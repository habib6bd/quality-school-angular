const ALLOWED_EXTENSIONS = new Set(['webp', 'png', 'jpg', 'jpeg', 'pdf']);

/**
 * Returns an attachment path only when it is safe to put in a link: a site-relative file path
 * (no scheme, no protocol-relative `//`, no `..`, no query or fragment) with an allowed file
 * type. Anything else returns `null` and the UI refuses to link to it.
 */
export function safeAttachmentPath(src: string): string | null {
  if (!src || src.startsWith('/') || src.includes('\\') || /^[a-z][a-z0-9+.-]*:/i.test(src))
    return null;
  if (src.includes('..') || /[?#\s]/.test(src)) return null;
  const extension = src.split('.').pop()?.toLowerCase() ?? '';
  return ALLOWED_EXTENSIONS.has(extension) ? src : null;
}
