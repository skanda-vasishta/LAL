// app/dashboard/trade-builder.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/app/ui/button';

// NBA teams for the dropdown
const NBA_TEAMS = [
  'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
  'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
  'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
  'LA Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
  'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans',
  'New York Knicks', 'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers',
  'Phoenix Suns', 'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs',
  'Toronto Raptors', 'Utah Jazz', 'Washington Wizards'
];

// Years for the draft picks (next 5 years)
const DRAFT_YEARS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i);

interface DraftPick {
  year: number;
  round: number;
  pickNumber: number;
  givingTeam: string;
  receivingTeam: string;
}

interface Team {
  id: string;
  name: string;
  picks: DraftPick[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface TeamValue {
  given: number;
  received: number;
  givenPicks: string[];
  receivedPicks: string[];
}

interface EvaluatedTrade {
  description: string;
  teams: string[];
  draftPicks: DraftPick[];
  teamValues: Record<string, TeamValue>;
  userId: string;
}

const PICK_VALUE_CHART: Record<number, number> = {
  1: 4000, 2: 3250, 3: 2890, 4: 2660, 5: 2500, 6: 2380, 7: 2280, 8: 2200, 9: 2120, 10: 2030,
  11: 1930, 12: 1840, 13: 1760, 14: 1690, 15: 1630, 16: 1580, 17: 1530, 18: 1490, 19: 1440, 20: 1400,
  21: 1340, 22: 1300, 23: 1250, 24: 1210, 25: 1170, 26: 1130, 27: 1090, 28: 1040, 29: 1000, 30: 950,
  31: 720, 32: 690, 33: 660, 34: 630, 35: 600, 36: 580, 37: 550, 38: 530, 39: 500, 40: 480,
  41: 460, 42: 430, 43: 410, 44: 390, 45: 370, 46: 350, 47: 330, 48: 310, 49: 290, 50: 270,
  51: 250, 52: 240, 53: 220, 54: 200, 55: 180, 56: 170, 57: 150, 58: 130, 59: 120, 60: 100,
};

const getPickValue = (round: number, pickNumber: number) => {
  const overallPick = round === 1 ? pickNumber : pickNumber + 30;
  return PICK_VALUE_CHART[overallPick] || 0;
};

export default function TradeBuilder({ userId }: { userId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [evaluatedTrade, setEvaluatedTrade] = useState<EvaluatedTrade | null>(null);

  const addTeam = () => {
    setTeams([...teams, { id: Math.random().toString(), name: '', picks: [] }]);
  };

  const updateTeam = (id: string, name: string) => {
    setErrors([]);
    setTeams(teams.map(team => 
      team.id === id ? { ...team, name } : team
    ));
  };

  const addPick = (teamId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          picks: [...team.picks, {
            year: new Date().getFullYear(),
            round: 1,
            pickNumber: 1,
            givingTeam: team.name,
            receivingTeam: ''
          }]
        };
      }
      return team;
    }));
  };

  // Modify the updatePick function to include validation
  const updatePick = (teamId: string, pickIndex: number, field: keyof DraftPick, value: string | number) => {
    setErrors([]);
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const newPicks = [...team.picks];
        const updatedPick = { ...newPicks[pickIndex], [field]: value };
        
        newPicks[pickIndex] = updatedPick;
        return { ...team, picks: newPicks };
      }
      return team;
    }));
  };

  // Modify the validateTrade function to include pick uniqueness check
  const validateTrade = (): boolean => {
    const newErrors: ValidationError[] = [];

    // Check description
    // if (!description.trim()) {
    //   newErrors.push({
    //     field: 'description',
    //     message: 'Trade description is required'
    //   });
    // }

    // Check teams
    if (teams.length === 0) {
      newErrors.push({
        field: 'teams',
        message: 'At least one team must be added'
      });
    }

    // Check each team and their picks
    teams.forEach((team, teamIndex) => {
      if (!team.name) {
        newErrors.push({
          field: `team-${teamIndex}`,
          message: 'Team must be selected'
        });
      }

      // Check if team has at least one pick
      if (team.picks.length === 0) {
        newErrors.push({
          field: `team-${teamIndex}-picks`,
          message: 'At least one draft pick must be added'
        });
      }

      // Check each pick
      team.picks.forEach((pick, pickIndex) => {
        if (!pick.receivingTeam) {
          newErrors.push({
            field: `pick-${teamIndex}-${pickIndex}`,
            message: 'Receiving team must be selected'
          });
        }

        // Validate that receiving team is different from giving team
        if (pick.receivingTeam === team.name) {
          newErrors.push({
            field: `pick-${teamIndex}-${pickIndex}`,
            message: 'Receiving team cannot be the same as giving team'
          });
        }
      });
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const saveTrade = async () => {
    // Clear previous errors before starting
    setErrors([]);

    // Validate before saving
    if (!validateTrade()) {
      return;
    }

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          teams: teams.map(team => team.name),
          draftPicks: teams.flatMap(team => team.picks),
          userId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{
          field: 'general',
          message: data.error || 'Failed to save trade'
        }]);
        // Clear errors after displaying for a moment (optional)
        setTimeout(() => setErrors([]), 2000); // 2 seconds, adjust as needed
        return;
      }

      // Reset form
      setTeams([]);
      setDescription('');
      setErrors([]); // Clear errors after successful save

      // Refresh the page to show new trade
      window.location.reload();
    } catch (error) {
      console.error('Error saving trade:', error);
      setErrors([{
        field: 'general',
        message: error instanceof Error ? error.message : 'Failed to save trade. Please try again.'
      }]);
      // Clear errors after displaying for a moment (optional)
      setTimeout(() => setErrors([]), 2000); // 2 seconds, adjust as needed
    }
  };

  // New function for evaluating the trade
  const evaluateTrade = () => {
    setErrors([]); // Clear previous errors

    if (!validateTrade()) {
      setEvaluatedTrade(null);
      return;
    }

    // Collect all unique teams from givingTeam and receivingTeam
    const allTeams = new Set<string>();
    teams.forEach(team => allTeams.add(team.name));
    teams.forEach(team => {
      team.picks.forEach(pick => {
        allTeams.add(pick.givingTeam);
        allTeams.add(pick.receivingTeam);
      });
    });

    // Initialize value summary for all teams
    const teamValues: Record<string, TeamValue> = {};
    allTeams.forEach(team => {
      teamValues[team] = { given: 0, received: 0, givenPicks: [], receivedPicks: [] };
    });

    // Calculate values and track given/received picks
    teams.forEach(team => {
      team.picks.forEach(pick => {
        const value = getPickValue(pick.round, pick.pickNumber);
        const pickLabel = `${pick.year} Round ${pick.round} Pick ${pick.pickNumber}`;
        teamValues[pick.givingTeam].given += value;
        teamValues[pick.givingTeam].givenPicks.push(pickLabel);
        teamValues[pick.receivingTeam].received += value;
        teamValues[pick.receivingTeam].receivedPicks.push(pickLabel);
      });
    });

    setEvaluatedTrade({
      description,
      teams: Array.from(allTeams),
      draftPicks: teams.flatMap(team => team.picks),
      teamValues,
      userId
    });
  };

  // Helper function to get error message for a field
  const getError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* General error message */}
      {getError('general') && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {getError('general')}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trade Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`w-full p-2 border rounded-md ${
            getError('description') ? 'border-red-500' : ''
          }`}
          placeholder="Enter trade description"
        />
        {getError('description') && (
          <p className="mt-1 text-sm text-red-600">{getError('description')}</p>
        )}
      </div>

      {teams.map((team, index) => (
        <div key={team.id} className="mb-6 p-4 border rounded-md">
          <div className="mb-4 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team {index + 1}
            </label>
            {teams.length > 1 && (
              <button
                onClick={() => setTeams(teams.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
                type="button"
              >
                Remove Team
              </button>
            )}
          </div>
          <div className="mb-4">
            <select
              value={team.name}
              onChange={(e) => updateTeam(team.id, e.target.value)}
              className={`w-full p-2 border rounded-md ${
                getError(`team-${index}`) ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select a team</option>
              {NBA_TEAMS.map(teamName => (
                <option key={teamName} value={teamName}>{teamName}</option>
              ))}
            </select>
            {getError(`team-${index}`) && (
              <p className="mt-1 text-sm text-red-600">{getError(`team-${index}`)}</p>
            )}
          </div>

          <div className="space-y-4">
            {team.picks.length === 0 && getError(`team-${index}-picks`) && (
              <p className="text-sm text-red-600">{getError(`team-${index}-picks`)}</p>
            )}
            
            {team.picks.map((pick, pickIndex) => (
              <div key={pickIndex} className="flex gap-4 items-center">
                <select
                  value={pick.year}
                  onChange={(e) => updatePick(team.id, pickIndex, 'year', parseInt(e.target.value))}
                  className="p-2 border rounded-md"
                >
                  {DRAFT_YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={pick.round}
                  onChange={(e) => updatePick(team.id, pickIndex, 'round', parseInt(e.target.value))}
                  className="p-2 border rounded-md"
                >
                  <option value={1}>1st Round</option>
                  <option value={2}>2nd Round</option>
                </select>

                <select
                  value={pick.pickNumber}
                  onChange={(e) => updatePick(team.id, pickIndex, 'pickNumber', parseInt(e.target.value))}
                  className="p-2 border rounded-md"
                >
                  {Array.from({ length: 30 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Pick {i + 1}</option>
                  ))}
                </select>

                <select
                  value={pick.receivingTeam}
                  onChange={(e) => updatePick(team.id, pickIndex, 'receivingTeam', e.target.value)}
                  className={`p-2 border rounded-md ${
                    getError(`pick-${index}-${pickIndex}`) ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select receiving team</option>
                  {NBA_TEAMS.map(teamName => (
                    <option key={teamName} value={teamName}>{teamName}</option>
                  ))}
                </select>
                {getError(`pick-${index}-${pickIndex}`) && (
                  <p className="text-sm text-red-600">{getError(`pick-${index}-${pickIndex}`)}</p>
                )}

                <button
                  onClick={() => {
                    setTeams(teams.map(t => {
                      if (t.id === team.id) {
                        return {
                          ...t,
                          picks: t.picks.filter((_, i) => i !== pickIndex)
                        };
                      }
                      return t;
                    }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove Pick
                </button>
              </div>
            ))}

            <button
              onClick={() => addPick(team.id)}
              className="text-blue-500 hover:text-blue-700"
            >
              + Add Draft Pick
            </button>
          </div>
        </div>
      ))}

      {getError('teams') && (
        <p className="mb-4 text-sm text-red-600">{getError('teams')}</p>
      )}

      <div className="flex gap-4">
        <Button onClick={addTeam} disabled={teams.length >= 4}>
          + Add Team
        </Button>
        <Button onClick={saveTrade} disabled={teams.length === 0}>
          Save Trade
        </Button>
        <Button onClick={evaluateTrade} disabled={teams.length === 0}>
          Evaluate Trade
        </Button>
      </div>

      {/* Show evaluated trade details */}
      {evaluatedTrade && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="font-bold mb-2">Team Value Summary</h3>
          <ul>
            {Object.entries(evaluatedTrade.teamValues).map(([team, { given, received, givenPicks, receivedPicks }]) => {
              const net = received - given;
              return (
                <li key={team} className="mb-4">
                  <div>
                    <strong>{team}:</strong> Gave up {given}, Received {received}, Net: {net} —{" "}
                    <span className={net >= 0 ? "text-green-600" : "text-red-600"}>
                      {net >= 0 ? "Good trade" : "Bad trade"}
                    </span>
                  </div>
                  {givenPicks.length > 0 && (
                    <div className="ml-4 text-sm text-gray-700">
                      Picks given up: {givenPicks.join(", ")}
                    </div>
                  )}
                  {receivedPicks.length > 0 && (
                    <div className="ml-4 text-sm text-blue-700">
                      Picks received: {receivedPicks.join(", ")}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}