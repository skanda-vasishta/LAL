import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages, tradeData } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  const lastMessage = messages[messages.length - 1]?.content || '';
  if (!lastMessage) {
    return NextResponse.json({ response: "Please ask a question about the trade or prospects." });
  }

  const prompt = `You are a helpful NBA trade analysis assistant. You have access to the following trade information:

Trade Description: ${tradeData.description}
Teams Involved: ${tradeData.teams.join(', ')}
Draft Picks: ${tradeData.draftPicks.map((pick: any) => 
  `${pick.year} Round ${pick.round} Pick ${pick.pickNumber}: ${pick.givingTeam} → ${pick.receivingTeam}`
).join('\n')}
Team Values: ${Object.entries(tradeData.teamValues)
  .map(([team, values]: [string, any]) => 
    `${team}: Gave ${values.given}, Received ${values.received}, Net: ${values.received - values.given}`
  ).join('\n')}
Available Prospects: ${Object.entries(tradeData.prospects)
  .map(([year, prospects]: [string, any]) => 
    `${year}: ${prospects.join(', ')}`
  ).join('\n')}

Please answer the following question about this trade, focusing only on the information provided above:
${lastMessage}

Keep your response concise and focused on the trade details provided.`;

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }, ...messages],
      max_tokens: 200,
    }),
  });

  const data = await openaiRes.json();
  return NextResponse.json({ response: data.choices?.[0]?.message?.content || 'No response.' });
}