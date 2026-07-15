import { theme as antdTheme } from 'antd'
import type { ThemeConfig } from 'antd'

/**
 * Shared Ant Design theme for the whole POS SPA -- established once here
 * (C-15) and applied at the app root via ConfigProvider. Every role's page
 * components (Owner/Cashier/Take-Orders/Kitchen, C-16 through C-19) inherit
 * these tokens rather than each picking their own colors/type scale.
 *
 * Palette rationale: colorPrimary is a warm terracotta distinct from
 * colorError's true red, so a primary action button never reads as a
 * destructive one next to it. colorBgLayout/colorBgContainer are neutral
 * (not warm-tinted) -- the Kitchen display in particular needs plain
 * contrast, not a color competing with order content, when read from a
 * few feet away.
 *
 * Dark theme (C-36): the app is dark-only now, via antd's `darkAlgorithm`,
 * which is what actually derives the full neutral scale (colorBgElevated,
 * colorText, colorBorder, ...) from the two anchors pinned below -- pinning
 * every neutral by hand would fight the algorithm instead of using it.
 * colorPrimary was nudged from the original light-theme terracotta
 * (#C2410C) to a slightly brighter shade of the same hue: antd's dark
 * algorithm derives its "primary as foreground" variant (used for outlined/
 * ghost/text buttons, links, focus rings) by *darkening* the seed, and
 * #C2410C's derived foreground color only hit ~2.9:1 contrast against
 * colorBgContainer -- below WCAG's 3:1 floor for UI components. #E55E10
 * derives a foreground color with ~4:1+ contrast against both
 * colorBgContainer and colorBgLayout, and still ~4.5:1 for white button
 * text on the primary fill, while staying in the same burnt-orange family
 * (verified with a small contrast script against antd's
 * `theme.getDesignToken`, see theme.test.ts).
 */
export const theme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: '#E55E10',
    colorSuccess: '#16A34A',
    colorWarning: '#CA8A04',
    colorError: '#DC2626',
    colorInfo: '#0369A1',
    colorBgLayout: '#000000',
    colorBgContainer: '#141414',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 16,
    borderRadius: 8,
  },
}
