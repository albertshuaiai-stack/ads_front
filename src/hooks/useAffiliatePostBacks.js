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

  const [postBackStats, setPostBackStats] = useState(null)
  const [postBackClicks, setPostBackClicks] = useState([])
  const [postBackClickSummary, setPostBackClickSummary] = useState(null)
  const [postBackStatsLoading, setPostBackStatsLoading] = useState(false)
  const [postBackStatsError, setPostBackStatsError] = useState('')
  const [postBackImporting, setPostBackImporting] = useState(false)
  const [postBackImportMessage, setPostBackImportMessage] = useState('')
  const [postBackImportError, setPostBackImportError] = useState('')

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

  // admin 选 All owners 时不传 adsOwner, 后端按全部账号统计 / no owner means all owners
  const statsOwner = useCallback(() => {
    const selected = isAdminView
      ? toOptionalTrimmedString(affiliatePostBackFilters.ownerPhoneNumber)
      : null
    if (selected) {
      return selected
    }
    return isAdminView ? null : toOptionalTrimmedString(defaultAdsOwner)
  }, [defaultAdsOwner, isAdminView, affiliatePostBackFilters.ownerPhoneNumber])

  const loadPostBackStats = useCallback(async () => {
    if (!token) {
      return
    }
    setPostBackStatsLoading(true)
    setPostBackStatsError('')
    try {
      const query = buildQueryString({ adsOwner: statsOwner() })
      const [stats, clicks] = await Promise.all([
        requestApi(`/postback/stats${query}`, { token }),
        requestApi(`/postback/clicks${query}`, { token }),
      ])
      setPostBackStats(stats && typeof stats === 'object' ? stats : null)
      setPostBackClicks(Array.isArray(clicks) ? clicks : extractItems(clicks))
    } catch (error) {
      setPostBackStatsError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setPostBackStatsLoading(false)
    }
  }, [token, statsOwner])

  const loadClickSummary = useCallback(async () => {
    if (!token) {
      return
    }
    try {
      const query = buildQueryString({ adsOwner: statsOwner(), size: 500 })
      const response = await requestApi(`/postback/click-summary${query}`, { token })
      setPostBackClickSummary(response && typeof response === 'object' ? response : null)
    } catch (error) {
      setPostBackClickSummary(null)
    }
  }, [token, statsOwner])

  const refreshAll = useCallback(async () => {
    await Promise.all([loadAffiliatePostBacks(), loadPostBackStats(), loadClickSummary()])
  }, [loadAffiliatePostBacks, loadPostBackStats, loadClickSummary])

  const importPostBackCsv = useCallback(
    async (file) => {
      if (!file) {
        return
      }
      setPostBackImporting(true)
      setPostBackImportMessage('')
      setPostBackImportError('')
      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await requestApi('/postback/import', {
          method: 'POST',
          token,
          body: formData,
        })
        setPostBackImportMessage(
          `Imported ${response?.imported ?? 0} rows; task-level ${response?.partial ?? 0}, ` +
            `unmatched ${response?.unmatched ?? 0}, skipped ${response?.skipped ?? 0}.`,
        )
        await refreshAll()
      } catch (error) {
        setPostBackImportError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setPostBackImporting(false)
      }
    },
    [token, refreshAll],
  )

  const deletePostBack = useCallback(
    async (id) => {
      try {
        await requestApi(`/postback/${id}`, { method: 'DELETE', token })
        await refreshAll()
        return ''
      } catch (error) {
        return error instanceof Error ? error.message : 'Unknown error'
      }
    },
    [token, refreshAll],
  )

  useEffect(() => {
    if (token) {
      loadPostBackStats()
      loadClickSummary()
    }
  }, [token, loadPostBackStats, loadClickSummary])

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
    postBackStats, postBackClicks, postBackClickSummary,
    postBackStatsLoading, postBackStatsError,
    postBackImporting, postBackImportMessage, postBackImportError,
    loadPostBackStats, loadClickSummary, importPostBackCsv, deletePostBack,
  }
}
