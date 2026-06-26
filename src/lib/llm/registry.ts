import { PROVIDER_ENV, PROVIDER_NAMES, type LLMProvider, type ProviderName } from "@/lib/llm/types";
import { ProviderError } from "@/lib/llm/errors";
import { AnthropicProvider } from "@/lib/llm/anthropic";
import { OpenAIProvider } from "@/lib/llm/openai";
import { GeminiProvider } from "@/lib/llm/gemini";

export interface ProviderRequest {
  provider?: ProviderName;  // validated at runtime; unknown strings caught by guard
  apiKey?: string;          // optional BYOK
}

function isProviderName(x: unknown): x is ProviderName {
  return typeof x === "string" && (PROVIDER_NAMES as readonly string[]).includes(x);
}

export function resolveProvider(req: ProviderRequest): LLMProvider {
  const name: ProviderName = req.provider == null ? "anthropic" : (req.provider as ProviderName);
  if (!isProviderName(name)) {
    throw new ProviderError("anthropic", 400, `Unknown provider "${req.provider}".`);
  }
  const key = req.apiKey?.trim() || process.env[PROVIDER_ENV[name]];
  if (!key) {
    throw new ProviderError(name, 401, `No API key for ${name}. Add one in settings or set ${PROVIDER_ENV[name]}.`);
  }
  switch (name) {
    case "anthropic": return new AnthropicProvider(key);
    case "openai": return new OpenAIProvider(key);
    case "gemini": return new GeminiProvider(key);
  }
}
