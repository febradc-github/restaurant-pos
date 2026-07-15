import { Layout } from 'antd'
import { OrderTaking } from './OrderTaking'
import './TakeOrdersPage.css'

export interface TakeOrdersPageProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /**
   * The logged-in Server's name (C-39), forwarded from App.tsx's session --
   * purely a display label next to the selected table chip, not an auth
   * token. OrderTaking's API calls remain unauthenticated regardless.
   */
  serverName?: string
}

/**
 * Server-facing page shell (C-18). Like CashierPage (C-17), OrderTaking is
 * the only section a Server needs -- no Sider, no nested routes -- so this
 * is just page-level chrome (consistent padding under the shared C-15
 * theme) around the rebuilt OrderTaking screen, mirroring the
 * OwnerPage/CashierPage naming convention for a role's top-level page
 * component. Route-level gating (login required, per C-11) already happens
 * one level up in App.tsx's RoleRoute -- this component forwards no auth
 * token because OrderTaking's API calls have never needed one (Server has
 * no login-gated order-taking endpoints).
 */
export function TakeOrdersPage({ apiBaseUrl, serverName }: TakeOrdersPageProps) {
  return (
    <Layout className="take-orders-page">
      <Layout.Content className="take-orders-page__content">
        <OrderTaking apiBaseUrl={apiBaseUrl} serverName={serverName} />
      </Layout.Content>
    </Layout>
  )
}

export default TakeOrdersPage
