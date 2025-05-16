"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For user image
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // For user menu
import { authClient } from "@/lib/auth-client";
import { Github, LogIn, LogOut, Mail, Twitter, UserCircle } from "lucide-react"; // Corrected Github and Twitter icons

export function AuthStatus() {
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      // Optional: redirect on success, though BetterAuth might handle this
      // fetchOptions: { onSuccess: () => window.location.reload() }
    });
    // Typically, useSession will update and re-render automatically
  };

  if (isPending) {
    return <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />; // Skeleton loader
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User avatar"} />
              <AvatarFallback>
                {session.user?.name ? session.user.name.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user?.name || "Authenticated User"}
              </p>
              {session.user?.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Add other items like "Profile", "Settings" if needed */}
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If not authenticated, show Sign In button
  // This could link to a /login page which then uses authClient.signIn methods
  // Or directly trigger signIn methods if using a modal approach.
  // For now, linking to a conceptual /login page.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" /> Sign In
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Sign in with</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => authClient.signIn.social({ provider: "github" })}
          className="cursor-pointer"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => authClient.signIn.social({ provider: "google" })}
          className="cursor-pointer"
        >
          <Mail className="mr-2 h-4 w-4" />
          Google
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => authClient.signIn.social({ provider: "twitter" })}
          className="cursor-pointer"
        >
          <Twitter className="mr-2 h-4 w-4" />
          X (Twitter)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
