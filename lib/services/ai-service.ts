// Agentic AI Service client
// Provides access to the hosted recommendation/search agent

export interface AgentSearchResponse {
  answer: string;
  movies: string[];
  confidence: number;
  route_taken: "direct_answer" | "research" | string;
}

const AI_SERVICE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
  process.env.AI_SERVICE_URL ||
  "https://ai.sagepick.in";

const AI_API_BASE = `${AI_SERVICE_URL}`;

export async function agentSearch(query: string): Promise<AgentSearchResponse> {
  const response = await fetch(`${AI_API_BASE}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    next: {
      revalidate: 0,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(
      `AI Search Error: ${response.status} - ${
        errorText || response.statusText
      }`
    );
  }

  return response.json();
}
