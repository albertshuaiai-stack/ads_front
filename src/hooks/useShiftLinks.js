// Shift Link（广告链接）模块状态与数据加载 / Shift Link module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useShiftLinks(token) {
  const [adsUrls, setAdsUrls] = useState([])
  const [adsLoading, setAdsLoading] = useState(false)
  const [adsError, setAdsError] = useState('')
  const [adsMessage, setAdsMessage] = useState('')
  const [adsUrlPagination, setAdsUrlPagination] = useState(() => createInitialPagination())
  const adsUrlPaginationRef = useRef(adsUrlPagination)
  const [editingAdsId, setEditingAdsId] = useState(null)
  const [editingAdsOriginal, setEditingAdsOriginal] = useState(null)
  const [capMainName, setCapMainName] = useState('')
  const [adsType, setAdsType] = useState('')
  const [platform, setPlatform] = useState('')
  const [fullUrl, setFullUrl] = useState('')
  const [displayNumber, setDisplayNumber] = useState('')
  const [remark, setRemark] = useState('')
  const [savingAds, setSavingAds] = useState(false)
  const [showAdsModal, setShowAdsModal] = useState(false)
  const [showBulkAdsModal, setShowBulkAdsModal] = useState(false)
  const [bulkAdsFile, setBulkAdsFile] = useState(null)
  const [bulkAdsSaving, setBulkAdsSaving] = useState(false)
  const [bulkAdsError, setBulkAdsError] = useState('')
  const [bulkAdsMessage, setBulkAdsMessage] = useState('')
  // 文件夹导入 / Folder import
  const [showFolderImportModal, setShowFolderImportModal] = useState(false)
  const [folderImportFiles, setFolderImportFiles] = useState(null)
  const [folderImportAdsType, setFolderImportAdsType] = useState('')
  const [folderImportSaving, setFolderImportSaving] = useState(false)
  const [folderImportError, setFolderImportError] = useState('')
  const [folderImportMessage, setFolderImportMessage] = useState('')
  const [adsUrlFilters, setAdsUrlFilters] = useState({
    adsType: '',
    adsName: '',
    platformName: '',
  })
  const [adsUrlQueryApplied, setAdsUrlQueryApplied] = useState(false)
  const adsUrlFiltersRef = useRef(adsUrlFilters)

  useEffect(() => {
    adsUrlFiltersRef.current = adsUrlFilters
  }, [adsUrlFilters])

  useEffect(() => {
    adsUrlPaginationRef.current = adsUrlPagination
  }, [adsUrlPagination])

  const loadAdsUrls = useCallback(
    async (filters = {}, pageConfig = adsUrlPaginationRef.current) => {
      setAdsLoading(true)
      setAdsError('')

      try {
        const path = `/shift-links${buildQueryString({
          ...filters,
          page: pageConfig.page,
          size: pageConfig.size,
        })}`
        const response = await requestApi(path, { token })
        setAdsUrls(extractItems(response))
        setAdsUrlPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAdsError(message)
      } finally {
        setAdsLoading(false)
      }
    },
    [token],
  )

  return {
    adsUrls, setAdsUrls,
    adsLoading, setAdsLoading,
    adsError, setAdsError,
    adsMessage, setAdsMessage,
    adsUrlPagination, setAdsUrlPagination,
    adsUrlPaginationRef,
    editingAdsId, setEditingAdsId,
    editingAdsOriginal, setEditingAdsOriginal,
    capMainName, setCapMainName,
    adsType, setAdsType,
    platform, setPlatform,
    fullUrl, setFullUrl,
    displayNumber, setDisplayNumber,
    remark, setRemark,
    savingAds, setSavingAds,
    showAdsModal, setShowAdsModal,
    showBulkAdsModal, setShowBulkAdsModal,
    bulkAdsFile, setBulkAdsFile,
    bulkAdsSaving, setBulkAdsSaving,
    bulkAdsError, setBulkAdsError,
    bulkAdsMessage, setBulkAdsMessage,
    showFolderImportModal, setShowFolderImportModal,
    folderImportFiles, setFolderImportFiles,
    folderImportAdsType, setFolderImportAdsType,
    folderImportSaving, setFolderImportSaving,
    folderImportError, setFolderImportError,
    folderImportMessage, setFolderImportMessage,
    adsUrlFilters, setAdsUrlFilters,
    adsUrlQueryApplied, setAdsUrlQueryApplied,
    adsUrlFiltersRef,
    loadAdsUrls,
  }
}
