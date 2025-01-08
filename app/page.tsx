'use client';

import { useState, useEffect } from 'react';
import { EmojiForm } from '@/app/components/emoji-form';
import { EmojiGrid } from '@/app/components/emoji-grid';
import { Loader2 } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import { ProfileCreator } from './components/profile-creator';
import { toggleEmojiLike, getUserLikedEmojis, deleteEmoji } from '@/app/actions/emoji-actions';

export default function Home() {
  const [downloadingEmoji, setDownloadingEmoji] = useState<string | null>(null);
  const [likedEmojis, setLikedEmojis] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load user's liked emojis on mount
  useEffect(() => {
    async function loadLikedEmojis() {
      try {
        const liked = await getUserLikedEmojis();
        setLikedEmojis(liked);
      } catch (error) {
        console.error('Error loading liked emojis:', error);
      }
    }
    loadLikedEmojis();
  }, []);

  const handleGenerateEmoji = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate emoji');
      }

      // Trigger a refresh of the emoji grid
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate emoji');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      setDownloadingEmoji(imageUrl);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'emoji.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading emoji:', error);
    } finally {
      setDownloadingEmoji(null);
    }
  };

  const handleLike = async (emojiId: number) => {
    try {
      const result = await toggleEmojiLike(emojiId);
      if (result.liked) {
        setLikedEmojis(prev => {
          const newSet = new Set(prev);
          newSet.add(emojiId);
          return newSet;
        });
      } else {
        setLikedEmojis(prev => {
          const newSet = new Set(prev);
          newSet.delete(emojiId);
          return newSet;
        });
      }
      // Refresh the grid to update like counts
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (emojiId: number) => {
    try {
      await deleteEmoji(emojiId);
      // Refresh the grid after deletion
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting emoji:', error);
      setError('Failed to delete emoji');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 gap-8">
      <ProfileCreator />
      <EmojiForm onSubmit={handleGenerateEmoji} disabled={isLoading} />
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Generating your emoji...</p>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      )}
      <EmojiGrid
        likedEmojis={likedEmojis}
        onLike={handleLike}
        onDownload={handleDownload}
        downloadingEmoji={downloadingEmoji}
        refreshTrigger={refreshTrigger}
        onDelete={handleDelete}
      />
    </main>
  );
}
