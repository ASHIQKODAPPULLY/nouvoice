-- Create team_subscriptions table
CREATE TABLE IF NOT EXISTS team_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('free', 'pro', 'team', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id)
);

-- Create RLS policies for team_subscriptions
ALTER TABLE team_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team owners and admins can view subscriptions" ON team_subscriptions;
CREATE POLICY "Team owners and admins can view subscriptions"
  ON team_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_subscriptions.team_id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'owner' OR tm.role = 'admin')
    )
  );

-- Create trigger to update the updated_at timestamp
DROP TRIGGER IF EXISTS update_team_subscriptions_modtime ON team_subscriptions;
CREATE TRIGGER update_team_subscriptions_modtime
BEFORE UPDATE ON team_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable realtime for team_subscriptions table
ALTER PUBLICATION supabase_realtime ADD TABLE team_subscriptions;

-- Create stored procedure to accept team invites
CREATE OR REPLACE FUNCTION accept_team_invite(
  p_token UUID,
  p_user_id UUID,
  p_team_id UUID,
  p_role TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insert the user as a team member
  INSERT INTO team_members (team_id, user_id, role, invite_accepted)
  VALUES (p_team_id, p_user_id, p_role, TRUE);
  
  -- Delete the invitation
  DELETE FROM team_invites WHERE token = p_token;
 END;
$$ LANGUAGE plpgsql;
