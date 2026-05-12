import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WebSocketService } from '../websocketService'
import type { Deal } from '@/types'

describe('WebSocketService', () => {
  let service: WebSocketService

  beforeEach(() => {
    vi.useFakeTimers()
    service = new WebSocketService()
  })

  afterEach(() => {
    service.disconnect()
    vi.clearAllTimers()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Connection Management', () => {
    it('should connect successfully', () => {
      const statusHandler = vi.fn<(connected: boolean) => void>()

      service.onStatusChange(statusHandler)

      service.connect()

      // Initially disconnected
      expect(service.getConnectionStatus()).toBe(false)

      // Fast-forward connection delay
      vi.advanceTimersByTime(1000)

      expect(service.getConnectionStatus()).toBe(true)
      expect(statusHandler).toHaveBeenCalledWith(true)
    })

    it('should not reconnect if already connected', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      service.connect()

      vi.advanceTimersByTime(1000)

      // Try connecting again
      service.connect()

      expect(consoleSpy).toHaveBeenCalledWith('[WebSocket] Already connected')
    })

    it('should disconnect successfully', () => {
      const statusHandler = vi.fn<(connected: boolean) => void>()

      service.onStatusChange(statusHandler)

      service.connect()
      vi.advanceTimersByTime(1000)

      expect(service.getConnectionStatus()).toBe(true)

      service.disconnect()

      expect(service.getConnectionStatus()).toBe(false)
      expect(statusHandler).toHaveBeenCalledWith(false)
    })
  })

  describe('Message Handlers', () => {
    it('should register and trigger message handlers', () => {
      const handler = vi.fn<(deals: Deal[]) => void>()

      service.onMessage(handler)

      service.connect()

      // Connect first
      vi.advanceTimersByTime(1000)

      // Trigger simulated update (30s interval)
      vi.advanceTimersByTime(30000)

      expect(handler).toHaveBeenCalledTimes(1)

      const receivedDeals = handler.mock.calls[0]?.[0]

      expect(Array.isArray(receivedDeals)).toBe(true)
      expect(receivedDeals?.length).toBeGreaterThan(0)
    })

    it('should unsubscribe message handlers', () => {
      const handler = vi.fn<(deals: Deal[]) => void>()

      const unsubscribe = service.onMessage(handler)

      unsubscribe()

      service.connect()

      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(30000)

      expect(handler).not.toHaveBeenCalled()
    })

    it('should support multiple message handlers', () => {
      const handler1 = vi.fn<(deals: Deal[]) => void>()
      const handler2 = vi.fn<(deals: Deal[]) => void>()

      service.onMessage(handler1)
      service.onMessage(handler2)

      service.connect()

      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(30000)

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('should handle errors in message handlers gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const badHandler = vi.fn<() => void>(() => {
        throw new Error('Handler error')
      })

      const goodHandler = vi.fn<(deals: Deal[]) => void>()

      service.onMessage(badHandler)
      service.onMessage(goodHandler)

      service.connect()

      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(30000)

      expect(badHandler).toHaveBeenCalled()
      expect(goodHandler).toHaveBeenCalled()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebSocket] Error in message handler:',
        expect.any(Error)
      )
    })
  })

  describe('Status Handlers', () => {
    it('should register and trigger status handlers', () => {
      const handler = vi.fn<(connected: boolean) => void>()

      service.onStatusChange(handler)

      service.connect()

      vi.advanceTimersByTime(1000)

      expect(handler).toHaveBeenCalledWith(true)

      service.disconnect()

      expect(handler).toHaveBeenCalledWith(false)
    })

    it('should unsubscribe status handlers', () => {
      const handler = vi.fn<(connected: boolean) => void>()

      const unsubscribe = service.onStatusChange(handler)

      unsubscribe()

      service.connect()

      vi.advanceTimersByTime(1000)

      expect(handler).not.toHaveBeenCalled()
    })

    it('should support multiple status handlers', () => {
      const handler1 = vi.fn<(connected: boolean) => void>()
      const handler2 = vi.fn<(connected: boolean) => void>()

      service.onStatusChange(handler1)
      service.onStatusChange(handler2)

      service.connect()

      vi.advanceTimersByTime(1000)

      expect(handler1).toHaveBeenCalledWith(true)
      expect(handler2).toHaveBeenCalledWith(true)
    })

    it('should handle errors in status handlers gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const badHandler = vi.fn<() => void>(() => {
        throw new Error('Status handler error')
      })

      const goodHandler = vi.fn<(connected: boolean) => void>()

      service.onStatusChange(badHandler)
      service.onStatusChange(goodHandler)

      service.connect()

      vi.advanceTimersByTime(1000)

      expect(badHandler).toHaveBeenCalled()
      expect(goodHandler).toHaveBeenCalled()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebSocket] Error in status handler:',
        expect.any(Error)
      )
    })
  })

  describe('Deal Updates', () => {
    it('should emit valid deal updates', () => {
      const handler = vi.fn<(deals: Deal[]) => void>()

      service.onMessage(handler)

      service.connect()

      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(30000)

      const deals: Deal[] = handler.mock.calls[0]![0]

      deals.forEach((deal) => {
        expect(deal).toHaveProperty('dealId')
        expect(deal).toHaveProperty('dealName')
        expect(deal).toHaveProperty('accountName')
        expect(deal).toHaveProperty('status')
        expect(deal).toHaveProperty('amount')
        expect(deal).toHaveProperty('createdDate')

        expect(typeof deal.dealId).toBe('string')
        expect(typeof deal.dealName).toBe('string')
        expect(typeof deal.accountName).toBe('string')
        expect(typeof deal.amount).toBe('number')
      })
    })

    it('should simulate updates periodically', () => {
      const handler = vi.fn<(deals: Deal[]) => void>()

      service.onMessage(handler)

      service.connect()

      vi.advanceTimersByTime(1000)

      // 3 update cycles
      vi.advanceTimersByTime(90000)

      expect(handler).toHaveBeenCalledTimes(3)
    })
  })

  describe('Cleanup', () => {
    it('should clear intervals on disconnect', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      service.connect()

      vi.advanceTimersByTime(1000)

      service.disconnect()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should stop updates after disconnect', () => {
      const handler = vi.fn<(deals: Deal[]) => void>()

      service.onMessage(handler)

      service.connect()

      vi.advanceTimersByTime(1000)

      // First update
      vi.advanceTimersByTime(30000)

      expect(handler).toHaveBeenCalledTimes(1)

      service.disconnect()

      // Advance more time
      vi.advanceTimersByTime(60000)

      // Should still be 1
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Singleton Instance', () => {
    it('should create independent instances', () => {
      const service1 = new WebSocketService()
      const service2 = new WebSocketService()

      expect(service1).not.toBe(service2)
    })
  })
})
