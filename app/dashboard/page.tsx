// // app/dashboard/page.tsx
// import { prisma } from '@/app/lib/prisma';

// export default async function DashboardPage() {
//   // Fetch all data from each table
//   const users = await prisma.user.findMany();
//   const trades = await prisma.trade.findMany({
//     include: {
//       draftPicks: true
//     }
//   });

//   return (
//     <div className="p-6 space-y-8">
//       {/* Users Table */}
//       <div>
//         <h2 className="text-2xl font-bold mb-4">Users</h2>
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {users.map((user) => (
//                 <tr key={user.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {new Date(user.createdAt).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Trades Table */}
//       <div>
//         <h2 className="text-2xl font-bold mb-4">Trades</h2>
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draft Picks</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {trades.map((trade) => (
//                 <tr key={trade.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">{trade.description}</td>
//                   <td className="px-6 py-4">
//                     <div className="flex flex-col gap-1">
//                       {trade.teams.map((team, index) => (
//                         <span key={index} className="text-sm">{team}</span>
//                       ))}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex flex-col gap-1">
//                       {trade.draftPicks.map((pick) => (
//                         <span key={pick.id} className="text-sm">
//                           {pick.year} Round {pick.round}: {pick.givingTeam} → {pick.receivingTeam}
//                         </span>
//                       ))}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {new Date(trade.createdAt).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/dashboard/page.tsx
import { prisma } from '@/app/lib/prisma';
import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();
  
  // Get the logged-in user's data
  const user = await prisma.user.findUnique({
    where: { 
      email: session?.user?.email // Use email from session
    },
    select: {
      name: true,
      email: true,
      trades: {
        select: {
          id: true,
          description: true,
          teams: true,
          draftPicks: {
            select: {
              id: true,
              year: true,
              round: true,
              givingTeam: true,
              receivingTeam: true
            }
          },
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
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
        <h2 className="text-xl font-semibold mb-4">Your Saved Trades</h2>
        {user.trades.length === 0 ? (
          <p className="text-gray-500">No trades saved yet.</p>
        ) : (
          <div className="space-y-4">
            {user.trades.map((trade) => (
              <div key={trade.id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-medium mb-2">{trade.description || 'Untitled Trade'}</p>
                <div className="text-sm text-gray-600">
                  <p>Teams: {trade.teams.join(' ↔ ')}</p>
                  {trade.draftPicks.map((pick) => (
                    <p key={pick.id}>
                      {pick.year} Round {pick.round}: {pick.givingTeam} → {pick.receivingTeam}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}