import { defineStore } from 'pinia'
import { ref } from 'vue'
import { UserRole } from '@/types'

/**
 * Auth Store for Role-Based Access Control
 *
 * - Simple role switching (Admin/Partner)
 * - Admin can see all deals
 * - Partner can only see deals assigned to them
 * - Role persisted in localStorage
 */

// Get saved role from localStorage or default to Admin
const savedRole = (localStorage.getItem('userRole') as UserRole) || UserRole.ADMIN

// Mock partner ID for demo purposes
const MOCK_PARTNER_ID = 'partner-001'

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentRole = ref<UserRole>(savedRole)
  const partnerId = ref<string>(MOCK_PARTNER_ID)

  // Actions
  /**
   * Set user role and persist to localStorage
   */
  function setRole(role: UserRole) {
    currentRole.value = role
    localStorage.setItem('userRole', role)
  }

  /**
   * Check if current user is admin
   */
  function isAdmin(): boolean {
    return currentRole.value === UserRole.ADMIN
  }

  /**
   * Check if current user is partner
   */
  function isPartner(): boolean {
    return currentRole.value === UserRole.PARTNER
  }

  return {
    // State
    currentRole,
    partnerId,

    // Actions
    setRole,
    isAdmin,
    isPartner,
  }
})
