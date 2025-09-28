import { SYNC_CONFIG } from "@/lib/config/sync-config";

export class RateLimitHelper {
  private static requestCounts = new Map<string, number>();
  private static lastReset = new Map<string, number>();

  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async checkRateLimit(
    provider: keyof typeof SYNC_CONFIG.RATE_LIMITS
  ): Promise<void> {
    const config = SYNC_CONFIG.RATE_LIMITS[provider];
    const now = Date.now();
    const lastReset = this.lastReset.get(provider) || 0;

    // Reset counter if window has passed
    if (now - lastReset >= config.window) {
      this.requestCounts.set(provider, 0);
      this.lastReset.set(provider, now);
    }

    const currentCount = this.requestCounts.get(provider) || 0;

    // If we've hit the limit, wait for the window to reset
    if (currentCount >= config.requests) {
      const timeToWait = config.window - (now - lastReset);
      if (timeToWait > 0) {
        await this.delay(timeToWait);
      }
      this.requestCounts.set(provider, 0);
      this.lastReset.set(provider, Date.now());
    }

    // Increment counter
    this.requestCounts.set(
      provider,
      (this.requestCounts.get(provider) || 0) + 1
    );
  }
}
