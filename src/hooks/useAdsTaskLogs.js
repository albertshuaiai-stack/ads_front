import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi, toOptionalTrimmedString } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAdsTaskLogs(token, defaultAdsOwner, isAdminView) {
  const [adsTaskLogs, setAdsTaskLogs] = useState([])
  const [adsTaskLogsLoading, setAdsTaskLogsLoading] = useState(false)
  const [adsTaskLogsError, setAdsTaskLogsError] = useState('')
  const [adsTaskLogsLoaded, setAdsTaskLogsLoaded] = useState(false)
  const [adsTaskLogPagination, setAdsTaskLogPagination] = useState(() => createInitialPagination())
  const adsTaskLogPaginationRef = useRef(adsTaskLogPagination)
  const [adsTaskLogFilters, setAdsTaskLogFilters] = useState({
    adsType: '',
    adsName: '',
    ownerPhoneNumber: '',
  })
  const [adsTaskLogQueryApplied, setAdsTaskLogQueryApplied] = useState(false)
  const adsTaskLogFiltersRef = useRef(adsTaskLogFilters)

  useEffect(() => {
    adsTaskLogFiltersRef.current = adsTaskLogFilters
  }, [adsTaskLogFilters])

  useEffect(() => {
    adsTaskLogPaginationRef.current = adsTaskLogPagination
  }, [adsTaskLogPagination])

  const loadAdsTaskLogs = useCallback(
    async (
      filters = adsTaskLogFiltersRef.current,
      pageConfig = adsTaskLogPaginationRef.current,
    ) => {
      setAdsTaskLogsLoading(true)
      setAdsTaskLogsError('')

      try {
        const resolvedAdsOwner = isAdminView
          ? toOptionalTrimmedString(filters.ownerPhoneNumber)
          : toOptionalTrimmedString(defaultAdsOwner)

        const response = await requestApi(
          `/ads-task-logs${buildQueryString({
            adsOwner: resolvedAdsOwner,
            adsType: toOptionalTrimmedString(filters.adsType),
            adsName: toOptionalTrimmedString(filters.adsName),
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAdsTaskLogs(extractItems(response))
        setAdsTaskLogPagination(buildPaginationState(response, pageConfig))
        setAdsTaskLogsLoaded(true)
        setAdsTaskLogQueryApplied(true)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAdsTaskLogsError(message)
        setAdsTaskLogs([])
        setAdsTaskLogsLoaded(true)
      } finally {
        setAdsTaskLogsLoading(false)
      }
    },
    [defaultAdsOwner, isAdminView, token],
  )

  return {
    adsTaskLogs,
    adsTaskLogsLoading,
    adsTaskLogsError,
    setAdsTaskLogsError,
    adsTaskLogsLoaded,
    setAdsTaskLogsLoaded,
    adsTaskLogPagination,
    setAdsTaskLogPagination,
    adsTaskLogPaginationRef,
    adsTaskLogFilters,
    setAdsTaskLogFilters,
    adsTaskLogQueryApplied,
    setAdsTaskLogQueryApplied,
    adsTaskLogFiltersRef,
    loadAdsTaskLogs,
  }
}
