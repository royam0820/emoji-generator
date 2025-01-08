import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
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

export async function ensureUserProfile() {
  try {
    // Get the auth session
    const session = auth();
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
    console.error('Error in ensureUserProfile:', error);
    throw error;
  }
} 