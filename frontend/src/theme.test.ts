import { describe, expect, it } from 'vitest'
import { theme as antdTheme } from 'antd'
import { theme } from './theme'

/** Parses a `#rrggbb` hex color into 0-255 channel values. */
function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

/** WCAG relative luminance, used to tell a dark surface from a light one. */
function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const linear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** WCAG contrast ratio between two `#rrggbb` colors. */
function contrastRatio(hexA: string, hexB: string) {
  const lA = relativeLuminance(hexA)
  const lB = relativeLuminance(hexB)
  const lighter = Math.max(lA, lB)
  const darker = Math.min(lA, lB)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('theme', () => {
  it('applies antd dark algorithm so surfaces resolve to dark, near-black backgrounds', () => {
    const resolved = antdTheme.getDesignToken(theme)

    // A light theme's colorBgLayout/colorBgContainer sit near white
    // (luminance close to 1); a dark theme's sit near black (luminance
    // close to 0). This is the cheapest way to assert "actually dark"
    // without depending on antd's exact default hex values.
    expect(relativeLuminance(resolved.colorBgLayout)).toBeLessThan(0.05)
    expect(relativeLuminance(resolved.colorBgContainer)).toBeLessThan(0.05)
  })

  it('keeps colorPrimary in the terracotta/burnt-orange family (warm hue, not a generic blue/gray)', () => {
    const { r, g, b } = hexToRgb(theme.token!.colorPrimary as string)

    // Terracotta is a warm, red-leaning orange: red channel clearly
    // dominant, blue channel clearly the smallest.
    expect(r).toBeGreaterThan(g)
    expect(g).toBeGreaterThan(b)
    expect(r - b).toBeGreaterThan(100)
  })

  it('derives a colorPrimary readable against both dark surfaces (WCAG UI-component minimum, 3:1)', () => {
    const resolved = antdTheme.getDesignToken(theme)

    expect(contrastRatio(resolved.colorPrimary, resolved.colorBgContainer)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(resolved.colorPrimary, resolved.colorBgLayout)).toBeGreaterThanOrEqual(3)
  })

  it('keeps white button text readable on the derived primary color (WCAG normal-text minimum, 4.5:1)', () => {
    const resolved = antdTheme.getDesignToken(theme)

    expect(contrastRatio('#ffffff', resolved.colorPrimary)).toBeGreaterThanOrEqual(4.5)
  })
})
