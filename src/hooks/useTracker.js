// 追踪链路管理模块状态与数据加载 / Tracker management module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export const EMPTY_TRACK_CAMPAIGN_FORM = {
  slug: '',
  campaignName: '',
  offerUrlTemplate: '',
  landingPageUrl: '',
  allowedLandingHosts: '',
  poolCode: '',
  rotateStrategy: 'WEIGHTED_RANDOM',
  fixedSiteId: '',
  status: 'RUNNING',
  remarks: '',
}

export const EMPTY_TRACK_POOL_FORM = {
  poolCode: '',
  siteId: '',
  platform: '',
  advertiser: '',
  weight: 1,
  dailyCap: '',
  status: 'ACTIVE',
  remarks: '',
}

export function useTracker(token) {
  // ---- campaigns ----
  const [campaigns, setCampaigns] = useState([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [campaignsError, setCampaignsError] = useState('')
  const [campaignsMessage, setCampaignsMessage] = useState('')
  const [campaignPagination, setCampaignPagination] = useState(() => createInitialPagination())
  const campaignPaginationRef = useRef(campaignPagination)
  const [campaignForm, setCampaignForm] = useState(EMPTY_TRACK_CAMPAIGN_FORM)
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [savingCampaign, setSavingCampaign] = useState(false)

  // ---- site id pool ----
  const [pools, setPools] = useState([])
  const [poolsLoading, setPoolsLoading] = useState(false)
  const [poolsError, setPoolsError] = useState('')
  const [poolsMessage, setPoolsMessage] = useState('')
  const [poolPagination, setPoolPagination] = useState(() => createInitialPagination())
  const poolPaginationRef = useRef(poolPagination)
  const [poolForm, setPoolForm] = useState(EMPTY_TRACK_POOL_FORM)
  const [editingPoolId, setEditingPoolId] = useState(null)
  const [showPoolModal, setShowPoolModal] = useState(false)
  const [savingPool, setSavingPool] = useState(false)

  // ---- clicks ----
  const [clicks, setClicks] = useState([])
  const [clicksLoading, setClicksLoading] = useState(false)
  const [clicksError, setClicksError] = useState('')
  const [clickPagination, setClickPagination] = useState(() => createInitialPagination())
  const clickPaginationRef = useRef(clickPagination)
  const [clickFilters, setClickFilters] = useState({ slug: '', campaignName: '' })

  // ---- conversions ----
  const [conversions, setConversions] = useState([])
  const [conversionsLoading, setConversionsLoading] = useState(false)
  const [conversionsError, setConversionsError] = useState('')
  const [conversionPagination, setConversionPagination] = useState(() => createInitialPagination())
  const conversionPaginationRef = useRef(conversionPagination)
  const [conversionFilters, setConversionFilters] = useState({ orderNo: '', attributed: '' })

  // ---- health checks ----
  const [checks, setChecks] = useState([])
  const [checksLoading, setChecksLoading] = useState(false)
  const [checksError, setChecksError] = useState('')
  const [checksMessage, setChecksMessage] = useState('')
  const [checkPagination, setCheckPagination] = useState(() => createInitialPagination())
  const checkPaginationRef = useRef(checkPagination)
  const [lastCheck, setLastCheck] = useState(null)

  // ---- active tab ----
  const [trackerTab, setTrackerTab] = useState('campaigns')

  useEffect(() => {
    campaignPaginationRef.current = campaignPagination
  }, [campaignPagination])

  useEffect(() => {
    poolPaginationRef.current = poolPagination
  }, [poolPagination])

  useEffect(() => {
    clickPaginationRef.current = clickPagination
  }, [clickPagination])

  useEffect(() => {
    conversionPaginationRef.current = conversionPagination
  }, [conversionPagination])

  useEffect(() => {
    checkPaginationRef.current = checkPagination
  }, [checkPagination])

  const loadTrackCampaigns = useCallback(
    async (pageConfig = campaignPaginationRef.current) => {
      setCampaignsLoading(true)
      setCampaignsError('')
      try {
        const response = await requestApi(
          `/track/campaigns${buildQueryString({ page: pageConfig.page, size: pageConfig.size })}`,
          { token },
        )
        setCampaigns(extractItems(response))
        setCampaignPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        setCampaignsError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setCampaignsLoading(false)
      }
    },
    [token],
  )

  const loadTrackPools = useCallback(
    async (pageConfig = poolPaginationRef.current) => {
      setPoolsLoading(true)
      setPoolsError('')
      try {
        const response = await requestApi(
          `/track/pools${buildQueryString({ page: pageConfig.page, size: pageConfig.size })}`,
          { token },
        )
        setPools(extractItems(response))
        setPoolPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        setPoolsError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setPoolsLoading(false)
      }
    },
    [token],
  )

  const loadTrackClicks = useCallback(
    async (pageConfig = clickPaginationRef.current) => {
      setClicksLoading(true)
      setClicksError('')
      try {
        const response = await requestApi(
          `/track/clicks${buildQueryString({
            slug: clickFilters.slug,
            campaignName: clickFilters.campaignName,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setClicks(extractItems(response))
        setClickPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        setClicksError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setClicksLoading(false)
      }
    },
    [token, clickFilters],
  )

  const loadTrackConversions = useCallback(
    async (pageConfig = conversionPaginationRef.current) => {
      setConversionsLoading(true)
      setConversionsError('')
      try {
        const response = await requestApi(
          `/track/conversions${buildQueryString({
            orderNo: conversionFilters.orderNo,
            attributed: conversionFilters.attributed,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setConversions(extractItems(response))
        setConversionPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        setConversionsError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setConversionsLoading(false)
      }
    },
    [token, conversionFilters],
  )

  const loadTrackChecks = useCallback(
    async (pageConfig = checkPaginationRef.current) => {
      setChecksLoading(true)
      setChecksError('')
      try {
        const response = await requestApi(
          `/track/checks${buildQueryString({ page: pageConfig.page, size: pageConfig.size })}`,
          { token },
        )
        setChecks(extractItems(response))
        setCheckPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        setChecksError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setChecksLoading(false)
      }
    },
    [token],
  )

  const openCreateCampaign = useCallback(() => {
    setEditingCampaignId(null)
    setCampaignForm(EMPTY_TRACK_CAMPAIGN_FORM)
    setShowCampaignModal(true)
  }, [])

  const openEditCampaign = useCallback((campaign) => {
    setEditingCampaignId(campaign?.id ?? null)
    setCampaignForm({
      slug: campaign?.slug ?? '',
      campaignName: campaign?.campaignName ?? '',
      offerUrlTemplate: campaign?.offerUrlTemplate ?? '',
      landingPageUrl: campaign?.landingPageUrl ?? '',
      allowedLandingHosts: campaign?.allowedLandingHosts ?? '',
      poolCode: campaign?.poolCode ?? '',
      rotateStrategy: campaign?.rotateStrategy || 'WEIGHTED_RANDOM',
      fixedSiteId: campaign?.fixedSiteId ?? '',
      status: campaign?.status || 'RUNNING',
      remarks: campaign?.remarks ?? '',
    })
    setShowCampaignModal(true)
  }, [])

  const saveTrackCampaign = useCallback(async () => {
    setSavingCampaign(true)
    setCampaignsError('')
    setCampaignsMessage('')
    try {
      const payload = {
        slug: campaignForm.slug.trim(),
        campaignName: campaignForm.campaignName.trim() || null,
        offerUrlTemplate: campaignForm.offerUrlTemplate.trim(),
        landingPageUrl: campaignForm.landingPageUrl.trim() || null,
        allowedLandingHosts: campaignForm.allowedLandingHosts.trim() || null,
        poolCode: campaignForm.poolCode.trim() || null,
        rotateStrategy: campaignForm.rotateStrategy,
        fixedSiteId: campaignForm.fixedSiteId.trim() || null,
        status: campaignForm.status,
        remarks: campaignForm.remarks.trim() || null,
      }
      if (editingCampaignId) {
        await requestApi(`/track/campaigns/${editingCampaignId}`, { method: 'PUT', token, body: payload })
        setCampaignsMessage('Tracker campaign updated.')
      } else {
        await requestApi('/track/campaigns', { method: 'POST', token, body: payload })
        setCampaignsMessage('Tracker campaign created.')
      }
      setShowCampaignModal(false)
      setEditingCampaignId(null)
      setCampaignForm(EMPTY_TRACK_CAMPAIGN_FORM)
      await loadTrackCampaigns()
    } catch (error) {
      setCampaignsError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setSavingCampaign(false)
    }
  }, [campaignForm, editingCampaignId, loadTrackCampaigns, token])

  const deleteTrackCampaign = useCallback(
    async (campaignId) => {
      setCampaignsError('')
      setCampaignsMessage('')
      try {
        await requestApi(`/track/campaigns/${campaignId}`, { method: 'DELETE', token })
        setCampaignsMessage('Tracker campaign deleted.')
        await loadTrackCampaigns()
      } catch (error) {
        setCampaignsError(error instanceof Error ? error.message : 'Unknown error')
      }
    },
    [loadTrackCampaigns, token],
  )

  const openCreatePool = useCallback(() => {
    setEditingPoolId(null)
    setPoolForm(EMPTY_TRACK_POOL_FORM)
    setShowPoolModal(true)
  }, [])

  const openEditPool = useCallback((pool) => {
    setEditingPoolId(pool?.id ?? null)
    setPoolForm({
      poolCode: pool?.poolCode ?? '',
      siteId: pool?.siteId ?? '',
      platform: pool?.platform ?? '',
      advertiser: pool?.advertiser ?? '',
      weight: pool?.weight ?? 1,
      dailyCap: pool?.dailyCap ?? '',
      status: pool?.status || 'ACTIVE',
      remarks: pool?.remarks ?? '',
    })
    setShowPoolModal(true)
  }, [])

  const saveTrackPool = useCallback(async () => {
    setSavingPool(true)
    setPoolsError('')
    setPoolsMessage('')
    try {
      const payload = {
        poolCode: poolForm.poolCode.trim(),
        siteId: poolForm.siteId.trim(),
        platform: poolForm.platform.trim() || null,
        advertiser: poolForm.advertiser.trim() || null,
        weight: Number(poolForm.weight) || 1,
        dailyCap: poolForm.dailyCap === '' ? null : Number(poolForm.dailyCap),
        status: poolForm.status,
        remarks: poolForm.remarks.trim() || null,
      }
      if (editingPoolId) {
        await requestApi(`/track/pools/${editingPoolId}`, { method: 'PUT', token, body: payload })
        setPoolsMessage('Pool entry updated.')
      } else {
        await requestApi('/track/pools', { method: 'POST', token, body: payload })
        setPoolsMessage('Pool entry created.')
      }
      setShowPoolModal(false)
      setEditingPoolId(null)
      setPoolForm(EMPTY_TRACK_POOL_FORM)
      await loadTrackPools()
    } catch (error) {
      setPoolsError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setSavingPool(false)
    }
  }, [editingPoolId, loadTrackPools, poolForm, token])

  const deleteTrackPool = useCallback(
    async (poolId) => {
      setPoolsError('')
      setPoolsMessage('')
      try {
        await requestApi(`/track/pools/${poolId}`, { method: 'DELETE', token })
        setPoolsMessage('Pool entry deleted.')
        await loadTrackPools()
      } catch (error) {
        setPoolsError(error instanceof Error ? error.message : 'Unknown error')
      }
    },
    [loadTrackPools, token],
  )

  const resetPoolDailyUsage = useCallback(
    async (poolCode) => {
      setPoolsError('')
      setPoolsMessage('')
      try {
        await requestApi(
          `/track/pools/reset-daily${buildQueryString({ poolCode })}`,
          { method: 'POST', token },
        )
        setPoolsMessage('Daily usage reset.')
        await loadTrackPools()
      } catch (error) {
        setPoolsError(error instanceof Error ? error.message : 'Unknown error')
      }
    },
    [loadTrackPools, token],
  )

  // 触发一次链路合规巡检 / run one compliance check
  const runTrackerCheck = useCallback(
    async (campaignId) => {
      setChecksLoading(true)
      setChecksError('')
      setChecksMessage('')
      try {
        const response = await requestApi(`/track/campaigns/${campaignId}/check`, {
          method: 'POST',
          token,
        })
        setChecksMessage(response?.message || 'Compliance check finished.')
        setLastCheck(response?.data ?? null)
        setTrackerTab('checks')
        await loadTrackChecks()
      } catch (error) {
        setChecksError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setChecksLoading(false)
      }
    },
    [loadTrackChecks, token],
  )

  return {
    campaigns,
    campaignsLoading,
    campaignsError,
    campaignsMessage,
    campaignPagination,
    setCampaignPagination,
    campaignForm,
    setCampaignForm,
    editingCampaignId,
    showCampaignModal,
    setShowCampaignModal,
    savingCampaign,
    loadTrackCampaigns,
    openCreateCampaign,
    openEditCampaign,
    saveTrackCampaign,
    deleteTrackCampaign,

    pools,
    poolsLoading,
    poolsError,
    poolsMessage,
    poolPagination,
    setPoolPagination,
    poolForm,
    setPoolForm,
    editingPoolId,
    showPoolModal,
    setShowPoolModal,
    savingPool,
    loadTrackPools,
    openCreatePool,
    openEditPool,
    saveTrackPool,
    deleteTrackPool,
    resetPoolDailyUsage,

    clicks,
    clicksLoading,
    clicksError,
    clickPagination,
    setClickPagination,
    clickFilters,
    setClickFilters,
    loadTrackClicks,

    conversions,
    conversionsLoading,
    conversionsError,
    conversionPagination,
    setConversionPagination,
    conversionFilters,
    setConversionFilters,
    loadTrackConversions,

    checks,
    checksLoading,
    checksError,
    checksMessage,
    checkPagination,
    setCheckPagination,
    lastCheck,
    loadTrackChecks,
    runTrackerCheck,

    trackerTab,
    setTrackerTab,
  }
}
