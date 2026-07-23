// 矩阵广告模块状态与数据加载 / Matrix ADs module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildQueryString,
  createEmptyAffiliateRow,
  extractItems,
  requestApi,
} from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useMatrixAds(token) {
  const [matrixAds, setMatrixAds] = useState([])
  const [matrixAdsLoading, setMatrixAdsLoading] = useState(false)
  const [matrixAdsError, setMatrixAdsError] = useState('')
  const [matrixAdsMessage, setMatrixAdsMessage] = useState('')
  const [matrixAdsPagination, setMatrixAdsPagination] = useState(() => createInitialPagination())
  const matrixAdsPaginationRef = useRef(matrixAdsPagination)
  const [editingMatrixAdsId, setEditingMatrixAdsId] = useState(null)
  const [matrixCampainName, setMatrixCampainName] = useState('')
  const [matrixCampainCountry, setMatrixCampainCountry] = useState('')
  const [matrixLandingPageUrl, setMatrixLandingPageUrl] = useState('')
  const [matrixDynamicProxyInfo, setMatrixDynamicProxyInfo] = useState('')
  const [matrixDynamicProxyInfoBackup, setMatrixDynamicProxyInfoBackup] = useState('')
  const [matrixIntervalTime, setMatrixIntervalTime] = useState('')
  const [matrixStatus, setMatrixStatus] = useState('RUNNING')
  const [matrixAffiliateRows, setMatrixAffiliateRows] = useState([createEmptyAffiliateRow()])
  const [savingMatrixAds, setSavingMatrixAds] = useState(false)
  const [showMatrixAdsModal, setShowMatrixAdsModal] = useState(false)
  const [matrixAdsFilters, setMatrixAdsFilters] = useState({
    campainName: '',
    platformName: '',
    status: '',
  })
  const [matrixAdsQueryApplied, setMatrixAdsQueryApplied] = useState(false)
  const matrixAdsFiltersRef = useRef(matrixAdsFilters)

  useEffect(() => {
    matrixAdsFiltersRef.current = matrixAdsFilters
  }, [matrixAdsFilters])

  useEffect(() => {
    matrixAdsPaginationRef.current = matrixAdsPagination
  }, [matrixAdsPagination])

  const loadMatrixAds = useCallback(
    async (filters = {}, pageConfig = matrixAdsPaginationRef.current) => {
      setMatrixAdsLoading(true)
      setMatrixAdsError('')

      try {
        const path = `/matrix-ads${buildQueryString({
          ...filters,
          page: pageConfig.page,
          size: pageConfig.size,
        })}`
        const response = await requestApi(path, { token })
        setMatrixAds(extractItems(response))
        setMatrixAdsPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setMatrixAdsError(message)
      } finally {
        setMatrixAdsLoading(false)
      }
    },
    [token],
  )

  return {
    matrixAds, setMatrixAds,
    matrixAdsLoading, setMatrixAdsLoading,
    matrixAdsError, setMatrixAdsError,
    matrixAdsMessage, setMatrixAdsMessage,
    matrixAdsPagination, setMatrixAdsPagination,
    matrixAdsPaginationRef,
    editingMatrixAdsId, setEditingMatrixAdsId,
    matrixCampainName, setMatrixCampainName,
    matrixCampainCountry, setMatrixCampainCountry,
    matrixLandingPageUrl, setMatrixLandingPageUrl,
    matrixDynamicProxyInfo, setMatrixDynamicProxyInfo,
    matrixDynamicProxyInfoBackup, setMatrixDynamicProxyInfoBackup,
    matrixIntervalTime, setMatrixIntervalTime,
    matrixStatus, setMatrixStatus,
    matrixAffiliateRows, setMatrixAffiliateRows,
    savingMatrixAds, setSavingMatrixAds,
    showMatrixAdsModal, setShowMatrixAdsModal,
    matrixAdsFilters, setMatrixAdsFilters,
    matrixAdsQueryApplied, setMatrixAdsQueryApplied,
    matrixAdsFiltersRef,
    loadMatrixAds,
  }
}
