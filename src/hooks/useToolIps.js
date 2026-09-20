import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useToolIps(token) {
  const [toolIps, setToolIps] = useState([])
  const [toolIpsLoading, setToolIpsLoading] = useState(false)
  const [toolIpsError, setToolIpsError] = useState('')
  const [toolIpsMessage, setToolIpsMessage] = useState('')
  const [toolIpPagination, setToolIpPagination] = useState(() => createInitialPagination())
  const toolIpPaginationRef = useRef(toolIpPagination)
  const [toolIpFilters, setToolIpFilters] = useState({
    ipString: '',
    adsOwner: '',
  })
  const [toolIpQueryApplied, setToolIpQueryApplied] = useState(false)
  const toolIpFiltersRef = useRef(toolIpFilters)
  const [editingToolIpId, setEditingToolIpId] = useState(null)
  const [toolIpString, setToolIpString] = useState('')
  const [toolIpRemarks, setToolIpRemarks] = useState('')
  const [toolIpStartDate, setToolIpStartDate] = useState('')
  const [toolIpExpireDate, setToolIpExpireDate] = useState('')
  const [savingToolIp, setSavingToolIp] = useState(false)
  const [showToolIpModal, setShowToolIpModal] = useState(false)

  useEffect(() => {
    toolIpFiltersRef.current = toolIpFilters
  }, [toolIpFilters])

  useEffect(() => {
    toolIpPaginationRef.current = toolIpPagination
  }, [toolIpPagination])

  const loadToolIps = useCallback(
    async (filters = toolIpFiltersRef.current, pageConfig = toolIpPaginationRef.current) => {
      setToolIpsLoading(true)
      setToolIpsError('')

      try {
        const response = await requestApi(
          `/tool-ips${buildQueryString({
            ip: filters.ipString,
            adsOwner: filters.adsOwner,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setToolIps(extractItems(response))
        setToolIpPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setToolIpsError(message)
      } finally {
        setToolIpsLoading(false)
      }
    },
    [token],
  )

  return {
    toolIps,
    setToolIps,
    toolIpsLoading,
    setToolIpsLoading,
    toolIpsError,
    setToolIpsError,
    toolIpsMessage,
    setToolIpsMessage,
    toolIpPagination,
    setToolIpPagination,
    toolIpPaginationRef,
    toolIpFilters,
    setToolIpFilters,
    toolIpQueryApplied,
    setToolIpQueryApplied,
    toolIpFiltersRef,
    editingToolIpId,
    setEditingToolIpId,
    toolIpString,
    setToolIpString,
    toolIpRemarks,
    setToolIpRemarks,
    toolIpStartDate,
    setToolIpStartDate,
    toolIpExpireDate,
    setToolIpExpireDate,
    savingToolIp,
    setSavingToolIp,
    showToolIpModal,
    setShowToolIpModal,
    loadToolIps,
  }
}
