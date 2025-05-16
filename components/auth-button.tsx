"use client";

import { Button } from "@/components/ui/button";
// We'll need to import BetterAuth hooks later, e.g., useSession, signIn, signOut

export function AuthButton() {
  // const { data: session, status } = useSession(); // Placeholder for BetterAuth
  const status = "unauthenticated"; // Placeholder
  const session = null; // Placeholder

  if (status === "loading") {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        {/* <p>Signed in as {session.user?.email}</p> */}
        <Button variant="outline" onClick={() => console.log("signOut()") /* signOut() */}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => console.log("signIn(\'x\')") /* signIn('x') */}>Sign in with X</Button>
      <Button onClick={() => console.log("signIn(\'github\')") /* signIn('github') */}>Sign in with GitHub</Button>
      <Button onClick={() => console.log("signIn(\'google\')") /* signIn('google') */}>Sign in with Google</Button>
    </div>
  );
} 
