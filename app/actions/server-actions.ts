'use server';

import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`Missing Supabase environment variables: ${!supabaseUrl ? 'URL' : ''} ${!supabaseKey ? 'KEY' : ''}`);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});

export async function createUserProfile() {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      console.log('No user ID found in session');
      return null;
    }

    console.log('Found user ID:', userId);

    // Check if user exists in profiles table
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      console.log('Found existing profile:', existingProfile);
      return existingProfile;
    }

    console.log('Creating new profile for user:', userId);

    // If user doesn't exist, create new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: userId,
          credits: 3,
          tier: 'free'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      throw insertError;
    }

    console.log('Successfully created new profile:', newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    throw error;
  }
}

// Function to upload emoji to Supabase storage and save to database
export async function uploadEmoji(imageUrl: string, prompt: string) {
  try {
    const session = await auth();
    const userId = session.userId;
    
    if (!userId) {
      throw new Error('No user ID found in session');
    }

    // 1. Fetch the image from the Replicate URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image from Replicate');
    }
    const imageBlob = await response.blob();

    // 2. Generate a unique filename
    const filename = `${userId}_${Date.now()}.png`;
    
    // 3. Upload to Supabase Storage
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

    // 4. Get the public URL for the uploaded file
    const { data: publicUrl } = supabase
      .storage
      .from('emojis')
      .getPublicUrl(filename);

    if (!publicUrl) {
      throw new Error('Failed to get public URL');
    }

    // 5. Save to emojis table
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

    console.log('Successfully uploaded and saved emoji:', emojiData);
    return emojiData;
  } catch (error) {
    console.error('Error in uploadEmoji:', error);
    throw error;
  }
} 