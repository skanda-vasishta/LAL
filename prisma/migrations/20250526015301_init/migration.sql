-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "win_percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_picks" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "draft_picks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_teams" (
    "id" TEXT NOT NULL,
    "trade_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "is_giving" BOOLEAN NOT NULL,

    CONSTRAINT "trade_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_draft_picks" (
    "id" TEXT NOT NULL,
    "trade_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "giving_team_id" TEXT NOT NULL,
    "receiving_team_id" TEXT NOT NULL,

    CONSTRAINT "trade_draft_picks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "draft_picks_year_round_team_id_key" ON "draft_picks"("year", "round", "team_id");

-- AddForeignKey
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_teams" ADD CONSTRAINT "trade_teams_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_teams" ADD CONSTRAINT "trade_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_draft_picks" ADD CONSTRAINT "trade_draft_picks_trade_id_fkey" FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_draft_picks" ADD CONSTRAINT "trade_draft_picks_giving_team_id_fkey" FOREIGN KEY ("giving_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_draft_picks" ADD CONSTRAINT "trade_draft_picks_receiving_team_id_fkey" FOREIGN KEY ("receiving_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
