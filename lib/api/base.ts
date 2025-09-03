export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor({ baseUrl = "/api", headers = {} }: ApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
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
}
