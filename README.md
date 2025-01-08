# Emoji Generator App

A modern web application that allows users to generate custom emojis using AI. Built with Next.js, Clerk for authentication, and Supabase for storage.

## Features

- 🎨 AI-powered emoji generation using Replicate's SDXL model
- 🔐 User authentication with Clerk
- 💾 Persistent storage with Supabase
- ❤️ Like and save your favorite emojis
- 📥 Download generated emojis
- 🎯 User-specific emoji collections
- 🌈 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14.2.16, React 18
- **Authentication**: Clerk
- **Database & Storage**: Supabase
- **AI Model**: Replicate (SDXL Emoji)
- **Styling**: Tailwind CSS, Shadcn UI
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Clerk account for authentication
- A Supabase account for database and storage
- A Replicate account for AI model access

## Project Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/emoji-generator.git
cd emoji-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
REPLICATE_API_TOKEN=your_replicate_token
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up Supabase:
   - Create a new Supabase project
   - Create the required tables:
     ```sql
     -- Emojis table
     CREATE TABLE emojis (
         id BIGSERIAL PRIMARY KEY,
         image_url TEXT NOT NULL,
         prompt TEXT NOT NULL,
         likes_count INTEGER DEFAULT 0,
         creator_user_id TEXT NOT NULL,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );

     -- Emoji likes table
     CREATE TABLE emoji_likes (
         emoji_id BIGINT REFERENCES emojis(id) ON DELETE CASCADE,
         user_id TEXT NOT NULL,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
         PRIMARY KEY (emoji_id, user_id)
     );

     -- User profiles table
     CREATE TABLE profiles (
         user_id TEXT PRIMARY KEY,
         credits INTEGER DEFAULT 3 NOT NULL,
         tier TEXT NOT NULL DEFAULT 'free',
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```

## Running the Project

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
   - Default URL: http://localhost:3000
   - If port 3000 is in use, check the terminal output for the alternative port

## Usage

1. **Authentication**:
   - Sign up or log in using the Clerk authentication system
   - A user profile will be automatically created in Supabase

2. **Generating Emojis**:
   - Enter a text prompt describing the emoji you want to create
   - Wait for the AI model to generate your custom emoji
   - The emoji will be saved to your collection automatically

3. **Managing Emojis**:
   - View all your generated emojis in the grid
   - Like/unlike emojis to keep track of your favorites
   - Download emojis for use in other applications
   - Delete emojis you no longer want

## Project Structure

```
emoji-generator/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── api/              # API routes
│   ├── components/       # React components
│   └── ...              # Other app files
├── components/            # Shared UI components
├── lib/                   # Utility functions
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Replicate](https://replicate.com) for the SDXL emoji model
- [Clerk](https://clerk.dev) for authentication
- [Supabase](https://supabase.com) for database and storage
- [Shadcn UI](https://ui.shadcn.com) for UI components
