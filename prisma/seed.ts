// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  // Create some sample trades
  const trades = [
    {
      description: 'Lakers-Celtics Blockbuster',
      teams: ['Los Angeles Lakers', 'Boston Celtics'],
      draftPicks: [
        {
          year: 2024,
          round: 1,
          pickNumber: 1,
          givingTeam: 'Los Angeles Lakers',
          receivingTeam: 'Boston Celtics',
        },
        {
          year: 2025,
          round: 2,
          pickNumber: 15,
          givingTeam: 'Boston Celtics',
          receivingTeam: 'Los Angeles Lakers',
        },
      ],
    },
    {
      description: 'Warriors-Nuggets Trade',
      teams: ['Golden State Warriors', 'Denver Nuggets'],
      draftPicks: [
        {
          year: 2024,
          round: 1,
          pickNumber: 7,
          givingTeam: 'Golden State Warriors',
          receivingTeam: 'Denver Nuggets',
        },
      ],
    },
    {
      description: 'Three-Team Trade',
      teams: ['Miami Heat', 'Milwaukee Bucks', 'Phoenix Suns'],
      draftPicks: [
        {
          year: 2024,
          round: 1,
          pickNumber: 3,
          givingTeam: 'Miami Heat',
          receivingTeam: 'Milwaukee Bucks',
        },
        {
          year: 2025,
          round: 1,
          pickNumber: 12,
          givingTeam: 'Milwaukee Bucks',
          receivingTeam: 'Phoenix Suns',
        },
        {
          year: 2026,
          round: 2,
          pickNumber: 25,
          givingTeam: 'Phoenix Suns',
          receivingTeam: 'Miami Heat',
        },
      ],
    },
  ];

  // Create the trades
  for (const trade of trades) {
    await prisma.trade.create({
      data: {
        userId: user.id,
        description: trade.description,
        teams: trade.teams,
        draftPicks: {
          create: trade.draftPicks,
        },
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });