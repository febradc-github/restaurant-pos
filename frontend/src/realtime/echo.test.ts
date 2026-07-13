import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_REVERB_APP_KEY, getReverbConfig } from './echo'

describe('getReverbConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('falls back to a placeholder key when VITE_REVERB_APP_KEY is not set', () => {
    vi.stubEnv('VITE_REVERB_APP_KEY', undefined)

    expect(getReverbConfig().key).toBe(DEFAULT_REVERB_APP_KEY)
  })

  it('uses VITE_REVERB_APP_KEY when set', () => {
    vi.stubEnv('VITE_REVERB_APP_KEY', 'my-app-key')

    expect(getReverbConfig().key).toBe('my-app-key')
  })

  it('defaults to the local Reverb host/port over an unencrypted connection', () => {
    const config = getReverbConfig()

    expect(config.host).toBe('127.0.0.1')
    expect(config.port).toBe(8080)
    expect(config.forceTLS).toBe(false)
  })

  it('uses VITE_REVERB_HOST/PORT/SCHEME when set, so a built SPA can reach Reverb on the deployment machine\'s LAN IP', () => {
    vi.stubEnv('VITE_REVERB_HOST', '192.168.31.5')
    vi.stubEnv('VITE_REVERB_PORT', '8080')
    vi.stubEnv('VITE_REVERB_SCHEME', 'http')

    const config = getReverbConfig()

    expect(config.host).toBe('192.168.31.5')
    expect(config.port).toBe(8080)
    expect(config.forceTLS).toBe(false)
  })

  it('sets forceTLS when VITE_REVERB_SCHEME is https', () => {
    vi.stubEnv('VITE_REVERB_SCHEME', 'https')

    expect(getReverbConfig().forceTLS).toBe(true)
  })
})
