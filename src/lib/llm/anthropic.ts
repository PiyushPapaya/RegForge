import Anthropic from "@anthropic-ai/sdk";
import type { DocumentBlockParam, TextBlockParam } from "@anthropic-ai/sdk/resources/messages/messages";
import type { LLMProvider } from "@/lib/llm/types";
import { PROVIDER_MODELS } from "@/lib/llm/types";

const MODEL = PROVIDER_MODELS.anthropic;

export class AnthropicProvider implements LLMProvider {
  name = "anthropic" as const;
  private client: Anthropic;
  constructor(key: string, client?: Anthropic) {
    this.client = client ?? new Anthropic({ apiKey: key });
  }
  async extractFromPdf(pdf: Buffer, prompt: string): Promise<string> {
    const content: (DocumentBlockParam | TextBlockParam)[] = [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") } },
      { type: "text", text: prompt },
    ];
    const msg = await this.client.messages.create({ model: MODEL, max_tokens: 8000, messages: [{ role: "user", content }] });
    const b = msg.content.find((x) => x.type === "text");
    return b && b.type === "text" ? b.text : "";
  }
  async reasonText(prompt: string): Promise<string> {
    const msg = await this.client.messages.create({ model: MODEL, max_tokens: 4000, messages: [{ role: "user", content: prompt }] });
    const b = msg.content.find((x) => x.type === "text");
    return b && b.type === "text" ? b.text : "";
  }
}
