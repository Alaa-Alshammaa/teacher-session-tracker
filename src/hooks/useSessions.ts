import { useCallback, useEffect, useState } from 'react'
import type { Session } from '../types/session'
import * as sessionStorage from '../lib/sessionStorage'
import type {
  LoggedSessionResult,
  NewSessionInput,
  UpdateSessionInput,
} from '../lib/sessionStorage'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])

  const refresh = useCallback(() => {
    setSessions(sessionStorage.getSessions())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logSession = useCallback(
    (input: NewSessionInput): LoggedSessionResult => {
      const result = sessionStorage.addSession(input)
      refresh()
      return result
    },
    [refresh],
  )

  const updateSession = useCallback(
    (logicalSessionId: string, input: UpdateSessionInput): boolean => {
      const updated = sessionStorage.updateSession(logicalSessionId, input)
      refresh()
      return updated
    },
    [refresh],
  )

  const deleteSession = useCallback(
    (logicalSessionId: string): boolean => {
      const deleted = sessionStorage.deleteSession(logicalSessionId)
      refresh()
      return deleted
    },
    [refresh],
  )

  return { sessions, logSession, updateSession, deleteSession }
}
