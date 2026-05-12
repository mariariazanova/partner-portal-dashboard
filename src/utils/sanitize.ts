/**
 * Input Sanitization Utilities
 *
 * - Sanitize user inputs to prevent XSS attacks
 * - Remove HTML tags and dangerous characters
 * - Trim whitespace
 */

/**
 * Sanitize text input by removing HTML tags and dangerous characters
 * @param input - Raw user input
 * @returns Sanitized string safe for display
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return (
    input
      // Remove script/style blocks completely
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

      // Remove event handlers
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')

      // Remove javascript: protocol
      .replace(/javascript:/gi, '')

      // Remove remaining HTML tags
      .replace(/<[^>]*>/g, '')

      // Trim whitespace
      .trim()
  )
}

/**
 * Sanitize search query with additional restrictions
 * @param query - Search query input
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  const sanitized = sanitizeInput(query).toLowerCase()

  // Limit length to prevent DoS
  const maxLength = 200
  return sanitized.slice(0, maxLength)
}

/**
 * Sanitize number input
 * @param input - Number input (may be string or number)
 * @returns Valid number or null
 */
export function sanitizeNumberInput(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) {
    return null
  }

  // Handle strings
  if (typeof input === 'string') {
    const trimmed = input.trim()

    if (trimmed === '') {
      return null
    }

    // Reject hex/octal/binary notation
    if (/^0[xob]/i.test(trimmed)) {
      return null
    }

    // Strict decimal validation
    if (!/^-?\d+(\.\d+)?(e[-+]?\d+)?$/i.test(trimmed)) {
      return null
    }

    const num = Number(trimmed)

    return isFinite(num) ? num : null
  }

  // Handle numbers
  return isFinite(input) ? input : null
}

/**
 * Sanitize email input
 * @param email - Email input
 * @returns Sanitized email or empty string
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  const sanitized = sanitizeInput(email)

  // Basic email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(sanitized) ? sanitized : ''
}
