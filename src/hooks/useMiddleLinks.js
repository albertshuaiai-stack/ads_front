// 中间链接模块状态与数据加载 / Middle link module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useMiddleLinks(token) {
  const [middleLinks, setMiddleLinks] = useState([])
  const [middleLinksLoading, setMiddleLinksLoading] = useState(false)
  const [middleLinksError, setMiddleLinksError] = useState('')
  const [middleLinksMessage, setMiddleLinksMessage] = useState('')
  const [middleLinkPagination, setMiddleLinkPagination] = useState(() => createInitialPagination())
  const middleLinkPaginationRef = useRef(middleLinkPagination)
  const [middleLinkFilters, setMiddleLinkFilters] = useState({
    ownerPhoneNumber: '',
    brandName: '',
    resolveStatus: '',
  })
  const [middleLinkQueryApplied, setMiddleLinkQueryApplied] = useState(false)
  const middleLinkFiltersRef = useRef(middleLinkFilters)
  const [middleLinkBrandName, setMiddleLinkBrandName] = useState('')
  const [middleLinkUrlsText, setMiddleLinkUrlsText] = useState('')
  const [middleLinkTargetCount, setMiddleLinkTargetCount] = useState('24')
  const [middleLinkWindowSeconds, setMiddleLinkWindowSeconds] = useState('600')
  const [middleLinkIntervalSeconds, setMiddleLinkIntervalSeconds] = useState('3')
  const [middleLinkUploading, setMiddleLinkUploading] = useState(false)
  const [resolvingMiddleLinkId, setResolvingMiddleLinkId] = useState(null)

  useEffect(() => {
    middleLinkFiltersRef.current = middleLinkFilters
  }, [middleLinkFilters])

  useEffect(() => {
    middleLinkPaginationRef.current = middleLinkPagination
  }, [middleLinkPagination])

  const loadMiddleLinks = useCallback(
    async (
      filters = middleLinkFiltersRef.current,
      pageConfig = middleLinkPaginationRef.current,
    ) => {
      setMiddleLinksLoading(true)
      setMiddleLinksError('')

      try {
        const response = await requestApi(
          `/middle-links${buildQueryString({
            brandName: filters.brandName,
            resolveStatus: filters.resolveStatus,
            adsOwner: filters.ownerPhoneNumber,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setMiddleLinks(extractItems(response))
        setMiddleLinkPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setMiddleLinksError(message)
      } finally {
        setMiddleLinksLoading(false)
      }
    },
    [token],
  )

  return {
    middleLinks,
    middleLinksLoading,
    middleLinksError,
    setMiddleLinksError,
    middleLinksMessage,
    setMiddleLinksMessage,
    middleLinkPagination,
    middleLinkPaginationRef,
    middleLinkFilters,
    setMiddleLinkFilters,
    middleLinkQueryApplied,
    setMiddleLinkQueryApplied,
    middleLinkFiltersRef,
    middleLinkBrandName,
    setMiddleLinkBrandName,
    middleLinkUrlsText,
    setMiddleLinkUrlsText,
    middleLinkTargetCount,
    setMiddleLinkTargetCount,
    middleLinkWindowSeconds,
    setMiddleLinkWindowSeconds,
    middleLinkIntervalSeconds,
    setMiddleLinkIntervalSeconds,
    middleLinkUploading,
    setMiddleLinkUploading,
    resolvingMiddleLinkId,
    setResolvingMiddleLinkId,
    loadMiddleLinks,
  }
}
