export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&]/g, (character) => {
    const escapes: Record<string, string> = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" };
    return escapes[character];
  });
}
