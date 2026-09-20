// 支出管理模块状态与数据加载 / Outcome management module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildOwnerQueryParams, buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'
import { toApiDateValue } from '../utils/formatters'

export function useOutcomes(token) {
  const [outcomes, setOutcomes] = useState([])
  const [outcomesLoading, setOutcomesLoading] = useState(false)
  const [outcomesError, setOutcomesError] = useState('')
  const [outcomesMessage, setOutcomesMessage] = useState('')
  const [outcomePagination, setOutcomePagination] = useState(() => createInitialPagination())
  const outcomePaginationRef = useRef(outcomePagination)
  const [outcomeFilters, setOutcomeFilters] = useState({
    outcomeType: '',
    payDateBegin: '',
    payDateEnd: '',
    ownerPhoneNumber: '',
  })
  const [outcomeQueryApplied, setOutcomeQueryApplied] = useState(false)
  const outcomeFiltersRef = useRef(outcomeFilters)
  const [editingOutcomeId, setEditingOutcomeId] = useState(null)
  const [outcomeType, setOutcomeType] = useState('')
  const [outcomeAmount, setOutcomeAmount] = useState('')
  const [outcomeCurrency, setOutcomeCurrency] = useState('')
  const [outcomePayDate, setOutcomePayDate] = useState('')
  const [outcomeRemarks, setOutcomeRemarks] = useState('')
  const [outcomeAdsAccount, setOutcomeAdsAccount] = useState('')
  const [outcomeCloudPhone, setOutcomeCloudPhone] = useState('')
  const [outcomeIp, setOutcomeIp] = useState('')
  const [adsAccountOptions, setAdsAccountOptions] = useState([])
  const [adsAccountOptionsLoading, setAdsAccountOptionsLoading] = useState(false)
  const [adsAccountOptionsError, setAdsAccountOptionsError] = useState('')
  const [cloudPhoneOptions, setCloudPhoneOptions] = useState([])
  const [cloudPhoneOptionsLoading, setCloudPhoneOptionsLoading] = useState(false)
  const [cloudPhoneOptionsError, setCloudPhoneOptionsError] = useState('')
  const [ipOptions, setIpOptions] = useState([])
  const [ipOptionsLoading, setIpOptionsLoading] = useState(false)
  const [ipOptionsError, setIpOptionsError] = useState('')
  const [savingOutcome, setSavingOutcome] = useState(false)
  const [showOutcomeModal, setShowOutcomeModal] = useState(false)

  useEffect(() => {
    outcomeFiltersRef.current = outcomeFilters
  }, [outcomeFilters])

  useEffect(() => {
    outcomePaginationRef.current = outcomePagination
  }, [outcomePagination])

  const loadAdsAccountOptions = useCallback(async () => {
    setAdsAccountOptionsLoading(true)
    setAdsAccountOptionsError('')
    try {
      const response = await requestApi('/ads-accounts/dropdown', { token })
      const items = Array.isArray(response) ? response : Array.isArray(response?.content) ? response.content : []
      const options = items
        .filter(Boolean)
        .map((it) => {
          if (typeof it === 'string') {
            return { value: it, label: it }
          }
          if (it && typeof it === 'object') {
            if (it.value && it.label) return { value: it.value, label: it.label }
            const value = it.value ?? it.id ?? it.adsAccount ?? it.accountId ?? it.accountName ?? ''
            const label = it.label ?? it.displayName ?? it.adsName ?? it.accountName ?? it.name ?? String(value)
            return { value: String(value), label: String(label) }
          }
          return null
        })
        .filter(Boolean)
      setAdsAccountOptions(options)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAdsAccountOptionsError(message)
    } finally {
      setAdsAccountOptionsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadAdsAccountOptions()
  }, [loadAdsAccountOptions])

  const loadCloudPhoneOptions = useCallback(async () => {
    setCloudPhoneOptionsLoading(true)
    setCloudPhoneOptionsError('')
    try {
      const response = await requestApi('/tool-cloud-phones/phones', { token })
      const items = extractItems(response)
      const options = (Array.isArray(items) ? items : [])
        .filter(Boolean)
        .map((it) => {
          if (typeof it === 'string') {
            return { value: it, label: it }
          }
          if (it && typeof it === 'object') {
            const value = it.value ?? it.phoneNumber ?? it.cloudPhone ?? it.cloudPhoneNumber ?? ''
            const label = it.label ?? it.phoneNumber ?? it.cloudPhone ?? it.cloudPhoneNumber ?? String(value)
            return value ? { value: String(value), label: String(label) } : null
          }
          return null
        })
        .filter(Boolean)
      setCloudPhoneOptions(options)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setCloudPhoneOptionsError(message)
    } finally {
      setCloudPhoneOptionsLoading(false)
    }
  }, [token])

  const loadIpOptions = useCallback(async () => {
    setIpOptionsLoading(true)
    setIpOptionsError('')
    try {
      const response = await requestApi('/tool-ips/ips', { token })
      const items = extractItems(response)
      const options = (Array.isArray(items) ? items : [])
        .filter(Boolean)
        .map((it) => {
          if (typeof it === 'string') {
            return { value: it, label: it }
          }
          if (it && typeof it === 'object') {
            const value = it.value ?? it.ip ?? it.ipString ?? ''
            const label = it.label ?? it.ip ?? it.ipString ?? String(value)
            return value ? { value: String(value), label: String(label) } : null
          }
          return null
        })
        .filter(Boolean)
      setIpOptions(options)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setIpOptionsError(message)
    } finally {
      setIpOptionsLoading(false)
    }
  }, [token])

  const loadToolOutcomes = useCallback(
    async (filters = outcomeFiltersRef.current, pageConfig = outcomePaginationRef.current) => {
      setOutcomesLoading(true)
      setOutcomesError('')

      try {
        const response = await requestApi(
          `/tool-outcomes${buildQueryString({
            outcomeType: filters.outcomeType,
            payDateBegin: toApiDateValue(filters.payDateBegin),
            payDateEnd: toApiDateValue(filters.payDateEnd),
            ...buildOwnerQueryParams(filters.ownerPhoneNumber),
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setOutcomes(extractItems(response))
        setOutcomePagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setOutcomesError(message)
      } finally {
        setOutcomesLoading(false)
      }
    },
    [token],
  )

  return {
    outcomes, setOutcomes,
    outcomesLoading, setOutcomesLoading,
    outcomesError, setOutcomesError,
    outcomesMessage, setOutcomesMessage,
    outcomePagination, setOutcomePagination,
    outcomePaginationRef,
    outcomeFilters, setOutcomeFilters,
    outcomeQueryApplied, setOutcomeQueryApplied,
    outcomeFiltersRef,
    editingOutcomeId, setEditingOutcomeId,
    outcomeType, setOutcomeType,
    outcomeAmount, setOutcomeAmount,
    outcomeCurrency, setOutcomeCurrency,
    outcomePayDate, setOutcomePayDate,
    outcomeRemarks, setOutcomeRemarks,
    outcomeAdsAccount, setOutcomeAdsAccount,
    outcomeCloudPhone, setOutcomeCloudPhone,
    outcomeIp, setOutcomeIp,
    cloudPhoneOptions, cloudPhoneOptionsLoading, cloudPhoneOptionsError, loadCloudPhoneOptions,
    ipOptions, ipOptionsLoading, ipOptionsError, loadIpOptions,
    adsAccountOptions, adsAccountOptionsLoading, adsAccountOptionsError, loadAdsAccountOptions,
    savingOutcome, setSavingOutcome,
    showOutcomeModal, setShowOutcomeModal,
    loadToolOutcomes,
  }
}
