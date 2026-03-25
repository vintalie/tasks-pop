import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

type EchoInstance = InstanceType<typeof Echo>

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo?: EchoInstance
  }
}

window.Pusher = Pusher

const key = import.meta.env.VITE_PUSHER_APP_KEY
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1'

export function getEcho(): EchoInstance | null {
  if (!key) return null
  if (window.Echo) return window.Echo

  window.Echo = new Echo<'pusher'>({
    broadcaster: 'pusher',
    key,
    cluster,
  })

  return window.Echo
}
