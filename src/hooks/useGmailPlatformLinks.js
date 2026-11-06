// Gmail-平台链接归类规则模块状态与数据加载 / Gmail platform link rule module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useGmailPlatformLinks(token) {
  const [gmailPlatformLinks, setGmailPlatformLinks] = useState([])
  const [gmailPlatformLinksLoading, setGmailPlatformLinksLoading] = useState(false)
  const [gmailPlatformLinksError, setGmailPlatformLinksError] = useState('')
  const [gmailPlatformLinksMessage, setGmailPlatformLinksMessage] = useState('')
  const [gmailPlatformLinkPagination, setGmailPlatformLinkPagination] = useState(() =>
    createInitialPagination(),
  )
  const gmailPlatformLinkPaginationRef = useRef(gmailPlatformLinkPagination)
  const [gmailPlatformLinkFilters, setGmailPlatformLinkFilters] = useState({
    ownerPhoneNumber: '',
    userName: '',
    platformName: '',
  })
  const [gmailPlatformLinkQueryApplied, setGmailPlatformLinkQueryApplied] = useState(false)
  const gmailPlatformLinkFiltersRef = useRef(gmailPlatformLinkFilters)
  const [editingGmailPlatformLinkId, setEditingGmailPlatformLinkId] = useState(null)
  const [gmailPlatformLinkUserName, setGmailPlatformLinkUserName] = useState('')
  const [gmailPlatformLinkPlatformName, setGmailPlatformLinkPlatformName] = useState('')
  const [gmailPlatformLinkMatchId, setGmailPlatformLinkMatchId] = useState('')
  const [gmailPlatformLinkRemarks, setGmailPlatformLinkRemarks] = useState('')
  const [savingGmailPlatformLink, setSavingGmailPlatformLink] = useState(false)
  const [showGmailPlatformLinkModal, setShowGmailPlatformLinkModal] = useState(false)
  const [gmailPlatformStats, setGmailPlatformStats] = useState([])
  const [gmailMerchantRatings, setGmailMerchantRatings] = useState([])
  const [gmailPlatformStatsLoading, setGmailPlatformStatsLoading] = useState(false)
  const [gmailPlatformStatsError, setGmailPlatformStatsError] = useState('')

  useEffect(() => {
    gmailPlatformLinkFiltersRef.current = gmailPlatformLinkFilters
  }, [gmailPlatformLinkFilters])

  useEffect(() => {
    gmailPlatformLinkPaginationRef.current = gmailPlatformLinkPagination
  }, [gmailPlatformLinkPagination])

  const loadGmailPlatformLinks = useCallback(
    async (
      filters = gmailPlatformLinkFiltersRef.current,
      pageConfig = gmailPlatformLinkPaginationRef.current,
    ) => {
      setGmailPlatformLinksLoading(true)
      setGmailPlatformLinksError('')

      try {
        const response = await requestApi(
          `/gmail-platform-links${buildQueryString({
            userName: filters.userName,
            platformName: filters.platformName,
            adsOwner: filters.ownerPhoneNumber,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setGmailPlatformLinks(extractItems(response))
        setGmailPlatformLinkPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setGmailPlatformLinksError(message)
      } finally {
        setGmailPlatformLinksLoading(false)
      }
    },
    [token],
  )

  // 加载 Gmail -> 平台 -> 商家 统计 / load gmail -> platform -> merchant stats
  const loadGmailPlatformStats = useCallback(async () => {
    setGmailPlatformStatsLoading(true)
    setGmailPlatformStatsError('')

    try {
      const response = await requestApi('/gmail-platform-links/stats', { token })
      setGmailPlatformStats(Array.isArray(response?.accounts) ? response.accounts : [])
      setGmailMerchantRatings(Array.isArray(response?.merchants) ? response.merchants : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setGmailPlatformStatsError(message)
    } finally {
      setGmailPlatformStatsLoading(false)
    }
  }, [token])

  return {
    gmailPlatformLinks,
    setGmailPlatformLinks,
    gmailPlatformLinksLoading,
    gmailPlatformLinksError,
    setGmailPlatformLinksError,
    gmailPlatformLinksMessage,
    setGmailPlatformLinksMessage,
    gmailPlatformLinkPagination,
    setGmailPlatformLinkPagination,
    gmailPlatformLinkPaginationRef,
    gmailPlatformLinkFilters,
    setGmailPlatformLinkFilters,
    gmailPlatformLinkQueryApplied,
    setGmailPlatformLinkQueryApplied,
    gmailPlatformLinkFiltersRef,
    editingGmailPlatformLinkId,
    setEditingGmailPlatformLinkId,
    gmailPlatformLinkUserName,
    setGmailPlatformLinkUserName,
    gmailPlatformLinkPlatformName,
    setGmailPlatformLinkPlatformName,
    gmailPlatformLinkMatchId,
    setGmailPlatformLinkMatchId,
    gmailPlatformLinkRemarks,
    setGmailPlatformLinkRemarks,
    savingGmailPlatformLink,
    setSavingGmailPlatformLink,
    showGmailPlatformLinkModal,
    setShowGmailPlatformLinkModal,
    gmailPlatformStats,
    gmailMerchantRatings,
    gmailPlatformStatsLoading,
    gmailPlatformStatsError,
    loadGmailPlatformLinks,
    loadGmailPlatformStats,
  }
}
