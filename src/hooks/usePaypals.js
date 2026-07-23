// PayPal 管理模块状态与数据加载 / PayPal management module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function usePaypals(token) {
  const [paypals, setPaypals] = useState([])
  const [paypalsLoading, setPaypalsLoading] = useState(false)
  const [paypalsError, setPaypalsError] = useState('')
  const [paypalsMessage, setPaypalsMessage] = useState('')
  const [paypalPagination, setPaypalPagination] = useState(() => createInitialPagination())
  const paypalPaginationRef = useRef(paypalPagination)
  const [paypalFilters, setPaypalFilters] = useState({
    paypalEmail: '',
    primaryEmail: '',
  })
  const [paypalQueryApplied, setPaypalQueryApplied] = useState(false)
  const paypalFiltersRef = useRef(paypalFilters)
  const [editingPaypalId, setEditingPaypalId] = useState(null)
  const [paypalEmail, setPaypalEmail] = useState('')
  const [paypalPrimaryEmail, setPaypalPrimaryEmail] = useState('')
  const [paypalIdValue, setPaypalIdValue] = useState('')
  const [savingPaypal, setSavingPaypal] = useState(false)
  const [showPaypalModal, setShowPaypalModal] = useState(false)

  useEffect(() => {
    paypalFiltersRef.current = paypalFilters
  }, [paypalFilters])

  useEffect(() => {
    paypalPaginationRef.current = paypalPagination
  }, [paypalPagination])

  const loadToolPaypals = useCallback(
    async (filters = paypalFiltersRef.current, pageConfig = paypalPaginationRef.current) => {
      setPaypalsLoading(true)
      setPaypalsError('')

      try {
        const response = await requestApi(
          `/tool-paypals${buildQueryString({
            paypalEmail: filters.paypalEmail,
            primaryEmail: filters.primaryEmail,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setPaypals(extractItems(response))
        setPaypalPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setPaypalsError(message)
      } finally {
        setPaypalsLoading(false)
      }
    },
    [token],
  )

  return {
    paypals, setPaypals,
    paypalsLoading, setPaypalsLoading,
    paypalsError, setPaypalsError,
    paypalsMessage, setPaypalsMessage,
    paypalPagination, setPaypalPagination,
    paypalPaginationRef,
    paypalFilters, setPaypalFilters,
    paypalQueryApplied, setPaypalQueryApplied,
    paypalFiltersRef,
    editingPaypalId, setEditingPaypalId,
    paypalEmail, setPaypalEmail,
    paypalPrimaryEmail, setPaypalPrimaryEmail,
    paypalIdValue, setPaypalIdValue,
    savingPaypal, setSavingPaypal,
    showPaypalModal, setShowPaypalModal,
    loadToolPaypals,
  }
}
