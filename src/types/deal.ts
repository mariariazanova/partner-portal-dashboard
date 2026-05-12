/**
 * Deal-related types and enums
 */

/**
 * Deal status enum
 */
export enum DealStatus {
  OPEN = 'Open',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

/**
 * Main Deal interface
 */
export interface Deal {
  dealId: string
  dealName: string
  accountName: string
  status: DealStatus
  amount: number
  createdDate: string // ISO date string
  assignedTo?: string // Partner ID for role-based filtering
  description?: string
  contactPerson?: string
  contactEmail?: string
  updatedDate?: string // ISO date string for real-time updates
}

/**
 * Filter state interface
 */
export interface DealFilters {
  search: string
  statusFilter: DealStatus[]
  amountMin: number | null
  amountMax: number | null
  dateFrom: string | null // ISO date string
  dateTo: string | null // ISO date string
  accountNameFilter: string
  dealNameFilter: string
}
