import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi, toOptionalTrimmedString } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliatePostBacks(token, defaultAdsOwner, isAdminView) {
  const [affiliatePostBacks, setAffiliatePostBacks] = useState([])
  const [affiliatePostBacksLoading, setAffiliatePostBacksLoading] = useState(false)
  const [affiliatePostBacksError, setAffiliatePostBacksError] = useState('')
  const [affiliatePostBacksMessage, setAffiliatePostBacksMessage] = useState('')
  const [affiliatePostBackPagination, setAffiliatePostBackPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliatePostBackPaginationRef = useRef(affiliatePostBackPagination)
  const [affiliatePostBackFilters, setAffiliatePostBackFilters] = useState({
    affiliateSite: '',
    orderNo: '',
    status: '',
    ownerPhoneNumber: '',
  })
  const [affiliatePostBackQueryApplied, setAffiliatePostBackQueryApplied] = useState(false)
  const affiliatePostBackFiltersRef = useRef(affiliatePostBackFilters)

  useEffect(() => {
    affiliatePostBackFiltersRef.current = affiliatePostBackFilters
  }, [affiliatePostBackFilters])

  useEffect(() => {
    affiliatePostBackPaginationRef.current = affiliatePostBackPagination
  }, [affiliatePostBackPagination])

  const loadAffiliatePostBacks = useCallback(
    async (
      filters = affiliatePostBackFiltersRef.current,
      pageConfig = affiliatePostBackPaginationRef.current,
    ) => {
      setAffiliatePostBacksLoading(true)
      setAffiliatePostBacksError('')

      try {
        const resolvedAdsOwner = isAdminView
          ? toOptionalTrimmedString(filters.ownerPhoneNumber)
          : toOptionalTrimmedString(defaultAdsOwner)

        const response = await requestApi(
          `/postback${buildQueryString({
            adsOwner: resolvedAdsOwner,
            affiliateSite: filters.affiliateSite,
            orderNo: filters.orderNo,
            status: filters.status,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliatePostBacks(extractItems(response))
        setAffiliatePostBackPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliatePostBacksError(message)
      } finally {
        setAffiliatePostBacksLoading(false)
      }
    },
    [defaultAdsOwner, isAdminView, token],
  )

  return {
    affiliatePostBacks, setAffiliatePostBacks,
    affiliatePostBacksLoading, setAffiliatePostBacksLoading,
    affiliatePostBacksError, setAffiliatePostBacksError,
    affiliatePostBacksMessage, setAffiliatePostBacksMessage,
    affiliatePostBackPagination, setAffiliatePostBackPagination,
    affiliatePostBackPaginationRef,
    affiliatePostBackFilters, setAffiliatePostBackFilters,
    affiliatePostBackQueryApplied, setAffiliatePostBackQueryApplied,
    affiliatePostBackFiltersRef,
    loadAffiliatePostBacks,
  }
}
