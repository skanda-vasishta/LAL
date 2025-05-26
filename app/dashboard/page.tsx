import { getTeams, getDraftPicksByTeam } from '@/app/lib/db';
import { Team, DraftPick } from '@/app/lib/definitions';

interface TeamWithPicks {
  team: Team;
  picks: DraftPick[];
}

export default async function DashboardPage() {
  const teams = await getTeams();
  
  // Get all teams with their draft picks
  const teamsWithPicks: TeamWithPicks[] = await Promise.all(
    teams.map(async (team: Team) => {
      const picks = await getDraftPicksByTeam(team.id);
      return { team, picks };
    })
  );
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">NBA Teams and Draft Picks</h1>
      
      <div className="grid gap-6">
        {teamsWithPicks.map(({ team, picks }: TeamWithPicks) => (
          <div key={team.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{team.name}</h2>
              <span className="text-gray-600">
                Win %: {(team.win_percentage * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Draft Picks</h3>
              <div className="grid grid-cols-2 gap-4">
                {picks.map((pick: DraftPick) => (
                  <div key={pick.id} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">
                      {pick.year} Round {pick.round}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}