import * as XLSX from 'xlsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ads.admirecars.com/api'
const TOKEN_STORAGE_KEY = 'ads_auth_token'
const USER_STORAGE_KEY = 'ads_current_user'
const ROLE_STORAGE_KEY = 'ads_current_role'
const NORMAL_ADS_TOTAL_STORAGE_KEY = 'ads_normal_total_count'
const MATRIX_ADS_TOTAL_STORAGE_KEY = 'ads_matrix_total_count'
const UNAUTHORIZED_EVENT_NAME = 'ads:unauthorized'

function getApiUrl(path) {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

async function parseResponse(response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

async function requestApi(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData

  if (token) {
    headers.AMtoken = token
    headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined && !isFormDataBody) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(getApiUrl(path), {
    method,
    headers,
    body:
      body === undefined ? undefined : isFormDataBody ? body : JSON.stringify(body),
  })

  const responseData = await parseResponse(response)
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT_NAME))
    }

    const message =
      responseData?.message ||
      responseData?.error ||
      `Request failed (${response.status})`
    throw new Error(message)
  }

  return responseData
}

function parseAdsUrl(fullUrl) {
  try {
    const parsed = new URL(fullUrl)
    return {
      landingUrl: `${parsed.origin}${parsed.pathname}`,
      urlSuffix: `${parsed.search}${parsed.hash}` || undefined,
    }
  } catch {
    throw new Error('Full URL is invalid. Please enter a valid URL.')
  }
}

function formatTableValue(value) {
  if (value == null || value === '') {
    return '—'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function toFieldLabel(fieldName) {
  return String(fieldName)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function firstDefinedValue(item, keys) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== '') {
      return item[key]
    }
  }

  return undefined
}

function normalizeHeader(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function getRowValue(row, aliases) {
  const normalizedAliases = aliases.map((alias) => normalizeHeader(alias))

  for (const [key, value] of Object.entries(row || {})) {
    if (normalizedAliases.includes(normalizeHeader(key))) {
      return value
    }
  }

  return undefined
}

function toOptionalTrimmedString(value) {
  if (value == null) {
    return undefined
  }

  const text = String(value).trim()
  return text ? text : undefined
}

function toOptionalNumber(value) {
  const text = toOptionalTrimmedString(value)
  if (text === undefined) {
    return undefined
  }

  const numberValue = Number(text)
  return Number.isFinite(numberValue) ? numberValue : text
}

const SHIFT_LINK_UPLOAD_HEADERS = [
  'adsType',
  'adsName',
  'platformName',
  'fullUrl',
  'landingPageUrl',
  'displayNumber',
  'remarks',
]

function createShiftLinkUploadRow(payload) {
  return SHIFT_LINK_UPLOAD_HEADERS.reduce((row, key) => {
    row[key] = payload[key] ?? ''
    return row
  }, {})
}

function readShiftLinkPayloadFromRow(row, rowNumber) {
  const adsName = toOptionalTrimmedString(
    getRowValue(row, [
      'adsName',
      'capMainName',
      'cap main name',
      'campaignName',
      'campaign name',
      'campainName',
    ]),
  )
  const platformName = toOptionalTrimmedString(
    getRowValue(row, ['platformName', 'platform name', 'platform']),
  )
  const fullUrl = toOptionalTrimmedString(getRowValue(row, ['fullUrl', 'full url', 'url']))
  const adsType = toOptionalTrimmedString(
      getRowValue(row, ['adsType', 'ads type', 'type']),
  )

  if (!adsName) {
    throw new Error(`Row ${rowNumber}: Campaign Name is required.`)
  }

  if (!platformName) {
    throw new Error(`Row ${rowNumber}: Platform is required.`)
  }

  if (!fullUrl) {
    throw new Error(`Row ${rowNumber}: Full URL is required.`)
  }

  if (!adsType) {
    throw new Error(`Row ${rowNumber}: Ads Type is required.`)
  }

  const parsedUrl = parseAdsUrl(fullUrl)
  const payload = {
    adsType,
    adsName,
    platformName,
    fullUrl,
    landingPageUrl: parsedUrl.landingUrl,
    urlSuffix: parsedUrl.urlSuffix,
    remarks: toOptionalTrimmedString(getRowValue(row, ['remarks', 'remark'])),
  }

  const adsOwner = toOptionalTrimmedString(
    getRowValue(row, ['adsOwner', 'ads owner', 'campaignOwner', 'campaign owner']),
  )
  if (adsOwner !== undefined) {
    payload.adsOwner = adsOwner
  }

  const seqNumber = toOptionalNumber(getRowValue(row, ['seqNumber', 'seq number', 'sequence']))
  if (seqNumber !== undefined) {
    payload.seqNumber = seqNumber
  }

  const displayTimes = toOptionalNumber(
    getRowValue(row, ['displayTimes', 'display times', 'display count']),
  )
  if (displayTimes !== undefined) {
    payload.displayTimes = displayTimes
  }

  const displayNumber = toOptionalNumber(
    getRowValue(row, ['displayNumber', 'display number']),
  )
  if (displayNumber !== undefined) {
    payload.displayNumber = displayNumber
  }

  return payload
}

async function readAdsRowsFromFile(file) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })

  if (workbook.SheetNames.length === 0) {
    throw new Error('The Excel file does not contain any sheets.')
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

  if (rows.length === 0) {
    throw new Error('The first sheet does not contain any data rows.')
  }

  return rows
}

