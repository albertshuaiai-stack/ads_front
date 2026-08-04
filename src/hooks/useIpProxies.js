import { useCallback, useEffect, useRef, useState } from 'react'
import { buildOwnerQueryParams, buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useIpProxies(token) {
  const [ipProxies, setIpProxies] = useState([])
  const [ipProxiesLoading, setIpProxiesLoading] = useState(false)
  const [ipProxiesError, setIpProxiesError] = useState('')
  const [ipProxiesMessage, setIpProxiesMessage] = useState('')
  const [ipProxyPagination, setIpProxyPagination] = useState(() => createInitialPagination())
  const ipProxyPaginationRef = useRef(ipProxyPagination)
  const [ipProxyFilters, setIpProxyFilters] = useState({
    proxyType: '',
    proxyProtocol: '',
    status: '',
    ownerPhoneNumber: '',
  })
  const [ipProxyQueryApplied, setIpProxyQueryApplied] = useState(false)
  const ipProxyFiltersRef = useRef(ipProxyFilters)
  const [editingIpProxyId, setEditingIpProxyId] = useState(null)
  const [ipProxyType, setIpProxyType] = useState('')
  const [ipProxyProtocol, setIpProxyProtocol] = useState('')
  const [ipProxyInfo, setIpProxyInfo] = useState('')
  const [ipProxyStatus, setIpProxyStatus] = useState('')
  const [ipProxyAdsOwner, setIpProxyAdsOwner] = useState('')
  const [savingIpProxy, setSavingIpProxy] = useState(false)
  const [showIpProxyModal, setShowIpProxyModal] = useState(false)

  useEffect(() => {
    ipProxyFiltersRef.current = ipProxyFilters
  }, [ipProxyFilters])

  useEffect(() => {
    ipProxyPaginationRef.current = ipProxyPagination
  }, [ipProxyPagination])

  const loadIpProxies = useCallback(
    async (filters = ipProxyFiltersRef.current, pageConfig = ipProxyPaginationRef.current) => {
      setIpProxiesLoading(true)
      setIpProxiesError('')

      try {
        const response = await requestApi(
          `/ip-proxy-info${buildQueryString({
            proxyType: filters.proxyType,
            proxyProtocol: filters.proxyProtocol,
            status: filters.status,
            ...buildOwnerQueryParams(filters.ownerPhoneNumber),
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setIpProxies(extractItems(response))
        setIpProxyPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setIpProxiesError(message)
      } finally {
        setIpProxiesLoading(false)
      }
    },
    [token],
  )

  return {
    ipProxies, setIpProxies,
    ipProxiesLoading, setIpProxiesLoading,
    ipProxiesError, setIpProxiesError,
    ipProxiesMessage, setIpProxiesMessage,
    ipProxyPagination, setIpProxyPagination,
    ipProxyPaginationRef,
    ipProxyFilters, setIpProxyFilters,
    ipProxyQueryApplied, setIpProxyQueryApplied,
    ipProxyFiltersRef,
    editingIpProxyId, setEditingIpProxyId,
    ipProxyType, setIpProxyType,
    ipProxyProtocol, setIpProxyProtocol,
    ipProxyInfo, setIpProxyInfo,
    ipProxyStatus, setIpProxyStatus,
    ipProxyAdsOwner, setIpProxyAdsOwner,
    savingIpProxy, setSavingIpProxy,
    showIpProxyModal, setShowIpProxyModal,
    loadIpProxies,
  }
}
