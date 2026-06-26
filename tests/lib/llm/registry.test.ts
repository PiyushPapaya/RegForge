import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveProvider } from "@/lib/llm/registry";
import { ProviderError } from "@/lib/llm/errors";
import { GeminiProvider } from "@/lib/llm/gemini";

describe("resolveProvider", () => {
  const OLD = process.env.GEMINI_API_KEY;
  beforeEach(() => { delete process.env.GEMINI_API_KEY; });
  afterEach(() => { if (OLD) process.env.GEMINI_API_KEY = OLD; else delete process.env.GEMINI_API_KEY; });

  it("uses BYOK key when supplied", () => {
    const p = resolveProvider({ provider: "gemini", apiKey: "byok" });
    expect(p).toBeInstanceOf(GeminiProvider);
  });
  it("falls back to env key", () => {
    process.env.GEMINI_API_KEY = "envkey";
    expect(resolveProvider({ provider: "gemini" })).toBeInstanceOf(GeminiProvider);
  });
  it("throws ProviderError when no key anywhere", () => {
    expect(() => resolveProvider({ provider: "gemini" })).toThrow(ProviderError);
  });
  it("throws on unknown provider", () => {
    // @ts-expect-error testing runtime guard
    expect(() => resolveProvider({ provider: "bogus", apiKey: "x" })).toThrow(ProviderError);
  });
  it("defaults to anthropic when provider omitted", () => {
    process.env.ANTHROPIC_API_KEY = "a";
    const p = resolveProvider({ apiKey: undefined });
    expect(p.name).toBe("anthropic");
    delete process.env.ANTHROPIC_API_KEY;
  });
});
