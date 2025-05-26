-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (already exists, but adding for reference)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  win_percentage DECIMAL(5,3) NOT NULL -- Stored as decimal between 0 and 1
);

-- Create draft_picks table
CREATE TABLE draft_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  round INTEGER NOT NULL CHECK (round IN (1, 2)),
  team_id UUID NOT NULL REFERENCES teams(id),
  UNIQUE(year, round, team_id) -- Prevent duplicate picks
);

-- Create trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trade_teams table
CREATE TABLE trade_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  is_giving BOOLEAN NOT NULL -- true if team is giving assets, false if receiving
);

-- Create trade_draft_picks table
CREATE TABLE trade_draft_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  round INTEGER NOT NULL CHECK (round IN (1, 2)),
  giving_team_id UUID NOT NULL REFERENCES teams(id),
  receiving_team_id UUID NOT NULL REFERENCES teams(id)
);

-- Create indexes
CREATE INDEX idx_draft_picks_team ON draft_picks(team_id);
CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trade_teams_trade ON trade_teams(trade_id);
CREATE INDEX idx_trade_teams_team ON trade_teams(team_id);
CREATE INDEX idx_trade_draft_picks_trade ON trade_draft_picks(trade_id);
CREATE INDEX idx_trade_draft_picks_teams ON trade_draft_picks(giving_team_id, receiving_team_id); 