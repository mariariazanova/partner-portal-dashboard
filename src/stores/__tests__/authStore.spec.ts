import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'
import { UserRole } from '@/types'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with ADMIN role by default', () => {
      const store = useAuthStore()

      expect(store.currentRole).toBe(UserRole.ADMIN)
    })

    it('should initialize with saved role from localStorage', async () => {
      localStorage.setItem('userRole', UserRole.PARTNER)

      // Re-import module so top-level localStorage code re-runs
      vi.resetModules()

      const { useAuthStore: freshUseAuthStore } = await import('../authStore')

      setActivePinia(createPinia())

      const store = freshUseAuthStore()

      expect(store.currentRole).toBe(UserRole.PARTNER)
    })

    it('should initialize with mock partner ID', () => {
      const store = useAuthStore()

      expect(store.partnerId).toBe('partner-001')
    })
  })

  describe('setRole', () => {
    it('should update currentRole to ADMIN', () => {
      const store = useAuthStore()

      store.setRole(UserRole.ADMIN)

      expect(store.currentRole).toBe(UserRole.ADMIN)
    })

    it('should update currentRole to PARTNER', () => {
      const store = useAuthStore()

      store.setRole(UserRole.PARTNER)

      expect(store.currentRole).toBe(UserRole.PARTNER)
    })

    it('should persist role to localStorage', () => {
      const store = useAuthStore()

      store.setRole(UserRole.PARTNER)

      expect(localStorage.getItem('userRole')).toBe(UserRole.PARTNER)
    })
  })

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      const store = useAuthStore()

      store.setRole(UserRole.ADMIN)

      expect(store.isAdmin()).toBe(true)
    })

    it('should return false for PARTNER role', () => {
      const store = useAuthStore()

      store.setRole(UserRole.PARTNER)

      expect(store.isAdmin()).toBe(false)
    })
  })

  describe('isPartner', () => {
    it('should return true for PARTNER role', () => {
      const store = useAuthStore()

      store.setRole(UserRole.PARTNER)

      expect(store.isPartner()).toBe(true)
    })

    it('should return false for ADMIN role', () => {
      const store = useAuthStore()

      store.setRole(UserRole.ADMIN)

      expect(store.isPartner()).toBe(false)
    })
  })

  describe('Role Switching', () => {
    it('should switch from ADMIN to PARTNER', () => {
      const store = useAuthStore()

      store.setRole(UserRole.ADMIN)
      expect(store.isAdmin()).toBe(true)

      store.setRole(UserRole.PARTNER)

      expect(store.isPartner()).toBe(true)
      expect(store.isAdmin()).toBe(false)
    })

    it('should switch from PARTNER to ADMIN', () => {
      const store = useAuthStore()

      store.setRole(UserRole.PARTNER)
      expect(store.isPartner()).toBe(true)

      store.setRole(UserRole.ADMIN)

      expect(store.isAdmin()).toBe(true)
      expect(store.isPartner()).toBe(false)
    })
  })
})
