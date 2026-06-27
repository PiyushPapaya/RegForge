import { describe, it, expect } from "vitest";
import { PROVIDER_MODELS, PROVIDER_NAMES } from "@/lib/llm/types";

describe("provider constants", () => {
  it("lists the three providers", () => {
    expect(PROVIDER_NAMES).toEqual(["anthropic", "openai", "gemini"]);
  });
  it("maps gemini to gemini-2.5-flash (NOT 2.0)", () => {
    expect(PROVIDER_MODELS.gemini).toBe("gemini-2.5-flash");
  });
  it("maps anthropic and openai to their models", () => {
    expect(PROVIDER_MODELS.anthropic).toBe("claude-sonnet-4-6");
    expect(PROVIDER_MODELS.openai).toBe("gpt-4o");
  });
});
