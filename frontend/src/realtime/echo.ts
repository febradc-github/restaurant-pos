import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import type { Order } from '../types/order'

// Laravel Echo's Reverb/Pusher connector expects a global Pusher constructor.
;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher

/** Fallback Reverb app key for local dev when VITE_REVERB_APP_KEY is not set. */
export const DEFAULT_REVERB_APP_KEY = 'local-reverb-key'

/** Fallback Reverb host/port/scheme for local dev when the VITE_REVERB_* env vars are not set. */
export const DEFAULT_REVERB_HOST = '127.0.0.1'
export const DEFAULT_REVERB_PORT = 8080
export const DEFAULT_REVERB_SCHEME = 'http'

export interface ReverbConfig {
  key: string
  host: string
  port: number
  forceTLS: boolean
}

/**
 * Resolves the Reverb connection config. All four values are overridable via
 * VITE_REVERB_APP_KEY / VITE_REVERB_HOST / VITE_REVERB_PORT /
 * VITE_REVERB_SCHEME (same pattern as VITE_API_BASE_URL in the API
 * clients), baked in at build time -- see deploy/README.md. Defaults match
 * the self-hosted Reverb server described in the C-6 spec (127.0.0.1:8080,
 * plain http, for local dev). On-premise deployment (C-9) sets
 * VITE_REVERB_HOST to the deployment machine's LAN IP so devices other than
 * the host itself can open the WebSocket connection.
 */
export function getReverbConfig(): ReverbConfig {
  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? DEFAULT_REVERB_SCHEME
  return {
    key: import.meta.env.VITE_REVERB_APP_KEY ?? DEFAULT_REVERB_APP_KEY,
    host: import.meta.env.VITE_REVERB_HOST ?? DEFAULT_REVERB_HOST,
    port: Number(import.meta.env.VITE_REVERB_PORT ?? DEFAULT_REVERB_PORT),
    forceTLS: scheme === 'https',
  }
}

let echoInstance: Echo<'reverb'> | null = null

function getEcho(): Echo<'reverb'> {
  if (!echoInstance) {
    const { key, host, port, forceTLS } = getReverbConfig()
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS,
      enabledTransports: forceTLS ? ['wss'] : ['ws'],
    })
  }
  return echoInstance
}

export interface KitchenChannelHandlers {
  onOrderPlaced: (order: Order) => void
  onOrderUpdated: (order: Order) => void
}

/**
 * Subscribes to the public `kitchen` channel and wires the given handlers to
 * the order.placed / order.updated broadcast events fired by the backend
 * (see App\Events\OrderPlaced / OrderStatusUpdated). Returns an unsubscribe
 * function.
 *
 * This is the sole seam between components and the real Echo/Pusher client,
 * kept deliberately thin so tests can mock this module (`vi.mock('../realtime/echo')`)
 * instead of standing up a real WebSocket connection.
 */
export function subscribeToKitchenChannel(handlers: KitchenChannelHandlers): () => void {
  const echo = getEcho()
  const channel = echo.channel('kitchen')

  // Leading dot: broadcastAs() returns an unnamespaced event name
  // ("order.placed"), so it must be listened for literally instead of
  // Echo prefixing it with the default "App.Events" namespace.
  channel.listen('.order.placed', (data: { order: Order }) => handlers.onOrderPlaced(data.order))
  channel.listen('.order.updated', (data: { order: Order }) => handlers.onOrderUpdated(data.order))

  return () => {
    echo.leaveChannel('kitchen')
  }
}
