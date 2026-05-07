import type { Deal } from '@/types'

/**
 * WebSocket Service for Real-Time Updates
 *
 * - Mock WebSocket connection (simulates server push)
 * - Handles deal updates, additions, and deletions
 * - Auto-reconnection on disconnect
 * - Deduplication via deal store
 */

type MessageHandler = (deals: Deal[]) => void
type ConnectionStatusHandler = (connected: boolean) => void

export class WebSocketService {
  private ws: WebSocket | null = null
  private messageHandlers: Set<MessageHandler> = new Set()
  private statusHandlers: Set<ConnectionStatusHandler> = new Set()
  private reconnectInterval: ReturnType<typeof setInterval> | null = null
  private simulationInterval: ReturnType<typeof setInterval> | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  /**
   * Mock WebSocket URL (in production, this would be a real WebSocket endpoint)
   */
  private readonly wsUrl = 'ws://localhost:3000/deals' // Mock URL

  /**
   * Connect to WebSocket server
   * For demo purposes, simulates connection and periodic updates
   */
  connect() {
    if (this.isConnected) {
      console.log('[WebSocket] Already connected')
      return
    }

    console.log('[WebSocket] Connecting to real-time updates...')

    // In a real implementation, you would connect to actual WebSocket:
    // this.ws = new WebSocket(this.wsUrl)
    // this.setupWebSocketHandlers()

    // For demo: Simulate successful connection
    this.simulateConnection()
  }

  /**
   * Simulate WebSocket connection for demo purposes
   * In production, replace with actual WebSocket connection
   */
  private simulateConnection() {
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true
      this.reconnectAttempts = 0
      console.log('[WebSocket] Connected to real-time updates')
      this.notifyStatusHandlers(true)

      // Simulate receiving updates every 30 seconds
      this.simulationInterval = setInterval(() => {
        this.simulateUpdate()
      }, 30000) // Every 30 seconds
    }, 1000)
  }

  /**
   * Simulate receiving a deal update
   * In production, this would be replaced by actual WebSocket message handler
   */
  private simulateUpdate() {
    console.log('[WebSocket] Simulating real-time update...')

    const mockUpdates: Deal[] = []

    // 70% chance: Update an existing deal (simulates real-time changes)
    // 30% chance: Add a new deal
    const updateExisting = Math.random() > 0.3

    if (updateExisting) {
      // Update an existing deal from DEAL-001 to DEAL-080
      const dealNumber = Math.floor(Math.random() * 80) + 1
      const dealId = `DEAL-${String(dealNumber).padStart(3, '0')}`

      // Random status change (realistic transitions)
      const statuses: Array<'Open' | 'Approved' | 'Rejected'> = ['Open', 'Approved', 'Rejected']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      // Random amount change (+/- 10-20%)
      const baseAmount = Math.floor(Math.random() * 100000) + 20000
      const changePercent = (Math.random() * 0.2 + 0.9) // 0.9 to 1.1
      const newAmount = Math.floor(baseAmount * changePercent)

      mockUpdates.push({
        dealId: dealId,
        dealName: `Updated Deal ${dealId} - ${new Date().toLocaleTimeString()}`,
        accountName: 'Updated via WebSocket',
        status: randomStatus,
        amount: newAmount,
        createdDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
        updatedDate: new Date().toISOString(),
        assignedTo: Math.random() > 0.5 ? 'partner-001' : undefined,
        description: `Deal updated via WebSocket at ${new Date().toLocaleString()}`,
        contactPerson: 'WebSocket Update',
        contactEmail: 'websocket@demo.com'
      } as Deal)

      console.log(`[WebSocket] Updating existing deal: ${dealId} - Status: ${randomStatus}, Amount: ${newAmount}`)
    } else {
      // Add a new deal
      const newDealId = `DEAL-NEW-${Date.now()}`
      mockUpdates.push({
        dealId: newDealId,
        dealName: `New Real-time Deal ${Date.now()}`,
        accountName: 'WebSocket Demo Account',
        status: Math.random() > 0.5 ? 'Open' : 'Approved',
        amount: Math.floor(Math.random() * 100000) + 10000,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        assignedTo: Math.random() > 0.5 ? 'partner-001' : undefined,
        description: 'This deal was added via WebSocket',
        contactPerson: 'New Contact',
        contactEmail: 'new@demo.com'
      } as Deal)

      console.log(`[WebSocket] Adding new deal: ${newDealId}`)
    }

    // Notify all message handlers
    this.notifyMessageHandlers(mockUpdates)
  }

  /**
   * Setup actual WebSocket event handlers
   * This would be used in production with real WebSocket
   */
  private setupWebSocketHandlers() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('[WebSocket] Connection opened')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.notifyStatusHandlers(true)
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[WebSocket] Received message:', data)

        if (data.type === 'deals_update' && Array.isArray(data.deals)) {
          this.notifyMessageHandlers(data.deals)
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
    }

    this.ws.onclose = () => {
      console.log('[WebSocket] Connection closed')
      this.isConnected = false
      this.notifyStatusHandlers(false)
      this.attemptReconnect()
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnection attempts reached')
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Subscribe to deal updates
   */
  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(handler: ConnectionStatusHandler) {
    this.statusHandlers.add(handler)
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  /**
   * Notify all message handlers
   */
  private notifyMessageHandlers(deals: Deal[]) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(deals)
      } catch (error) {
        console.error('[WebSocket] Error in message handler:', error)
      }
    })
  }

  /**
   * Notify all status handlers
   */
  private notifyStatusHandlers(connected: boolean) {
    this.statusHandlers.forEach((handler) => {
      try {
        handler(connected)
      } catch (error) {
        console.error('[WebSocket] Error in status handler:', error)
      }
    })
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    console.log('[WebSocket] Disconnecting...')

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }

    this.isConnected = false
    this.notifyStatusHandlers(false)
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Singleton instance
export const websocketService = new WebSocketService()
