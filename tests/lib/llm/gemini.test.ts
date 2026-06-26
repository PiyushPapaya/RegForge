import { describe, it, expect, vi } from "vitest";
import { GeminiProvider } from "@/lib/llm/gemini";
import { ProviderError } from "@/lib/llm/errors";

function okResponse(text: string) {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });
}

describe("GeminiProvider", () => {
  it("extractFromPdf sends inlineData PDF and returns text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse("HELLO"));
    const p = new GeminiProvider("KEY123", fetchMock);
    const out = await p.extractFromPdf(Buffer.from("pdfbytes"), "do it");
    expect(out).toBe("HELLO");
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("gemini-2.5-flash:generateContent");
    expect(String(url)).toContain("key=KEY123");
    const body = JSON.parse((init as RequestInit).body as string);
    const parts = body.contents[0].parts;
    expect(parts.some((x: any) => x.inline_data?.mime_type === "application/pdf")).toBe(true);
    expect(parts.some((x: any) => x.text === "do it")).toBe(true);
  });

  it("reasonText sends a text-only request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse("STEP"));
    const p = new GeminiProvider("K", fetchMock);
    const out = await p.reasonText("prompt");
    expect(out).toBe("STEP");
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.contents[0].parts).toEqual([{ text: "prompt" }]);
  });

  it("throws ProviderError on 429", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("limit: 0", { status: 429 }));
    const p = new GeminiProvider("K", fetchMock);
    await expect(p.reasonText("x")).rejects.toBeInstanceOf(ProviderError);
  });
});
