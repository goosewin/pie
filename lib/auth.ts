import { db } from "@/db/index"; // Corrected import path for the Drizzle instance
import * as schema from "@/db/schema"; // Assuming your Drizzle schema is here
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// Ensure environment variables are set for BetterAuth core and providers
const betterAuthSecret = process.env.AUTH_SECRET;
const betterAuthUrl = process.env.NEXT_PUBLIC_APP_URL;

// Social Provider Credentials (ensure these are in your .env.local)
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const xClientId = process.env.X_CLIENT_ID; // (Twitter/X)
const xClientSecret = process.env.X_CLIENT_SECRET;

if (!betterAuthSecret) {
  throw new Error(
    "Missing BETTER_AUTH_SECRET environment variable."
  );
}
if (!betterAuthUrl) {
  throw new Error(
    "Missing BETTER_AUTH_URL environment variable."
  );
}

export const auth = betterAuth({
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  database: drizzleAdapter(db, { schema, provider: "pg" }), // Corrected provider to "pg"

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    github: githubClientId && githubClientSecret ? {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    } : undefined,
    google: googleClientId && googleClientSecret ? {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    } : undefined,
    // Per BetterAuth docs, the key for Twitter/X is typically "twitter"
    twitter: xClientId && xClientSecret ? {
      clientId: xClientId,
      clientSecret: xClientSecret,
    } : undefined,
  },
  // plugins: [], // For other types of plugins like 2FA, magic links, etc.
});

// Optional: Type helper for server-side session access
// export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>['data']>; 
