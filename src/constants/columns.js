// 静态表格列定义常量 / static table column definitions

export const ADS_URL_COLUMNS = [
  { key: 'id', label: 'ID', fields: ['id'] },
  {
    key: 'adsName',
    label: 'Ads Name',
    fields: ['adsName', 'capMainName', 'campainName'],
  },
  { key: 'adsType', label: 'Ads Type', fields: ['adsType', 'ads_type'] },
  { key: 'platformName', label: 'Platform Name', fields: ['platformName', 'platform'] },
  { key: 'seqNumber', label: 'Seq Number', fields: ['seqNumber'] },
  { key: 'displayNumber', label: 'Display Capacity', fields: ['displayNumber'] },
  {
    key: 'displayTimes',
    label: 'Display Times',
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
  { key: 'adsName', label: 'Ads Name', fields: ['adsName', 'capMainName', 'campaignName'] },
  { key: 'platformName', label: 'Platform Name', fields: ['platformName', 'platform'] },
  { key: 'fullUrl', label: 'Full Url', fields: ['fullUrl'] },
  { key: 'displayTimes', label: 'Display Times', fields: ['displayTimes'] },
  { key: 'remarks', label: 'Remarks', fields: ['remarks', 'remark'] },
  { key: 'createDate', label: 'Create Date', fields: ['createDate'] },
]

export const ADS_TASK_LOG_COLUMNS = [
  { key: 'id', label: 'ID', fields: ['id'] },
  { key: 'adsType', label: 'Ads Type', fields: ['adsType'] },
  { key: 'adsName', label: 'Ads Name', fields: ['adsName'] },
  { key: 'platformName', label: 'Platform Name', fields: ['platformName'] },
  { key: 'device', label: 'Device', fields: ['device'] },
  { key: 'ip', label: 'IP', fields: ['ip'] },
  { key: 'countryCode', label: 'Country Code', fields: ['countryCode'] },
  { key: 'sequence', label: 'Sequence', fields: ['sequence'] },
  { key: 'requestUrl', label: 'Request Url', fields: ['requestUrl'] },
  { key: 'responseUrl', label: 'Response Url', fields: ['responseUrl'] },
  { key: 'statusCode', label: 'Status Code', fields: ['statusCode'] },
  { key: 'durationMillis', label: 'Duration (ms)', fields: ['durationMillis'] },
  { key: 'success', label: 'Success', fields: ['success'] },
  { key: 'errMsg', label: 'Error Message', fields: ['errMsg'] },
  { key: 'createDate', label: 'Create Date', fields: ['createDate'] },
]

// 动态列排序偏好 / preferred ordering for dynamically discovered columns
export const NORMAL_ADS_PREFERRED_COLUMNS = [
  'campainCountry',
  'campainName',
  'dynamicProxyInfo',
  'landingPageUrl',
  'intervalTime',
  'affiliteUrl',
  'lastExecuteTime',
  'nextExecuteTime',
  'lastSuccessDate',
  'successCount',
  'failedCount',
  'status',
]

export const NORMAL_ADS_EXCLUDED_COLUMNS = [
  'id',
  'adsOwner',
  'platformName',
  'dynamicProxyInfoBackup',
  'createDate',
  'updateDate',
]

export const MATRIX_ADS_PREFERRED_COLUMNS = [
  'campainCountry',
  'campainName',
  'dynamicProxyInfo',
  'landingPageUrl',
  'intervalTime',
  'affiliateInfos',
  'lastExecuteTime',
  'nextExecuteTime',
  'lastSuccessDate',
  'successCount',
  'failedCount',
  'status',
]

export const MATRIX_ADS_EXCLUDED_COLUMNS = [
  'id',
  'adsOwner',
  'dynamicProxyInfoBackup',
  'createDate',
  'updateDate',
]
