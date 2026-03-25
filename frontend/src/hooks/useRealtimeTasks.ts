import { useEffect } from 'react'
import { getEcho } from '../lib/echo'

type OnTaskLogCreated = () => void

export function useRealtimeTasks(onTaskLogCreated: OnTaskLogCreated): void {
  useEffect(() => {
    const echo = getEcho()
    if (!echo) return () => {}

    const channel = echo.channel('tasks-daily')
    channel.listen('.task-log.created', onTaskLogCreated)

    return () => {
      channel.stopListening('.task-log.created')
      echo.leave('tasks-daily')
    }
  }, [onTaskLogCreated])
}
