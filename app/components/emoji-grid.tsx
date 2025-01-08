'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllEmojis } from '@/app/actions/emoji-actions';

interface Emoji {
  id: number;
  image_url: string;
  prompt: string;
  likes_count: number;
  creator_user_id: string;
  created_at: string;
}

interface EmojiGridProps {
  onDelete?: (id: number) => void;
  likedEmojis: Set<number>;
  onLike: (id: number) => void;
  onDownload: (imageUrl: string) => void;
  downloadingEmoji: string | null;
  refreshTrigger?: number;
}

export function EmojiGrid({ 
  onDelete,
  likedEmojis,
  onLike,
  onDownload,
  downloadingEmoji,
  refreshTrigger = 0,
}: EmojiGridProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmojis() {
      try {
        const loadedEmojis = await getAllEmojis();
        setEmojis(loadedEmojis || []);
      } catch (error) {
        console.error('Error loading emojis:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEmojis();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-8 text-center text-gray-500">
        <p>Loading emojis...</p>
      </div>
    );
  }

  if (emojis.length === 0) {
    return (
      <div className="w-full max-w-4xl p-8 text-center text-gray-500">
        <p>No emojis generated yet. Enter a prompt to create some!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
      {emojis.map((emoji) => {
        if (!emoji.image_url) return null;

        const isDownloading = downloadingEmoji === emoji.image_url;
        const isLiked = likedEmojis.has(emoji.id);

        return (
          <div key={emoji.id} className="flex flex-col items-center">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden w-full group">
              <div className="relative w-full h-full">
                <Image
                  src={emoji.image_url}
                  alt={`Generated emoji: ${emoji.prompt}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain p-2"
                  unoptimized
                  priority={emoji.id < 4}
                  onError={(e) => {
                    console.error('Image load error for URL:', emoji.image_url);
                    console.error(e);
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`text-white hover:text-white hover:bg-white/20 ${
                    isLiked ? 'text-red-500 hover:text-red-500' : ''
                  }`}
                  onClick={() => onLike(emoji.id)}
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      isLiked ? 'fill-current' : ''
                    }`} 
                  />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-white/20"
                  onClick={() => onDownload(emoji.image_url)}
                  disabled={isDownloading}
                >
                  <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                </Button>
                {onDelete && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-white hover:text-white hover:bg-red-500/20"
                    onClick={() => onDelete(emoji.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{emoji.likes_count}</span> likes
            </div>
          </div>
        );
      })}
    </div>
  );
} 