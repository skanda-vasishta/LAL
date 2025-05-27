'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteTradeButtonProps {
  tradeId: string;
}

export default function DeleteTradeButton({ tradeId }: DeleteTradeButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trade?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('/api/trades', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tradeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete trade');
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Failed to delete trade. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
} 