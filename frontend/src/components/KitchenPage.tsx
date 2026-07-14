import { Layout } from 'antd'
import { KitchenDisplay } from './KitchenDisplay'
import './KitchenPage.css'

export interface KitchenPageProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
}

/**
 * Kitchen-facing page shell (C-19). Like CashierPage (C-17) and
 * TakeOrdersPage (C-18), KitchenDisplay is the only section this role needs
 * -- no Sider, no nested routes -- so this is just page-level chrome around
 * the rebuilt KitchenDisplay screen, mirroring the CashierPage/TakeOrdersPage
 * naming convention for a role's top-level page component.
 *
 * Unlike every other page in the C-14 redesign, this one is deliberately a
 * PURE presentational wrapper: it takes no session, checks no auth, and
 * imports nothing from the auth/session system. Kitchen has no login by
 * design (adr-008-server-login-kitchen-pin-attendance) -- the PIN pad
 * rendered inside KitchenDisplay is a separate, lightweight attendance flow,
 * not page access control. App.tsx must mount this with no RoleRoute wrapper.
 */
export function KitchenPage({ apiBaseUrl }: KitchenPageProps) {
  return (
    <Layout className="kitchen-page">
      <Layout.Content className="kitchen-page__content">
        <KitchenDisplay apiBaseUrl={apiBaseUrl} />
      </Layout.Content>
    </Layout>
  )
}

export default KitchenPage
