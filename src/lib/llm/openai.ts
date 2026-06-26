import OpenAI from "openai";
import type { LLMProvider } from "@/lib/llm/types";
import { PROVIDER_MODELS } from "@/lib/llm/types";

const MODEL = PROVIDER_MODELS.openai;

export class OpenAIProvider implements LLMProvider {
  name = "openai" as const;
  private client: OpenAI;
  constructor(key: string, client?: OpenAI) {
    this.client = client ?? new OpenAI({ apiKey: key });
  }
  async extractFromPdf(pdf: Buffer, prompt: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: [
            { type: "text", text: prompt },
            { type: "file", file: { filename: "datasheet.pdf", file_data: `data:application/pdf;base64,${pdf.toString("base64")}` } },
          ] as any,
        },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }
  async reasonText(prompt: string): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: MODEL, max_tokens: 4000, messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0]?.message?.content ?? "";
  }
}
