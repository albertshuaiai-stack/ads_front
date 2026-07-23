// 静态表格列定义常量 / static table column definitions

export const ADS_URL_COLUMNS = [
  { key: 'id', label: 'ID', fields: ['id'] },
  {
    key: 'adsName',
    label: 'Campaign Name',
    fields: ['adsName', 'capMainName', 'campainName'],
  },
  { key: 'adsType', label: 'Ads Type', fields: ['adsType', 'ads_type'] },
  { key: 'platformName', label: 'Platform Name', fields: ['platformName', 'platform'] },
  { key: 'seqNumber', label: 'Seq Number', fields: ['seqNumber'] },
  { key: 'displayNumber', label: 'Display Number', fields: ['displayNumber'] },
  {
    key: 'displayTimes',
    label: 'Display Time',
    fields: ['displayTimes'],
  },
  {
    key: 'landingPageUrl',
    label: 'Landing Page Url',
    fields: ['landingPageUrl', 'landingUrl'],
  },
  { key: 'fullUrl', label: 'Full Url', fields: ['fullUrl'] },
  { key: 'remarks', label: 'Remarks', fields: ['remarks', 'remark'] },
  { key: 'status', label: 'Status', fields: ['status'] },
  { key: 'createDate', label: 'Create Date', fields: ['createDate'] },
  { key: 'updateDate', label: 'Update Date', fields: ['updateDate'] },
]

export const SHIFT_LINK_LOG_COLUMNS = [
  { key: 'id', label: 'ID', fields: ['id'] },
  { key: 'adsType', label: 'Ads Type', fields: ['adsType'] },
  { key: 'adsName', label: 'Ads Name', fields: ['adsName', 'capMainName', 'campainName'] },
  { key: 'platformName', label: 'Platform Name', fields: ['platformName', 'platform'] },
  { key: 'fullUrl', label: 'Full Url', fields: ['fullUrl'] },
  { key: 'displayTimes', label: 'Display Time', fields: ['displayTimes'] },
  { key: 'remarks', label: 'Remarks', fields: ['remarks', 'remark'] },
  { key: 'createDate', label: 'Create Date', fields: ['createDate'] },
]

// 动态列排序偏好 / preferred ordering for dynamically discovered columns
export const NORMAL_ADS_PREFERRED_COLUMNS = [
  'id',
  'campainName',
  'campainCountry',
  'platformName',
  'affiliteUrl',
  'landingPageUrl',
  'dynamicProxyInfo',
  'intervalTime',
  'status',
  'createDate',
  'updateDate',
]

export const NORMAL_ADS_EXCLUDED_COLUMNS = ['adsOwner', 'dynamicProxyInfoBackup']

export const MATRIX_ADS_PREFERRED_COLUMNS = [
  'id',
  'campainName',
  'campainCountry',
  'landingPageUrl',
  'dynamicProxyInfo',
  'dynamicProxyInfoBackup',
  'intervalTime',
  'status',
  'affiliateInfos',
  'createDate',
  'updateDate',
]

export const MATRIX_ADS_EXCLUDED_COLUMNS = ['adsOwner']
