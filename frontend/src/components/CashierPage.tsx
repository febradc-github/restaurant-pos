import { Layout } from 'antd'
import { Checkout } from './Checkout'
import './CashierPage.css'

export interface CashierPageProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /** Cashier bearer token, forwarded to Checkout. */
  authToken?: string | null
}

/**
 * Cashier-facing page shell (C-17). Unlike OwnerPage (C-16), Checkout is the
 * only section a Cashier needs -- no Sider, no nested routes -- so this is
 * just page-level chrome (consistent padding under the shared C-15 theme)
 * around the rebuilt Checkout screen, mirroring OwnerPage's naming
 * convention for a role's top-level page component.
 */
export function CashierPage({ apiBaseUrl, authToken = null }: CashierPageProps) {
  return (
    <Layout className="cashier-page">
      <Layout.Content className="cashier-page__content">
        <Checkout apiBaseUrl={apiBaseUrl} authToken={authToken} />
      </Layout.Content>
    </Layout>
  )
}

export default CashierPage
