import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Heart, Trash2 } from 'lucide-react';

interface LatestEmojiProps {
  imageUrl: string;
  onLike: (imageUrl: string) => void;
  onDownload: (imageUrl: string) => void;
  onDelete: () => void;
  isLiked: boolean;
  isDownloading: boolean;
  likeCount?: number;
}

export function LatestEmoji({
  imageUrl,
  onLike,
  onDownload,
  onDelete,
  isLiked,
  isDownloading,
  likeCount = 0
}: LatestEmojiProps) {
  return (
    <div className="w-full max-w-[200px] mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-center">Latest Creation</h2>
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="Latest generated emoji"
            fill
            sizes="200px"
            className="object-contain p-2"
            unoptimized
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <div className="relative">
            <Button 
              size="icon" 
              variant="ghost" 
              className={`text-white hover:text-white hover:bg-white/20 ${
                isLiked ? 'text-red-500 hover:text-red-500' : ''
              }`}
              onClick={() => onLike(imageUrl)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            {likeCount > 0 && (
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium text-white">
                {likeCount}
              </span>
            )}
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-white/20"
            onClick={() => onDownload(imageUrl)}
            disabled={isDownloading}
          >
            <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-red-500/20"
            onClick={onDelete}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 