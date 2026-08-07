import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi, toOptionalTrimmedString } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateAutoTasks(token, defaultAdsOwner, isAdminView) {
  const [affiliateAutoTasks, setAffiliateAutoTasks] = useState([])
  const [affiliateAutoTasksLoading, setAffiliateAutoTasksLoading] = useState(false)
  const [affiliateAutoTasksError, setAffiliateAutoTasksError] = useState('')
  const [affiliateAutoTasksMessage, setAffiliateAutoTasksMessage] = useState('')
  const [affiliateAutoTaskPagination, setAffiliateAutoTaskPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateAutoTaskPaginationRef = useRef(affiliateAutoTaskPagination)
  const [affiliateAutoTaskFilters, setAffiliateAutoTaskFilters] = useState({
    affiliateNetwork: '',
    region: '',
    status: '',
    ownerPhoneNumber: '',
  })
  const [affiliateAutoTaskQueryApplied, setAffiliateAutoTaskQueryApplied] = useState(false)
  const affiliateAutoTaskFiltersRef = useRef(affiliateAutoTaskFilters)
  const [editingAffiliateAutoTaskId, setEditingAffiliateAutoTaskId] = useState(null)
  const [editingAffiliateAutoTaskOriginal, setEditingAffiliateAutoTaskOriginal] = useState(null)
  const [affiliateAutoTaskNetwork, setAffiliateAutoTaskNetwork] = useState('')
  const [affiliateAutoTaskType, setAffiliateAutoTaskType] = useState('')
  const [affiliateAutoTaskRegion, setAffiliateAutoTaskRegion] = useState('')
  const [affiliateAutoTaskAdsOwner, setAffiliateAutoTaskAdsOwner] = useState('')
  const [savingAffiliateAutoTask, setSavingAffiliateAutoTask] = useState(false)
  const [showAffiliateAutoTaskModal, setShowAffiliateAutoTaskModal] = useState(false)

  useEffect(() => {
    affiliateAutoTaskFiltersRef.current = affiliateAutoTaskFilters
  }, [affiliateAutoTaskFilters])

  useEffect(() => {
    affiliateAutoTaskPaginationRef.current = affiliateAutoTaskPagination
  }, [affiliateAutoTaskPagination])

  const loadAffiliateAutoTasks = useCallback(
    async (
      filters = affiliateAutoTaskFiltersRef.current,
      pageConfig = affiliateAutoTaskPaginationRef.current,
    ) => {
      setAffiliateAutoTasksLoading(true)
      setAffiliateAutoTasksError('')

      try {
        const resolvedAdsOwner = isAdminView
          ? toOptionalTrimmedString(filters.ownerPhoneNumber)
          : toOptionalTrimmedString(defaultAdsOwner)

        const response = await requestApi(
          `/affiliate-auto-task${buildQueryString({
            adsOwner: resolvedAdsOwner,
            affiliateNetwork: filters.affiliateNetwork,
            region: filters.region,
            status: filters.status,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliateAutoTasks(extractItems(response))
        setAffiliateAutoTaskPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateAutoTasksError(message)
      } finally {
        setAffiliateAutoTasksLoading(false)
      }
    },
    [defaultAdsOwner, isAdminView, token],
  )

  return {
    affiliateAutoTasks, setAffiliateAutoTasks,
    affiliateAutoTasksLoading, setAffiliateAutoTasksLoading,
    affiliateAutoTasksError, setAffiliateAutoTasksError,
    affiliateAutoTasksMessage, setAffiliateAutoTasksMessage,
    affiliateAutoTaskPagination, setAffiliateAutoTaskPagination,
    affiliateAutoTaskPaginationRef,
    affiliateAutoTaskFilters, setAffiliateAutoTaskFilters,
    affiliateAutoTaskQueryApplied, setAffiliateAutoTaskQueryApplied,
    affiliateAutoTaskFiltersRef,
    editingAffiliateAutoTaskId, setEditingAffiliateAutoTaskId,
    editingAffiliateAutoTaskOriginal, setEditingAffiliateAutoTaskOriginal,
    affiliateAutoTaskNetwork, setAffiliateAutoTaskNetwork,
    affiliateAutoTaskType, setAffiliateAutoTaskType,
    affiliateAutoTaskRegion, setAffiliateAutoTaskRegion,
    affiliateAutoTaskAdsOwner, setAffiliateAutoTaskAdsOwner,
    savingAffiliateAutoTask, setSavingAffiliateAutoTask,
    showAffiliateAutoTaskModal, setShowAffiliateAutoTaskModal,
    loadAffiliateAutoTasks,
  }
}
