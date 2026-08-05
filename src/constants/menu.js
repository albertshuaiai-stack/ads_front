// 侧边栏菜单分组配置 / Sidebar menu group configuration
export const MENU_GROUPS = [
  {
    id: 'system',
    title: 'System Management',
    items: [
      { id: 'user-management', label: 'User' },
      { id: 'role-management', label: 'User Role' },
      { id: 'ads-platform-management', label: 'Platform' },
      { id: 'user-agent-management', label: 'User Agent' },
    ],
  },
  {
    id: 'ads',
    title: 'Advertisement',
    items: [
      { id: 'auto-script', label: 'Auto Script' },
      { id: 'normal-ads-management', label: 'Normal Ads Tasks' },
      { id: 'matrix-ads-management', label: 'Matrix Ads Tasks' },
      { id: 'ads-url-management', label: 'Shift Link' },
      { id: 'shift-link-log', label: 'Shift Link Log' },
      { id: 'test-shift-link', label: 'Shift Link Testing' },
    ],
  },
  {
    id: 'tool',
    title: 'Tool',
    items: [
      { id: 'email-management', label: 'Email' },
      { id: 'cash-bach-account', label: 'Cash Bach Account' },
      { id: 'ads-account-management', label: 'Ads Account' },
      { id: 'paypal-management', label: 'PayPal' },
      { id: 'income-management', label: 'Income' },
      { id: 'outcome-management', label: 'Expenditure' },
    ],
  },
  {
    id: 'affiliate-ads',
    title: 'Auto Task',
    items: [
      { id: 'affiliate-job-detail', label: 'Auto Job' },
      { id: 'affiliate-trigger', label: 'Auto Trigger' },
      { id: 'affiliate-ip-proxy', label: 'Proxy Config' },
      { id: 'affiliate-sync-config', label: 'API Config' },
      { id: 'affiliate-sync-task', label: 'Auto Sync Task' },
      { id: 'affiliate-test-task', label: 'Auto Test Task' },
      { id: 'affiliate-test-result', label: 'Auto Test Report' },
      { id: 'affiliate-sync-result', label: 'Auto Sync Report' },
    ],
  },
]

// Tool 类菜单 id 集合 / Tool menu ids
export const TOOL_MENU_IDS = [
  'email-management',
  'cash-bach-account',
  'ads-account-management',
  'paypal-management',
  'income-management',
  'outcome-management',
]

// Affiliate Ads 类菜单 id 集合 / Affiliate Ads menu ids
export const AFFILIATE_ADS_MENU_IDS = [
  'affiliate-job-detail',
  'affiliate-trigger',
  'affiliate-ip-proxy',
  'affiliate-sync-config',
  'affiliate-sync-task',
  'affiliate-test-task',
  'affiliate-test-result',
  'affiliate-sync-result',
]

// Shift Link 批量导入模板下载地址 / Shift Link bulk-upload template url
export const SHIFT_LINK_TEMPLATE_FILE_URL = `${import.meta.env.BASE_URL}templates/Shift_Link_Temp.xlsx`
