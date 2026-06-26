import JSZip from "jszip";

export interface GenFile { name: string; content: string; }

export async function buildZip(files: GenFile[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.content);
  return zip.generateAsync({ type: "uint8array" });
}
