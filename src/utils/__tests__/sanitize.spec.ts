import { describe, it, expect } from 'vitest'
import {
  sanitizeInput,
  sanitizeSearchQuery,
  sanitizeNumberInput
} from '../sanitize'

describe('sanitize utilities', () => {
  describe('sanitizeInput', () => {
    describe('XSS Prevention', () => {
      it('should remove script tags', () => {
        const input = '<script>alert("xss")</script>Hello'
        const result = sanitizeInput(input)

        expect(result).toBe('Hello')
        expect(result).not.toContain('<script>')
        expect(result).not.toContain('alert')
      })

      it('should remove inline JavaScript', () => {
        const input = '<img onerror="alert(1)" src="x">'
        const result = sanitizeInput(input)

        expect(result).not.toContain('onerror')
        expect(result).not.toContain('alert')
      })

      it('should remove javascript: protocol', () => {
        const input = '<a href="javascript:alert(1)">Click</a>'
        const result = sanitizeInput(input)

        expect(result).not.toContain('javascript:')
        expect(result).not.toContain('alert')
      })

      it('should remove event handlers', () => {
        const handlers = [
          'onclick="alert(1)"',
          'onload="alert(1)"',
          'onmouseover="alert(1)"',
          'onerror="alert(1)"'
        ]

        handlers.forEach(handler => {
          const input = `<div ${handler}>Test</div>`
          const result = sanitizeInput(input)

          expect(result).not.toContain('alert')
          expect(result).not.toContain('onclick')
          expect(result).not.toContain('onload')
          expect(result).not.toContain('onmouseover')
          expect(result).not.toContain('onerror')
        })
      })

      it('should remove all HTML tags', () => {
        const input = '<div><p>Hello <strong>World</strong></p></div>'
        const result = sanitizeInput(input)

        expect(result).toBe('Hello World')
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
      })

      it('should handle nested script tags', () => {
        const input = '<script><script>alert("nested")</script></script>'
        const result = sanitizeInput(input)

        expect(result).toBe('')
        expect(result).not.toContain('script')
        expect(result).not.toContain('alert')
      })

      it('should handle mixed case tags', () => {
        const inputs = [
          '<SCRIPT>alert(1)</SCRIPT>',
          '<ScRiPt>alert(1)</ScRiPt>',
          '<sCrIpT>alert(1)</sCrIpT>'
        ]

        inputs.forEach(input => {
          const result = sanitizeInput(input)

          expect(result).toBe('')
          expect(result).not.toContain('alert')
        })
      })
    })

    describe('Whitespace Handling', () => {
      it('should trim leading and trailing whitespace', () => {
        const input = '   Hello World   '
        const result = sanitizeInput(input)

        expect(result).toBe('Hello World')
      })

      it('should preserve internal whitespace', () => {
        const input = 'Hello    World'
        const result = sanitizeInput(input)

        expect(result).toBe('Hello    World')
      })

      it('should handle newlines and tabs', () => {
        const input = '  \n\t  Hello  \n\t  World  \n\t  '
        const result = sanitizeInput(input)

        // Trim removes leading/trailing but preserves internal
        expect(result).toContain('Hello')
        expect(result).toContain('World')
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty string', () => {
        const result = sanitizeInput('')

        expect(result).toBe('')
      })

      it('should handle string with only whitespace', () => {
        const result = sanitizeInput('   ')

        expect(result).toBe('')
      })

      it('should handle string with only tags', () => {
        const result = sanitizeInput('<div></div>')

        expect(result).toBe('')
      })

      it('should handle normal text without changes', () => {
        const input = 'Hello World 123'
        const result = sanitizeInput(input)

        expect(result).toBe('Hello World 123')
      })

      it('should preserve special characters', () => {
        const input = 'Price: $1,000.00 (USD) - 50% off!'
        const result = sanitizeInput(input)

        expect(result).toBe('Price: $1,000.00 (USD) - 50% off!')
      })

      it('should handle unicode characters', () => {
        const input = 'Hello 世界 🌍'
        const result = sanitizeInput(input)

        expect(result).toBe('Hello 世界 🌍')
      })
    })

    describe('Real-World Attack Vectors', () => {
      it('should prevent SVG-based XSS', () => {
        const input = '<svg onload="alert(1)">'
        const result = sanitizeInput(input)

        expect(result).not.toContain('onload')
        expect(result).not.toContain('alert')
      })

      it('should prevent iframe injection', () => {
        const input = '<iframe src="javascript:alert(1)"></iframe>'
        const result = sanitizeInput(input)

        expect(result).not.toContain('iframe')
        expect(result).not.toContain('javascript:')
      })

      it('should prevent form injection', () => {
        const input = '<form action="evil.com"><input type="submit"></form>'
        const result = sanitizeInput(input)

        expect(result).not.toContain('form')
        expect(result).not.toContain('action')
      })

      it('should prevent style-based attacks', () => {
        const input = '<style>body { display: none; }</style>'
        const result = sanitizeInput(input)

        expect(result).not.toContain('style')
        expect(result).not.toContain('display')
      })
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should trim and convert to lowercase', () => {
      const input = '  HELLO WORLD  '
      const result = sanitizeSearchQuery(input)

      expect(result).toBe('hello world')
    })

    it('should remove HTML tags', () => {
      const input = '<script>search</script>term'
      const result = sanitizeSearchQuery(input)

      expect(result).toBe('term')
      expect(result).not.toContain('script')
    })

    it('should handle empty string', () => {
      const result = sanitizeSearchQuery('')

      expect(result).toBe('')
    })

    it('should preserve search-relevant characters', () => {
      const input = 'ACME Corp - Deal #123'
      const result = sanitizeSearchQuery(input)

      expect(result).toBe('acme corp - deal #123')
    })

    it('should remove excess whitespace', () => {
      const input = '  multiple    spaces   '
      const result = sanitizeSearchQuery(input)

      // Internal spaces might be preserved, but trimmed
      expect(result.startsWith(' ')).toBe(false)
      expect(result.endsWith(' ')).toBe(false)
    })
  })

  describe('sanitizeNumberInput', () => {
    describe('Valid Numbers', () => {
      it('should parse valid number strings', () => {
        expect(sanitizeNumberInput('123')).toBe(123)
        expect(sanitizeNumberInput('456.78')).toBe(456.78)
        expect(sanitizeNumberInput('0')).toBe(0)
      })

      it('should handle numbers passed as numbers', () => {
        expect(sanitizeNumberInput(123)).toBe(123)
        expect(sanitizeNumberInput(456.78)).toBe(456.78)
        expect(sanitizeNumberInput(0)).toBe(0)
      })

      it('should trim whitespace', () => {
        expect(sanitizeNumberInput('  123  ')).toBe(123)
        expect(sanitizeNumberInput(' 456.78 ')).toBe(456.78)
      })

      it('should handle negative numbers', () => {
        expect(sanitizeNumberInput('-123')).toBe(-123)
        expect(sanitizeNumberInput(-456)).toBe(-456)
      })
    })

    describe('Invalid Inputs', () => {
      it('should return null for null', () => {
        expect(sanitizeNumberInput(null)).toBeNull()
      })

      it('should return null for undefined', () => {
        expect(sanitizeNumberInput(undefined)).toBeNull()
      })

      it('should return null for empty string', () => {
        expect(sanitizeNumberInput('')).toBeNull()
      })

      it('should return null for whitespace-only string', () => {
        expect(sanitizeNumberInput('   ')).toBeNull()
      })

      it('should return null for non-numeric strings', () => {
        expect(sanitizeNumberInput('abc')).toBeNull()
        expect(sanitizeNumberInput('not a number')).toBeNull()
        expect(sanitizeNumberInput('12abc')).toBeNull()
      })

      it('should return null for NaN', () => {
        expect(sanitizeNumberInput(NaN)).toBeNull()
      })

      it('should return null for Infinity', () => {
        expect(sanitizeNumberInput(Infinity)).toBeNull()
        expect(sanitizeNumberInput(-Infinity)).toBeNull()
      })
    })

    describe('Edge Cases', () => {
      it('should handle zero correctly', () => {
        expect(sanitizeNumberInput(0)).toBe(0)
        expect(sanitizeNumberInput('0')).toBe(0)
        expect(sanitizeNumberInput('0.0')).toBe(0)
      })

      it('should handle very large numbers', () => {
        expect(sanitizeNumberInput('999999999999')).toBe(999999999999)
        expect(sanitizeNumberInput(999999999999)).toBe(999999999999)
      })

      it('should handle very small numbers', () => {
        expect(sanitizeNumberInput('0.0001')).toBe(0.0001)
        expect(sanitizeNumberInput(0.0001)).toBe(0.0001)
      })

      it('should handle scientific notation', () => {
        expect(sanitizeNumberInput('1e5')).toBe(100000)
        expect(sanitizeNumberInput('1.5e2')).toBe(150)
      })
    })

    describe('Security', () => {
      it('should reject attempts to inject code', () => {
        expect(sanitizeNumberInput('123; alert(1)')).toBeNull()
        expect(sanitizeNumberInput('123<script>')).toBeNull()
        expect(sanitizeNumberInput('javascript:123')).toBeNull()
      })

      it('should handle special number strings safely', () => {
        expect(sanitizeNumberInput('0x10')).toBeNull() // Hex notation
        expect(sanitizeNumberInput('0o10')).toBeNull() // Octal notation
        expect(sanitizeNumberInput('0b10')).toBeNull() // Binary notation
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should safely handle user input in filter fields', () => {
      const maliciousInput = '<script>alert("xss")</script>Acme Corp'
      const sanitized = sanitizeInput(maliciousInput)

      expect(sanitized).toBe('Acme Corp')
      expect(sanitized).not.toContain('script')
    })

    it('should safely handle amount inputs', () => {
      const amounts = [
        { input: '10000', expected: 10000 },
        { input: '10000.50', expected: 10000.50 },
        { input: 'ten thousand', expected: null },
        { input: '10000<script>', expected: null }
      ]

      amounts.forEach(({ input, expected }) => {
        expect(sanitizeNumberInput(input)).toBe(expected)
      })
    })

    it('should safely handle search queries', () => {
      const queries = [
        { input: 'ACME Corp', expected: 'acme corp' },
        { input: '<b>ACME</b>', expected: 'acme' },
        { input: 'ACME<script>alert(1)</script>', expected: 'acme' }
      ]

      queries.forEach(({ input, expected }) => {
        expect(sanitizeSearchQuery(input)).toBe(expected)
      })
    })
  })
})
