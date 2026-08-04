import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi, toOptionalTrimmedString } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateTestTasks(token) {
  const [affiliateTestTasks, setAffiliateTestTasks] = useState([])
  const [affiliateTestTasksLoading, setAffiliateTestTasksLoading] = useState(false)
  const [affiliateTestTasksError, setAffiliateTestTasksError] = useState('')
  const [affiliateTestTasksMessage, setAffiliateTestTasksMessage] = useState('')
  const [affiliateTestTaskPagination, setAffiliateTestTaskPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateTestTaskPaginationRef = useRef(affiliateTestTaskPagination)
  const [affiliateTestTaskFilters, setAffiliateTestTaskFilters] = useState({
    affiliateAdsSyncConfigId: '',
    ownerPhoneNumber: '',
  })
  const [affiliateTestTaskQueryApplied, setAffiliateTestTaskQueryApplied] = useState(false)
  const affiliateTestTaskFiltersRef = useRef(affiliateTestTaskFilters)
  const [editingAffiliateTestTaskId, setEditingAffiliateTestTaskId] = useState(null)
  const [affiliateTestTaskConfigId, setAffiliateTestTaskConfigId] = useState('')
  const [affiliateTestTaskRegion, setAffiliateTestTaskRegion] = useState('')
  const [affiliateTestTaskIpProxyInfoId, setAffiliateTestTaskIpProxyInfoId] = useState('')
  const [affiliateTestTaskTotalCount, setAffiliateTestTaskTotalCount] = useState(0)
  const [affiliateTestTaskSuccessCount, setAffiliateTestTaskSuccessCount] = useState(0)
  const [affiliateTestTaskFailedCount, setAffiliateTestTaskFailedCount] = useState(0)
  const [affiliateTestTaskStatus, setAffiliateTestTaskStatus] = useState('WAITING')
  const [affiliateTestTaskAdsOwner, setAffiliateTestTaskAdsOwner] = useState('')
  const [savingAffiliateTestTask, setSavingAffiliateTestTask] = useState(false)
  const [runningAffiliateTestTaskId, setRunningAffiliateTestTaskId] = useState(null)
  const [showAffiliateTestTaskModal, setShowAffiliateTestTaskModal] = useState(false)

  useEffect(() => {
    affiliateTestTaskFiltersRef.current = affiliateTestTaskFilters
  }, [affiliateTestTaskFilters])

  useEffect(() => {
    affiliateTestTaskPaginationRef.current = affiliateTestTaskPagination
  }, [affiliateTestTaskPagination])

  const loadAffiliateTestTasks = useCallback(
    async (
      filters = affiliateTestTaskFiltersRef.current,
      pageConfig = affiliateTestTaskPaginationRef.current,
    ) => {
      setAffiliateTestTasksLoading(true)
      setAffiliateTestTasksError('')

      try {
        const response = await requestApi(
          `/affiliate-ads-test-task${buildQueryString({
            affiliateAdsSyncConfigId:
              filters.affiliateAdsSyncConfigId === ''
                ? undefined
                : Number(filters.affiliateAdsSyncConfigId),
            adsOwner: toOptionalTrimmedString(filters.ownerPhoneNumber),
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliateTestTasks(extractItems(response))
        setAffiliateTestTaskPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateTestTasksError(message)
      } finally {
        setAffiliateTestTasksLoading(false)
      }
    },
    [token],
  )

  return {
    affiliateTestTasks, setAffiliateTestTasks,
    affiliateTestTasksLoading, setAffiliateTestTasksLoading,
    affiliateTestTasksError, setAffiliateTestTasksError,
    affiliateTestTasksMessage, setAffiliateTestTasksMessage,
    affiliateTestTaskPagination, setAffiliateTestTaskPagination,
    affiliateTestTaskPaginationRef,
    affiliateTestTaskFilters, setAffiliateTestTaskFilters,
    affiliateTestTaskQueryApplied, setAffiliateTestTaskQueryApplied,
    affiliateTestTaskFiltersRef,
    editingAffiliateTestTaskId, setEditingAffiliateTestTaskId,
    affiliateTestTaskConfigId, setAffiliateTestTaskConfigId,
    affiliateTestTaskRegion, setAffiliateTestTaskRegion,
    affiliateTestTaskIpProxyInfoId, setAffiliateTestTaskIpProxyInfoId,
    affiliateTestTaskTotalCount, setAffiliateTestTaskTotalCount,
    affiliateTestTaskSuccessCount, setAffiliateTestTaskSuccessCount,
    affiliateTestTaskFailedCount, setAffiliateTestTaskFailedCount,
    affiliateTestTaskStatus, setAffiliateTestTaskStatus,
    affiliateTestTaskAdsOwner, setAffiliateTestTaskAdsOwner,
    savingAffiliateTestTask, setSavingAffiliateTestTask,
    runningAffiliateTestTaskId, setRunningAffiliateTestTaskId,
    showAffiliateTestTaskModal, setShowAffiliateTestTaskModal,
    loadAffiliateTestTasks,
  }
}
