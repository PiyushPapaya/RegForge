export const PROVIDER_NAMES = ["anthropic", "openai", "gemini"] as const;
export type ProviderName = (typeof PROVIDER_NAMES)[number];

export const PROVIDER_MODELS: Record<ProviderName, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o",
  gemini: "gemini-2.5-flash",
};

/** The env var holding each provider's default key. */
export const PROVIDER_ENV: Record<ProviderName, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

export interface LLMProvider {
  name: ProviderName;
  /** Send a PDF + prompt, return raw model text. */
  extractFromPdf(pdf: Buffer, prompt: string): Promise<string>;
  /**
   * Optional streaming variant: yields raw text deltas as the model emits them,
   * so the route can report live progress. Falls back to extractFromPdf when absent.
   */
  extractFromPdfStream?(pdf: Buffer, prompt: string): AsyncIterable<string>;
  /** Text-only reasoning, return raw model text. */
  reasonText(prompt: string): Promise<string>;
}
