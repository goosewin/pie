import { auth } from "@/lib/auth"; // Path to your server-side auth instance
import { toNextJsHandler } from "better-auth/next-js"; // BetterAuth helper for Next.js

/**
 * API route handlers for BetterAuth.
 * This file sets up the catch-all route (e.g., /api/auth/*)
 * to handle all authentication-related requests like sign-in, sign-up,
 * callbacks from OAuth providers, session management, etc.
 */

// Export the GET and POST handlers provided by BetterAuth
// These handlers will process requests based on the [...all] segment in the path.
export const { GET, POST } = toNextJsHandler(auth);

// Optional: You can also define OPTIONS, PUT, DELETE, PATCH, HEAD if needed for specific auth flows
// or if BetterAuth requires them, though typically GET and POST are sufficient for core auth.

// Note: Ensure that your `betterAuthUrl` in `lib/auth.ts` and `baseURL` in `lib/auth-client.ts`
// correctly point to the path where these handlers are mounted (e.g., http://localhost:3000 if routes are at /api/auth/*).
// The `basePath` in `lib/auth-client.ts` (if `baseURL` is not the app root) or the full `baseURL`
// in `authClient` should align with this API route structure.
// If `authClient` baseURL is `http://localhost:3000` and these routes are at `/api/auth`, then requests will go to `/api/auth/...`. 
