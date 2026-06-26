import { describe, it, expect } from "vitest";
import { buildZip } from "@/lib/zip";
import JSZip from "jszip";

describe("buildZip", () => {
  it("packs all files and round-trips", async () => {
    const blob = await buildZip([
      { name: "a.h", content: "AAA" },
      { name: "b.c", content: "BBB" },
    ]);
    const z = await JSZip.loadAsync(blob);
    expect(await z.file("a.h")!.async("string")).toBe("AAA");
    expect(await z.file("b.c")!.async("string")).toBe("BBB");
  });
});
