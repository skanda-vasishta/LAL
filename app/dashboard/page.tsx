// app/dashboard/page.tsx
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';
import TradeBuilder from './trade-builder';

export default async function DashboardPage() {
  const session = await auth();
  
  // const user = await prisma.user.findUnique({
  //   where: { 
  //     email: session?.user?.email
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //   }
  // });
   // Add null check for session and email
   if (!session?.user?.email) {
    return <div>Please log in to continue</div>;
  }

  const user = await prisma.user.findUnique({
    where: { 
      email: session.user.email // Now TypeScript knows this is a string
    },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Build New Trade</h2>
        <TradeBuilder userId={user.id} />
      </div>
    </div>
  );
}