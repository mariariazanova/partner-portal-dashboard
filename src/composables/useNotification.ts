import { ref } from 'vue'

/**
 * Notification Composable
 * Error handling with v-snackbar and retry functionality
 *
 * Provides centralized notification system for:
 * - Error messages (HTTP 500, timeout, network errors)
 * - Success messages
 * - Info messages
 * - Retry actions
 *
 * Usage:
 * ```ts
 * import { useNotification } from '@/composables/useNotification'
 *
 * const notification = useNotification()
 *
 * // Show error with retry
 * try {
 *   await someApiCall()
 * } catch (error) {
 *   notification.showErrorFromException(error, retryFunction)
 * }
 *
 * // Show success
 * notification.showSuccess('Operation completed successfully')
 * ```
 *
 * Testing:
 * To test error notifications, edit .env file:
 * - VITE_MOCK_ERROR_RATE=20  (20% chance of HTTP 500 errors)
 * - VITE_MOCK_TIMEOUT_RATE=20 (20% chance of timeout errors)
 */

export type NotificationType = 'error' | 'success' | 'info' | 'warning'

export interface NotificationOptions {
  message: string
  type?: NotificationType
  timeout?: number
  showRetry?: boolean
  onRetry?: () => void | Promise<void>
}

interface NotificationState {
  visible: boolean
  message: string
  type: NotificationType
  timeout: number
  showRetry: boolean
  onRetry: (() => void | Promise<void>) | null
}

const state = ref<NotificationState>({
  visible: false,
  message: '',
  type: 'info',
  timeout: 5000,
  showRetry: false,
  onRetry: null
})

export function useNotification() {
  /**
   * Show a notification
   */
  function show(options: NotificationOptions) {
    state.value = {
      visible: true,
      message: options.message,
      type: options.type || 'info',
      timeout: options.timeout ?? 5000,
      showRetry: options.showRetry || false,
      onRetry: options.onRetry || null
    }
  }

  /**
   * Show error notification
   * Note: Retry button removed from snackbar - errors should use in-page retry buttons
   */
  function showError(message: string, onRetry?: () => void | Promise<void>) {
    show({
      message,
      type: 'error',
      timeout: 8000, // Longer timeout for errors
      showRetry: false, // Retry button removed from snackbar
      onRetry
    })
  }

  /**
   * Show success notification
   */
  function showSuccess(message: string) {
    show({
      message,
      type: 'success',
      timeout: 4000
    })
  }

  /**
   * Show info notification
   */
  function showInfo(message: string) {
    show({
      message,
      type: 'info',
      timeout: 4000
    })
  }

  /**
   * Show warning notification
   */
  function showWarning(message: string) {
    show({
      message,
      type: 'warning',
      timeout: 5000
    })
  }

  /**
   * Hide notification
   */
  function hide() {
    state.value.visible = false
  }

  /**
   * Handle retry action
   */
  async function handleRetry() {
    if (state.value.onRetry) {
      hide() // Hide notification before retry
      try {
        await state.value.onRetry()
      } catch (error) {
        // Error will be handled by the retry function itself
        console.error('[Notification] Retry failed:', error)
      }
    }
  }

  /**
   * Parse error and show appropriate message
   * Handles different error types (HTTP 500, timeout, network, etc.)
   * Stores translation key instead of translated string for reactivity
   */
  function showErrorFromException(error: unknown, onRetry?: () => void | Promise<void>) {
    let message = 'errors.unexpected'

    if (error instanceof Error) {
      // Check for timeout errors
      if (error.name === 'MockTimeoutError' || error.message.includes('timeout')) {
        message = 'errors.timeout'
      }
      // Check for HTTP 500 errors
      else if (error.message.includes('500') || error.message.includes('Internal server error')) {
        message = 'errors.serverError'
      }
      // Check for network errors
      else if (error.message.includes('network') || error.message.includes('fetch')) {
        message = 'errors.networkError'
      }
      // Generic error with error message (keep as-is if not a standard error)
      else if (error.message) {
        message = error.message
      }
    }

    showError(message, onRetry)
  }

  return {
    state,
    show,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    showErrorFromException,
    hide,
    handleRetry
  }
}
