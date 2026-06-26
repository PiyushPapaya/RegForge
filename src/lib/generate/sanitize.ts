/** Make a string safe to embed inside a C block comment: no comment-close, no newlines. */
export function sanitizeComment(s: string): string {
  return s.replace(/\*\//g, "* /").replace(/[\r\n]+/g, " ").trim();
}

/** Make a string safe as part of a C identifier (macro/function name): keep [A-Za-z0-9_]. */
export function sanitizeIdent(s: string): string {
  return s.replace(/[^A-Za-z0-9_]/g, "_");
}
