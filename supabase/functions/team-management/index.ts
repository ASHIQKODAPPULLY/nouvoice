// Edge function for team management operations

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, data } = await req.json();

    let result;
    let query;

    switch (action) {
      case "inviteMembers":
        // Validate request data
        if (!data.teamId || !data.emails || !data.role || !data.invitedBy) {
          throw new Error("Missing required fields");
        }

        // Use the Pica passthrough endpoint to run SQL query
        const picaUrl =
          "https://api.picaos.com/v1/passthrough/v1/projects/your-project-ref-20chars/database/query";
        const picaResponse = await fetch(picaUrl, {
          method: "POST",
          headers: {
            "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
            "x-pica-connection-key":
              Deno.env.get("PICA_SUPABASE_CONNECTION_KEY") || "",
            "x-pica-action-id":
              "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              WITH inserted_invites AS (
                INSERT INTO team_invites (team_id, email, role, invited_by, token, expires_at)
                SELECT 
                  '${data.teamId}', 
                  unnest($1::text[]), 
                  '${data.role}', 
                  '${data.invitedBy}', 
                  gen_random_uuid(), 
                  NOW() + INTERVAL '48 hours'
                RETURNING *
              )
              SELECT * FROM inserted_invites;
            `,
            params: [data.emails],
          }),
        });

        if (!picaResponse.ok) {
          const errorData = await picaResponse.json();
          throw new Error(
            `Pica API error: ${errorData.message || picaResponse.statusText}`,
          );
        }

        result = await picaResponse.json();
        break;

      case "checkSubscription":
        if (!data.teamId) {
          throw new Error("Missing team ID");
        }

        query = `
          SELECT subscription_tier, status 
          FROM team_subscriptions 
          WHERE team_id = '${data.teamId}' 
          AND status = 'active' 
          LIMIT 1;
        `;

        const picaSubResponse = await fetch(
          "https://api.picaos.com/v1/passthrough/v1/projects/your-project-ref-20chars/database/query",
          {
            method: "POST",
            headers: {
              "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
              "x-pica-connection-key":
                Deno.env.get("PICA_SUPABASE_CONNECTION_KEY") || "",
              "x-pica-action-id":
                "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          },
        );

        if (!picaSubResponse.ok) {
          const errorData = await picaSubResponse.json();
          throw new Error(
            `Pica API error: ${errorData.message || picaSubResponse.statusText}`,
          );
        }

        result = await picaSubResponse.json();
        break;

      case "updateMemberRole":
        if (!data.teamId || !data.userId || !data.role) {
          throw new Error("Missing required fields");
        }

        query = `
          UPDATE team_members
          SET role = '${data.role}'
          WHERE team_id = '${data.teamId}' AND user_id = '${data.userId}'
          RETURNING *;
        `;

        const picaRoleResponse = await fetch(
          "https://api.picaos.com/v1/passthrough/v1/projects/your-project-ref-20chars/database/query",
          {
            method: "POST",
            headers: {
              "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
              "x-pica-connection-key":
                Deno.env.get("PICA_SUPABASE_CONNECTION_KEY") || "",
              "x-pica-action-id":
                "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          },
        );

        if (!picaRoleResponse.ok) {
          const errorData = await picaRoleResponse.json();
          throw new Error(
            `Pica API error: ${errorData.message || picaRoleResponse.statusText}`,
          );
        }

        result = await picaRoleResponse.json();
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