async function createShiftLinkUploadFile(file, fallbackAdsOwner) {
  const rows = await readAdsRowsFromFile(file)
  const normalizedRows = rows.map((row, index) => {
    const payload = readShiftLinkPayloadFromRow(row, index + 2)
    if (payload.adsOwner === undefined && fallbackAdsOwner) {
      payload.adsOwner = fallbackAdsOwner
    }
    return createShiftLinkUploadRow(payload)
  })
  const worksheet = XLSX.utils.json_to_sheet(normalizedRows, {
    header: SHIFT_LINK_UPLOAD_HEADERS,
  })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ShiftLinks')
  const content = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

  return new File([content], file.name.replace(/\.(xlsx|xls)$/i, '') + '-shift-links.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

// 解析选中的文件夹为 Shift Link 列表 / Parse the picked folder into shift link entries.
// 结构约定 / Structure: root/platform/campaignFile ，文件内每行一个 Full URL。
async function parseFolderShiftLinks(fileList) {
  const files = Array.from(fileList || [])
  if (files.length === 0) {
    throw new Error('The selected folder is empty.')
  }

  const entries = []
  const platformNames = new Set()

  for (const file of files) {
    const relativePath = file.webkitRelativePath || file.name
    const segments = relativePath.split('/').filter(Boolean)

    // 至少需要 root/platform/file 三级 / need at least root/platform/file
    if (segments.length < 3) {
      continue
    }

    const platformName = segments[1]
    const fileName = segments[segments.length - 1]
    const campaignName = fileName.replace(/\.[^.]+$/, '')

    if (!platformName || !campaignName) {
      continue
    }

    const text = await file.text()
    const urls = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (urls.length === 0) {
      continue
    }

    platformNames.add(platformName)
    urls.forEach((fullUrl) => {
      entries.push({ platformName, campaignName, fullUrl })
    })
  }

  if (entries.length === 0) {
    throw new Error(
      'No valid links found. Expected structure: folder / platform / campaign-file with one URL per line.',
    )
  }

  return { entries, platformNames: Array.from(platformNames) }
}

function extractItems(response) {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.content)) {
    return response.content
  }

  return []
}

function buildQueryString(params) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== '') {
      searchParams.set(key, `${value}`)
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

function getLoggedInAdsOwner(identifier, currentUser) {
  return toOptionalTrimmedString(currentUser || identifier)
}

function normalizeRoleName(roleName) {
  return String(roleName ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

function getStatusToneClass(value) {
  const normalized = String(value ?? '').trim().toUpperCase()

  if (['RUNNING', 'ACTIVE', 'ENABLED', 'ENABLE'].includes(normalized)) {
    return 'table-row--positive'
  }

  if (['PAUSED', 'DISABLED', 'DISABLE'].includes(normalized)) {
    return 'table-row--negative'
  }

  return ''
}

function isAdminRole(roleName) {
  const normalized = normalizeRoleName(roleName)
  return normalized.includes('admin')
}

function isNormalRole(roleName) {
  const normalized = normalizeRoleName(roleName)
  return normalized.includes('normal') || normalized.includes('both')
}

function isMatrixRole(roleName) {
  const normalized = normalizeRoleName(roleName)
  return (
    normalized.includes('matrix') ||
    normalized.includes('martix') ||
    normalized.includes('both')
  )
}

function getDefaultMenuForRole(roleName) {
  if (isAdminRole(roleName)) {
    return 'user-management'
  }

  if (isNormalRole(roleName)) {
    return 'normal-ads-management'
  }

  if (isMatrixRole(roleName)) {
    return 'matrix-ads-management'
  }

  return ''
}

function createEmptyAffiliateRow() {
  return {
    platformName: '',
    affiliteUrl: '',
    displayNumber: '',
    remarks: '',
  }
}

function normalizeAffiliateRow(row) {
  return {
    platformName: toOptionalTrimmedString(row?.platformName) || '',
    affiliteUrl: toOptionalTrimmedString(row?.affiliteUrl) || '',
    displayNumber: toOptionalTrimmedString(row?.displayNumber) || '',
    remarks: toOptionalTrimmedString(row?.remarks) || '',
  }
}

async function downloadApiFile(path, token, fileName) {
  const headers = {}
  if (token) {
    headers.AMtoken = token
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(getApiUrl(path), { headers })
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT_NAME))
    }

    const responseData = await parseResponse(response)
    const message =
      responseData?.message || responseData?.error || `Request failed (${response.status})`
    throw new Error(message)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.click()
  URL.revokeObjectURL(objectUrl)
}

async function downloadStaticFile(fileUrl, fileName) {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Failed to download file (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

async function uploadApiFile(path, token, file, fieldName = 'file') {
  const formData = new FormData()
  formData.append(fieldName, file)
  return requestApi(path, {
    method: 'POST',
    token,
    body: formData,
  })
}

export {
  API_BASE_URL,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  ROLE_STORAGE_KEY,
  NORMAL_ADS_TOTAL_STORAGE_KEY,
  MATRIX_ADS_TOTAL_STORAGE_KEY,
  UNAUTHORIZED_EVENT_NAME,
  getApiUrl,
  parseResponse,
  requestApi,
  parseAdsUrl,
  formatTableValue,
  toFieldLabel,
  firstDefinedValue,
  normalizeHeader,
  getRowValue,
  toOptionalTrimmedString,
  toOptionalNumber,
  readShiftLinkPayloadFromRow,
  readAdsRowsFromFile,
  createShiftLinkUploadFile,
  parseFolderShiftLinks,
  extractItems,
  buildQueryString,
  getLoggedInAdsOwner,
  getStatusToneClass,
  normalizeRoleName,
  isAdminRole,
  isNormalRole,
  isMatrixRole,
  getDefaultMenuForRole,
  createEmptyAffiliateRow,
  normalizeAffiliateRow,
  downloadApiFile,
  downloadStaticFile,
  uploadApiFile,
}
