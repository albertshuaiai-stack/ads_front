// Ads Account 管理模块状态与数据加载 / Ads Account management module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildOwnerQueryParams, buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useAdsAccounts(token) {
  const [adsAccounts, setAdsAccounts] = useState([])
  const [adsAccountsLoading, setAdsAccountsLoading] = useState(false)
  const [adsAccountsError, setAdsAccountsError] = useState('')
  const [adsAccountsMessage, setAdsAccountsMessage] = useState('')
  const [adsAccountPagination, setAdsAccountPagination] = useState(() => createInitialPagination())
  const adsAccountPaginationRef = useRef(adsAccountPagination)
  const [adsAccountFilters, setAdsAccountFilters] = useState({
    adsAccount: '',
    mccAccount: '',
    agencyPlatform: '',
    accountType: '',
    status: '',
    ownerPhoneNumber: '',
  })
  const [adsAccountQueryApplied, setAdsAccountQueryApplied] = useState(false)
  const adsAccountFiltersRef = useRef(adsAccountFilters)
  const [editingAdsAccountId, setEditingAdsAccountId] = useState(null)
  const [adsAccountValue, setAdsAccountValue] = useState('')
  const [adsAccountType, setAdsAccountType] = useState('')
  const [adsAccountAgencyPlatform, setAdsAccountAgencyPlatform] = useState('')
  const [adsAccountMccAccount, setAdsAccountMccAccount] = useState('')
  const [adsAccountStatus, setAdsAccountStatus] = useState('')
  const [savingAdsAccount, setSavingAdsAccount] = useState(false)
  const [showAdsAccountModal, setShowAdsAccountModal] = useState(false)

  useEffect(() => {
    adsAccountFiltersRef.current = adsAccountFilters
  }, [adsAccountFilters])

  useEffect(() => {
    adsAccountPaginationRef.current = adsAccountPagination
  }, [adsAccountPagination])

  const loadAdsAccounts = useCallback(
    async (
      filters = adsAccountFiltersRef.current,
      pageConfig = adsAccountPaginationRef.current,
    ) => {
      setAdsAccountsLoading(true)
      setAdsAccountsError('')

      try {
        const response = await requestApi(
          `/ads-accounts${buildQueryString({
            adsAccount: filters.adsAccount,
            mccAccount: filters.mccAccount,
            agencyPlatform: filters.agencyPlatform,
            accountType: filters.accountType,
            status: filters.status,
            ...buildOwnerQueryParams(filters.ownerPhoneNumber),
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAdsAccounts(extractItems(response))
        setAdsAccountPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAdsAccountsError(message)
      } finally {
        setAdsAccountsLoading(false)
      }
    },
    [token],
  )

  return {
    adsAccounts, setAdsAccounts,
    adsAccountsLoading, setAdsAccountsLoading,
    adsAccountsError, setAdsAccountsError,
    adsAccountsMessage, setAdsAccountsMessage,
    adsAccountPagination, setAdsAccountPagination,
    adsAccountPaginationRef,
    adsAccountFilters, setAdsAccountFilters,
    adsAccountQueryApplied, setAdsAccountQueryApplied,
    adsAccountFiltersRef,
    editingAdsAccountId, setEditingAdsAccountId,
    adsAccountValue, setAdsAccountValue,
    adsAccountType, setAdsAccountType,
    adsAccountAgencyPlatform, setAdsAccountAgencyPlatform,
    adsAccountMccAccount, setAdsAccountMccAccount,
    adsAccountStatus, setAdsAccountStatus,
    savingAdsAccount, setSavingAdsAccount,
    showAdsAccountModal, setShowAdsAccountModal,
    loadAdsAccounts,
  }
}
