import type { LLMProvider } from "@/lib/llm/types";
import { PROVIDER_MODELS } from "@/lib/llm/types";
import { mapProviderError } from "@/lib/llm/errors";

type FetchFn = typeof fetch;
const MODEL = PROVIDER_MODELS.gemini;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiProvider implements LLMProvider {
  name = "gemini" as const;
  constructor(private key: string, private fetchFn: FetchFn = fetch) {}

  private async call(parts: unknown[]): Promise<string> {
    const url = `${BASE}/${MODEL}:generateContent`;
    const res = await this.fetchFn(url, {
      method: "POST",
      // Key goes in a header, never the URL — keeps it out of proxy/server logs.
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.key },
      body: JSON.stringify({ contents: [{ parts }] }),
    });
    if (!res.ok) throw mapProviderError("gemini", res.status, await res.text());
    const data = await res.json();
    const out = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    return out;
  }

  extractFromPdf(pdf: Buffer, prompt: string): Promise<string> {
    return this.call([
      { inline_data: { mime_type: "application/pdf", data: pdf.toString("base64") } },
      { text: prompt },
    ]);
  }

  async *extractFromPdfStream(pdf: Buffer, prompt: string): AsyncIterable<string> {
    const url = `${BASE}/${MODEL}:streamGenerateContent?alt=sse`;
    const res = await this.fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.key },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: "application/pdf", data: pdf.toString("base64") } },
          { text: prompt },
        ] }],
      }),
    });
    if (!res.ok) throw mapProviderError("gemini", res.status, await res.text());
    if (!res.body) return;
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const json = line.slice(5).trim();
        if (!json || json === "[DONE]") continue;
        try {
          const d = JSON.parse(json);
          const t = d?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
          if (t) yield t;
        } catch { /* partial/non-JSON keepalive line — skip */ }
      }
    }
  }

  reasonText(prompt: string): Promise<string> {
    return this.call([{ text: prompt }]);
  }
}
