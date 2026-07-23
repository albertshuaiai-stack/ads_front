// 侧边栏菜单分组配置 / Sidebar menu group configuration
export const MENU_GROUPS = [
  {
    id: 'system',
    title: 'System Management',
    items: [
      { id: 'user-management', label: 'User' },
      { id: 'role-management', label: 'User Role' },
      { id: 'ads-platform-management', label: 'Platform' },
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
      { id: 'email-management', label: 'Email Management' },
      { id: 'cash-bach-account', label: 'Cash Bach Account' },
      { id: 'paypal-management', label: 'PayPal Management' },
      { id: 'income-management', label: 'Income Management' },
      { id: 'outcome-management', label: 'Outcome Management' },
    ],
  },
]

// 财务工具类菜单 id 集合 / Financial tool menu ids
export const TOOL_MENU_IDS = [
  'email-management',
  'cash-bach-account',
  'paypal-management',
  'income-management',
  'outcome-management',
]

// Shift Link 批量导入模板下载地址 / Shift Link bulk-upload template url
export const SHIFT_LINK_TEMPLATE_FILE_URL = `${import.meta.env.BASE_URL}templates/Shift_Link_Temp.xlsx`
