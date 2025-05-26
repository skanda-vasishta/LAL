// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

export type Team = {
  id: string;
  name: string;
  winPercentage: number; // Last season's win percentage
};

export type DraftPick = {
  id: string;
  year: number;
  round: number; // Round number (typically 1 or 2)
  teamId: string; // Current owner of the pick
};

export type Trade = {
  id: string;
  userId: string;
  description: string;
  createdAt: Date;
  teams: string[]; // Array of team names
};

export type TradeTeam = {
  id: string;
  tradeId: string;
  teamId: string;
  isGiving: boolean; // true if team is giving assets, false if receiving
};

export type TradeDraftPick = {
  id: string;
  tradeId: string;
  year: number;
  round: number;
  givingTeam: string; // Team name as string
  receivingTeam: string; // Team name as string
};

// Combined types for API responses
export type TradeWithDetails = Trade & {
  teams: (TradeTeam & { team: Team })[];
  draftPicks: TradeDraftPick[];
};

export type TeamWithAssets = Team & {
  draftPicks: DraftPick[];
};
