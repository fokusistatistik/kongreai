import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(dirty: string | null | undefined): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}
