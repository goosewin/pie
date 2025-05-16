import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is not set or is empty.");
}

export default defineConfig({
  schema: "./db/schema.ts", // Path to your schema file
  out: "./drizzle/migrations", // Standard output directory for migrations
  dialect: "postgresql", // Specify PostgreSQL dialect for Neon
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true, // For detailed output during operations
  strict: true, // For stricter type checking and error reporting
}); 
