/** The set of authenticated user roles. Mirrors the backend's UserRole enum. */
export type AuthRole = 'owner' | 'cashier'

/** An authenticated Owner or Cashier, as returned by the login endpoint. */
export interface AuthUser {
  id: number
  name: string
  email: string
  role: AuthRole
}

/** A logged-in session: the authenticated user plus their Sanctum bearer token. */
export interface AuthSession {
  token: string
  user: AuthUser
}
