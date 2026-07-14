/** The set of employee roles. Mirrors the backend's UserRole enum (C-21). */
export type EmployeeRole = 'owner' | 'cashier' | 'server' | 'kitchen'

/**
 * An employee as returned by the API. `email` is `null` for Kitchen
 * employees (never their real value -- Kitchen authenticates by PIN, not
 * email). `has_pin` reports whether a PIN is set without ever exposing the
 * raw PIN.
 */
export interface Employee {
  id: number
  name: string
  email: string | null
  role: EmployeeRole
  active: boolean
  has_pin: boolean
}

/**
 * Fields needed to create a new employee. `email`+`password` are used for
 * the login roles (Owner/Cashier/Server); `pin` is used for Kitchen.
 */
export interface NewEmployee {
  name: string
  role: EmployeeRole
  email?: string
  password?: string
  pin?: string
}

/** Partial fields for updating an existing employee's role and/or credential. */
export type EmployeeUpdate = Partial<NewEmployee>
