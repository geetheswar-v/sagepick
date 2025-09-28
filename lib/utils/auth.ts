import { NextRequest } from "next/server";

export function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.JOB_API_KEY;
  return !!expectedApiKey && apiKey === expectedApiKey;
}

export function verifyDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}
