import { createAuthClient } from "better-auth/react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * BetterAuth client instance.
 * This client is used to interact with the auth server from the client-side,
 * providing methods for sign-in, sign-up, sign-out, session management (useSession hook), etc.
 *
 * The baseURL should point to the root of your application where the BetterAuth API
 * routes (e.g., /api/auth/*) are hosted.
 */
export const authClient = createAuthClient({
  /** 
   * The base URL of the server where BetterAuth API routes are handled.
   * Optional if the auth server is running on the same domain as your client.
   * If your auth routes are at /api/auth/*, this should be your app's base URL.
   */
  baseURL: appUrl, // e.g., 'http://localhost:3000' or your production URL
  // plugins: [], // Add any client-side plugins here if needed later
});

// You can also export specific methods if you prefer to use them directly:
// export const { signIn, signUp, signOut, useSession, getSession } = authClient; 
