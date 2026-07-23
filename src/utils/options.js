// 选项/列派生纯函数 / pure helpers for deriving options & columns
import {
  isAdminRole,
  isMatrixRole,
  isNormalRole,
  firstDefinedValue,
  toOptionalTrimmedString,
} from '../lib/adsPortal'
import { normalizeShiftLinkAdsType } from './formatters'

// 升序排序并转成数组 / sort names ascending and return an array
export function sortNamesAscending(names) {
  return Array.from(names).sort((left, right) => String(left).localeCompare(String(right)))
}

// 根据角色构造广告类型选项 / build ads type options from the current role
export function buildAdsTypeOptions(role) {
  if (isAdminRole(role)) {
    return [
      { value: 'Normal', label: 'Normal' },
      { value: 'Matrix', label: 'Matrix' },
    ]
  }

  const options = []

  if (isNormalRole(role)) {
    options.push({ value: 'Normal', label: 'Normal' })
  }

  if (isMatrixRole(role)) {
    options.push({ value: 'Matrix', label: 'Matrix' })
  }

  return options
}

// 基于数据行动态推导列（按偏好排序，排除指定字段）/ derive columns dynamically from rows
export function buildDynamicColumns(rows, preferredOrder, excludedFields = []) {
  const fieldNames = new Set()

  rows.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach((key) => fieldNames.add(key))
    }
  })

  const excluded = new Set(excludedFields)
  const orderedFields = preferredOrder.filter((fieldName) => fieldNames.has(fieldName))
  const remainingFields = Array.from(fieldNames).filter(
    (fieldName) => !preferredOrder.includes(fieldName) && !excluded.has(fieldName),
  )

  remainingFields.sort((left, right) => left.localeCompare(right))
  return [...orderedFields, ...remainingFields]
}

const ADS_NAME_FIELDS = ['adsName', 'capMainName', 'campainName']
const PLATFORM_NAME_FIELDS = ['platformName', 'platform']

// 从班表日志目录收集去重字段值，支持按 adsType / adsName 过滤
// collect deduped field values from the shift-link catalog with optional adsType/adsName filters
export function collectCatalogFieldNames(catalog, { field, adsType, adsName } = {}) {
  const names = new Set()

  catalog.forEach((item) => {
    const itemAdsType = normalizeShiftLinkAdsType(firstDefinedValue(item, ['adsType', 'ads_type']))
    if (adsType && itemAdsType !== adsType) {
      return
    }

    if (adsName) {
      const itemAdsName = toOptionalTrimmedString(firstDefinedValue(item, ADS_NAME_FIELDS))
      if (itemAdsName !== adsName) {
        return
      }
    }

    const value = toOptionalTrimmedString(firstDefinedValue(item, field))
    if (value) {
      names.add(value)
    }
  })

  return sortNamesAscending(names)
}

export const CATALOG_ADS_NAME_FIELDS = ADS_NAME_FIELDS
export const CATALOG_PLATFORM_NAME_FIELDS = PLATFORM_NAME_FIELDS
