export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  retry?: {
    attempts?: number;
    backoffMs?: number;
    retryOnStatus?: number[];
  };
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private retryAttempts: number;
  private retryBackoffMs: number;
  private retryStatuses: Set<number>;

  constructor({
    baseUrl = "/api",
    headers = {},
    retry = {},
  }: ApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    this.retryAttempts = Math.max(0, retry.attempts ?? 2);
    this.retryBackoffMs = Math.max(0, retry.backoffMs ?? 250);
    this.retryStatuses = new Set(
      retry.retryOnStatus ?? [408, 425, 429, 500, 502, 503, 504]
    );
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.retryAttempts) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            ...this.defaultHeaders,
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (
            attempt < this.retryAttempts &&
            this.retryStatuses.has(response.status)
          ) {
            await this.delay(attempt);
            attempt += 1;
            continue;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        const isAbortError = (error as { name?: string }).name === "AbortError";
        const isFetchError = error instanceof TypeError;
        const isNetworkIssue =
          (error as { code?: string }).code === "ECONNRESET" ||
          (error as { code?: string }).code === "ETIMEDOUT";

        if (
          attempt < this.retryAttempts &&
          (isAbortError || isFetchError || isNetworkIssue)
        ) {
          await this.delay(attempt);
          attempt += 1;
          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new Error("Request failed without specific error");
  }

  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  post<T>(endpoint: string, body: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
  }

  put<T>(endpoint: string, body: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers,
    });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }

  private async delay(attempt: number) {
    const delayMs = this.retryBackoffMs * Math.pow(2, attempt);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
