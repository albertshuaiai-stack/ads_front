import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useHouseKeepingLogs(token) {
  const [houseKeepingLogs, setHouseKeepingLogs] = useState([])
  const [houseKeepingLogsLoading, setHouseKeepingLogsLoading] = useState(false)
  const [houseKeepingLogsError, setHouseKeepingLogsError] = useState('')
  const [houseKeepingLogsLoaded, setHouseKeepingLogsLoaded] = useState(false)
  const [houseKeepingPagination, setHouseKeepingPagination] = useState(() => createInitialPagination())
  const houseKeepingPaginationRef = useRef(houseKeepingPagination)

  useEffect(() => {
    houseKeepingPaginationRef.current = houseKeepingPagination
  }, [houseKeepingPagination])

  const loadHouseKeepingLogs = useCallback(
    async (pageConfig = houseKeepingPaginationRef.current) => {
      setHouseKeepingLogsLoading(true)
      setHouseKeepingLogsError('')

      try {
        const response = await requestApi(
          `/house-keeping${buildQueryString({
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setHouseKeepingLogs(extractItems(response))
        setHouseKeepingPagination(buildPaginationState(response, pageConfig))
        setHouseKeepingLogsLoaded(true)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setHouseKeepingLogsError(message)
        setHouseKeepingLogs([])
        setHouseKeepingLogsLoaded(true)
      } finally {
        setHouseKeepingLogsLoading(false)
      }
    },
    [token],
  )

  return {
    houseKeepingLogs,
    houseKeepingLogsLoading,
    houseKeepingLogsError,
    setHouseKeepingLogsError,
    houseKeepingLogsLoaded,
    setHouseKeepingLogsLoaded,
    houseKeepingPagination,
    setHouseKeepingPagination,
    houseKeepingPaginationRef,
    loadHouseKeepingLogs,
  }
}
