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

export function SiteHeader() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover:bg-muted text-sm px-3 sm:px-4">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-3 sm:px-4">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      );
    }

    if (authState === "authenticated") {
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Popover
            trigger={
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 flex items-center justify-center hover:bg-muted"
              >
                <Avatar 
                  src={user?.image}
                  name={user?.name}
                  alt={user?.name || "User"}
                  size={32}
                  className="border-2 border-border w-7 h-7 sm:w-8 sm:h-8"
                />
              </Button>
            }
            content={
              <div className="w-64">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Avatar 
                    src={user?.image}
                    name={user?.name}
                    alt={user?.name || "User"}
                    size={40}
                    className="border border-border"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="p-1">
                  <PopoverItem onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
      </div>
    );
  };

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-md border-b border-border/40' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl sm:text-2xl text-primary">SagePick</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
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
