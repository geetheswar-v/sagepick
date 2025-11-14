"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      redirect("/login");
    }

    return session;
  } catch {
    redirect("/login");
  }
};

export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Optimize database query - select only needed fields
  const currentUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true,
    },
  });

  if (!currentUser) {
    redirect("/login");
  }

  return {
    ...session,
    currentUser,
  };
};

export const signIn = async (email: string, password: string) => {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    if (response) {
      return {
        success: true,
        message: "Signed in successfully.",
      };
    } else {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }
  } catch (error) {
    const e = error as Error & { message?: string };
    const message = e.message || "Invalid email or password.";
    return {
      success: false,
      message: /verify/i.test(message)
        ? "Please verify your email address before signing in. We just sent you a fresh verification email."
        : message,
    };
  }
};

export const signUp = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
        callbackURL: "/login",
      },
      headers: await headers(),
    });

    if (response) {
      return {
        success: true,
        message:
          "Account created! We sent a verification link to your inbox. Please verify your email before signing in.",
      };
    } else {
      return {
        success: false,
        message: "Failed to create account.",
      };
    }
  } catch (error) {
    const e = error as Error & { message?: string };
    return {
      success: false,
      message: e.message || "An error occurred while creating the account.",
    };
  }
};

// ==================== USER PREFERENCES ====================

import type { ReleaseYearRange } from "@prisma/client";

export type UserPreferenceInput = {
  genreIds: number[];
  languages: string[];
  releaseYearRanges: ReleaseYearRange[];
  keywords?: string[];
};

export async function setUserPreferences(data: UserPreferenceInput) {
  try {
    const user = await getCurrentUser();

    const preference = await prisma.userPreference.upsert({
      where: {
        userId: user.currentUser.id,
      },
      update: {
        genreIds: data.genreIds,
        languages: data.languages,
        releaseYearRanges: data.releaseYearRanges,
        keywords: data.keywords || [],
        completedOnboarding: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.currentUser.id,
        genreIds: data.genreIds,
        languages: data.languages,
        releaseYearRanges: data.releaseYearRanges,
        keywords: data.keywords || [],
        completedOnboarding: true,
      },
    });

    return {
      success: true,
      data: preference,
      message: "Preferences saved successfully!",
    };
  } catch (error) {
    console.error("Error saving preferences:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save preferences",
    };
  }
}

export async function getUserPreferences() {
  try {
    const user = await getCurrentUser();

    const preference = await prisma.userPreference.findUnique({
      where: {
        userId: user.currentUser.id,
      },
    });

    return {
      success: true,
      data: preference,
    };
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch preferences",
    };
  }
}

export async function updatePreferences(data: Partial<UserPreferenceInput>) {
  try {
    const user = await getCurrentUser();

    // Check if preference exists
    const existing = await prisma.userPreference.findUnique({
      where: {
        userId: user.currentUser.id,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Preferences not found. Please complete onboarding first.",
      };
    }

    const preference = await prisma.userPreference.update({
      where: {
        userId: user.currentUser.id,
      },
      data: {
        ...(data.genreIds && { genreIds: data.genreIds }),
        ...(data.languages && { languages: data.languages }),
        ...(data.releaseYearRanges && {
          releaseYearRanges: data.releaseYearRanges,
        }),
        ...(data.keywords !== undefined && { keywords: data.keywords }),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: preference,
      message: "Preferences updated successfully!",
    };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update preferences",
    };
  }
}

export async function hasCompletedOnboarding() {
  try {
    const user = await getCurrentUser();

    const preference = await prisma.userPreference.findUnique({
      where: {
        userId: user.currentUser.id,
      },
      select: {
        completedOnboarding: true,
      },
    });

    return {
      success: true,
      completed: preference?.completedOnboarding ?? false,
    };
  } catch {
    return {
      success: false,
      completed: false,
    };
  }
}
