import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useToolCloudPhones(token) {
  const [toolCloudPhones, setToolCloudPhones] = useState([])
  const [toolCloudPhonesLoading, setToolCloudPhonesLoading] = useState(false)
  const [toolCloudPhonesError, setToolCloudPhonesError] = useState('')
  const [toolCloudPhonesMessage, setToolCloudPhonesMessage] = useState('')
  const [toolCloudPhonePagination, setToolCloudPhonePagination] = useState(() => createInitialPagination())
  const toolCloudPhonePaginationRef = useRef(toolCloudPhonePagination)
  const [toolCloudPhoneFilters, setToolCloudPhoneFilters] = useState({
    countryCd: '',
    adsOwner: '',
  })
  const [toolCloudPhoneQueryApplied, setToolCloudPhoneQueryApplied] = useState(false)
  const toolCloudPhoneFiltersRef = useRef(toolCloudPhoneFilters)
  const [editingToolCloudPhoneId, setEditingToolCloudPhoneId] = useState(null)
  const [toolCloudPhoneCountryCd, setToolCloudPhoneCountryCd] = useState('')
  const [toolCloudPhoneNumber, setToolCloudPhoneNumber] = useState('')
  const [toolCloudPhoneStartDate, setToolCloudPhoneStartDate] = useState('')
  const [toolCloudPhoneExpireDate, setToolCloudPhoneExpireDate] = useState('')
  const [toolCloudPhoneRemarks, setToolCloudPhoneRemarks] = useState('')
  const [savingToolCloudPhone, setSavingToolCloudPhone] = useState(false)
  const [showToolCloudPhoneModal, setShowToolCloudPhoneModal] = useState(false)

  useEffect(() => {
    toolCloudPhoneFiltersRef.current = toolCloudPhoneFilters
  }, [toolCloudPhoneFilters])

  useEffect(() => {
    toolCloudPhonePaginationRef.current = toolCloudPhonePagination
  }, [toolCloudPhonePagination])

  const loadToolCloudPhones = useCallback(
    async (filters = toolCloudPhoneFiltersRef.current, pageConfig = toolCloudPhonePaginationRef.current) => {
      setToolCloudPhonesLoading(true)
      setToolCloudPhonesError('')

      try {
        const response = await requestApi(
          `/tool-cloud-phones${buildQueryString({
            countryCd: filters.countryCd,
            adsOwner: filters.adsOwner,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setToolCloudPhones(extractItems(response))
        setToolCloudPhonePagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setToolCloudPhonesError(message)
      } finally {
        setToolCloudPhonesLoading(false)
      }
    },
    [token],
  )

  return {
    toolCloudPhones,
    setToolCloudPhones,
    toolCloudPhonesLoading,
    setToolCloudPhonesLoading,
    toolCloudPhonesError,
    setToolCloudPhonesError,
    toolCloudPhonesMessage,
    setToolCloudPhonesMessage,
    toolCloudPhonePagination,
    setToolCloudPhonePagination,
    toolCloudPhonePaginationRef,
    toolCloudPhoneFilters,
    setToolCloudPhoneFilters,
    toolCloudPhoneQueryApplied,
    setToolCloudPhoneQueryApplied,
    toolCloudPhoneFiltersRef,
    editingToolCloudPhoneId,
    setEditingToolCloudPhoneId,
    toolCloudPhoneCountryCd,
    setToolCloudPhoneCountryCd,
    toolCloudPhoneNumber,
    setToolCloudPhoneNumber,
    toolCloudPhoneStartDate,
    setToolCloudPhoneStartDate,
    toolCloudPhoneExpireDate,
    setToolCloudPhoneExpireDate,
    toolCloudPhoneRemarks,
    setToolCloudPhoneRemarks,
    savingToolCloudPhone,
    setSavingToolCloudPhone,
    showToolCloudPhoneModal,
    setShowToolCloudPhoneModal,
    loadToolCloudPhones,
  }
}
