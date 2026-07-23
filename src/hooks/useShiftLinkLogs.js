// Shift Link Log 模块状态与数据加载 / Shift Link Log module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useShiftLinkLogs(token) {
  const [shiftLinkLogFilters, setShiftLinkLogFilters] = useState({
    adsType: '',
    adsName: '',
    platformName: '',
  })
  const [shiftLinkLogCatalog, setShiftLinkLogCatalog] = useState([])
  const [shiftLinkLogCatalogLoading, setShiftLinkLogCatalogLoading] = useState(false)
  const [shiftLinkLogCatalogError, setShiftLinkLogCatalogError] = useState('')
  const [shiftLinkLogs, setShiftLinkLogs] = useState([])
  const [shiftLinkLogsLoading, setShiftLinkLogsLoading] = useState(false)
  const [shiftLinkLogsError, setShiftLinkLogsError] = useState('')
  const [shiftLinkLogsLoaded, setShiftLinkLogsLoaded] = useState(false)
  const [shiftLinkLogPagination, setShiftLinkLogPagination] = useState(() => createInitialPagination())
  const shiftLinkLogPaginationRef = useRef(shiftLinkLogPagination)
  const [shiftLinkLogQueryApplied, setShiftLinkLogQueryApplied] = useState(false)
  const shiftLinkLogFiltersRef = useRef(shiftLinkLogFilters)

  useEffect(() => {
    shiftLinkLogFiltersRef.current = shiftLinkLogFilters
  }, [shiftLinkLogFilters])

  useEffect(() => {
    shiftLinkLogPaginationRef.current = shiftLinkLogPagination
  }, [shiftLinkLogPagination])

  const loadShiftLinkLogCatalog = useCallback(async () => {
    setShiftLinkLogCatalogLoading(true)
    setShiftLinkLogCatalogError('')

    try {
      const response = await requestApi('/shift-links/all', { token })
      setShiftLinkLogCatalog(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setShiftLinkLogCatalogError(message)
    } finally {
      setShiftLinkLogCatalogLoading(false)
    }
  }, [token])

  const loadShiftLinkLogs = useCallback(
    async (filters = shiftLinkLogFiltersRef.current, pageConfig = shiftLinkLogPaginationRef.current) => {
      setShiftLinkLogsLoading(true)
      setShiftLinkLogsError('')

      try {
        const response = await requestApi(
          `/shift-link-logs${buildQueryString({
            adsType: filters.adsType,
            adsName: filters.adsName,
            platformName: filters.platformName,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setShiftLinkLogs(extractItems(response))
        setShiftLinkLogPagination(buildPaginationState(response, pageConfig))
        setShiftLinkLogsLoaded(true)
        setShiftLinkLogQueryApplied(true)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setShiftLinkLogsError(message)
        setShiftLinkLogs([])
        setShiftLinkLogsLoaded(true)
      } finally {
        setShiftLinkLogsLoading(false)
      }
    },
    [token],
  )

  return {
    shiftLinkLogFilters, setShiftLinkLogFilters,
    shiftLinkLogCatalog, setShiftLinkLogCatalog,
    shiftLinkLogCatalogLoading, setShiftLinkLogCatalogLoading,
    shiftLinkLogCatalogError, setShiftLinkLogCatalogError,
    shiftLinkLogs, setShiftLinkLogs,
    shiftLinkLogsLoading, setShiftLinkLogsLoading,
    shiftLinkLogsError, setShiftLinkLogsError,
    shiftLinkLogsLoaded, setShiftLinkLogsLoaded,
    shiftLinkLogPagination, setShiftLinkLogPagination,
    shiftLinkLogPaginationRef,
    shiftLinkLogQueryApplied, setShiftLinkLogQueryApplied,
    shiftLinkLogFiltersRef,
    loadShiftLinkLogCatalog,
    loadShiftLinkLogs,
  }
}
