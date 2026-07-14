import type { ThemeConfig } from 'antd'

/**
 * Shared Ant Design theme for the whole POS SPA -- established once here
 * (C-15) and applied at the app root via ConfigProvider. Every role's page
 * components (Owner/Cashier/Take-Orders/Kitchen, C-16 through C-19) inherit
 * these tokens rather than each picking their own colors/type scale.
 *
 * Palette rationale: colorPrimary is a warm terracotta distinct from
 * colorError's true red, so a primary action button never reads as a
 * destructive one next to it. colorBgLayout is neutral (not warm-tinted) --
 * the Kitchen display in particular needs plain contrast, not a color
 * competing with order content, when read from a few feet away.
 */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#C2410C',
    colorSuccess: '#16A34A',
    colorWarning: '#CA8A04',
    colorError: '#DC2626',
    colorInfo: '#0369A1',
    colorBgLayout: '#FAFAFA',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 16,
    borderRadius: 8,
  },
}
