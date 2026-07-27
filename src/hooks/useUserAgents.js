// User Agent module state and data loading
import { useCallback, useState } from 'react'
import { extractItems, requestApi } from '../lib/adsPortal'

export function useUserAgents(token) {
  const [userAgents, setUserAgents] = useState([])
  const [userAgentsLoading, setUserAgentsLoading] = useState(false)
  const [userAgentsError, setUserAgentsError] = useState('')
  const [userAgentsMessage, setUserAgentsMessage] = useState('')
  const [editingUserAgentId, setEditingUserAgentId] = useState(null)
  const [userAgentDevice, setUserAgentDevice] = useState('')
  const [userAgentValue, setUserAgentValue] = useState('')
  const [savingUserAgent, setSavingUserAgent] = useState(false)
  const [showUserAgentModal, setShowUserAgentModal] = useState(false)

  const loadUserAgents = useCallback(async () => {
    setUserAgentsLoading(true)
    setUserAgentsError('')

    try {
      const response = await requestApi('/refer-user-agents', { token })
      setUserAgents(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUserAgentsError(message)
      setUserAgents([])
    } finally {
      setUserAgentsLoading(false)
    }
  }, [token])

  return {
    userAgents, setUserAgents,
    userAgentsLoading, setUserAgentsLoading,
    userAgentsError, setUserAgentsError,
    userAgentsMessage, setUserAgentsMessage,
    editingUserAgentId, setEditingUserAgentId,
    userAgentDevice, setUserAgentDevice,
    userAgentValue, setUserAgentValue,
    savingUserAgent, setSavingUserAgent,
    showUserAgentModal, setShowUserAgentModal,
    loadUserAgents,
  }
}
