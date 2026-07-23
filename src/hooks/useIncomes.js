// 收入管理模块状态与数据加载 / Income management module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'
import { toApiDateValue } from '../utils/formatters'

export function useIncomes(token) {
  const [incomes, setIncomes] = useState([])
  const [incomesLoading, setIncomesLoading] = useState(false)
  const [incomesError, setIncomesError] = useState('')
  const [incomesMessage, setIncomesMessage] = useState('')
  const [incomePagination, setIncomePagination] = useState(() => createInitialPagination())
  const incomePaginationRef = useRef(incomePagination)
  const [incomeFilters, setIncomeFilters] = useState({
    platformName: '',
    userName: '',
    paypalAccount: '',
    payoutDateBegin: '',
    payoutDateEnd: '',
  })
  const [incomeQueryApplied, setIncomeQueryApplied] = useState(false)
  const incomeFiltersRef = useRef(incomeFilters)
  const [editingIncomeId, setEditingIncomeId] = useState(null)
  const [incomePlatformName, setIncomePlatformName] = useState('')
  const [incomeUserName, setIncomeUserName] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeCurrency, setIncomeCurrency] = useState('')
  const [incomePaymentMethod, setIncomePaymentMethod] = useState('')
  const [incomePaypalAccount, setIncomePaypalAccount] = useState('')
  const [incomePayoutDate, setIncomePayoutDate] = useState('')
  const [incomeRemarks, setIncomeRemarks] = useState('')
  const [savingIncome, setSavingIncome] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)

  useEffect(() => {
    incomeFiltersRef.current = incomeFilters
  }, [incomeFilters])

  useEffect(() => {
    incomePaginationRef.current = incomePagination
  }, [incomePagination])

  const loadToolIncomes = useCallback(
    async (filters = incomeFiltersRef.current, pageConfig = incomePaginationRef.current) => {
      setIncomesLoading(true)
      setIncomesError('')

      try {
        const response = await requestApi(
          `/tool-incomes${buildQueryString({
            platformName: filters.platformName,
            userName: filters.userName,
            paypalAccount: filters.paypalAccount,
            payoutDateBegin: toApiDateValue(filters.payoutDateBegin),
            payoutDateEnd: toApiDateValue(filters.payoutDateEnd),
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setIncomes(extractItems(response))
        setIncomePagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setIncomesError(message)
      } finally {
        setIncomesLoading(false)
      }
    },
    [token],
  )

  return {
    incomes, setIncomes,
    incomesLoading, setIncomesLoading,
    incomesError, setIncomesError,
    incomesMessage, setIncomesMessage,
    incomePagination, setIncomePagination,
    incomePaginationRef,
    incomeFilters, setIncomeFilters,
    incomeQueryApplied, setIncomeQueryApplied,
    incomeFiltersRef,
    editingIncomeId, setEditingIncomeId,
    incomePlatformName, setIncomePlatformName,
    incomeUserName, setIncomeUserName,
    incomeAmount, setIncomeAmount,
    incomeCurrency, setIncomeCurrency,
    incomePaymentMethod, setIncomePaymentMethod,
    incomePaypalAccount, setIncomePaypalAccount,
    incomePayoutDate, setIncomePayoutDate,
    incomeRemarks, setIncomeRemarks,
    savingIncome, setSavingIncome,
    showIncomeModal, setShowIncomeModal,
    loadToolIncomes,
  }
}
