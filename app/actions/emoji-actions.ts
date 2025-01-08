'use server';

import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';
import Replicate from "replicate";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(`Missing Supabase environment variables: ${!supabaseUrl ? 'URL' : ''} ${!supabaseServiceKey ? 'SERVICE_KEY' : ''}`);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Function to toggle like on an emoji
export async function toggleEmojiLike(emojiId: number) {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      throw new Error('No user ID found in session');
    }

    // First, check if the user has already liked this emoji
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('emoji_likes')
      .select('*')
      .eq('emoji_id', emojiId)
      .eq('user_id', userId)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      throw likeCheckError;
    }

    if (existingLike) {
      // Unlike: Remove the like record
      const { error: unlikeError } = await supabase
        .from('emoji_likes')
        .delete()
        .eq('emoji_id', emojiId)
        .eq('user_id', userId);

      if (unlikeError) throw unlikeError;

      return { liked: false };
    } else {
      // Like: Add a like record
      const { error: likeError } = await supabase
        .from('emoji_likes')
        .insert([{ emoji_id: emojiId, user_id: userId }]);

      if (likeError) throw likeError;

      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling emoji like:', error);
    throw error;
  }
}

// Function to get liked emojis for current user
export async function getUserLikedEmojis() {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      throw new Error('No user ID found in session');
    }

    const { data: likedEmojis, error } = await supabase
      .from('emoji_likes')
      .select('emoji_id')
      .eq('user_id', userId);

    if (error) throw error;

    return new Set(likedEmojis.map(like => like.emoji_id));
  } catch (error) {
    console.error('Error fetching user liked emojis:', error);
    throw error;
  }
}

export async function generateAndUploadEmoji(prompt: string) {
  try {
    // 1. Generate emoji using Replicate
    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          prompt: `friendly emoji style: ${prompt}`,
          apply_watermark: false,
          negative_prompt: "nsfw, offensive content, inappropriate, violent, gore, adult content"
        }
      }
    );

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('No output from Replicate');
    }

    const imageUrl = output[0];

    // 2. Upload to Supabase and save to database
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      throw new Error('No user ID found in session');
    }

    // 3. Fetch the image from Replicate
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image from Replicate');
    }
    const imageBlob = await response.blob();

    // 4. Generate a unique filename
    const filename = `${userId}_${Date.now()}.png`;
    
    // 5. Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('emojis')
      .upload(filename, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (storageError) {
      console.error('Error uploading to storage:', storageError);
      throw storageError;
    }

    // 6. Get the public URL
    const { data: publicUrl } = supabase
      .storage
      .from('emojis')
      .getPublicUrl(filename);

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // 7. Save to emojis table
    const { data: emojiData, error: dbError } = await supabase
      .from('emojis')
      .insert([
        {
          image_url: publicUrl.publicUrl,
          prompt: prompt,
          creator_user_id: userId,
          likes_count: 0
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error saving to database:', dbError);
      throw dbError;
    }

    return emojiData;
  } catch (error) {
    console.error('Error in generateAndUploadEmoji:', error);
    throw error;
  }
}

// Function to fetch all emojis
export async function getAllEmojis() {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      throw new Error('No user ID found in session');
    }

    const { data: emojis, error } = await supabase
      .from('emojis')
      .select('*')
      .eq('creator_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return emojis;
  } catch (error) {
    console.error('Error fetching emojis:', error);
    throw error;
  }
}

// Function to delete an emoji
export async function deleteEmoji(emojiId: number) {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      throw new Error('No user ID found in session');
    }

    // First, get the emoji to check ownership and get the filename
    const { data: emoji, error: fetchError } = await supabase
      .from('emojis')
      .select('*')
      .eq('id', emojiId)
      .eq('creator_user_id', userId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!emoji) {
      throw new Error('Emoji not found or you do not have permission to delete it');
    }

    // Extract filename from the URL
    const urlParts = emoji.image_url.split('/');
    const filename = urlParts[urlParts.length - 1];

    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('emojis')
      .remove([filename]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      throw storageError;
    }

    // Delete from emojis table (this will cascade delete likes due to foreign key)
    const { error: dbError } = await supabase
      .from('emojis')
      .delete()
      .eq('id', emojiId)
      .eq('creator_user_id', userId);

    if (dbError) {
      throw dbError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting emoji:', error);
    throw error;
  }
} 