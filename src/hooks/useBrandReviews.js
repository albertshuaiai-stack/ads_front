// 品牌评审模块状态与数据加载 / Brand review module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useBrandReviews(token) {
  const [brandReviews, setBrandReviews] = useState([])
  const [brandReviewsLoading, setBrandReviewsLoading] = useState(false)
  const [brandReviewsError, setBrandReviewsError] = useState('')
  const [brandReviewsMessage, setBrandReviewsMessage] = useState('')
  const [brandReviewPagination, setBrandReviewPagination] = useState(() =>
    createInitialPagination(),
  )
  const brandReviewPaginationRef = useRef(brandReviewPagination)
  const [brandReviewFilters, setBrandReviewFilters] = useState({
    ownerPhoneNumber: '',
    score: '',
    brand: '',
  })
  const [brandReviewQueryApplied, setBrandReviewQueryApplied] = useState(false)
  const brandReviewFiltersRef = useRef(brandReviewFilters)
  const [editingBrandReviewId, setEditingBrandReviewId] = useState(null)
  const [brandReviewBrand, setBrandReviewBrand] = useState('')
  const [brandReviewScore, setBrandReviewScore] = useState('')
  const [brandReviewRemarks, setBrandReviewRemarks] = useState('')
  const [brandReviewAdsOwner, setBrandReviewAdsOwner] = useState('')
  const [savingBrandReview, setSavingBrandReview] = useState(false)
  const [showBrandReviewModal, setShowBrandReviewModal] = useState(false)

  useEffect(() => {
    brandReviewFiltersRef.current = brandReviewFilters
  }, [brandReviewFilters])

  useEffect(() => {
    brandReviewPaginationRef.current = brandReviewPagination
  }, [brandReviewPagination])

  const loadBrandReviews = useCallback(
    async (filters = brandReviewFiltersRef.current, pageConfig = brandReviewPaginationRef.current) => {
      setBrandReviewsLoading(true)
      setBrandReviewsError('')

      try {
        const response = await requestApi(
          `/tool-brands-reviews${buildQueryString({
            ...(filters.score ? { minScore: filters.score, maxScore: filters.score } : {}),
            brand: filters.brand,
            adsOwner: filters.ownerPhoneNumber,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setBrandReviews(extractItems(response))
        setBrandReviewPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setBrandReviewsError(message)
      } finally {
        setBrandReviewsLoading(false)
      }
    },
    [token],
  )

  return {
    brandReviews,
    setBrandReviews,
    brandReviewsLoading,
    setBrandReviewsLoading,
    brandReviewsError,
    setBrandReviewsError,
    brandReviewsMessage,
    setBrandReviewsMessage,
    brandReviewPagination,
    setBrandReviewPagination,
    brandReviewPaginationRef,
    brandReviewFilters,
    setBrandReviewFilters,
    brandReviewQueryApplied,
    setBrandReviewQueryApplied,
    brandReviewFiltersRef,
    editingBrandReviewId,
    setEditingBrandReviewId,
    brandReviewBrand,
    setBrandReviewBrand,
    brandReviewScore,
    setBrandReviewScore,
    brandReviewRemarks,
    setBrandReviewRemarks,
    brandReviewAdsOwner,
    setBrandReviewAdsOwner,
    savingBrandReview,
    setSavingBrandReview,
    showBrandReviewModal,
    setShowBrandReviewModal,
    loadBrandReviews,
  }
}
