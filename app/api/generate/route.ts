import { NextResponse } from 'next/server';
import { generateAndUploadEmoji } from '@/app/actions/emoji-actions';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return new NextResponse('Prompt is required', { status: 400 });
    }

    const emoji = await generateAndUploadEmoji(prompt);
    
    // Format the response to match what the frontend expects
    return NextResponse.json({ 
      images: [emoji.image_url],
      data: emoji
    });
  } catch (error) {
    console.error('Error in generate route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 