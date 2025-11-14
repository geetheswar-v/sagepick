import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../prisma";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "../email";
import bcrypt from "bcryptjs";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "SagePick";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "https://www.sagepick.in",
    "https://sagepick.in",
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    password: {
      // Use bcrypt for password hashing (for seed compatibility)
      hash: async (password: string) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({
        hash,
        password,
      }: {
        hash: string;
        password: string;
      }) => {
        if (!hash) return false;
        // Support both bcrypt ($2a/$2b) and scrypt hashes
        if (hash.startsWith("$2a$") || hash.startsWith("$2b$")) {
          try {
            return await bcrypt.compare(password, hash);
          } catch {
            return false;
          }
        }
        return false;
      },
    },
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `${appName} password reset instructions`,
        text: `Hi ${
          user.name || "there"
        },\n\nWe received a request to reset your ${appName} password.\n\nOpen the link below to set a new password. The link expires in one hour.\n${url}\n\nIf you did not request a password reset, you can safely ignore this email.\n\nThanks,\n${appName} Support`,
        html:
          `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;">` +
          `<p>Hi ${user.name || "there"},</p>` +
          `<p>We received a request to reset your ${appName} password.</p>` +
          `<p><a href="${url}" style="display:inline-block;padding:12px 18px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">Reset password</a></p>` +
          `<p>This link expires in one hour. If you did not request a reset, you can safely ignore this email.</p>` +
          `<p>Thanks,<br/>${appName} Support</p>` +
          `<p style="font-size:12px;color:#6b7280;">If the button above does not work, copy and paste this URL into your browser:<br/><a href="${url}">${url}</a></p>` +
          `</body></html>`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Verify your ${appName} email address`,
        text: `Hi ${
          user.name || "there"
        },\n\nWelcome to ${appName}! Please confirm your email address by opening the link below.\n${url}\n\nIf you did not create this account, you can ignore this message.`,
        html:
          `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;">` +
          `<p>Hi ${user.name || "there"},</p>` +
          `<p>Welcome to ${appName}! Please confirm your email address to activate your account.</p>` +
          `<p><a href="${url}" style="display:inline-block;padding:12px 18px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">Verify email</a></p>` +
          `<p>If you did not create this account, you can ignore this message.</p>` +
          `<p>Thanks,<br/>${appName} Support</p>` +
          `<p style="font-size:12px;color:#6b7280;">If the button above does not work, copy and paste this URL into your browser:<br/><a href="${url}">${url}</a></p>` +
          `</body></html>`,
      });
    },
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [nextCookies()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    window: 60,
    max: 30,
  },
});
