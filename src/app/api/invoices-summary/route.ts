import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const runtime = "edge";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has premium subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subError || !subscription || !subscription.is_premium) {
      return Response.json(
        { error: "Premium subscription required" },
        { status: 403 },
      );
    }

    // Get invoices data
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id);

    if (invoicesError) {
      return Response.json(
        { error: "Failed to fetch invoices" },
        { status: 500 },
      );
    }

    // Calculate summary statistics
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0);
    const unpaidAmount = invoices
      .filter((inv) => inv.status === "unpaid")
      .reduce((sum, inv) => sum + inv.amount, 0);
    const overdueInvoices = invoices.filter(
      (inv) => inv.status === "overdue",
    ).length;
    const overdueAmount = invoices
      .filter((inv) => inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Calculate top clients
    const clientMap = new Map();
    invoices.forEach((inv) => {
      const currentAmount = clientMap.get(inv.client_name) || 0;
      clientMap.set(inv.client_name, currentAmount + inv.amount);
    });

    const topClients = Array.from(clientMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Get team data if applicable
    let teamData = null;
    const { data: teamMembership, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .single();

    if (!teamError && teamMembership) {
      const { data: teamInvoices, error: teamInvError } = await supabase
        .from("invoices")
        .select("*, users:user_id(name)")
        .eq("team_id", teamMembership.team_id);

      if (!teamInvError && teamInvoices) {
        // Calculate team member contributions
        const memberContributions = teamInvoices.reduce((acc, inv) => {
          const memberName = inv.users?.name || "Unknown";
          if (!acc[memberName]) acc[memberName] = { count: 0, amount: 0 };
          acc[memberName].count += 1;
          acc[memberName].amount += inv.amount;
          return acc;
        }, {});

        teamData = {
          totalTeamInvoices: teamInvoices.length,
          totalTeamAmount: teamInvoices.reduce(
            (sum, inv) => sum + inv.amount,
            0,
          ),
          memberContributions: Object.entries(memberContributions).map(
            ([name, data]) => ({
              name,
              count: data.count,
              amount: data.amount,
            }),
          ),
        };
      }
    }

    // Get recent invoices for detailed view
    const recentInvoices = invoices.slice(0, 10).map((inv) => ({
      invoiceNumber: inv.invoice_number,
      clientName: inv.client_name,
      amount: inv.amount,
      date: inv.created_at,
      dueDate: inv.due_date,
      status: inv.status,
    }));

    return Response.json({
      totalInvoices,
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      overdueInvoices,
      topClients,
      teamData,
      recentInvoices,
      summary: {
        totalRevenue: paidAmount,
        pendingRevenue: unpaidAmount + overdueAmount,
        collectionRate:
          totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
        averageInvoiceValue:
          totalInvoices > 0 ? Math.round(totalAmount / totalInvoices) : 0,
      },
    });
  } catch (error) {
    console.error("Error in invoices-summary API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
