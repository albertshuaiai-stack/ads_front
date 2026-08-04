import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buildQueryString,
  createEmptyParameterRow,
  createResponsePayloadState,
  extractItems,
  requestApi,
  toOptionalTrimmedString,
} from '../lib/adsPortal'
import { buildPaginationState, createInitialPagination } from '../utils/pagination'

export function useAffiliateSyncConfigs(token) {
  const [affiliateSyncConfigs, setAffiliateSyncConfigs] = useState([])
  const [affiliateSyncConfigsLoading, setAffiliateSyncConfigsLoading] = useState(false)
  const [affiliateSyncConfigsError, setAffiliateSyncConfigsError] = useState('')
  const [affiliateSyncConfigsMessage, setAffiliateSyncConfigsMessage] = useState('')
  const [affiliateSyncConfigPagination, setAffiliateSyncConfigPagination] = useState(() =>
    createInitialPagination(),
  )
  const affiliateSyncConfigPaginationRef = useRef(affiliateSyncConfigPagination)
  const [affiliateSyncConfigFilters, setAffiliateSyncConfigFilters] = useState({
    affiliateNetwork: '',
    ownerPhoneNumber: '',
  })
  const [affiliateSyncConfigQueryApplied, setAffiliateSyncConfigQueryApplied] = useState(false)
  const affiliateSyncConfigFiltersRef = useRef(affiliateSyncConfigFilters)
  const [editingAffiliateSyncConfigId, setEditingAffiliateSyncConfigId] = useState(null)
  const [affiliateSyncConfigNetwork, setAffiliateSyncConfigNetwork] = useState('')
  const [affiliateSyncConfigName, setAffiliateSyncConfigName] = useState('')
  const [affiliateSyncConfigUrl, setAffiliateSyncConfigUrl] = useState('')
  const [affiliateSyncConfigMethod, setAffiliateSyncConfigMethod] = useState('')
  const [affiliateSyncConfigRequestHeaderRows, setAffiliateSyncConfigRequestHeaderRows] = useState([
    createEmptyParameterRow(),
  ])
  const [affiliateSyncConfigRequestPayloadRows, setAffiliateSyncConfigRequestPayloadRows] = useState([
    createEmptyParameterRow(),
  ])
  const [affiliateSyncConfigResponsePayload, setAffiliateSyncConfigResponsePayload] = useState('')
  const [affiliateSyncConfigResponsePayloadFormat, setAffiliateSyncConfigResponsePayloadFormat] = useState(
    createResponsePayloadState().format,
  )
  const [savingAffiliateSyncConfig, setSavingAffiliateSyncConfig] = useState(false)
  const [showAffiliateSyncConfigModal, setShowAffiliateSyncConfigModal] = useState(false)

  useEffect(() => {
    affiliateSyncConfigFiltersRef.current = affiliateSyncConfigFilters
  }, [affiliateSyncConfigFilters])

  useEffect(() => {
    affiliateSyncConfigPaginationRef.current = affiliateSyncConfigPagination
  }, [affiliateSyncConfigPagination])

  const loadAffiliateSyncConfigs = useCallback(
    async (
      filters = affiliateSyncConfigFiltersRef.current,
      pageConfig = affiliateSyncConfigPaginationRef.current,
    ) => {
      setAffiliateSyncConfigsLoading(true)
      setAffiliateSyncConfigsError('')

      try {
        const response = await requestApi(
          `/affiliate-ads-sync-config${buildQueryString({
            affiliateNetwork: filters.affiliateNetwork,
            adsOwner: toOptionalTrimmedString(filters.ownerPhoneNumber),
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setAffiliateSyncConfigs(extractItems(response))
        setAffiliateSyncConfigPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setAffiliateSyncConfigsError(message)
      } finally {
        setAffiliateSyncConfigsLoading(false)
      }
    },
    [token],
  )

  return {
    affiliateSyncConfigs, setAffiliateSyncConfigs,
    affiliateSyncConfigsLoading, setAffiliateSyncConfigsLoading,
    affiliateSyncConfigsError, setAffiliateSyncConfigsError,
    affiliateSyncConfigsMessage, setAffiliateSyncConfigsMessage,
    affiliateSyncConfigPagination, setAffiliateSyncConfigPagination,
    affiliateSyncConfigPaginationRef,
    affiliateSyncConfigFilters, setAffiliateSyncConfigFilters,
    affiliateSyncConfigQueryApplied, setAffiliateSyncConfigQueryApplied,
    affiliateSyncConfigFiltersRef,
    editingAffiliateSyncConfigId, setEditingAffiliateSyncConfigId,
    affiliateSyncConfigNetwork, setAffiliateSyncConfigNetwork,
    affiliateSyncConfigName, setAffiliateSyncConfigName,
    affiliateSyncConfigUrl, setAffiliateSyncConfigUrl,
    affiliateSyncConfigMethod, setAffiliateSyncConfigMethod,
    affiliateSyncConfigRequestHeaderRows, setAffiliateSyncConfigRequestHeaderRows,
    affiliateSyncConfigRequestPayloadRows, setAffiliateSyncConfigRequestPayloadRows,
    affiliateSyncConfigResponsePayload, setAffiliateSyncConfigResponsePayload,
    affiliateSyncConfigResponsePayloadFormat, setAffiliateSyncConfigResponsePayloadFormat,
    savingAffiliateSyncConfig, setSavingAffiliateSyncConfig,
    showAffiliateSyncConfigModal, setShowAffiliateSyncConfigModal,
    loadAffiliateSyncConfigs,
  }
}
