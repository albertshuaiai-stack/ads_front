import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi, toOptionalTrimmedString } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateSyncResults(token, defaultAdsOwner, isAdminView) {
  const [affiliateSyncResults, setAffiliateSyncResults] = useState([])
  const [affiliateSyncResultsLoading, setAffiliateSyncResultsLoading] = useState(false)
  const [affiliateSyncResultsError, setAffiliateSyncResultsError] = useState('')
  const [affiliateSyncResultsMessage, setAffiliateSyncResultsMessage] = useState('')
  const [affiliateSyncResultPagination, setAffiliateSyncResultPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateSyncResultPaginationRef = useRef(affiliateSyncResultPagination)
  const [affiliateSyncResultFilters, setAffiliateSyncResultFilters] = useState({
    affiliateNetwork: '',
    ownerPhoneNumber: '',
    status: '',
  })
  const [affiliateSyncResultQueryApplied, setAffiliateSyncResultQueryApplied] = useState(false)
  const affiliateSyncResultFiltersRef = useRef(affiliateSyncResultFilters)

  useEffect(() => {
    affiliateSyncResultFiltersRef.current = affiliateSyncResultFilters
  }, [affiliateSyncResultFilters])

  useEffect(() => {
    affiliateSyncResultPaginationRef.current = affiliateSyncResultPagination
  }, [affiliateSyncResultPagination])

  const loadAffiliateSyncResults = useCallback(
    async (
      filters = affiliateSyncResultFiltersRef.current,
      pageConfig = affiliateSyncResultPaginationRef.current,
    ) => {
      setAffiliateSyncResultsLoading(true)
      setAffiliateSyncResultsError('')

      try {
        const resolvedAdsOwner = isAdminView
          ? toOptionalTrimmedString(filters.ownerPhoneNumber)
          : toOptionalTrimmedString(defaultAdsOwner)

        const response = await requestApi(
          `/affiliate-ads${buildQueryString({
            adsOwner: resolvedAdsOwner,
            affiliateNetwork: filters.affiliateNetwork,
            status: filters.status,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliateSyncResults(extractItems(response))
        setAffiliateSyncResultPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateSyncResultsError(message)
      } finally {
        setAffiliateSyncResultsLoading(false)
      }
    },
    [defaultAdsOwner, isAdminView, token],
  )

  return {
    affiliateSyncResults, setAffiliateSyncResults,
    affiliateSyncResultsLoading, setAffiliateSyncResultsLoading,
    affiliateSyncResultsError, setAffiliateSyncResultsError,
    affiliateSyncResultsMessage, setAffiliateSyncResultsMessage,
    affiliateSyncResultPagination, setAffiliateSyncResultPagination,
    affiliateSyncResultPaginationRef,
    affiliateSyncResultFilters, setAffiliateSyncResultFilters,
    affiliateSyncResultQueryApplied, setAffiliateSyncResultQueryApplied,
    affiliateSyncResultFiltersRef,
    loadAffiliateSyncResults,
  }
}
