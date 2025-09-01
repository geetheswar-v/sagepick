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
    const e = error as Error;
    return {
      success: false,
      message: e.message || "Invalid email or password.",
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
      },
      headers: await headers(),
    });

    if (response) {
      return {
        success: true,
        message: "Account created successfully.",
      };
    } else {
      return {
        success: false,
        message: "Failed to create account.",
      };
    }
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message || "An error occurred while creating the account.",
    };
  }
};
