"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Popover, PopoverItem } from "@/components/ui/popover";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

type AuthState = "loading" | "authenticated" | "unauthenticated";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/search", label: "Search" },
];

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
        <div className="flex items-center gap-2">
          <ThemeToggle />
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
      return (
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Popover
            trigger={
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full p-0 flex items-center justify-center"
              >
                <Avatar 
                  src={user?.image}
                  name={user?.name}
                  alt={user?.name || "User"}
                  size={32}
                  className="border"
                />
              </Button>
            }
            content={
              <div className="w-64">
                <div className="flex items-center gap-3 p-4 border-b">
                  <Avatar 
                    src={user?.image}
                    name={user?.name}
                    alt={user?.name || "User"}
                    size={40}
                    className="border"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="p-1">
                  <PopoverItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50">
                    Logout
                  </PopoverItem>
                </div>
              </div>
            }
            align="end"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">SagePick</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-foreground text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side - Auth Section */}
        <div className="flex items-center">
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
}
