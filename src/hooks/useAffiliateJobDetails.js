import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateJobDetails(token) {
  const [affiliateJobDetails, setAffiliateJobDetails] = useState([])
  const [affiliateJobDetailsLoading, setAffiliateJobDetailsLoading] = useState(false)
  const [affiliateJobDetailsError, setAffiliateJobDetailsError] = useState('')
  const [affiliateJobDetailsMessage, setAffiliateJobDetailsMessage] = useState('')
  const [affiliateJobDetailPagination, setAffiliateJobDetailPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateJobDetailPaginationRef = useRef(affiliateJobDetailPagination)
  const [affiliateJobDetailFilters, setAffiliateJobDetailFilters] = useState({
    schedName: '',
    jobName: '',
    jobGroup: '',
    jobClassName: '',
    description: '',
  })
  const [affiliateJobDetailQueryApplied, setAffiliateJobDetailQueryApplied] = useState(false)
  const affiliateJobDetailFiltersRef = useRef(affiliateJobDetailFilters)

  useEffect(() => {
    affiliateJobDetailFiltersRef.current = affiliateJobDetailFilters
  }, [affiliateJobDetailFilters])

  useEffect(() => {
    affiliateJobDetailPaginationRef.current = affiliateJobDetailPagination
  }, [affiliateJobDetailPagination])

  const loadAffiliateJobDetails = useCallback(
    async (
      filters = affiliateJobDetailFiltersRef.current,
      pageConfig = affiliateJobDetailPaginationRef.current,
    ) => {
      setAffiliateJobDetailsLoading(true)
      setAffiliateJobDetailsError('')

      try {
        const response = await requestApi(
          `/qrtz/jobs${buildQueryString({
            schedName: filters.schedName,
            jobName: filters.jobName,
            jobGroup: filters.jobGroup,
            jobClassName: filters.jobClassName,
            description: filters.description,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliateJobDetails(extractItems(response))
        setAffiliateJobDetailPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateJobDetailsError(message)
      } finally {
        setAffiliateJobDetailsLoading(false)
      }
    },
    [token],
  )

  return {
    affiliateJobDetails,
    setAffiliateJobDetails,
    affiliateJobDetailsLoading,
    setAffiliateJobDetailsLoading,
    affiliateJobDetailsError,
    setAffiliateJobDetailsError,
    affiliateJobDetailsMessage,
    setAffiliateJobDetailsMessage,
    affiliateJobDetailPagination,
    setAffiliateJobDetailPagination,
    affiliateJobDetailPaginationRef,
    affiliateJobDetailFilters,
    setAffiliateJobDetailFilters,
    affiliateJobDetailQueryApplied,
    setAffiliateJobDetailQueryApplied,
    affiliateJobDetailFiltersRef,
    loadAffiliateJobDetails,
  }
}
