-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invite_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(team_id, user_id)
);

-- Create team_invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(team_id, email)
);

-- Add team_id to invoices table
ALTER TABLE IF EXISTS invoices 
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS last_modified_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create RLS policies for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team owners can manage their teams" ON teams;
CREATE POLICY "Team owners can manage their teams"
  ON teams
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Team members can view teams they belong to" ON teams;
CREATE POLICY "Team members can view teams they belong to"
  ON teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

-- Create RLS policies for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team owners and admins can manage team members" ON team_members;
CREATE POLICY "Team owners and admins can manage team members"
  ON team_members
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'owner' OR tm.role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Team members can view other team members" ON team_members;
CREATE POLICY "Team members can view other team members"
  ON team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Create RLS policies for team_invites
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team owners and admins can manage invites" ON team_invites;
CREATE POLICY "Team owners and admins can manage invites"
  ON team_invites
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_invites.team_id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'owner' OR tm.role = 'admin')
    )
  );

-- Create RLS policies for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own invoices" ON invoices;
CREATE POLICY "Users can manage their own invoices"
  ON invoices
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Team members can view team invoices" ON invoices;
CREATE POLICY "Team members can view team invoices"
  ON invoices
  FOR SELECT
  USING (
    team_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invoices.team_id
      AND team_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team members with edit permission can update team invoices" ON invoices;
CREATE POLICY "Team members with edit permission can update team invoices"
  ON invoices
  FOR UPDATE
  USING (
    team_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invoices.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Team members with create permission can insert team invoices" ON invoices;
CREATE POLICY "Team members with create permission can insert team invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (
    team_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invoices.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin', 'member')
    )
  );

DROP POLICY IF EXISTS "Team owners and admins can delete team invoices" ON invoices;
CREATE POLICY "Team owners and admins can delete team invoices"
  ON invoices
  FOR DELETE
  USING (
    team_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invoices.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Create function to automatically add team owner as a member
CREATE OR REPLACE FUNCTION add_team_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role, invite_accepted)
  VALUES (NEW.id, NEW.owner_id, 'owner', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add team owner as a member
DROP TRIGGER IF EXISTS add_team_owner_trigger ON teams;
CREATE TRIGGER add_team_owner_trigger
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION add_team_owner_as_member();

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update the updated_at timestamp
DROP TRIGGER IF EXISTS update_teams_modtime ON teams;
CREATE TRIGGER update_teams_modtime
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_team_members_modtime ON team_members;
CREATE TRIGGER update_team_members_modtime
BEFORE UPDATE ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE team_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
