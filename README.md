# Emoji Maker App

This is a Next.js project that allows users to generate custom emojis using AI.

## Project Setup

1. Clone or unzip the project
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following environment variables:
```env
REPLICATE_API_TOKEN=your_replicate_token
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the Project

1. Navigate to the project directory:
```bash
cd path/to/emoji-maker
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
- Default URL: http://localhost:3000
- If port 3000 is in use, check the terminal output for the alternative port (e.g., http://localhost:3001)

## Important Notes

- The app requires all environment variables to be properly set in `.env.local`
- You must have Node.js installed
- Make sure to keep your environment variables secure and never commit them to version control
- The development server must be running to use the application
- If you see a blank page instead of the sign-in page, ensure the development server is running with `npm run dev`

## Tech Stack

- Next.js 14.2.16
- Clerk for authentication
- Supabase for database
- Replicate for AI emoji generation

## Dependencies

See `package.json` for the complete list of dependencies. Key packages:
- @clerk/nextjs: ^6.9.7
- next: 14.2.16
- react: ^18
- @supabase/supabase-js: ^2.47.10
