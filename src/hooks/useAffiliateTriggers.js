import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateTriggers(token) {
  const [affiliateTriggers, setAffiliateTriggers] = useState([])
  const [affiliateTriggersLoading, setAffiliateTriggersLoading] = useState(false)
  const [affiliateTriggersError, setAffiliateTriggersError] = useState('')
  const [affiliateTriggersMessage, setAffiliateTriggersMessage] = useState('')
  const [affiliateTriggerPagination, setAffiliateTriggerPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateTriggerPaginationRef = useRef(affiliateTriggerPagination)
  const [affiliateTriggerFilters, setAffiliateTriggerFilters] = useState({
    schedName: '',
    triggerName: '',
    triggerGroup: '',
    jobName: '',
    jobGroup: '',
    triggerState: '',
    triggerType: '',
  })
  const [affiliateTriggerQueryApplied, setAffiliateTriggerQueryApplied] = useState(false)
  const affiliateTriggerFiltersRef = useRef(affiliateTriggerFilters)

  useEffect(() => {
    affiliateTriggerFiltersRef.current = affiliateTriggerFilters
  }, [affiliateTriggerFilters])

  useEffect(() => {
    affiliateTriggerPaginationRef.current = affiliateTriggerPagination
  }, [affiliateTriggerPagination])

  const loadAffiliateTriggers = useCallback(
    async (
      filters = affiliateTriggerFiltersRef.current,
      pageConfig = affiliateTriggerPaginationRef.current,
    ) => {
      setAffiliateTriggersLoading(true)
      setAffiliateTriggersError('')

      try {
        const response = await requestApi(
          `/qrtz/triggers${buildQueryString({
            schedName: filters.schedName,
            triggerName: filters.triggerName,
            triggerGroup: filters.triggerGroup,
            jobName: filters.jobName,
            jobGroup: filters.jobGroup,
            triggerState: filters.triggerState,
            triggerType: filters.triggerType,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliateTriggers(extractItems(response))
        setAffiliateTriggerPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateTriggersError(message)
      } finally {
        setAffiliateTriggersLoading(false)
      }
    },
    [token],
  )

  return {
    affiliateTriggers,
    setAffiliateTriggers,
    affiliateTriggersLoading,
    setAffiliateTriggersLoading,
    affiliateTriggersError,
    setAffiliateTriggersError,
    affiliateTriggersMessage,
    setAffiliateTriggersMessage,
    affiliateTriggerPagination,
    setAffiliateTriggerPagination,
    affiliateTriggerPaginationRef,
    affiliateTriggerFilters,
    setAffiliateTriggerFilters,
    affiliateTriggerQueryApplied,
    setAffiliateTriggerQueryApplied,
    affiliateTriggerFiltersRef,
    loadAffiliateTriggers,
  }
}
