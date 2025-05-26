import { PrismaClient } from '@prisma/client';

console.log('Initializing Prisma client...');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!globalForPrisma.prisma) {
  console.log('Creating new Prisma client instance...');
  globalForPrisma.prisma = new PrismaClient();
}

export const prisma = globalForPrisma.prisma;

console.log('Prisma client initialized:', !!prisma); 