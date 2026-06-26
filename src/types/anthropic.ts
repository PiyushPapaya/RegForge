import Anthropic from "@anthropic-ai/sdk";
import type { TextCaller } from "@/lib/extract/extractRegisterMap";
import type {
  DocumentBlockParam,
  TextBlockParam,
} from "@anthropic-ai/sdk/resources/messages/messages";

export const MODEL = "claude-sonnet-4-6";

export function makeClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export function makePdfCaller(client: Anthropic): TextCaller {
  return async (prompt, pdf) => {
    const content: (DocumentBlockParam | TextBlockParam)[] = [
      {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: pdf.toString("base64"),
        },
      },
      { type: "text", text: prompt },
    ];

    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });

    const block = msg.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : "";
  };
}
