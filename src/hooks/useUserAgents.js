// User Agent module state and data loading
import { useCallback, useState, useRef, useEffect } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

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

  const [userAgentsPagination, setUserAgentsPagination] = useState(() => createInitialPagination())
  const userAgentsPaginationRef = useRef(userAgentsPagination)

  useEffect(() => {
    userAgentsPaginationRef.current = userAgentsPagination
  }, [userAgentsPagination])

  const loadUserAgents = useCallback(
    async (filters = {}, pageConfig = userAgentsPaginationRef.current) => {
      setUserAgentsLoading(true)
      setUserAgentsError('')

      try {
        const response = await requestApi(
          `/refer-user-agents${buildQueryString({ page: pageConfig.page, size: pageConfig.size })}`,
          { token },
        )
        setUserAgents(extractItems(response))
        setUserAgentsPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setUserAgentsError(message)
        setUserAgents([])
      } finally {
        setUserAgentsLoading(false)
      }
    },
    [token],
  )

  return {
    userAgents, setUserAgents,
    userAgentsLoading, setUserAgentsLoading,
    userAgentsError, setUserAgentsError,
    userAgentsMessage, setUserAgentsMessage,
    userAgentsPagination, setUserAgentsPagination,
    userAgentsPaginationRef,
    editingUserAgentId, setEditingUserAgentId,
    userAgentDevice, setUserAgentDevice,
    userAgentValue, setUserAgentValue,
    savingUserAgent, setSavingUserAgent,
    showUserAgentModal, setShowUserAgentModal,
    loadUserAgents,
  }
}
