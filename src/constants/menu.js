// 侧边栏菜单分组配置 / Sidebar menu group configuration
export const MENU_GROUPS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      { id: 'shift-link-dashboard', label: 'Dashboard' },
    ],
  },
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
      { id: 'ads-task-log', label: 'Ads Task Log' },
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
    title: 'AFFILIATE',
    items: [
      { id: 'affiliate-auto-task', label: 'Auto Task' },
      { id: 'affiliate-job-detail', label: 'Auto Job' },
      { id: 'affiliate-trigger', label: 'Auto Trigger' },
      { id: 'affiliate-ip-proxy', label: 'Proxy Config' },
      { id: 'affiliate-test-result', label: 'Affiliate Test' },
      { id: 'affiliate-sync-result', label: 'Affiliate Ads' },
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
  'affiliate-auto-task',
  'affiliate-job-detail',
  'affiliate-trigger',
  'affiliate-ip-proxy',
  'affiliate-test-result',
  'affiliate-sync-result',
]

// Shift Link 批量导入模板下载地址 / Shift Link bulk-upload template url
export const SHIFT_LINK_TEMPLATE_FILE_URL = `${import.meta.env.BASE_URL}templates/Shift_Link_Temp.xlsx`
