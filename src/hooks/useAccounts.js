// 账户（Cash Bach Account）模块状态与数据加载 / Account module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useAccounts(token) {
  const [accounts, setAccounts] = useState([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [accountsError, setAccountsError] = useState('')
  const [accountsMessage, setAccountsMessage] = useState('')
  const [accountPagination, setAccountPagination] = useState(() => createInitialPagination())
  const accountPaginationRef = useRef(accountPagination)
  const [accountFilters, setAccountFilters] = useState({
    userName: '',
    platformName: '',
    status: '',
  })
  const [accountQueryApplied, setAccountQueryApplied] = useState(false)
  const accountFiltersRef = useRef(accountFilters)
  const [editingAccountId, setEditingAccountId] = useState(null)
  const [accountEmailAddress, setAccountEmailAddress] = useState('')
  const [accountUserName, setAccountUserName] = useState('')
  const [accountPlatformName, setAccountPlatformName] = useState('')
  const [accountPaymentStatus, setAccountPaymentStatus] = useState('')
  const [accountStatus, setAccountStatus] = useState('')
  const [accountRegisterDate, setAccountRegisterDate] = useState('')
  const [accountBalance, setAccountBalance] = useState('')
  const [accountCurrency, setAccountCurrency] = useState('')
  const [accountRemarks, setAccountRemarks] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  useEffect(() => {
    accountFiltersRef.current = accountFilters
  }, [accountFilters])

  useEffect(() => {
    accountPaginationRef.current = accountPagination
  }, [accountPagination])

  const loadToolAccounts = useCallback(
    async (filters = accountFiltersRef.current, pageConfig = accountPaginationRef.current) => {
      setAccountsLoading(true)
      setAccountsError('')

      try {
        const response = await requestApi(
          `/tool-accounts${buildQueryString({
            userName: filters.userName,
            platformName: filters.platformName,
            status: filters.status,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAccounts(extractItems(response))
        setAccountPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAccountsError(message)
      } finally {
        setAccountsLoading(false)
      }
    },
    [token],
  )

  return {
    accounts, setAccounts,
    accountsLoading, setAccountsLoading,
    accountsError, setAccountsError,
    accountsMessage, setAccountsMessage,
    accountPagination, setAccountPagination,
    accountPaginationRef,
    accountFilters, setAccountFilters,
    accountQueryApplied, setAccountQueryApplied,
    accountFiltersRef,
    editingAccountId, setEditingAccountId,
    accountEmailAddress, setAccountEmailAddress,
    accountUserName, setAccountUserName,
    accountPlatformName, setAccountPlatformName,
    accountPaymentStatus, setAccountPaymentStatus,
    accountStatus, setAccountStatus,
    accountRegisterDate, setAccountRegisterDate,
    accountBalance, setAccountBalance,
    accountCurrency, setAccountCurrency,
    accountRemarks, setAccountRemarks,
    savingAccount, setSavingAccount,
    showAccountModal, setShowAccountModal,
    loadToolAccounts,
  }
}
