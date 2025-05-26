// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Team = {
  id: string;
  name: string;
  win_percentage: number; // Last season's win percentage
};

export type DraftPick = {
  id: string;
  year: number;
  round: 1 | 2; // Only first or second round picks
  team_id: string; // Current owner of the pick
};

export type Trade = {
  id: string;
  user_id: string;
  description: string;
  created_at: Date;
};

export type TradeTeam = {
  id: string;
  trade_id: string;
  team_id: string;
  is_giving: boolean; // true if team is giving assets, false if receiving
};

export type TradeDraftPick = {
  id: string;
  trade_id: string;
  year: number;
  round: 1 | 2;
  giving_team_id: string;
  receiving_team_id: string;
};

// Combined types for API responses
export type TradeWithDetails = Trade & {
  teams: (TradeTeam & { team: Team })[];
  draft_picks: TradeDraftPick[];
};

export type TeamWithAssets = Team & {
  draft_picks: DraftPick[];
};
