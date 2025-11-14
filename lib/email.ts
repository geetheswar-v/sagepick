import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

const EMAIL_HOST = process.env.EMAIL_SERVER_HOST;
const EMAIL_PORT = process.env.EMAIL_SERVER_PORT;
const EMAIL_SECURE = process.env.EMAIL_SERVER_SECURE;
const EMAIL_USER = process.env.EMAIL_SERVER_USER;
const EMAIL_PASSWORD = process.env.EMAIL_SERVER_PASSWORD;
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  process.env.EMAIL_SERVER_USER ||
  "no-reply@sagepick.in";

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
  throw new Error(
    "Missing SMTP configuration. Check EMAIL_SERVER_* environment variables."
  );
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure:
    EMAIL_SECURE === "true" ||
    EMAIL_SECURE === "1" ||
    Number(EMAIL_PORT) === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}
