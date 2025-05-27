'use client';

import { useState, useEffect } from 'react';

// Hardcoded prospects by year
const PROSPECTS_BY_YEAR: Record<number, string[]> = {
  2025: [
    'AJ Dybantsa', 'Cameron Boozer', 'Darryn Peterson', 'Caleb Wilson', 
    'Koa Peat', 'Nate Ament', 'Isiah Harwell', 'Mikel Brown Jr.', 
    'Chris Cenac', 'Tounde Yessoufou'
  ],
  2026: [
    'Tyran Stokes', 'Brandon McCoy Jr.', 'Christian Collins', 'Jordan Smith Jr.', 
    'Caleb Holt', 'Jason Crowe Jr.', 'Miikka Muurinen', 'Tajh Ariza', 
    'Alijah Arenas', 'Abdou Toure'
  ],
  2027: [
    'Baba Oladotun', 'C.J. Rosser', 'Ryan Hampton', 'Jaylan Mitchell', 
    'Paul Osaruyi', 'Lincoln Cosby', 'Tyrone Jamison', 'Josh Leonard', 
    'Marcus Spears Jr.', 'Taiwo Daramola'
  ],
  2028: [
    'Kam Mercer', 'Quinton Wilson', 'Adan Diggs', 'AJ Williams', 
    'Peter Julius', 'Kevin Wheatley Jr.', 'Josh Lindsay', 'Miles Simpson', 
    'Jaleel Smith', 'Antoine Moreman'
  ]
};

interface TradeAnalysisProps {
  evaluatedTrade: {
    description: string;
    teams: string[];
    draftPicks: Array<{
      year: number;
      round: number;
      pickNumber: number;
      givingTeam: string;
      receivingTeam: string;
    }>;
    teamValues: Record<string, {
      given: number;
      received: number;
      givenPicks: string[];
      receivedPicks: string[];
    }>;
  };
}

export default function TradeAnalysis({ evaluatedTrade }: TradeAnalysisProps) {
  const [analysis, setAnalysis] = useState<{ summary: string; prospects: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeTrade = async () => {
    setIsLoading(true);
    try {
      // Get unique years from draft picks
      const yearsInTrade = [...new Set(evaluatedTrade.draftPicks.map(pick => pick.year))];
      
      // Get relevant prospects for the years in the trade
      const relevantProspects: Record<number, string[]> = yearsInTrade.reduce((acc, year) => {
        if (PROSPECTS_BY_YEAR[year]) {
          acc[year] = PROSPECTS_BY_YEAR[year];
        }
        return acc;
      }, {} as Record<number, string[]>);

      // Generate local analysis
      const teamAnalysis = evaluatedTrade.teams.map(team => {
        const values = evaluatedTrade.teamValues[team];
        const netValue = values.received - values.given;
        const isWinner = netValue > 0;
        return `${team} ${isWinner ? 'wins' : 'loses'} this trade with a net value of ${netValue}`;
      }).join('. ');

      const topProspects = yearsInTrade.map(year => {
        const prospects = PROSPECTS_BY_YEAR[year] || [];
        return `${year}: ${prospects.slice(0, 3).join(', ')}`;
      });

      setAnalysis({
        summary: `This trade involves ${evaluatedTrade.teams.length} teams exchanging draft picks. ${teamAnalysis}. The trade includes picks from ${yearsInTrade.join(', ')}.`,
        prospects: topProspects
      });
    } catch (error) {
      console.error('Error analyzing trade:', error);
      setAnalysis({
        summary: "Error analyzing trade. Please try again.",
        prospects: ["Error", "Error", "Error"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Call analyzeTrade when the component mounts
  useEffect(() => {
    analyzeTrade();
  }, []);

  return (
    <div className="mt-8">
      {analysis && (
        <div className="p-4 border rounded bg-gray-50">
          <h3 className="font-bold mb-4">AI Trade Analysis</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Trade Summary</h4>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Potential Prospects</h4>
              <ul className="list-disc list-inside text-gray-700">
                {analysis.prospects.map((prospect, index) => (
                  <li key={index}>{prospect}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 