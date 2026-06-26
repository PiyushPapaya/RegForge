import { describe, it, expect } from "vitest";
import { mapProviderError, ProviderError } from "@/lib/llm/errors";

describe("mapProviderError", () => {
  it("401/403 -> bad key message", () => {
    const e = mapProviderError("gemini", 401, "");
    expect(e).toBeInstanceOf(ProviderError);
    expect(e.status).toBe(401);
    expect(e.userMessage).toMatch(/key/i);
    expect(e.userMessage).toMatch(/gemini/i);
  });
  it("429 -> rate-limit message", () => {
    const e = mapProviderError("gemini", 429, "limit: 0");
    expect(e.userMessage).toMatch(/rate|quota|limit/i);
  });
  it("other -> generic provider message", () => {
    const e = mapProviderError("openai", 500, "boom");
    expect(e.userMessage).toMatch(/openai/i);
  });
  it("never leaks the raw body verbatim in userMessage", () => {
    const e = mapProviderError("gemini", 400, "SECRET-INTERNAL-DETAIL");
    expect(e.userMessage).not.toContain("SECRET-INTERNAL-DETAIL");
  });
});
