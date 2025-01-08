'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EmojiFormProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export function EmojiForm({ onSubmit, disabled }: EmojiFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || disabled) return;
    onSubmit(prompt.trim());
    setPrompt('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to generate an emoji"
          className="flex-1"
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || !prompt.trim()}>
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Generate'
          )}
        </Button>
      </div>
    </form>
  );
} 