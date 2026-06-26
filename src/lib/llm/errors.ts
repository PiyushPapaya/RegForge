import type { ProviderName } from "@/lib/llm/types";

export class ProviderError extends Error {
  constructor(
    public provider: ProviderName,
    public status: number,
    public userMessage: string,
  ) {
    super(userMessage);
    this.name = "ProviderError";
  }
}

const label: Record<ProviderName, string> = {
  anthropic: "Anthropic", openai: "OpenAI", gemini: "Gemini",
};

export function mapProviderError(provider: ProviderName, status: number, _body: string): ProviderError {
  const who = label[provider];
  let msg: string;
  if (status === 401 || status === 403) {
    msg = `${who} rejected this API key — check it or pick another provider.`;
  } else if (status === 429) {
    msg = `${who} is rate-limited or its free tier is exhausted — wait a moment, switch provider, or add your own key.`;
  } else {
    msg = `${who} request failed (status ${status}). Try again or pick another provider.`;
  }
  return new ProviderError(provider, status, msg);
}
