"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverItem } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

type AuthState = "loading" | "authenticated" | "unauthenticated";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export function Header() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const checkAuthOptimized = async () => {
    try {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        setUser(session.user);
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
      }
    } catch {
      setAuthState("unauthenticated");
    }
  };

  useEffect(() => {
    checkAuthOptimized();

    const handleAuthChange = () => {
      setTimeout(checkAuthOptimized, 100);
    };

    window.addEventListener("authStateChange", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChange", handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setAuthState("unauthenticated");
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout error:", error);
    }
  };

  const renderAuthSection = () => {
    if (authState === "unauthenticated") {
      return (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      );
    }

    if (authState === "authenticated") {
      // authenticated state
      return (
        <Popover
          trigger={
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "User"}
                />
                <AvatarFallback name={user?.name}>
                  U
                </AvatarFallback>
              </Avatar>
            </Button>
          }
          content={
            <div className="w-56">
              <div className="flex items-center space-x-2 p-3 border-b">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback name={user?.name} />
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <PopoverItem onClick={handleLogout}>
                Logout
              </PopoverItem>
            </div>
          }
          align="end"
        />
      );
    }

    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">SagePick</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
            <Link
              href="/movies"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Movies
            </Link>
            <Link
              href="/search"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Search
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
}
