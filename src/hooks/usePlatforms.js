// 平台模块状态与数据加载 / Platform module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function usePlatforms(token) {
  const [platforms, setPlatforms] = useState([])
  const [platformsLoading, setPlatformsLoading] = useState(false)
  const [platformsError, setPlatformsError] = useState('')
  const [platformsMessage, setPlatformsMessage] = useState('')
  const [platformList, setPlatformList] = useState([])
  const [platformListLoading, setPlatformListLoading] = useState(false)
  const [platformPagination, setPlatformPagination] = useState(() => createInitialPagination())
  const platformPaginationRef = useRef(platformPagination)
  const [editingPlatformId, setEditingPlatformId] = useState(null)
  const [platformName, setPlatformName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [platformRemarks, setPlatformRemarks] = useState('')
  const [savingPlatform, setSavingPlatform] = useState(false)
  const [showPlatformModal, setShowPlatformModal] = useState(false)

  useEffect(() => {
    platformPaginationRef.current = platformPagination
  }, [platformPagination])

  const loadPlatformOptions = useCallback(async () => {
    setPlatformsLoading(true)
    setPlatformsError('')

    try {
      const response = await requestApi('/platforms/all', { token })
      setPlatforms(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setPlatformsError(message)
      setPlatforms([])
    } finally {
      setPlatformsLoading(false)
    }
  }, [token])

  const loadPlatformList = useCallback(
    async (pageConfig = platformPaginationRef.current) => {
      setPlatformListLoading(true)
      setPlatformsError('')

      try {
        const response = await requestApi(
          `/platforms${buildQueryString({
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setPlatformList(extractItems(response))
        setPlatformPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setPlatformsError(message)
        setPlatformList([])
      } finally {
        setPlatformListLoading(false)
      }
    },
    [token],
  )

  return {
    platforms, setPlatforms,
    platformsLoading, setPlatformsLoading,
    platformsError, setPlatformsError,
    platformsMessage, setPlatformsMessage,
    platformList, setPlatformList,
    platformListLoading, setPlatformListLoading,
    platformPagination, setPlatformPagination,
    platformPaginationRef,
    editingPlatformId, setEditingPlatformId,
    platformName, setPlatformName,
    paymentMethod, setPaymentMethod,
    platformRemarks, setPlatformRemarks,
    savingPlatform, setSavingPlatform,
    showPlatformModal, setShowPlatformModal,
    loadPlatformOptions,
    loadPlatformList,
  }
}
