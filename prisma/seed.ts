import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create teams
  const teams = [
    { name: 'Lakers', winPercentage: 0.488 },
    { name: 'Celtics', winPercentage: 0.707 },
    { name: 'Warriors', winPercentage: 0.463 },
    { name: 'Bucks', winPercentage: 0.622 },
    { name: 'Nuggets', winPercentage: 0.622 },
  ];

  for (const team of teams) {
    await prisma.team.create({
      data: {
        name: team.name,
        winPercentage: team.winPercentage,
      },
    });
  }

  // Get all teams
  const allTeams = await prisma.team.findMany();

  // Create draft picks for each team
  const currentYear = new Date().getFullYear();
  for (const team of allTeams) {
    // First round picks for next 3 years
    for (let year = currentYear; year < currentYear + 3; year++) {
      await prisma.draftPick.create({
        data: {
          year,
          round: 1,
          teamId: team.id,
        },
      });
    }
    // Second round picks for next 3 years
    for (let year = currentYear; year < currentYear + 3; year++) {
      await prisma.draftPick.create({
        data: {
          year,
          round: 2,
          teamId: team.id,
        },
      });
    }
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