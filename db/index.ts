// import { Pool } from '@neondatabase/serverless'; // Not used with neon-http directly
import { neon } from '@neondatabase/serverless'; // Use neon for Vercel Edge compatibility
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    'NEON_DATABASE_URL environment variable is not set or is empty. Please ensure it is in your .env.local file and the file is being loaded correctly.'
  );
}

// Create the Neon query function
const sql = neon(dbUrl);

// Initialize Drizzle with the Neon query function and the schema
export const db = drizzle(sql, { schema });

// Note: If you are exclusively using Vercel Edge Functions, 
// you might use `neon`
