// 普通广告模块状态与数据加载 / Normal ADs module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useNormalAds(token) {
  const [normalAds, setNormalAds] = useState([])
  const [normalAdsLoading, setNormalAdsLoading] = useState(false)
  const [normalAdsError, setNormalAdsError] = useState('')
  const [normalAdsMessage, setNormalAdsMessage] = useState('')
  const [normalAdsPagination, setNormalAdsPagination] = useState(() => createInitialPagination())
  const normalAdsPaginationRef = useRef(normalAdsPagination)
  const [editingNormalAdsId, setEditingNormalAdsId] = useState(null)
  const [normalCampainName, setNormalCampainName] = useState('')
  const [normalCampainCountry, setNormalCampainCountry] = useState('')
  const [normalPlatformName, setNormalPlatformName] = useState('')
  const [normalAffiliteUrl, setNormalAffiliteUrl] = useState('')
  const [normalLandingPageUrl, setNormalLandingPageUrl] = useState('')
  const [normalDynamicProxyInfo, setNormalDynamicProxyInfo] = useState('')
  const [normalDynamicProxyInfoBackup, setNormalDynamicProxyInfoBackup] = useState('')
  const [normalIntervalTime, setNormalIntervalTime] = useState('')
  const [normalStatus, setNormalStatus] = useState('RUNNING')
  const [savingNormalAds, setSavingNormalAds] = useState(false)
  const [showNormalAdsModal, setShowNormalAdsModal] = useState(false)
  const [normalAdsFilters, setNormalAdsFilters] = useState({
    campainName: '',
    platformName: '',
    status: '',
  })
  const [normalAdsQueryApplied, setNormalAdsQueryApplied] = useState(false)
  const normalAdsFiltersRef = useRef(normalAdsFilters)

  useEffect(() => {
    normalAdsFiltersRef.current = normalAdsFilters
  }, [normalAdsFilters])

  useEffect(() => {
    normalAdsPaginationRef.current = normalAdsPagination
  }, [normalAdsPagination])

  const loadNormalAds = useCallback(
    async (filters = {}, pageConfig = normalAdsPaginationRef.current) => {
      setNormalAdsLoading(true)
      setNormalAdsError('')

      try {
        const path = `/normal-ads${buildQueryString({
          ...filters,
          page: pageConfig.page,
          size: pageConfig.size,
        })}`
        const response = await requestApi(path, { token })
        setNormalAds(extractItems(response))
        setNormalAdsPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setNormalAdsError(message)
      } finally {
        setNormalAdsLoading(false)
      }
    },
    [token],
  )

  return {
    normalAds, setNormalAds,
    normalAdsLoading, setNormalAdsLoading,
    normalAdsError, setNormalAdsError,
    normalAdsMessage, setNormalAdsMessage,
    normalAdsPagination, setNormalAdsPagination,
    normalAdsPaginationRef,
    editingNormalAdsId, setEditingNormalAdsId,
    normalCampainName, setNormalCampainName,
    normalCampainCountry, setNormalCampainCountry,
    normalPlatformName, setNormalPlatformName,
    normalAffiliteUrl, setNormalAffiliteUrl,
    normalLandingPageUrl, setNormalLandingPageUrl,
    normalDynamicProxyInfo, setNormalDynamicProxyInfo,
    normalDynamicProxyInfoBackup, setNormalDynamicProxyInfoBackup,
    normalIntervalTime, setNormalIntervalTime,
    normalStatus, setNormalStatus,
    savingNormalAds, setSavingNormalAds,
    showNormalAdsModal, setShowNormalAdsModal,
    normalAdsFilters, setNormalAdsFilters,
    normalAdsQueryApplied, setNormalAdsQueryApplied,
    normalAdsFiltersRef,
    loadNormalAds,
  }
}
