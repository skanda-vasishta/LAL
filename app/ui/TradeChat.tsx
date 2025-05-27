'use client';
import { useState } from 'react';
import { Button } from './button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TradeChatProps {
  tradeData: {
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

export default function TradeChat({ tradeData }: TradeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('/api/trade-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          tradeData: {
            ...tradeData,
            prospects: {
              // Add some sample prospects for testing
              '2025': ['Cooper Flagg', 'Ace Bailey', 'Dylan Harper'],
              '2026': ['AJ Dybantsa', 'Cameron Boozer', 'Koa Peat'],
              '2027': ['Tyler Jackson', 'Tyler Betsey', 'Terrion Burgess'],
              '2028': ['Jalen Haralson', 'Tyler Robison', 'Tyler Smith']
            }
          }
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="mb-2 font-semibold text-purple-700">Trade Analysis Assistant</div>
      <div className="h-32 overflow-y-auto mb-2 bg-gray-50 p-2 rounded text-sm">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm">
            Ask me about this trade, potential prospects, or team values...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-2 py-1 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about this trade or prospects..."
          disabled={loading}
        />
        <Button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          className="text-sm"
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
