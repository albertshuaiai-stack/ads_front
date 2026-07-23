// 日期 / 状态 / 数值 格式化纯函数 / Pure formatters for date, status and number
import { formatTableValue, toOptionalTrimmedString } from '../lib/adsPortal'

// 转成 <input type=date> 需要的 yyyy-mm-dd / Normalize to yyyy-mm-dd for date input
export function toDateInputValue(value) {
  const text = toOptionalTrimmedString(value)
  if (!text) {
    return ''
  }

  const match = text.match(/^\d{4}[-/]\d{2}[-/]\d{2}/)
  return match ? match[0].replace(/\//g, '-') : ''
}

// 转成后端接受的日期格式 / Normalize to API date format
export function toApiDateValue(value) {
  const text = toOptionalTrimmedString(value)
  if (!text) {
    return undefined
  }

  if (/^\d{4}\/\d{2}\/\d{2}$/.test(text)) {
    return text.replace(/\//g, '-')
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  return text
}

// 表格中展示用的日期 / Date value for table display
export function formatDateDisplayValue(value) {
  const dateValue = toDateInputValue(value)
  return dateValue ? dateValue.replace(/-/g, '/') : formatTableValue(value)
}

// 归一化广告状态（ACTIVE -> RUNNING）/ Normalize ads status
export function normalizeAdsStatusValue(value) {
  const text = String(value ?? '').trim().toUpperCase()

  if (text === 'ACTIVE') {
    return 'RUNNING'
  }

  return text
}

// 广告状态展示文案 / Ads status display label
export function formatAdsStatusLabel(value) {
  const status = normalizeAdsStatusValue(value)

  if (status === 'RUNNING') {
    return 'Running'
  }

  if (status === 'PAUSED') {
    return 'Paused'
  }

  return formatTableValue(value)
}

// 状态切换按钮文案 / Status toggle action label
export function getAdsStatusActionLabel(value) {
  return normalizeAdsStatusValue(value) === 'RUNNING' ? 'Pause' : 'Active'
}

// 状态切换目标值 / Next status when toggling
export function getNextAdsStatus(value) {
  return normalizeAdsStatusValue(value) === 'RUNNING' ? 'PAUSED' : 'RUNNING'
}

// 归一化 Shift Link 广告类型 / Normalize shift link ads type
export function normalizeShiftLinkAdsType(value) {
  const normalized = String(value ?? '').trim().toLowerCase()

  if (normalized === 'normal') {
    return 'Normal'
  }

  if (normalized === 'matrix') {
    return 'Matrix'
  }

  return ''
}

// 转可选数字，非法返回 null / Parse optional finite number
export function toOptionalCount(value) {
  if (value == null || value === '') {
    return null
  }

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}
