// 支出管理模块状态与数据加载 / Outcome management module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
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
  })
  const [outcomeQueryApplied, setOutcomeQueryApplied] = useState(false)
  const outcomeFiltersRef = useRef(outcomeFilters)
  const [editingOutcomeId, setEditingOutcomeId] = useState(null)
  const [outcomeType, setOutcomeType] = useState('')
  const [outcomeAmount, setOutcomeAmount] = useState('')
  const [outcomeCurrency, setOutcomeCurrency] = useState('')
  const [outcomePayDate, setOutcomePayDate] = useState('')
  const [outcomeRemarks, setOutcomeRemarks] = useState('')
  const [savingOutcome, setSavingOutcome] = useState(false)
  const [showOutcomeModal, setShowOutcomeModal] = useState(false)

  useEffect(() => {
    outcomeFiltersRef.current = outcomeFilters
  }, [outcomeFilters])

  useEffect(() => {
    outcomePaginationRef.current = outcomePagination
  }, [outcomePagination])

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
    savingOutcome, setSavingOutcome,
    showOutcomeModal, setShowOutcomeModal,
    loadToolOutcomes,
  }
}
