import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi, toOptionalTrimmedString } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateSyncTasks(token) {
  const [affiliateSyncTasks, setAffiliateSyncTasks] = useState([])
  const [affiliateSyncTasksLoading, setAffiliateSyncTasksLoading] = useState(false)
  const [affiliateSyncTasksError, setAffiliateSyncTasksError] = useState('')
  const [affiliateSyncTasksMessage, setAffiliateSyncTasksMessage] = useState('')
  const [affiliateSyncTaskPagination, setAffiliateSyncTaskPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateSyncTaskPaginationRef = useRef(affiliateSyncTaskPagination)
  const [affiliateSyncTaskFilters, setAffiliateSyncTaskFilters] = useState({
    affiliateAdsSyncConfigId: '',
    ownerPhoneNumber: '',
  })
  const [affiliateSyncTaskQueryApplied, setAffiliateSyncTaskQueryApplied] = useState(false)
  const affiliateSyncTaskFiltersRef = useRef(affiliateSyncTaskFilters)
  const [editingAffiliateSyncTaskId, setEditingAffiliateSyncTaskId] = useState(null)
  const [affiliateSyncTaskConfigId, setAffiliateSyncTaskConfigId] = useState('')
  const [affiliateSyncTaskRegion, setAffiliateSyncTaskRegion] = useState('')
  const [affiliateSyncTaskType, setAffiliateSyncTaskType] = useState('')
  const [affiliateSyncTaskCron, setAffiliateSyncTaskCron] = useState('')
  const [affiliateSyncTaskTotalCount, setAffiliateSyncTaskTotalCount] = useState(0)
  const [affiliateSyncTaskSuccessCount, setAffiliateSyncTaskSuccessCount] = useState(0)
  const [affiliateSyncTaskFailedCount, setAffiliateSyncTaskFailedCount] = useState(0)
  const [affiliateSyncTaskStatus, setAffiliateSyncTaskStatus] = useState('WAITING')
  const [affiliateSyncTaskAdsOwner, setAffiliateSyncTaskAdsOwner] = useState('')
  const [savingAffiliateSyncTask, setSavingAffiliateSyncTask] = useState(false)
  const [runningAffiliateSyncTaskId, setRunningAffiliateSyncTaskId] = useState(null)
  const [showAffiliateSyncTaskModal, setShowAffiliateSyncTaskModal] = useState(false)

  useEffect(() => {
    affiliateSyncTaskFiltersRef.current = affiliateSyncTaskFilters
  }, [affiliateSyncTaskFilters])

  useEffect(() => {
    affiliateSyncTaskPaginationRef.current = affiliateSyncTaskPagination
  }, [affiliateSyncTaskPagination])

  const loadAffiliateSyncTasks = useCallback(
    async (
      filters = affiliateSyncTaskFiltersRef.current,
      pageConfig = affiliateSyncTaskPaginationRef.current,
    ) => {
      setAffiliateSyncTasksLoading(true)
      setAffiliateSyncTasksError('')

      try {
        const response = await requestApi(
          `/affiliate-ads-sync-task${buildQueryString({
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
        setAffiliateSyncTasks(extractItems(response))
        setAffiliateSyncTaskPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateSyncTasksError(message)
      } finally {
        setAffiliateSyncTasksLoading(false)
      }
    },
    [token],
  )

  return {
    affiliateSyncTasks, setAffiliateSyncTasks,
    affiliateSyncTasksLoading, setAffiliateSyncTasksLoading,
    affiliateSyncTasksError, setAffiliateSyncTasksError,
    affiliateSyncTasksMessage, setAffiliateSyncTasksMessage,
    affiliateSyncTaskPagination, setAffiliateSyncTaskPagination,
    affiliateSyncTaskPaginationRef,
    affiliateSyncTaskFilters, setAffiliateSyncTaskFilters,
    affiliateSyncTaskQueryApplied, setAffiliateSyncTaskQueryApplied,
    affiliateSyncTaskFiltersRef,
    editingAffiliateSyncTaskId, setEditingAffiliateSyncTaskId,
    affiliateSyncTaskConfigId, setAffiliateSyncTaskConfigId,
    affiliateSyncTaskRegion, setAffiliateSyncTaskRegion,
    affiliateSyncTaskType, setAffiliateSyncTaskType,
    affiliateSyncTaskCron, setAffiliateSyncTaskCron,
    affiliateSyncTaskTotalCount, setAffiliateSyncTaskTotalCount,
    affiliateSyncTaskSuccessCount, setAffiliateSyncTaskSuccessCount,
    affiliateSyncTaskFailedCount, setAffiliateSyncTaskFailedCount,
    affiliateSyncTaskStatus, setAffiliateSyncTaskStatus,
    affiliateSyncTaskAdsOwner, setAffiliateSyncTaskAdsOwner,
    savingAffiliateSyncTask, setSavingAffiliateSyncTask,
    runningAffiliateSyncTaskId, setRunningAffiliateSyncTaskId,
    showAffiliateSyncTaskModal, setShowAffiliateSyncTaskModal,
    loadAffiliateSyncTasks,
  }
}
