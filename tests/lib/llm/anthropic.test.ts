import { describe, it, expect, vi } from "vitest";
import { AnthropicProvider } from "@/lib/llm/anthropic";

function fakeClient(text: string) {
  return { messages: { create: vi.fn().mockResolvedValue({ content: [{ type: "text", text }] }) } };
}

describe("AnthropicProvider", () => {
  it("extractFromPdf sends a document block and returns text", async () => {
    const client = fakeClient("MAP");
    const p = new AnthropicProvider("KEY", client as never);
    const out = await p.extractFromPdf(Buffer.from("x"), "prompt");
    expect(out).toBe("MAP");
    const arg = client.messages.create.mock.calls[0][0];
    expect(arg.model).toBe("claude-sonnet-4-6");
    const content = arg.messages[0].content;
    type Block = { type: string; text?: string };
    expect(content.some((c: Block) => c.type === "document")).toBe(true);
    expect(content.some((c: Block) => c.type === "text" && c.text === "prompt")).toBe(true);
  });
  it("reasonText sends a plain text message", async () => {
    const client = fakeClient("STEPS");
    const p = new AnthropicProvider("KEY", client as never);
    expect(await p.reasonText("p")).toBe("STEPS");
  });
});
