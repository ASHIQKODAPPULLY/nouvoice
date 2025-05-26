-- Fix permissions for team tables

-- Enable row level security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Team owners can manage their teams" ON teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON team_members;
DROP POLICY IF EXISTS "Team members can view invites" ON team_invites;
DROP POLICY IF EXISTS "Team admins can manage invites" ON team_invites;

-- Create policies for teams table
CREATE POLICY "Team owners can manage their teams"
ON teams
FOR ALL
USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view their teams"
ON teams
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
  )
);

-- Create policies for team_members table
CREATE POLICY "Team members can view team members"
ON team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Team admins can manage team members"
ON team_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
    AND (tm.role = 'owner' OR tm.role = 'admin')
  )
);

-- Create policies for team_invites table
CREATE POLICY "Team members can view invites"
ON team_invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = team_invites.team_id
    AND team_members.user_id = auth.uid()
  )
);

CREATE POLICY "Team admins can manage invites"
ON team_invites
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = team_invites.team_id
    AND team_members.user_id = auth.uid()
    AND (team_members.role = 'owner' OR team_members.role = 'admin')
  )
);

-- Create stored procedure for accepting team invites
CREATE OR REPLACE FUNCTION accept_team_invite(
  p_token TEXT,
  p_user_id UUID,
  p_team_id UUID,
  p_role TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insert the user as a team member
  INSERT INTO team_members (team_id, user_id, role, invite_accepted)
  VALUES (p_team_id, p_user_id, p_role, TRUE);
  
  -- Delete the invite
  DELETE FROM team_invites WHERE token = p_token;
 END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add publication for realtime
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table team_members;
alter publication supabase_realtime add table team_invites;
