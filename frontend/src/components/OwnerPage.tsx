import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button, Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  AppstoreOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TableOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { TableLayoutEditor } from './TableLayoutEditor'
import { MenuManager } from './MenuManager'
import { EmployeeManager } from './EmployeeManager'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import './OwnerPage.css'

export interface OwnerPageProps {
  /** Backend origin. Defaults to VITE_API_BASE_URL / localhost. */
  apiBaseUrl?: string
  /** Owner bearer token, forwarded to both sections. */
  authToken?: string | null
}

interface OwnerNavEntry {
  key: string
  icon: ReactNode
  label: string
  /** Path segment relative to /owner, used both for the Route match and the nav target. */
  path: string
}

/**
 * The Owner's primary navigation, structured as data so a fourth section
 * (Analytics, C-26) is a one-line addition here rather than a restructure
 * of the Sider/Menu/Routes wiring below.
 */
const NAV_ENTRIES: OwnerNavEntry[] = [
  { key: 'tables', icon: <TableOutlined />, label: 'Table Layout', path: 'tables' },
  { key: 'menu', icon: <AppstoreOutlined />, label: 'Menu Management', path: 'menu' },
  { key: 'employees', icon: <TeamOutlined />, label: 'Employees', path: 'employees' },
  { key: 'analytics', icon: <BarChartOutlined />, label: 'Analytics', path: 'analytics' },
]

/**
 * Owner section paths are matched by this component via a splat route
 * (App.tsx mounts it at "/owner/*"). react-router resolves *relative*
 * navigation against the splat route's whole matched pathname (including
 * whatever the splat captured), not just its static prefix -- so
 * navigate('menu') from here would append onto the current URL
 * ("/owner/tables/menu") instead of replacing the last segment, and the
 * catch-all redirect below would then do the same thing again, forever.
 * Every navigation target in this component is therefore built as an
 * absolute path.
 */
const ownerPath = (segment: string) => `/owner/${segment}`

const NAV_ITEMS: MenuProps['items'] = NAV_ENTRIES.map(({ key, icon, label }) => ({ key, icon, label }))

/**
 * Owner-facing admin shell (C-16): an Ant Design Layout with a collapsible
 * Sider for navigation between Owner sections, routed via nested paths under
 * /owner so each section has its own URL. Mounted by App.tsx inside the
 * existing RoleRoute owner gate -- this component does no auth checks of its
 * own, it only lays out already-gated content.
 */
export function OwnerPage({ apiBaseUrl, authToken = null }: OwnerPageProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const selectedEntry = NAV_ENTRIES.find((entry) => location.pathname.includes(`/${entry.path}`))
  const selectedKeys = selectedEntry ? [selectedEntry.key] : []

  function handleNavClick({ key }: { key: string }) {
    const entry = NAV_ENTRIES.find((candidate) => candidate.key === key)
    if (entry) navigate(ownerPath(entry.path))
  }

  return (
    <Layout className="owner-page">
      {/* C-34: antd's Layout.Sider defaults to a 200px expanded width, sized
          for antd's 14px baseline font. theme.ts sets fontSize: 16 app-wide,
          so the longest nav label ("Menu Management") no longer fit and
          antd's built-in menu-item ellipsis truncated it. 230px comfortably
          fits that label plus its icon at this app's font size without
          over-widening the sider; collapsedWidth is left at antd's default
          (80px) so the collapsed icon-only behavior is unchanged. */}
      <Layout.Sider collapsible trigger={null} collapsed={collapsed} onCollapse={setCollapsed} width={230}>
        <div className="owner-page__brand">{collapsed ? 'POS' : 'Owner Console'}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={NAV_ITEMS}
          onClick={handleNavClick}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="owner-page__header">
          <Button
            type="text"
            className="owner-page__collapse-toggle"
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((prev) => !prev)}
          />
          <Typography.Title level={4} className="owner-page__title">
            {selectedEntry?.label ?? 'Owner'}
          </Typography.Title>
        </Layout.Header>
        <Layout.Content className="owner-page__content">
          <Routes>
            <Route index element={<Navigate to={ownerPath('tables')} replace />} />
            <Route path="tables" element={<TableLayoutEditor apiBaseUrl={apiBaseUrl} authToken={authToken} />} />
            <Route path="menu" element={<MenuManager apiBaseUrl={apiBaseUrl} authToken={authToken} />} />
            <Route path="employees" element={<EmployeeManager apiBaseUrl={apiBaseUrl} authToken={authToken} />} />
            <Route path="analytics" element={<AnalyticsDashboard apiBaseUrl={apiBaseUrl} authToken={authToken} />} />
            <Route path="*" element={<Navigate to={ownerPath('tables')} replace />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default OwnerPage
