import { describe, it, expect, vi } from "vitest";
import { OpenAIProvider } from "@/lib/llm/openai";

function fakeClient(text: string) {
  return { chat: { completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: text } }] }) } } };
}

describe("OpenAIProvider", () => {
  it("extractFromPdf includes the prompt and a base64 file part, model gpt-4o", async () => {
    const client = fakeClient("MAP");
    const p = new OpenAIProvider("KEY", client as never);
    expect(await p.extractFromPdf(Buffer.from("x"), "prompt")).toBe("MAP");
    const arg = client.chat.completions.create.mock.calls[0][0];
    expect(arg.model).toBe("gpt-4o");
    const content = arg.messages[0].content;
    expect(content.some((c: any) => c.type === "text" && c.text === "prompt")).toBe(true);
    expect(content.some((c: any) => c.type === "file")).toBe(true);
  });
  it("reasonText returns the message content", async () => {
    const client = fakeClient("STEPS");
    const p = new OpenAIProvider("KEY", client as never);
    expect(await p.reasonText("p")).toBe("STEPS");
  });
});
