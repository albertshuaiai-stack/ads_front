import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi, toOptionalTrimmedString } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateTestResults(token, defaultAdsOwner, isAdminView) {
  const [affiliateTestResults, setAffiliateTestResults] = useState([])
  const [affiliateTestResultsLoading, setAffiliateTestResultsLoading] = useState(false)
  const [affiliateTestResultsError, setAffiliateTestResultsError] = useState('')
  const [affiliateTestResultsMessage, setAffiliateTestResultsMessage] = useState('')
  const [affiliateTestResultPagination, setAffiliateTestResultPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateTestResultPaginationRef = useRef(affiliateTestResultPagination)
  const [affiliateTestResultFilters, setAffiliateTestResultFilters] = useState({
    affiliateNetwork: '',
    region: '',
    status: '',
    ownerPhoneNumber: '',
  })
  const [affiliateTestResultQueryApplied, setAffiliateTestResultQueryApplied] = useState(false)
  const affiliateTestResultFiltersRef = useRef(affiliateTestResultFilters)
  const [editingAffiliateTestResultId, setEditingAffiliateTestResultId] = useState(null)
  const [affiliateTestResultNetwork, setAffiliateTestResultNetwork] = useState('')
  const [affiliateTestResultRegion, setAffiliateTestResultRegion] = useState('')
  const [affiliateTestResultSiteName, setAffiliateTestResultSiteName] = useState('')
  const [affiliateTestResultSiteUrl, setAffiliateTestResultSiteUrl] = useState('')
  const [affiliateTestResultTrackingUrl, setAffiliateTestResultTrackingUrl] = useState('')
  const [affiliateTestResultFinalUrl, setAffiliateTestResultFinalUrl] = useState('')
  const [affiliateTestResultStatus, setAffiliateTestResultStatus] = useState('')
  const [affiliateTestResultAdsOwner, setAffiliateTestResultAdsOwner] = useState('')
  const [savingAffiliateTestResult, setSavingAffiliateTestResult] = useState(false)
  const [showAffiliateTestResultModal, setShowAffiliateTestResultModal] = useState(false)

  useEffect(() => {
    affiliateTestResultFiltersRef.current = affiliateTestResultFilters
  }, [affiliateTestResultFilters])

  useEffect(() => {
    affiliateTestResultPaginationRef.current = affiliateTestResultPagination
  }, [affiliateTestResultPagination])

  const loadAffiliateTestResults = useCallback(
    async (
      filters = affiliateTestResultFiltersRef.current,
      pageConfig = affiliateTestResultPaginationRef.current,
    ) => {
      setAffiliateTestResultsLoading(true)
      setAffiliateTestResultsError('')

      try {
        const resolvedAdsOwner = isAdminView
          ? toOptionalTrimmedString(filters.ownerPhoneNumber)
          : toOptionalTrimmedString(defaultAdsOwner)

        const response = await requestApi(
          `/affiliate-ads-test-result${buildQueryString({
            adsOwner: resolvedAdsOwner,
            affiliateNetwork: filters.affiliateNetwork,
            region: filters.region,
            status: filters.status,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliateTestResults(extractItems(response))
        setAffiliateTestResultPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateTestResultsError(message)
      } finally {
        setAffiliateTestResultsLoading(false)
      }
    },
    [defaultAdsOwner, isAdminView, token],
  )

  return {
    affiliateTestResults, setAffiliateTestResults,
    affiliateTestResultsLoading, setAffiliateTestResultsLoading,
    affiliateTestResultsError, setAffiliateTestResultsError,
    affiliateTestResultsMessage, setAffiliateTestResultsMessage,
    affiliateTestResultPagination, setAffiliateTestResultPagination,
    affiliateTestResultPaginationRef,
    affiliateTestResultFilters, setAffiliateTestResultFilters,
    affiliateTestResultQueryApplied, setAffiliateTestResultQueryApplied,
    affiliateTestResultFiltersRef,
    editingAffiliateTestResultId, setEditingAffiliateTestResultId,
    affiliateTestResultNetwork, setAffiliateTestResultNetwork,
    affiliateTestResultRegion, setAffiliateTestResultRegion,
    affiliateTestResultSiteName, setAffiliateTestResultSiteName,
    affiliateTestResultSiteUrl, setAffiliateTestResultSiteUrl,
    affiliateTestResultTrackingUrl, setAffiliateTestResultTrackingUrl,
    affiliateTestResultFinalUrl, setAffiliateTestResultFinalUrl,
    affiliateTestResultStatus, setAffiliateTestResultStatus,
    affiliateTestResultAdsOwner, setAffiliateTestResultAdsOwner,
    savingAffiliateTestResult, setSavingAffiliateTestResult,
    showAffiliateTestResultModal, setShowAffiliateTestResultModal,
    loadAffiliateTestResults,
  }
}
