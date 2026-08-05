import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdsAccountManagementSection from './components/AdsAccountManagementSection/AdsAccountManagementSection'
import AffiliateJobDetailSection from './components/AffiliateJobDetailSection/AffiliateJobDetailSection'
import AffiliateSyncConfigManagementSection from './components/AffiliateSyncConfigManagementSection/AffiliateSyncConfigManagementSection'
import AffiliateSyncResultManagementSection from './components/AffiliateSyncResultManagementSection/AffiliateSyncResultManagementSection'
import AffiliateSyncTaskManagementSection from './components/AffiliateSyncTaskManagementSection/AffiliateSyncTaskManagementSection'
import AffiliateTestTaskManagementSection from './components/AffiliateTestTaskManagementSection/AffiliateTestTaskManagementSection'
import AffiliateTestResultManagementSection from './components/AffiliateTestResultManagementSection/AffiliateTestResultManagementSection'
import AffiliateTriggerSection from './components/AffiliateTriggerSection/AffiliateTriggerSection'
import IpProxyManagementSection from './components/IpProxyManagementSection/IpProxyManagementSection'
import LoginForm from './components/LoginForm/LoginForm'
import CashBachAccountManagementSection from './components/CashBachAccountManagementSection/CashBachAccountManagementSection'
import ChangePasswordModal from './components/ChangePasswordModal/ChangePasswordModal'
import EmailManagementSection from './components/EmailManagementSection/EmailManagementSection'
import GoogleAdsScriptPanel from './components/GoogleAdsScriptPanel/GoogleAdsScriptPanel'
import IncomeManagementSection from './components/IncomeManagementSection/IncomeManagementSection'
import MatrixAdsManagementSection from './components/MatrixAdsManagementSection/MatrixAdsManagementSection'
import NormalAdsManagementSection from './components/NormalAdsManagementSection/NormalAdsManagementSection'
import OutcomeManagementSection from './components/OutcomeManagementSection/OutcomeManagementSection'
import PageHeader from './components/PageHeader/PageHeader'
import PaypalManagementSection from './components/PaypalManagementSection/PaypalManagementSection'
import PlatformManagementSection from './components/PlatformManagementSection/PlatformManagementSection'
import RoleManagementSection from './components/RoleManagementSection/RoleManagementSection'
import ShiftLinkLogSection from './components/ShiftLinkLogSection/ShiftLinkLogSection'
import ShiftLinkManagementSection from './components/ShiftLinkManagementSection/ShiftLinkManagementSection'
import Sidebar from './components/Sidebar/Sidebar'
import TestShiftLinkSection from './components/TestShiftLinkSection/TestShiftLinkSection'
import UserAgentManagementSection from './components/UserAgentManagementSection/UserAgentManagementSection'
import UserManagementSection from './components/UserManagementSection/UserManagementSection'
import './App.css'
import { COUNTRY_OPTIONS, toCountryCode } from './lib/countryOptions'
import {
  TOKEN_STORAGE_KEY,
  UNAUTHORIZED_EVENT_NAME,
  USER_STORAGE_KEY,
  ROLE_STORAGE_KEY,
  NORMAL_ADS_TOTAL_STORAGE_KEY,
  MATRIX_ADS_TOTAL_STORAGE_KEY,
  buildQueryString,
  createShiftLinkUploadFile,
  createEmptyAffiliateRow,
  downloadStaticFile,
  extractItems,
  firstDefinedValue,
  getDefaultMenuForRole,
  getLoggedInAdsOwner,
  isAdminRole,
  isMatrixRole,
  isNormalRole,
  normalizeAffiliateRow,
  normalizeHeader,
  parseAdsUrl,
  parseFolderShiftLinks,
  requestApi,
  createEmptyParameterRow,
  createResponsePayloadState,
  toOptionalTrimmedString,
  parseParameterRows,
  parseResponsePayloadState,
  serializeResponsePayloadState,
  serializeParameterRows,
  uploadApiFile,
} from './lib/adsPortal'

import { MENU_GROUPS, TOOL_MENU_IDS, SHIFT_LINK_TEMPLATE_FILE_URL } from './constants/menu'
import { AFFILIATE_ADS_MENU_IDS } from './constants/menu'
import {
  ADS_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  OUTCOME_TYPE_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
  ACCOUNT_PAYMENT_STATUS_OPTIONS,
  ACCOUNT_CURRENCY_OPTIONS,
  ADS_ACCOUNT_TYPE_OPTIONS,
  ADS_ACCOUNT_AGENCY_PLATFORM_OPTIONS,
  ADS_ACCOUNT_STATUS_OPTIONS,
  AFFILIATE_SYNC_METHOD_OPTIONS,
  AFFILIATE_SYNC_RESPONSE_FORMAT_OPTIONS,
  AFFILIATE_SYNC_TYPE_OPTIONS,
  IP_PROXY_TYPE_OPTIONS,
  IP_PROXY_PROTOCOL_OPTIONS,
  IP_PROXY_STATUS_OPTIONS,
} from './constants/options'
import {
  ADS_URL_COLUMNS,
  SHIFT_LINK_LOG_COLUMNS,
  NORMAL_ADS_PREFERRED_COLUMNS,
  NORMAL_ADS_EXCLUDED_COLUMNS,
  MATRIX_ADS_PREFERRED_COLUMNS,
  MATRIX_ADS_EXCLUDED_COLUMNS,
} from './constants/columns'
import {
  sortNamesAscending,
  buildAdsTypeOptions,
  buildDynamicColumns,
  collectCatalogFieldNames,
  CATALOG_ADS_NAME_FIELDS,
  CATALOG_PLATFORM_NAME_FIELDS,
} from './utils/options'
import {
  toDateInputValue,
  toApiDateValue,
  formatDateDisplayValue,
  normalizeAdsStatusValue,
  formatAdsStatusLabel,
  getAdsStatusActionLabel,
  getNextAdsStatus,
  normalizeShiftLinkAdsType,
  toOptionalCount,
} from './utils/formatters'
import {
  getUserExpireDate,
  validateUserName,
  validateUserEmail,
  validateUserPhoneNumber,
} from './utils/validators'
import { createInitialPagination } from './utils/pagination'
import { isOwnedByCurrentUser } from './utils/ownership'
import { useUsers } from './hooks/useUsers'
import { useUserAgents } from './hooks/useUserAgents'
import { useRoles } from './hooks/useRoles'
import { usePlatforms } from './hooks/usePlatforms'
import { useNormalAds } from './hooks/useNormalAds'
import { useMatrixAds } from './hooks/useMatrixAds'
import { useShiftLinks } from './hooks/useShiftLinks'
import { useShiftLinkLogs } from './hooks/useShiftLinkLogs'
import { useTestShiftLink } from './hooks/useTestShiftLink'
import { useEmails } from './hooks/useEmails'
import { useAccounts } from './hooks/useAccounts'
import { useAdsAccounts } from './hooks/useAdsAccounts'
import { usePaypals } from './hooks/usePaypals'
import { useIncomes } from './hooks/useIncomes'
import { useOutcomes } from './hooks/useOutcomes'
import { useAffiliateJobDetails } from './hooks/useAffiliateJobDetails'
import { useAffiliateSyncConfigs } from './hooks/useAffiliateSyncConfigs'
import { useAffiliateSyncResults } from './hooks/useAffiliateSyncResults'
import { useAffiliateSyncTasks } from './hooks/useAffiliateSyncTasks'
import { useAffiliateTestResults } from './hooks/useAffiliateTestResults'
import { useAffiliateTestTasks } from './hooks/useAffiliateTestTasks'
import { useAffiliateTriggers } from './hooks/useAffiliateTriggers'
import { useIpProxies } from './hooks/useIpProxies'

function App() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem(USER_STORAGE_KEY) || '')
  const [currentUserRole, setCurrentUserRole] = useState(() => localStorage.getItem(ROLE_STORAGE_KEY) || '')
  const [currentUserProfile, setCurrentUserProfile] = useState(null)
  const [normalAdsTotalCount, setNormalAdsTotalCount] = useState(() =>
    toOptionalCount(localStorage.getItem(NORMAL_ADS_TOTAL_STORAGE_KEY)),
  )
  const [matrixAdsTotalCount, setMatrixAdsTotalCount] = useState(() =>
    toOptionalCount(localStorage.getItem(MATRIX_ADS_TOTAL_STORAGE_KEY)),
  )
  const [runningNormalAdsCount, setRunningNormalAdsCount] = useState(0)
  const [runningMatrixAdsCount, setRunningMatrixAdsCount] = useState(0)

  const [activeMenu, setActiveMenu] = useState('user-management')
  const {
    testShiftLinkCampainName, setTestShiftLinkCampainName,
    testShiftLinkApiKey, setTestShiftLinkApiKey,
    testShiftLinkError, setTestShiftLinkError,
    normalAdsTestResponse, setNormalAdsTestResponse,
    matrixAdsTestResponse, setMatrixAdsTestResponse,
    normalAdsTestLoading, setNormalAdsTestLoading,
    matrixAdsTestLoading, setMatrixAdsTestLoading,
  } = useTestShiftLink()

  const {
    shiftLinkLogFilters, setShiftLinkLogFilters,
    shiftLinkLogCatalog, setShiftLinkLogCatalog,
    shiftLinkLogCatalogLoading, setShiftLinkLogCatalogLoading,
    shiftLinkLogCatalogError, setShiftLinkLogCatalogError,
    shiftLinkLogs, setShiftLinkLogs,
    shiftLinkLogsLoading, setShiftLinkLogsLoading,
    shiftLinkLogsError, setShiftLinkLogsError,
    shiftLinkLogsLoaded, setShiftLinkLogsLoaded,
    shiftLinkLogPagination, setShiftLinkLogPagination,
    shiftLinkLogPaginationRef,
    shiftLinkLogQueryApplied, setShiftLinkLogQueryApplied,
    shiftLinkLogFiltersRef,
    loadShiftLinkLogCatalog,
    loadShiftLinkLogs,
  } = useShiftLinkLogs(token)

  const {
    users, setUsers,
    usersLoading,
    usersError, setUsersError,
    usersMessage, setUsersMessage,
    usersPagination, setUsersPagination,
    usersPaginationRef,
    editingUserId, setEditingUserId,
    userName, setUserName,
    userEmail, setUserEmail,
    userPhoneNumber, setUserPhoneNumber,
    userPassword, setUserPassword,
    userRole, setUserRole,
    expireDate, setExpireDate,
    userStatus, setUserStatus,
    savingUser, setSavingUser,
    showUserModal, setShowUserModal,
    loadUsers,
  } = useUsers(token)

  const {
    roles, setRoles,
    rolesLoading,
    rolesError, setRolesError,
    rolesMessage, setRolesMessage,
    editingRoleId, setEditingRoleId,
    roleName, setRoleName,
    savingRole, setSavingRole,
    showRoleModal, setShowRoleModal,
    loadRoles,
  } = useRoles(token)
  const {
    userAgents, setUserAgents,
    userAgentsLoading,
    userAgentsError, setUserAgentsError,
    userAgentsMessage, setUserAgentsMessage,
    editingUserAgentId, setEditingUserAgentId,
    userAgentDevice, setUserAgentDevice,
    userAgentValue, setUserAgentValue,
    savingUserAgent, setSavingUserAgent,
    showUserAgentModal, setShowUserAgentModal,
    loadUserAgents,
  } = useUserAgents(token)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordMessage, setChangePasswordMessage] = useState('')
  const [savingChangePassword, setSavingChangePassword] = useState(false)

  const {
    adsUrls, setAdsUrls,
    adsLoading,
    adsError, setAdsError,
    adsMessage, setAdsMessage,
    adsUrlPagination, setAdsUrlPagination,
    adsUrlPaginationRef,
    editingAdsId, setEditingAdsId,
    editingAdsOriginal, setEditingAdsOriginal,
    capMainName, setCapMainName,
    adsType, setAdsType,
    platform, setPlatform,
    fullUrl, setFullUrl,
    displayNumber, setDisplayNumber,
    remark, setRemark,
    savingAds, setSavingAds,
    showAdsModal, setShowAdsModal,
    showBulkAdsModal, setShowBulkAdsModal,
    bulkAdsFile, setBulkAdsFile,
    bulkAdsSaving, setBulkAdsSaving,
    bulkAdsError, setBulkAdsError,
    bulkAdsMessage, setBulkAdsMessage,
    showFolderImportModal, setShowFolderImportModal,
    folderImportFiles, setFolderImportFiles,
    folderImportAdsType, setFolderImportAdsType,
    folderImportDisplayNumber, setFolderImportDisplayNumber,
    folderImportSaving, setFolderImportSaving,
    folderImportError, setFolderImportError,
    folderImportMessage, setFolderImportMessage,
    showBulkDeleteModal, setShowBulkDeleteModal,
    bulkDeleteMode, setBulkDeleteMode,
    bulkDeleteValue, setBulkDeleteValue,
    bulkDeleteSaving, setBulkDeleteSaving,
    bulkDeleteError, setBulkDeleteError,
    bulkDeleteMessage, setBulkDeleteMessage,
    adsUrlFilters, setAdsUrlFilters,
    adsUrlQueryApplied, setAdsUrlQueryApplied,
    adsUrlFiltersRef,
    loadAdsUrls,
  } = useShiftLinks(token)

  const {
    normalAds, setNormalAds,
    normalAdsLoading,
    normalAdsError, setNormalAdsError,
    normalAdsMessage, setNormalAdsMessage,
    normalAdsPagination, setNormalAdsPagination,
    normalAdsPaginationRef,
    editingNormalAdsId, setEditingNormalAdsId,
    normalCampainName, setNormalCampainName,
    normalCampainCountry, setNormalCampainCountry,
    normalPlatformName, setNormalPlatformName,
    normalAffiliteUrl, setNormalAffiliteUrl,
    normalLandingPageUrl, setNormalLandingPageUrl,
    normalDynamicProxyInfo, setNormalDynamicProxyInfo,
    normalDynamicProxyInfoBackup, setNormalDynamicProxyInfoBackup,
    normalIntervalTime, setNormalIntervalTime,
    normalStatus, setNormalStatus,
    savingNormalAds, setSavingNormalAds,
    showNormalAdsModal, setShowNormalAdsModal,
    normalAdsFilters, setNormalAdsFilters,
    normalAdsQueryApplied, setNormalAdsQueryApplied,
    normalAdsFiltersRef,
    loadNormalAds,
  } = useNormalAds(token)

  const {
    matrixAds, setMatrixAds,
    matrixAdsLoading,
    matrixAdsError, setMatrixAdsError,
    matrixAdsMessage, setMatrixAdsMessage,
    matrixAdsPagination, setMatrixAdsPagination,
    matrixAdsPaginationRef,
    editingMatrixAdsId, setEditingMatrixAdsId,
    matrixCampainName, setMatrixCampainName,
    matrixCampainCountry, setMatrixCampainCountry,
    matrixLandingPageUrl, setMatrixLandingPageUrl,
    matrixDynamicProxyInfo, setMatrixDynamicProxyInfo,
    matrixDynamicProxyInfoBackup, setMatrixDynamicProxyInfoBackup,
    matrixIntervalTime, setMatrixIntervalTime,
    matrixStatus, setMatrixStatus,
    matrixAffiliateRows, setMatrixAffiliateRows,
    savingMatrixAds, setSavingMatrixAds,
    showMatrixAdsModal, setShowMatrixAdsModal,
    matrixAdsFilters, setMatrixAdsFilters,
    matrixAdsQueryApplied, setMatrixAdsQueryApplied,
    matrixAdsFiltersRef,
    loadMatrixAds,
  } = useMatrixAds(token)

  const {
    platforms, setPlatforms,
    platformsLoading,
    platformsError, setPlatformsError,
    platformsMessage, setPlatformsMessage,
    platformList, setPlatformList,
    platformListLoading,
    platformPagination, setPlatformPagination,
    platformPaginationRef,
    editingPlatformId, setEditingPlatformId,
    platformName, setPlatformName,
    paymentMethod, setPaymentMethod,
    platformRemarks, setPlatformRemarks,
    savingPlatform, setSavingPlatform,
    showPlatformModal, setShowPlatformModal,
    loadPlatformOptions,
    loadPlatformList,
  } = usePlatforms(token)

  const {
    emails, setEmails,
    emailsLoading,
    emailsError, setEmailsError,
    emailsMessage, setEmailsMessage,
    emailPagination, setEmailPagination,
    emailPaginationRef,
    emailFilters, setEmailFilters,
    emailQueryApplied, setEmailQueryApplied,
    emailFiltersRef,
    editingEmailId, setEditingEmailId,
    emailUserName, setEmailUserName,
    emailBirthdayDate, setEmailBirthdayDate,
    emailAddress, setEmailAddress,
    emailPassword, setEmailPassword,
    emailParentEmail, setEmailParentEmail,
    emailHomeAddress, setEmailHomeAddress,
    emailRemarks, setEmailRemarks,
    savingEmail, setSavingEmail,
    showEmailModal, setShowEmailModal,
    loadToolEmails,
  } = useEmails(token)

  const {
    accounts, setAccounts,
    accountsLoading,
    accountsError, setAccountsError,
    accountsMessage, setAccountsMessage,
    accountPagination, setAccountPagination,
    accountPaginationRef,
    accountFilters, setAccountFilters,
    accountQueryApplied, setAccountQueryApplied,
    accountFiltersRef,
    editingAccountId, setEditingAccountId,
    accountEmailAddress, setAccountEmailAddress,
    accountUserName, setAccountUserName,
    accountPlatformName, setAccountPlatformName,
    accountPaymentStatus, setAccountPaymentStatus,
    accountStatus, setAccountStatus,
    accountRegisterDate, setAccountRegisterDate,
    accountBalance, setAccountBalance,
    accountCurrency, setAccountCurrency,
    accountRemarks, setAccountRemarks,
    savingAccount, setSavingAccount,
    showAccountModal, setShowAccountModal,
    loadToolAccounts,
  } = useAccounts(token)
  const [accountEmailOptionsSource, setAccountEmailOptionsSource] = useState([])
  const [accountEmailOptionsLoading, setAccountEmailOptionsLoading] = useState(false)
  const [ownerFilterOptionsSource, setOwnerFilterOptionsSource] = useState([])
  const [ownerFilterOptionsLoading, setOwnerFilterOptionsLoading] = useState(false)

  const {
    adsAccounts,
    adsAccountsLoading,
    adsAccountsError, setAdsAccountsError,
    adsAccountsMessage, setAdsAccountsMessage,
    adsAccountPagination,
    adsAccountPaginationRef,
    adsAccountFilters, setAdsAccountFilters,
    adsAccountQueryApplied, setAdsAccountQueryApplied,
    adsAccountFiltersRef,
    editingAdsAccountId, setEditingAdsAccountId,
    adsAccountValue, setAdsAccountValue,
    adsAccountType, setAdsAccountType,
    adsAccountAgencyPlatform, setAdsAccountAgencyPlatform,
    adsAccountMccAccount, setAdsAccountMccAccount,
    adsAccountStatus, setAdsAccountStatus,
    savingAdsAccount, setSavingAdsAccount,
    showAdsAccountModal, setShowAdsAccountModal,
    loadAdsAccounts,
  } = useAdsAccounts(token)

  const {
    affiliateJobDetails, setAffiliateJobDetails,
    affiliateJobDetailsLoading, setAffiliateJobDetailsLoading,
    affiliateJobDetailsError, setAffiliateJobDetailsError,
    affiliateJobDetailsMessage, setAffiliateJobDetailsMessage,
    affiliateJobDetailPagination, setAffiliateJobDetailPagination,
    affiliateJobDetailPaginationRef,
    affiliateJobDetailFilters, setAffiliateJobDetailFilters,
    affiliateJobDetailQueryApplied, setAffiliateJobDetailQueryApplied,
    affiliateJobDetailFiltersRef,
    loadAffiliateJobDetails,
  } = useAffiliateJobDetails(token)

  const {
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
  } = useAffiliateSyncConfigs(token)
  const [affiliateSyncConfigOptionsSource, setAffiliateSyncConfigOptionsSource] = useState([])
  const [affiliateSyncConfigOptionsLoading, setAffiliateSyncConfigOptionsLoading] = useState(false)
  const [ipProxyOptionsSource, setIpProxyOptionsSource] = useState([])
  const [ipProxyOptionsLoading, setIpProxyOptionsLoading] = useState(false)
  const showAdminOwnerFilter = useMemo(() => isAdminRole(currentUserRole), [currentUserRole])
  const loggedInAdsOwner = useMemo(() => getLoggedInAdsOwner(identifier, currentUser), [identifier, currentUser])

  const {
    affiliateSyncResults, setAffiliateSyncResults,
    affiliateSyncResultsLoading, setAffiliateSyncResultsLoading,
    affiliateSyncResultsError, setAffiliateSyncResultsError,
    affiliateSyncResultsMessage, setAffiliateSyncResultsMessage,
    affiliateSyncResultPagination, setAffiliateSyncResultPagination,
    affiliateSyncResultPaginationRef,
    affiliateSyncResultFilters, setAffiliateSyncResultFilters,
    affiliateSyncResultQueryApplied, setAffiliateSyncResultQueryApplied,
    affiliateSyncResultFiltersRef,
    loadAffiliateSyncResults,
  } = useAffiliateSyncResults(token, loggedInAdsOwner, showAdminOwnerFilter)
  const [runningAffiliateSyncResultId, setRunningAffiliateSyncResultId] = useState(null)

  const {
    affiliateTestResults, setAffiliateTestResults,
    affiliateTestResultsLoading, setAffiliateTestResultsLoading,
    affiliateTestResultsError, setAffiliateTestResultsError,
    affiliateTestResultsMessage, setAffiliateTestResultsMessage,
    affiliateTestResultPagination, setAffiliateTestResultPagination,
    affiliateTestResultPaginationRef,
    affiliateTestResultFilters, setAffiliateTestResultFilters,
    affiliateTestResultQueryApplied, setAffiliateTestResultQueryApplied,
    affiliateTestResultFiltersRef,
    editingAffiliateTestResultId, setEditingAffiliateTestResultId,
    affiliateTestResultNetwork, setAffiliateTestResultNetwork,
    affiliateTestResultRegion, setAffiliateTestResultRegion,
    affiliateTestResultSiteName, setAffiliateTestResultSiteName,
    affiliateTestResultSiteUrl, setAffiliateTestResultSiteUrl,
    affiliateTestResultTrackingUrl, setAffiliateTestResultTrackingUrl,
    affiliateTestResultFinalUrl, setAffiliateTestResultFinalUrl,
    affiliateTestResultStatus, setAffiliateTestResultStatus,
    affiliateTestResultAdsOwner, setAffiliateTestResultAdsOwner,
    savingAffiliateTestResult, setSavingAffiliateTestResult,
    showAffiliateTestResultModal, setShowAffiliateTestResultModal,
    loadAffiliateTestResults,
  } = useAffiliateTestResults(token, loggedInAdsOwner, showAdminOwnerFilter)

  const {
    affiliateSyncTasks, setAffiliateSyncTasks,
    affiliateSyncTasksLoading, setAffiliateSyncTasksLoading,
    affiliateSyncTasksError, setAffiliateSyncTasksError,
    affiliateSyncTasksMessage, setAffiliateSyncTasksMessage,
    affiliateSyncTaskPagination, setAffiliateSyncTaskPagination,
    affiliateSyncTaskPaginationRef,
    affiliateSyncTaskFilters, setAffiliateSyncTaskFilters,
    affiliateSyncTaskQueryApplied, setAffiliateSyncTaskQueryApplied,
    affiliateSyncTaskFiltersRef,
    editingAffiliateSyncTaskId, setEditingAffiliateSyncTaskId,
    affiliateSyncTaskConfigId, setAffiliateSyncTaskConfigId,
    affiliateSyncTaskRegion, setAffiliateSyncTaskRegion,
    affiliateSyncTaskType, setAffiliateSyncTaskType,
    affiliateSyncTaskCron, setAffiliateSyncTaskCron,
    affiliateSyncTaskTotalCount, setAffiliateSyncTaskTotalCount,
    affiliateSyncTaskSuccessCount, setAffiliateSyncTaskSuccessCount,
    affiliateSyncTaskFailedCount, setAffiliateSyncTaskFailedCount,
    affiliateSyncTaskStatus, setAffiliateSyncTaskStatus,
    affiliateSyncTaskAdsOwner, setAffiliateSyncTaskAdsOwner,
    savingAffiliateSyncTask, setSavingAffiliateSyncTask,
    runningAffiliateSyncTaskId, setRunningAffiliateSyncTaskId,
    showAffiliateSyncTaskModal, setShowAffiliateSyncTaskModal,
    loadAffiliateSyncTasks,
  } = useAffiliateSyncTasks(token)

  const {
    affiliateTestTasks, setAffiliateTestTasks,
    affiliateTestTasksLoading, setAffiliateTestTasksLoading,
    affiliateTestTasksError, setAffiliateTestTasksError,
    affiliateTestTasksMessage, setAffiliateTestTasksMessage,
    affiliateTestTaskPagination, setAffiliateTestTaskPagination,
    affiliateTestTaskPaginationRef,
    affiliateTestTaskFilters, setAffiliateTestTaskFilters,
    affiliateTestTaskQueryApplied, setAffiliateTestTaskQueryApplied,
    affiliateTestTaskFiltersRef,
    editingAffiliateTestTaskId, setEditingAffiliateTestTaskId,
    affiliateTestTaskConfigId, setAffiliateTestTaskConfigId,
    affiliateTestTaskRegion, setAffiliateTestTaskRegion,
    affiliateTestTaskIpProxyInfoId, setAffiliateTestTaskIpProxyInfoId,
    affiliateTestTaskTotalCount, setAffiliateTestTaskTotalCount,
    affiliateTestTaskSuccessCount, setAffiliateTestTaskSuccessCount,
    affiliateTestTaskFailedCount, setAffiliateTestTaskFailedCount,
    affiliateTestTaskStatus, setAffiliateTestTaskStatus,
    affiliateTestTaskAdsOwner, setAffiliateTestTaskAdsOwner,
    savingAffiliateTestTask, setSavingAffiliateTestTask,
    runningAffiliateTestTaskId, setRunningAffiliateTestTaskId,
    showAffiliateTestTaskModal, setShowAffiliateTestTaskModal,
    loadAffiliateTestTasks,
  } = useAffiliateTestTasks(token)

  const {
    affiliateTriggers, setAffiliateTriggers,
    affiliateTriggersLoading, setAffiliateTriggersLoading,
    affiliateTriggersError, setAffiliateTriggersError,
    affiliateTriggersMessage, setAffiliateTriggersMessage,
    affiliateTriggerPagination, setAffiliateTriggerPagination,
    affiliateTriggerPaginationRef,
    affiliateTriggerFilters, setAffiliateTriggerFilters,
    affiliateTriggerQueryApplied, setAffiliateTriggerQueryApplied,
    affiliateTriggerFiltersRef,
    loadAffiliateTriggers,
  } = useAffiliateTriggers(token)

  const {
    ipProxies, setIpProxies,
    ipProxiesLoading, setIpProxiesLoading,
    ipProxiesError, setIpProxiesError,
    ipProxiesMessage, setIpProxiesMessage,
    ipProxyPagination, setIpProxyPagination,
    ipProxyPaginationRef,
    ipProxyFilters, setIpProxyFilters,
    ipProxyQueryApplied, setIpProxyQueryApplied,
    ipProxyFiltersRef,
    editingIpProxyId, setEditingIpProxyId,
    ipProxyType, setIpProxyType,
    ipProxyProtocol, setIpProxyProtocol,
    ipProxyInfo, setIpProxyInfo,
    ipProxyStatus, setIpProxyStatus,
    ipProxyAdsOwner, setIpProxyAdsOwner,
    savingIpProxy, setSavingIpProxy,
    showIpProxyModal, setShowIpProxyModal,
    loadIpProxies,
  } = useIpProxies(token)

  const {
    paypals, setPaypals,
    paypalsLoading,
    paypalsError, setPaypalsError,
    paypalsMessage, setPaypalsMessage,
    paypalPagination, setPaypalPagination,
    paypalPaginationRef,
    paypalFilters, setPaypalFilters,
    paypalQueryApplied, setPaypalQueryApplied,
    paypalFiltersRef,
    editingPaypalId, setEditingPaypalId,
    paypalEmail, setPaypalEmail,
    paypalPrimaryEmail, setPaypalPrimaryEmail,
    paypalIdValue, setPaypalIdValue,
    savingPaypal, setSavingPaypal,
    showPaypalModal, setShowPaypalModal,
    loadToolPaypals,
  } = usePaypals(token)

  const {
    incomes, setIncomes,
    incomesLoading,
    incomesError, setIncomesError,
    incomesMessage, setIncomesMessage,
    incomePagination, setIncomePagination,
    incomePaginationRef,
    incomeFilters, setIncomeFilters,
    incomeQueryApplied, setIncomeQueryApplied,
    incomeFiltersRef,
    editingIncomeId, setEditingIncomeId,
    incomePlatformName, setIncomePlatformName,
    incomeUserName, setIncomeUserName,
    incomeAmount, setIncomeAmount,
    incomeCurrency, setIncomeCurrency,
    incomePaymentMethod, setIncomePaymentMethod,
    incomePaypalAccount, setIncomePaypalAccount,
    incomePayoutDate, setIncomePayoutDate,
    incomeRemarks, setIncomeRemarks,
    savingIncome, setSavingIncome,
    showIncomeModal, setShowIncomeModal,
    loadToolIncomes,
  } = useIncomes(token)
  const [paypalAccountOptionsSource, setPaypalAccountOptionsSource] = useState([])
  const [paypalAccountOptionsLoading, setPaypalAccountOptionsLoading] = useState(false)

  const {
    outcomes, setOutcomes,
    outcomesLoading,
    outcomesError, setOutcomesError,
    outcomesMessage, setOutcomesMessage,
    outcomePagination, setOutcomePagination,
    outcomePaginationRef,
    outcomeFilters, setOutcomeFilters,
    outcomeQueryApplied, setOutcomeQueryApplied,
    outcomeFiltersRef,
    editingOutcomeId, setEditingOutcomeId,
    outcomeType, setOutcomeType,
    outcomeAmount, setOutcomeAmount,
    outcomeCurrency, setOutcomeCurrency,
    outcomePayDate, setOutcomePayDate,
    outcomeRemarks, setOutcomeRemarks,
    savingOutcome, setSavingOutcome,
    showOutcomeModal, setShowOutcomeModal,
    loadToolOutcomes,
  } = useOutcomes(token)
  const isAuthenticated = useMemo(() => Boolean(token), [token])

  const platformOptions = useMemo(() => {
    const names = new Set()

    platformList.forEach((item) => {
      if (item?.platformName) {
        names.add(item.platformName)
      }
    })

    platforms.forEach((item) => {
      if (item?.platformName) {
        names.add(item.platformName)
      }
    })

    const editingPlatformName =
      editingAdsOriginal?.platformName || editingAdsOriginal?.platform
    if (editingPlatformName) {
      names.add(editingPlatformName)
    }

    return sortNamesAscending(names)
  }, [editingAdsOriginal, platformList, platforms])

  const roleOptions = useMemo(() => {
    const names = new Set()

    roles.forEach((item) => {
      if (item?.roleName) {
        names.add(item.roleName)
      }
    })

    if (userRole) {
      names.add(userRole)
    }

    return sortNamesAscending(names)
  }, [roles, userRole])

  const adsUrlColumns = ADS_URL_COLUMNS

  const shiftLinkLogColumns = SHIFT_LINK_LOG_COLUMNS

  const adsStatusOptions = ADS_STATUS_OPTIONS

  const paymentMethodOptions = PAYMENT_METHOD_OPTIONS

  const outcomeTypeOptions = OUTCOME_TYPE_OPTIONS

  const accountStatusOptions = ACCOUNT_STATUS_OPTIONS

  const accountPaymentStatusOptions = ACCOUNT_PAYMENT_STATUS_OPTIONS

  const accountCurrencyOptions = ACCOUNT_CURRENCY_OPTIONS

  const adsAccountTypeOptions = ADS_ACCOUNT_TYPE_OPTIONS

  const adsAccountAgencyPlatformOptions = ADS_ACCOUNT_AGENCY_PLATFORM_OPTIONS

  const adsAccountStatusOptions = ADS_ACCOUNT_STATUS_OPTIONS

  const affiliateSyncMethodOptions = AFFILIATE_SYNC_METHOD_OPTIONS

  const affiliateSyncResponseFormatOptions = AFFILIATE_SYNC_RESPONSE_FORMAT_OPTIONS

  const affiliateSyncTypeOptions = AFFILIATE_SYNC_TYPE_OPTIONS

  const affiliateSyncConfigOptions = useMemo(() => {
    const optionsById = new Map()

    affiliateSyncConfigOptionsSource.forEach((item) => {
      const id = item?.id
      if (id == null || optionsById.has(String(id))) {
        return
      }

      const syncName = toOptionalTrimmedString(item?.syncName)
      const affiliateNetwork = toOptionalTrimmedString(item?.affiliateNetwork)
      const label = syncName && affiliateNetwork
        ? `${syncName} (${affiliateNetwork})`
        : syncName || affiliateNetwork || `Config #${id}`

      optionsById.set(String(id), {
        value: String(id),
        label,
      })
    })

    ;[affiliateSyncTaskConfigId, affiliateTestTaskConfigId].forEach((selectedId) => {
      if (!selectedId || optionsById.has(String(selectedId))) {
        return
      }

      optionsById.set(String(selectedId), {
        value: String(selectedId),
        label: `Config #${selectedId}`,
      })
    })

    return Array.from(optionsById.values()).sort((left, right) =>
      String(left.label).localeCompare(String(right.label)),
    )
  }, [affiliateSyncConfigOptionsSource, affiliateSyncTaskConfigId, affiliateTestTaskConfigId])

  const ipProxyOptions = useMemo(() => {
    const optionsById = new Map()

    ipProxyOptionsSource.forEach((item) => {
      const id = item?.id
      if (id == null || optionsById.has(String(id))) {
        return
      }

      const proxyInfo = toOptionalTrimmedString(item?.proxyInfo)
      const label = proxyInfo ? `${proxyInfo} (#${id})` : `IP Proxy #${id}`

      optionsById.set(String(id), {
        value: String(id),
        label,
      })
    })

    if (affiliateTestTaskIpProxyInfoId && !optionsById.has(String(affiliateTestTaskIpProxyInfoId))) {
      optionsById.set(String(affiliateTestTaskIpProxyInfoId), {
        value: String(affiliateTestTaskIpProxyInfoId),
        label: `IP Proxy #${affiliateTestTaskIpProxyInfoId}`,
      })
    }

    return Array.from(optionsById.values()).sort((left, right) =>
      String(left.label).localeCompare(String(right.label)),
    )
  }, [affiliateTestTaskIpProxyInfoId, ipProxyOptionsSource])

  const adsTypeOptions = useMemo(() => buildAdsTypeOptions(currentUserRole), [currentUserRole])

  const defaultShiftLinkLogAdsType = useMemo(
    () => (adsTypeOptions.length === 1 ? adsTypeOptions[0].value : ''),
    [adsTypeOptions],
  )

  const allowedShiftLinkLogAdsTypes = useMemo(
    () => new Set(adsTypeOptions.map((option) => option.value)),
    [adsTypeOptions],
  )

  const baseAvailableShiftLinkLogCatalog = useMemo(() => {
    return shiftLinkLogCatalog.filter((item) => {
      const adsType = normalizeShiftLinkAdsType(firstDefinedValue(item, ['adsType', 'ads_type']))
      return (
        adsType &&
        allowedShiftLinkLogAdsTypes.has(adsType) &&
        (showAdminOwnerFilter || isOwnedByCurrentUser(item, currentUserProfile, currentUser, identifier))
      )
    })
  }, [
    shiftLinkLogCatalog,
    allowedShiftLinkLogAdsTypes,
    currentUserProfile,
    currentUser,
    identifier,
    showAdminOwnerFilter,
  ])

  const availableShiftLinkLogCatalog = useMemo(() => {
    const selectedOwnerPhoneNumber = toOptionalTrimmedString(shiftLinkLogFilters.ownerPhoneNumber)
    if (!selectedOwnerPhoneNumber) {
      return baseAvailableShiftLinkLogCatalog
    }

    const normalizedOwnerPhoneNumber = normalizeHeader(selectedOwnerPhoneNumber)
    return baseAvailableShiftLinkLogCatalog.filter((item) => {
      const itemOwner = firstDefinedValue(item, ['adsOwner', 'owner', 'userPhoneNumber'])
      return normalizeHeader(itemOwner) === normalizedOwnerPhoneNumber
    })
  }, [baseAvailableShiftLinkLogCatalog, shiftLinkLogFilters.ownerPhoneNumber])

  const availableAdsUrlCatalog = useMemo(() => {
    const selectedOwnerPhoneNumber = toOptionalTrimmedString(adsUrlFilters.ownerPhoneNumber)
    if (!selectedOwnerPhoneNumber) {
      return baseAvailableShiftLinkLogCatalog
    }

    const normalizedOwnerPhoneNumber = normalizeHeader(selectedOwnerPhoneNumber)
    return baseAvailableShiftLinkLogCatalog.filter((item) => {
      const itemOwner = firstDefinedValue(item, ['adsOwner', 'owner', 'userPhoneNumber'])
      return normalizeHeader(itemOwner) === normalizedOwnerPhoneNumber
    })
  }, [adsUrlFilters.ownerPhoneNumber, baseAvailableShiftLinkLogCatalog])

  const shiftLinkLogAdsNameOptions = useMemo(
    () =>
      collectCatalogFieldNames(availableShiftLinkLogCatalog, {
        field: CATALOG_ADS_NAME_FIELDS,
        adsType: shiftLinkLogFilters.adsType,
      }),
    [availableShiftLinkLogCatalog, shiftLinkLogFilters.adsType],
  )

  const shiftLinkLogPlatformOptions = useMemo(
    () =>
      collectCatalogFieldNames(availableShiftLinkLogCatalog, {
        field: CATALOG_PLATFORM_NAME_FIELDS,
        adsType: shiftLinkLogFilters.adsType,
        adsName: shiftLinkLogFilters.adsName,
      }),
    [availableShiftLinkLogCatalog, shiftLinkLogFilters.adsName, shiftLinkLogFilters.adsType],
  )

  const adsUrlAdsNameOptions = useMemo(
    () =>
      collectCatalogFieldNames(availableAdsUrlCatalog, {
        field: CATALOG_ADS_NAME_FIELDS,
        adsType: adsUrlFilters.adsType,
      }),
    [adsUrlFilters.adsType, availableAdsUrlCatalog],
  )

  const adsUrlPlatformOptions = useMemo(
    () =>
      collectCatalogFieldNames(availableAdsUrlCatalog, {
        field: CATALOG_PLATFORM_NAME_FIELDS,
        adsType: adsUrlFilters.adsType,
        adsName: adsUrlFilters.adsName,
      }),
    [adsUrlFilters.adsName, adsUrlFilters.adsType, availableAdsUrlCatalog],
  )

  const toolEmailUserOptions = useMemo(() => {
    const usersByName = new Map()

    const addUserOption = (rawUserName, rawEmailAddress = '') => {
      const userName = toOptionalTrimmedString(rawUserName)
      if (!userName || usersByName.has(userName)) {
        return
      }

      usersByName.set(userName, {
        userName,
        emailAddress: toOptionalTrimmedString(rawEmailAddress) || '',
      })
    }

    accountEmailOptionsSource.forEach((item) => {
      addUserOption(item?.userName, item?.emailAddress)
    })

    addUserOption(accountUserName, accountEmailAddress)
    addUserOption(incomeUserName)
    addUserOption(accountFilters.userName)
    addUserOption(incomeFilters.userName)

    return Array.from(usersByName.values()).sort((left, right) =>
      String(left.userName).localeCompare(String(right.userName)),
    )
  }, [
    accountEmailAddress,
    accountEmailOptionsSource,
    accountFilters.userName,
    accountUserName,
    incomeFilters.userName,
    incomeUserName,
  ])

  const ownerFilterOptions = useMemo(() => {
    const usersByPhoneNumber = new Map()

    const addOwnerOption = (user) => {
      const userName = toOptionalTrimmedString(user?.userName)
      const userPhoneNumber = toOptionalTrimmedString(user?.userPhoneNumber)
      if (!userName || !userPhoneNumber || usersByPhoneNumber.has(userPhoneNumber)) {
        return
      }

      usersByPhoneNumber.set(userPhoneNumber, {
        label: userName,
        value: userPhoneNumber,
      })
    }

    ownerFilterOptionsSource.forEach(addOwnerOption)
    addOwnerOption(currentUserProfile)

    return Array.from(usersByPhoneNumber.values()).sort((left, right) =>
      String(left.label).localeCompare(String(right.label)),
    )
  }, [currentUserProfile, ownerFilterOptionsSource])

  const paypalAccountOptions = useMemo(() => {
    const accountsByEmail = new Map()

    paypalAccountOptionsSource.forEach((item) => {
      const account = toOptionalTrimmedString(item?.paypalEmail)
      if (!account) {
        return
      }

      if (!accountsByEmail.has(account)) {
        accountsByEmail.set(account, item)
      }
    })

    const currentPaypalAccount = toOptionalTrimmedString(incomePaypalAccount)
    if (currentPaypalAccount && !accountsByEmail.has(currentPaypalAccount)) {
      accountsByEmail.set(currentPaypalAccount, {
        paypalEmail: currentPaypalAccount,
        primaryEmail: toOptionalTrimmedString(paypalPrimaryEmail) || '',
      })
    }

    return Array.from(accountsByEmail.values()).sort((left, right) =>
      String(left.paypalEmail).localeCompare(String(right.paypalEmail)),
    )
  }, [incomePaypalAccount, paypalPrimaryEmail, paypalAccountOptionsSource])

  const normalAdsColumns = useMemo(
    () => buildDynamicColumns(normalAds, NORMAL_ADS_PREFERRED_COLUMNS, NORMAL_ADS_EXCLUDED_COLUMNS),
    [normalAds],
  )

  const matrixAdsColumns = useMemo(
    () => buildDynamicColumns(matrixAds, MATRIX_ADS_PREFERRED_COLUMNS, MATRIX_ADS_EXCLUDED_COLUMNS),
    [matrixAds],
  )

  const canCreateNormalAds = useMemo(() => {
    if (normalAdsTotalCount == null) {
      return true
    }

    return runningNormalAdsCount < normalAdsTotalCount
  }, [normalAdsTotalCount, runningNormalAdsCount])

  const canCreateMatrixAds = useMemo(() => {
    if (matrixAdsTotalCount == null) {
      return true
    }

    return runningMatrixAdsCount < matrixAdsTotalCount
  }, [matrixAdsTotalCount, runningMatrixAdsCount])

  const normalAdsQuotaMessage = useMemo(() => {
    if (normalAdsTotalCount == null) {
      return ''
    }

    return `Running/Total: ${runningNormalAdsCount} / ${normalAdsTotalCount}`
  }, [normalAdsTotalCount, runningNormalAdsCount])

  const matrixAdsQuotaMessage = useMemo(() => {
    if (matrixAdsTotalCount == null) {
      return ''
    }

    return `Running/Total: ${runningMatrixAdsCount} / ${matrixAdsTotalCount}`
  }, [matrixAdsTotalCount, runningMatrixAdsCount])

  function clearUserForm() {
    setEditingUserId(null)
    setUserName('')
    setUserEmail('')
    setUserPhoneNumber('')
    setUserPassword('')
    setUserRole('')
    setExpireDate('')
    setUserStatus('ENABLED')
  }

  function openCreateUser() {
    clearUserForm()
    setUsersError('')
    setShowUserModal(true)
  }

  function clearAdsForm() {
    setEditingAdsId(null)
    setEditingAdsOriginal(null)
    setCapMainName('')
    setAdsType(adsTypeOptions.length === 1 ? adsTypeOptions[0].value : '')
    setPlatform('')
    setFullUrl('')
    setDisplayNumber('')
    setRemark('')
  }

  function openCreateAds() {
    clearAdsForm()
    setAdsError('')
    setShowAdsModal(true)
  }

  function handleAdsUrlFiltersChange(nextFilters) {
    setAdsUrlFilters(nextFilters)
    setAdsUrlQueryApplied(false)
  }

  function handleShiftLinkLogFiltersChange(nextFilters) {
    setShiftLinkLogFilters(nextFilters)
    setShiftLinkLogQueryApplied(false)
    setShiftLinkLogs([])
    setShiftLinkLogsError('')
    setShiftLinkLogsLoaded(false)
    setShiftLinkLogPagination((current) => createInitialPagination(current.size))
  }

  function handleUsersPageChange(page) {
    void loadUsers({
      page,
      size: usersPaginationRef.current.size,
    })
  }

  function handleUsersPageSizeChange(size) {
    void loadUsers({
      page: 0,
      size,
    })
  }

  function handleAdsUrlPageChange(page) {
    void loadAdsUrls(adsUrlQueryApplied ? adsUrlFiltersRef.current : {}, {
      page,
      size: adsUrlPaginationRef.current.size,
    })
  }

  function handleAdsUrlPageSizeChange(size) {
    void loadAdsUrls(adsUrlQueryApplied ? adsUrlFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleNormalAdsPageChange(page) {
    void loadNormalAds(normalAdsQueryApplied ? normalAdsFiltersRef.current : {}, {
      page,
      size: normalAdsPaginationRef.current.size,
    })
  }

  function handleNormalAdsPageSizeChange(size) {
    void loadNormalAds(normalAdsQueryApplied ? normalAdsFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleMatrixAdsPageChange(page) {
    void loadMatrixAds(matrixAdsQueryApplied ? matrixAdsFiltersRef.current : {}, {
      page,
      size: matrixAdsPaginationRef.current.size,
    })
  }

  function handleMatrixAdsPageSizeChange(size) {
    void loadMatrixAds(matrixAdsQueryApplied ? matrixAdsFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleEmailPageChange(page) {
    void loadToolEmails(emailQueryApplied ? emailFiltersRef.current : {}, {
      page,
      size: emailPaginationRef.current.size,
    })
  }

  function handleEmailPageSizeChange(size) {
    void loadToolEmails(emailQueryApplied ? emailFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleAccountPageChange(page) {
    void loadToolAccounts(accountQueryApplied ? accountFiltersRef.current : {}, {
      page,
      size: accountPaginationRef.current.size,
    })
  }

  function handleAccountPageSizeChange(size) {
    void loadToolAccounts(accountQueryApplied ? accountFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleAdsAccountPageChange(page) {
    void loadAdsAccounts(adsAccountQueryApplied ? adsAccountFiltersRef.current : {}, {
      page,
      size: adsAccountPaginationRef.current.size,
    })
  }

  function handleAdsAccountPageSizeChange(size) {
    void loadAdsAccounts(adsAccountQueryApplied ? adsAccountFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleIpProxyPageChange(page) {
    void loadIpProxies(ipProxyQueryApplied ? ipProxyFiltersRef.current : {}, {
      page,
      size: ipProxyPaginationRef.current.size,
    })
  }

  function handleIpProxyPageSizeChange(size) {
    void loadIpProxies(ipProxyQueryApplied ? ipProxyFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleAffiliateSyncTaskPageChange(page) {
    void loadAffiliateSyncTasks(
      affiliateSyncTaskQueryApplied ? affiliateSyncTaskFiltersRef.current : {},
      {
        page,
        size: affiliateSyncTaskPaginationRef.current.size,
      },
    )
  }

  function handleAffiliateSyncTaskPageSizeChange(size) {
    void loadAffiliateSyncTasks(
      affiliateSyncTaskQueryApplied ? affiliateSyncTaskFiltersRef.current : {},
      {
        page: 0,
        size,
      },
    )
  }

  function handleAffiliateTestTaskPageChange(page) {
    void loadAffiliateTestTasks(
      affiliateTestTaskQueryApplied ? affiliateTestTaskFiltersRef.current : {},
      {
        page,
        size: affiliateTestTaskPaginationRef.current.size,
      },
    )
  }

  function handleAffiliateTestTaskPageSizeChange(size) {
    void loadAffiliateTestTasks(
      affiliateTestTaskQueryApplied ? affiliateTestTaskFiltersRef.current : {},
      {
        page: 0,
        size,
      },
    )
  }

  function handleAffiliateTestResultPageChange(page) {
    void loadAffiliateTestResults(
      affiliateTestResultQueryApplied ? affiliateTestResultFiltersRef.current : {},
      {
        page,
        size: affiliateTestResultPaginationRef.current.size,
      },
    )
  }

  function handleAffiliateTestResultPageSizeChange(size) {
    void loadAffiliateTestResults(
      affiliateTestResultQueryApplied ? affiliateTestResultFiltersRef.current : {},
      {
        page: 0,
        size,
      },
    )
  }

  function handleAffiliateSyncResultPageChange(page) {
    void loadAffiliateSyncResults(
      affiliateSyncResultQueryApplied ? affiliateSyncResultFiltersRef.current : {},
      {
        page,
        size: affiliateSyncResultPaginationRef.current.size,
      },
    )
  }

  function handleAffiliateSyncResultPageSizeChange(size) {
    void loadAffiliateSyncResults(
      affiliateSyncResultQueryApplied ? affiliateSyncResultFiltersRef.current : {},
      {
        page: 0,
        size,
      },
    )
  }

  function handleAffiliateSyncConfigPageChange(page) {
    void loadAffiliateSyncConfigs(
      affiliateSyncConfigQueryApplied ? affiliateSyncConfigFiltersRef.current : {},
      {
        page,
        size: affiliateSyncConfigPaginationRef.current.size,
      },
    )
  }

  function handleAffiliateSyncConfigPageSizeChange(size) {
    void loadAffiliateSyncConfigs(
      affiliateSyncConfigQueryApplied ? affiliateSyncConfigFiltersRef.current : {},
      {
        page: 0,
        size,
      },
    )
  }

  function handleAffiliateJobDetailPageChange(page) {
    void loadAffiliateJobDetails(
      affiliateJobDetailQueryApplied ? affiliateJobDetailFiltersRef.current : {},
      {
        page,
        size: affiliateJobDetailPaginationRef.current.size,
      },
    )
  }

  function handleAffiliateJobDetailPageSizeChange(size) {
    void loadAffiliateJobDetails(
      affiliateJobDetailQueryApplied ? affiliateJobDetailFiltersRef.current : {},
      {
        page: 0,
        size,
      },
    )
  }

  function handleAffiliateTriggerPageChange(page) {
    void loadAffiliateTriggers(affiliateTriggerQueryApplied ? affiliateTriggerFiltersRef.current : {}, {
      page,
      size: affiliateTriggerPaginationRef.current.size,
    })
  }

  function handleAffiliateTriggerPageSizeChange(size) {
    void loadAffiliateTriggers(affiliateTriggerQueryApplied ? affiliateTriggerFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handlePaypalPageChange(page) {
    void loadToolPaypals(paypalQueryApplied ? paypalFiltersRef.current : {}, {
      page,
      size: paypalPaginationRef.current.size,
    })
  }

  function handlePaypalPageSizeChange(size) {
    void loadToolPaypals(paypalQueryApplied ? paypalFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleIncomePageChange(page) {
    void loadToolIncomes(incomeQueryApplied ? incomeFiltersRef.current : {}, {
      page,
      size: incomePaginationRef.current.size,
    })
  }

  function handleIncomePageSizeChange(size) {
    void loadToolIncomes(incomeQueryApplied ? incomeFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handleOutcomePageChange(page) {
    void loadToolOutcomes(outcomeQueryApplied ? outcomeFiltersRef.current : {}, {
      page,
      size: outcomePaginationRef.current.size,
    })
  }

  function handleOutcomePageSizeChange(size) {
    void loadToolOutcomes(outcomeQueryApplied ? outcomeFiltersRef.current : {}, {
      page: 0,
      size,
    })
  }

  function handlePlatformPageChange(page) {
    void loadPlatformList({
      page,
      size: platformPaginationRef.current.size,
    })
  }

  function handlePlatformPageSizeChange(size) {
    void loadPlatformList({
      page: 0,
      size,
    })
  }

  function clearUserAgentForm() {
    setEditingUserAgentId(null)
    setUserAgentDevice('')
    setUserAgentValue('')
  }

  function openCreateUserAgent() {
    clearUserAgentForm()
    setUserAgentsError('')
    setShowUserAgentModal(true)
  }

  async function updateAdsUrlStatus(item, status) {
    setAdsError('')
    setAdsMessage('')

    try {
      await requestApi(`/shift-links/${item.id}`, {
        method: 'PUT',
        token,
        body: {
          ...item,
          adsName: firstDefinedValue(item, ['adsName', 'capMainName', 'campainName']),
          platformName: firstDefinedValue(item, ['platformName', 'platform']),
          landingPageUrl: firstDefinedValue(item, ['landingPageUrl', 'landingUrl']),
          remarks: firstDefinedValue(item, ['remarks', 'remark']),
          status,
        },
      })
      setAdsMessage(`Shift Link marked as ${formatAdsStatusLabel(status).toLowerCase()}.`)
      await loadAdsUrls(adsUrlQueryApplied ? adsUrlFiltersRef.current : {}, adsUrlPaginationRef.current)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAdsError(message)
    }
  }

  function startEditAffiliateSyncTask(item) {
    const normalizedSyncType = String(item.syncType ?? '').trim().toUpperCase()
    setEditingAffiliateSyncTaskId(item.id)
    setAffiliateSyncTaskConfigId(
      item.affiliateAdsSyncConfigId == null ? '' : String(item.affiliateAdsSyncConfigId),
    )
    setAffiliateSyncTaskRegion(toCountryCode(item.region))
    setAffiliateSyncTaskType(normalizedSyncType === 'MANUALLY' ? 'MANUAL' : item.syncType || '')
    setAffiliateSyncTaskCron(item.cron || '')
    setAffiliateSyncTaskTotalCount(Number(item.totalCount) || 0)
    setAffiliateSyncTaskSuccessCount(Number(item.successCount) || 0)
    setAffiliateSyncTaskFailedCount(Number(item.failedCount) || 0)
    setAffiliateSyncTaskStatus(item.status || 'WAITING')
    setAffiliateSyncTaskAdsOwner(item.adsOwner || '')
    setShowAffiliateSyncTaskModal(true)
  }

  function startEditAffiliateTestTask(item) {
    setEditingAffiliateTestTaskId(item.id)
    setAffiliateTestTaskConfigId(
      item.affiliateAdsSyncConfigId == null ? '' : String(item.affiliateAdsSyncConfigId),
    )
    setAffiliateTestTaskRegion(toCountryCode(item.region))
    setAffiliateTestTaskIpProxyInfoId(item.ipProxyInfoId == null ? '' : String(item.ipProxyInfoId))
    setAffiliateTestTaskTotalCount(Number(item.totalCount) || 0)
    setAffiliateTestTaskSuccessCount(Number(item.successCount) || 0)
    setAffiliateTestTaskFailedCount(Number(item.failedCount) || 0)
    setAffiliateTestTaskStatus(item.status || 'WAITING')
    setAffiliateTestTaskAdsOwner(item.adsOwner || '')
    setShowAffiliateTestTaskModal(true)
  }

  function startEditAffiliateTestResult(item) {
    setEditingAffiliateTestResultId(item.id)
    setAffiliateTestResultNetwork(item.affiliateNetwork || '')
    setAffiliateTestResultRegion(toCountryCode(item.region))
    setAffiliateTestResultSiteName(item.siteName || '')
    setAffiliateTestResultSiteUrl(item.siteUrl || '')
    setAffiliateTestResultTrackingUrl(item.trackingUrl || '')
    setAffiliateTestResultFinalUrl(item.finalUrl || '')
    setAffiliateTestResultStatus(item.status || '')
    setAffiliateTestResultAdsOwner(item.adsOwner || loggedInAdsOwner || '')
    setShowAffiliateTestResultModal(true)
  }

  async function updateNormalAdsStatus(item, status) {
    setNormalAdsError('')
    setNormalAdsMessage('')

    try {
      await requestApi(`/normal-ads/${item.id}`, {
        method: 'PUT',
        token,
        body: {
          ...item,
          status,
        },
      })
      setNormalAdsMessage(`Normal ADs marked as ${formatAdsStatusLabel(status).toLowerCase()}.`)
      await loadNormalAds(
        normalAdsQueryApplied ? normalAdsFiltersRef.current : {},
        normalAdsPaginationRef.current,
      )
      await loadRunningAdsCounts()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setNormalAdsError(message)
    }
  }

  async function handleDeleteAffiliateSyncTask(id) {
    setAffiliateSyncTasksError('')
    setAffiliateSyncTasksMessage('')

    try {
      await requestApi(`/affiliate-ads-sync-task/${id}`, {
        method: 'DELETE',
        token,
      })
      setAffiliateSyncTasksMessage('Ads Sync Task deleted successfully.')
      await loadAffiliateSyncTasks(
        affiliateSyncTaskQueryApplied ? affiliateSyncTaskFiltersRef.current : {},
        affiliateSyncTaskPaginationRef.current,
      )
      if (editingAffiliateSyncTaskId === id) {
        clearAffiliateSyncTaskForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateSyncTasksError(message)
    }
  }

  async function handleDeleteAffiliateTestTask(id) {
    setAffiliateTestTasksError('')
    setAffiliateTestTasksMessage('')

    try {
      await requestApi(`/affiliate-ads-test-task/${id}`, {
        method: 'DELETE',
        token,
      })
      setAffiliateTestTasksMessage('Ads Test Task deleted successfully.')
      await loadAffiliateTestTasks(
        affiliateTestTaskQueryApplied ? affiliateTestTaskFiltersRef.current : {},
        affiliateTestTaskPaginationRef.current,
      )
      if (editingAffiliateTestTaskId === id) {
        clearAffiliateTestTaskForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateTestTasksError(message)
    }
  }

  async function handleDeleteAffiliateTestResult(id) {
    setAffiliateTestResultsError('')
    setAffiliateTestResultsMessage('')

    try {
      await requestApi(`/affiliate-ads-test-result/${id}`, {
        method: 'DELETE',
        token,
      })
      setAffiliateTestResultsMessage('Ads Test Result deleted successfully.')
      await loadAffiliateTestResults(
        affiliateTestResultQueryApplied ? affiliateTestResultFiltersRef.current : {},
        affiliateTestResultPaginationRef.current,
      )
      if (editingAffiliateTestResultId === id) {
        clearAffiliateTestResultForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateTestResultsError(message)
    }
  }

  async function handleRunAffiliateSyncTask(id) {
    setRunningAffiliateSyncTaskId(id)
    setAffiliateSyncTasksError('')
    setAffiliateSyncTasksMessage('')

    try {
      await requestApi(`/affiliate-ads-sync-task/${id}/syncAds`, {
        method: 'POST',
        token,
      })
      setAffiliateSyncTasksMessage('Ads Sync triggered successfully.')
      await loadAffiliateSyncTasks(
        affiliateSyncTaskQueryApplied ? affiliateSyncTaskFiltersRef.current : {},
        affiliateSyncTaskPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateSyncTasksError(message)
    } finally {
      setRunningAffiliateSyncTaskId(null)
    }
  }

  async function handleRunAffiliateTestTask(id) {
    setRunningAffiliateTestTaskId(id)
    setAffiliateTestTasksError('')
    setAffiliateTestTasksMessage('')

    try {
      await requestApi(`/affiliate-ads-test-task/${id}/testAds`, {
        method: 'POST',
        token,
      })
      setAffiliateTestTasksMessage('Ads Test triggered successfully.')
      await loadAffiliateTestTasks(
        affiliateTestTaskQueryApplied ? affiliateTestTaskFiltersRef.current : {},
        affiliateTestTaskPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateTestTasksError(message)
    } finally {
      setRunningAffiliateTestTaskId(null)
    }
  }

  async function handleTestAffiliateSyncResult(id) {
    setRunningAffiliateSyncResultId(id)
    setAffiliateSyncResultsError('')
    setAffiliateSyncResultsMessage('')

    try {
      await requestApi(`/affiliate-ads-sync/${id}/testAd`, {
        method: 'POST',
        token,
      })
      setAffiliateSyncResultsMessage('Ad test triggered successfully.')
      await loadAffiliateSyncResults(
        affiliateSyncResultQueryApplied ? affiliateSyncResultFiltersRef.current : {},
        affiliateSyncResultPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateSyncResultsError(message)
    } finally {
      setRunningAffiliateSyncResultId(null)
    }
  }

  async function updateMatrixAdsStatus(item, status) {
    setMatrixAdsError('')
    setMatrixAdsMessage('')

    try {
      await requestApi(`/matrix-ads/${item.id}`, {
        method: 'PUT',
        token,
        body: {
          ...item,
          status,
        },
      })
      setMatrixAdsMessage(`Matrix ADs marked as ${formatAdsStatusLabel(status).toLowerCase()}.`)
      await loadMatrixAds(
        matrixAdsQueryApplied ? matrixAdsFiltersRef.current : {},
        matrixAdsPaginationRef.current,
      )
      await loadRunningAdsCounts()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setMatrixAdsError(message)
    }
  }

  function openBulkAdsUpload() {
    setBulkAdsFile(null)
    setBulkAdsSaving(false)
    setBulkAdsError('')
    setBulkAdsMessage('')
    setShowBulkAdsModal(true)
  }

  function openFolderImport() {
    setFolderImportFiles(null)
    setFolderImportAdsType(defaultShiftLinkLogAdsType)
    setFolderImportDisplayNumber('100')
    setFolderImportSaving(false)
    setFolderImportError('')
    setFolderImportMessage('')
    setShowFolderImportModal(true)
  }

  function openBulkDelete() {
    setBulkDeleteMode('campaign')
    setBulkDeleteValue('')
    setBulkDeleteSaving(false)
    setBulkDeleteError('')
    setBulkDeleteMessage('')
    setShowBulkDeleteModal(true)
  }

  function clearPlatformForm() {
    setEditingPlatformId(null)
    setPlatformName('')
    setPaymentMethod('')
    setPlatformRemarks('')
  }

  function openCreatePlatform() {
    clearPlatformForm()
    setPlatformsError('')
    setShowPlatformModal(true)
  }

  function clearEmailForm() {
    setEditingEmailId(null)
    setEmailUserName('')
    setEmailBirthdayDate('')
    setEmailAddress('')
    setEmailPassword('')
    setEmailParentEmail('')
    setEmailHomeAddress('')
    setEmailRemarks('')
  }

  function openCreateEmail() {
    clearEmailForm()
    setEmailsError('')
    setShowEmailModal(true)
  }

  function clearAccountForm() {
    setEditingAccountId(null)
    setAccountEmailAddress('')
    setAccountUserName('')
    setAccountPlatformName('')
    setAccountPaymentStatus('')
    setAccountStatus('')
    setAccountRegisterDate('')
    setAccountBalance('')
    setAccountCurrency('')
    setAccountRemarks('')
  }

  function openCreateAccount() {
    clearAccountForm()
    setAccountsError('')
    setShowAccountModal(true)
  }

  function clearAdsAccountForm() {
    setEditingAdsAccountId(null)
    setAdsAccountValue('')
    setAdsAccountType('')
    setAdsAccountAgencyPlatform('')
    setAdsAccountMccAccount('')
    setAdsAccountStatus('')
  }

  function clearIpProxyForm() {
    setEditingIpProxyId(null)
    setIpProxyType('')
    setIpProxyProtocol('')
    setIpProxyInfo('')
    setIpProxyStatus('')
    setIpProxyAdsOwner('')
  }

  function clearAffiliateSyncConfigForm() {
    setEditingAffiliateSyncConfigId(null)
    setAffiliateSyncConfigNetwork('')
    setAffiliateSyncConfigName('')
    setAffiliateSyncConfigUrl('')
    setAffiliateSyncConfigMethod('')
    setAffiliateSyncConfigRequestHeaderRows([createEmptyParameterRow()])
    setAffiliateSyncConfigRequestPayloadRows([createEmptyParameterRow()])
    const responsePayloadState = createResponsePayloadState()
    setAffiliateSyncConfigResponsePayloadFormat(responsePayloadState.format)
    setAffiliateSyncConfigResponsePayload(responsePayloadState.content)
  }

  function clearAffiliateSyncTaskForm() {
    setEditingAffiliateSyncTaskId(null)
    setAffiliateSyncTaskConfigId('')
    setAffiliateSyncTaskRegion('')
    setAffiliateSyncTaskType('')
    setAffiliateSyncTaskCron('')
    setAffiliateSyncTaskTotalCount(0)
    setAffiliateSyncTaskSuccessCount(0)
    setAffiliateSyncTaskFailedCount(0)
    setAffiliateSyncTaskStatus('WAITING')
    setAffiliateSyncTaskAdsOwner('')
  }

  function clearAffiliateTestTaskForm() {
    setEditingAffiliateTestTaskId(null)
    setAffiliateTestTaskConfigId('')
    setAffiliateTestTaskRegion('')
    setAffiliateTestTaskIpProxyInfoId('')
    setAffiliateTestTaskTotalCount(0)
    setAffiliateTestTaskSuccessCount(0)
    setAffiliateTestTaskFailedCount(0)
    setAffiliateTestTaskStatus('WAITING')
    setAffiliateTestTaskAdsOwner('')
  }

  function clearAffiliateTestResultForm() {
    setEditingAffiliateTestResultId(null)
    setAffiliateTestResultNetwork('')
    setAffiliateTestResultRegion('')
    setAffiliateTestResultSiteName('')
    setAffiliateTestResultSiteUrl('')
    setAffiliateTestResultTrackingUrl('')
    setAffiliateTestResultFinalUrl('')
    setAffiliateTestResultStatus('')
    setAffiliateTestResultAdsOwner(loggedInAdsOwner || '')
  }

  function openCreateAdsAccount() {
    clearAdsAccountForm()
    setAdsAccountsError('')
    setShowAdsAccountModal(true)
  }

  function openCreateIpProxy() {
    clearIpProxyForm()
    setIpProxiesError('')
    setShowIpProxyModal(true)
  }

  function openCreateAffiliateSyncConfig() {
    clearAffiliateSyncConfigForm()
    setAffiliateSyncConfigsError('')
    setShowAffiliateSyncConfigModal(true)
  }

  function openCreateAffiliateSyncTask() {
    clearAffiliateSyncTaskForm()
    setAffiliateSyncTasksError('')
    setShowAffiliateSyncTaskModal(true)
  }

  function openCreateAffiliateTestTask() {
    clearAffiliateTestTaskForm()
    setAffiliateTestTasksError('')
    setShowAffiliateTestTaskModal(true)
  }

  function openCreateAffiliateTestResult() {
    clearAffiliateTestResultForm()
    setAffiliateTestResultsError('')
    setShowAffiliateTestResultModal(true)
  }

  function addAffiliateSyncConfigRequestPayloadRow() {
    setAffiliateSyncConfigRequestPayloadRows((current) => [...current, createEmptyParameterRow()])
  }

  function addAffiliateSyncConfigRequestHeaderRow() {
    setAffiliateSyncConfigRequestHeaderRows((current) => [...current, createEmptyParameterRow()])
  }

  function updateAffiliateSyncConfigRequestHeaderRow(index, field, value) {
    setAffiliateSyncConfigRequestHeaderRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    )
  }

  function removeAffiliateSyncConfigRequestHeaderRow(index) {
    setAffiliateSyncConfigRequestHeaderRows((current) => {
      if (current.length === 1) {
        return [createEmptyParameterRow()]
      }

      return current.filter((_, rowIndex) => rowIndex !== index)
    })
  }

  function updateAffiliateSyncConfigRequestPayloadRow(index, field, value) {
    setAffiliateSyncConfigRequestPayloadRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    )
  }

  function removeAffiliateSyncConfigRequestPayloadRow(index) {
    setAffiliateSyncConfigRequestPayloadRows((current) => {
      if (current.length === 1) {
        return [createEmptyParameterRow()]
      }

      return current.filter((_, rowIndex) => rowIndex !== index)
    })
  }

  function handleAffiliateSyncTaskTypeChange(value) {
    setAffiliateSyncTaskType(value)
    if (value !== 'SCHEDULER') {
      setAffiliateSyncTaskCron('')
    }
  }

  function handleAdsAccountTypeChange(value) {
    setAdsAccountType(value)
    if (value !== 'Agency') {
      setAdsAccountAgencyPlatform('')
    }
  }

  function handleAdsAccountFiltersChange(nextFilters) {
    if (nextFilters.accountType === 'Self') {
      setAdsAccountFilters({
        ...nextFilters,
        agencyPlatform: '',
      })
      return
    }

    setAdsAccountFilters(nextFilters)
  }

  function clearPaypalForm() {
    setEditingPaypalId(null)
    setPaypalEmail('')
    setPaypalPrimaryEmail('')
    setPaypalIdValue('')
  }

  function openCreatePaypal() {
    clearPaypalForm()
    setPaypalsError('')
    setShowPaypalModal(true)
  }

  function clearIncomeForm() {
    setEditingIncomeId(null)
    setIncomePlatformName('')
    setIncomeUserName('')
    setIncomeAmount('')
    setIncomeCurrency('')
    setIncomePaymentMethod('')
    setIncomePaypalAccount('')
    setIncomePayoutDate('')
    setIncomeRemarks('')
  }

  function openCreateIncome() {
    clearIncomeForm()
    setIncomesError('')
    setShowIncomeModal(true)
  }

  function clearOutcomeForm() {
    setEditingOutcomeId(null)
    setOutcomeType('')
    setOutcomeAmount('')
    setOutcomeCurrency('')
    setOutcomePayDate('')
    setOutcomeRemarks('')
  }

  function openCreateOutcome() {
    clearOutcomeForm()
    setOutcomesError('')
    setShowOutcomeModal(true)
  }

  function handleAccountUserNameSelection(value) {
    setAccountUserName(value)

    const matchedUser = toolEmailUserOptions.find((item) => item.userName === value)
    if (matchedUser) {
      setAccountEmailAddress(matchedUser.emailAddress || '')
    } else if (!value) {
      setAccountEmailAddress('')
    }
  }

  function clearRoleForm() {
    setEditingRoleId(null)
    setRoleName('')
  }

  function openCreateRole() {
    clearRoleForm()
    setRolesError('')
    setShowRoleModal(true)
  }

  function clearNormalAdsForm() {
    setEditingNormalAdsId(null)
    setNormalCampainName('')
    setNormalCampainCountry('')
    setNormalPlatformName('')
    setNormalAffiliteUrl('')
    setNormalLandingPageUrl('')
    setNormalDynamicProxyInfo('')
    setNormalDynamicProxyInfoBackup('')
    setNormalIntervalTime('')
    setNormalStatus('RUNNING')
  }

  function openCreateNormalAds() {
    clearNormalAdsForm()
    setNormalAdsError('')
    setShowNormalAdsModal(true)
  }

  function clearMatrixAdsForm() {
    setEditingMatrixAdsId(null)
    setMatrixCampainName('')
    setMatrixCampainCountry('')
    setMatrixLandingPageUrl('')
    setMatrixDynamicProxyInfo('')
    setMatrixDynamicProxyInfoBackup('')
    setMatrixIntervalTime('')
    setMatrixStatus('RUNNING')
    setMatrixAffiliateRows([createEmptyAffiliateRow()])
  }

  function addMatrixAffiliateRow() {
    setMatrixAffiliateRows((current) => [...current, createEmptyAffiliateRow()])
  }

  function updateMatrixAffiliateRow(index, field, value) {
    setMatrixAffiliateRows((current) =>
      current.map((row, currentIndex) =>
        currentIndex === index ? { ...row, [field]: value } : row,
      ),
    )
  }

  function removeMatrixAffiliateRow(index) {
    setMatrixAffiliateRows((current) => {
      if (current.length === 1) {
        return [createEmptyAffiliateRow()]
      }

      return current.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  function openCreateMatrixAds() {
    clearMatrixAdsForm()
    setMatrixAdsError('')
    setShowMatrixAdsModal(true)
  }

  const loadAccountEmailOptions = useCallback(async () => {
    setAccountEmailOptionsLoading(true)

    try {
      const response = await requestApi(
        `/tool-emails${buildQueryString({
          page: 0,
          size: 1000,
        })}`,
        { token },
      )
      setAccountEmailOptionsSource(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (activeMenu === 'income-management') {
        setIncomesError(message)
      } else {
        setAccountsError(message)
      }
    } finally {
      setAccountEmailOptionsLoading(false)
    }
  }, [activeMenu, token])

  const loadPaypalAccountOptions = useCallback(async () => {
    setPaypalAccountOptionsLoading(true)

    try {
      const response = await requestApi(
        `/tool-paypals${buildQueryString({
          page: 0,
          size: 1000,
        })}`,
        { token },
      )
      setPaypalAccountOptionsSource(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setIncomesError(message)
    } finally {
      setPaypalAccountOptionsLoading(false)
    }
  }, [token])

  const loadAffiliateSyncConfigOptions = useCallback(async () => {
    if (!token) {
      setAffiliateSyncConfigOptionsSource([])
      return
    }

    setAffiliateSyncConfigOptionsLoading(true)

    try {
      const response = await requestApi(
        `/affiliate-ads-sync-config${buildQueryString({
          page: 0,
          size: 1000,
        })}`,
        { token },
      )
      setAffiliateSyncConfigOptionsSource(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (activeMenu === 'affiliate-test-task') {
        setAffiliateTestTasksError(message)
      } else {
        setAffiliateSyncTasksError(message)
      }
    } finally {
      setAffiliateSyncConfigOptionsLoading(false)
    }
  }, [activeMenu, token])

  const loadIpProxyOptions = useCallback(async () => {
    if (!token) {
      setIpProxyOptionsSource([])
      return
    }

    setIpProxyOptionsLoading(true)

    try {
      const response = await requestApi(
        `/ip-proxy-info${buildQueryString({
          page: 0,
          size: 1000,
        })}`,
        { token },
      )
      setIpProxyOptionsSource(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateTestTasksError(message)
    } finally {
      setIpProxyOptionsLoading(false)
    }
  }, [token])

  const loadOwnerFilterOptions = useCallback(async () => {
    if (!token) {
      setOwnerFilterOptionsSource([])
      return
    }

    setOwnerFilterOptionsLoading(true)

    try {
      const response = await requestApi(
        `/users${buildQueryString({
          page: 0,
          size: 1000,
        })}`,
        { token },
      )
      setOwnerFilterOptionsSource(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUsersError(message)
    } finally {
      setOwnerFilterOptionsLoading(false)
    }
  }, [token, setUsersError])

  const loadCurrentUserProfile = useCallback(
    async (userName) => {
      const identifierValue = toOptionalTrimmedString(userName)
      if (!identifierValue) {
        return null
      }

      const queries = [
        buildQueryString({ userName: identifierValue, page: 0, size: 1 }),
        buildQueryString({ email: identifierValue, page: 0, size: 1 }),
      ]

      for (const query of queries) {
        const response = await requestApi(`/users${query}`, { token })
        const items = extractItems(response)
        const matchedUser = items.find(
          (item) =>
            normalizeHeader(item?.userName) === normalizeHeader(identifierValue) ||
            normalizeHeader(item?.userEmail) === normalizeHeader(identifierValue),
        )

        if (matchedUser) {
          return matchedUser
        }
      }

      return null
    },
    [token],
  )

  const loadCurrentUserRole = useCallback(
    async (userName) => {
      const userProfile = await loadCurrentUserProfile(userName)
      return userProfile?.userRole || ''
    },
    [loadCurrentUserProfile],
  )

  const loadRunningAdsCounts = useCallback(async () => {
    if (!token) {
      setRunningNormalAdsCount(0)
      setRunningMatrixAdsCount(0)
      return
    }

    const requestSize = 1000

    const [normalResponse, matrixResponse] = await Promise.all([
      requestApi(
        `/normal-ads${buildQueryString({
          page: 0,
          size: requestSize,
        })}`,
        { token },
      ),
      requestApi(
        `/matrix-ads${buildQueryString({
          page: 0,
          size: requestSize,
        })}`,
        { token },
      ),
    ])

    const normalItems = extractItems(normalResponse).filter(
      (item) =>
        isOwnedByCurrentUser(item, currentUserProfile, currentUser, identifier) &&
        normalizeAdsStatusValue(item?.status) === 'RUNNING',
    )
    const matrixItems = extractItems(matrixResponse).filter(
      (item) =>
        isOwnedByCurrentUser(item, currentUserProfile, currentUser, identifier) &&
        normalizeAdsStatusValue(item?.status) === 'RUNNING',
    )

    setRunningNormalAdsCount(normalItems.length)
    setRunningMatrixAdsCount(matrixItems.length)
  }, [currentUser, currentUserProfile, identifier, token])

  const accessibleMenus = useMemo(() => {
    if (!isAuthenticated) {
      return []
    }

    if (isAdminRole(currentUserRole)) {
      return [
        'user-management',
        'role-management',
        'ads-platform-management',
        'user-agent-management',
        ...TOOL_MENU_IDS,
        ...AFFILIATE_ADS_MENU_IDS,
        'auto-script',
        'test-shift-link',
        'shift-link-log',
        'normal-ads-management',
        'matrix-ads-management',
        'ads-url-management',
      ]
    }

    const menus = [...TOOL_MENU_IDS]

    if (isNormalRole(currentUserRole)) {
      menus.push('normal-ads-management')
      menus.push(...AFFILIATE_ADS_MENU_IDS)
    }

    if (isMatrixRole(currentUserRole)) {
      menus.push('matrix-ads-management')
    }

    if (menus.length > 0) {
      menus.push('auto-script')
      menus.push('ads-url-management')
      menus.push('shift-link-log')
      menus.push('test-shift-link')
    }

    return menus
  }, [currentUserRole, isAuthenticated])

  useEffect(() => {
    setShiftLinkLogFilters((current) => {
      const nextAdsType =
        current.adsType && allowedShiftLinkLogAdsTypes.has(current.adsType)
          ? current.adsType
          : defaultShiftLinkLogAdsType

      if (current.adsType === nextAdsType) {
        return current
      }

      return {
        adsType: nextAdsType,
        adsName: '',
        platformName: '',
        ownerPhoneNumber: current.ownerPhoneNumber || '',
      }
    })
  }, [defaultShiftLinkLogAdsType, allowedShiftLinkLogAdsTypes])

  useEffect(() => {
    setAdsUrlFilters((current) => {
      const nextAdsType =
        current.adsType && allowedShiftLinkLogAdsTypes.has(current.adsType)
          ? current.adsType
          : defaultShiftLinkLogAdsType

      if (current.adsType === nextAdsType) {
        return current
      }

      return {
        adsType: nextAdsType,
        adsName: '',
        platformName: '',
        ownerPhoneNumber: current.ownerPhoneNumber || '',
      }
    })
  }, [defaultShiftLinkLogAdsType, allowedShiftLinkLogAdsTypes])

  useEffect(() => {
    if (adsUrlFilters.adsName && !adsUrlAdsNameOptions.includes(adsUrlFilters.adsName)) {
      setAdsUrlFilters((current) => ({
        ...current,
        adsName: '',
        platformName: '',
      }))
      return
    }

    if (
      adsUrlFilters.platformName &&
      !adsUrlPlatformOptions.includes(adsUrlFilters.platformName)
    ) {
      setAdsUrlFilters((current) => ({
        ...current,
        platformName: '',
      }))
    }
  }, [
    adsUrlAdsNameOptions,
    adsUrlFilters.adsName,
    adsUrlFilters.platformName,
    adsUrlPlatformOptions,
  ])

  useEffect(() => {
    if (
      shiftLinkLogFilters.adsName &&
      !shiftLinkLogAdsNameOptions.includes(shiftLinkLogFilters.adsName)
    ) {
      setShiftLinkLogFilters((current) => ({
        ...current,
        adsName: '',
        platformName: '',
      }))
      return
    }

    if (
      shiftLinkLogFilters.platformName &&
      !shiftLinkLogPlatformOptions.includes(shiftLinkLogFilters.platformName)
    ) {
      setShiftLinkLogFilters((current) => ({
        ...current,
        platformName: '',
      }))
    }
  }, [
    shiftLinkLogAdsNameOptions,
    shiftLinkLogFilters.adsName,
    shiftLinkLogFilters.platformName,
    shiftLinkLogPlatformOptions,
  ])

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setCurrentUserProfile(null)
      return
    }

    let cancelled = false

    async function hydrateCurrentUserProfile() {
      try {
        const userProfile = await loadCurrentUserProfile(currentUser)
        if (cancelled) {
          return
        }

        setCurrentUserProfile(userProfile)

        if (!currentUserRole && userProfile?.userRole) {
          setCurrentUserRole(userProfile.userRole)
          localStorage.setItem(ROLE_STORAGE_KEY, userProfile.userRole)
          const defaultMenu = getDefaultMenuForRole(userProfile.userRole)
          if (defaultMenu) {
            setActiveMenu(defaultMenu)
          }
        }
      } catch {
        if (!cancelled) {
          setCurrentUserProfile(null)
          if (!currentUserRole) {
            setCurrentUserRole('')
            localStorage.removeItem(ROLE_STORAGE_KEY)
          }
        }
      }
    }

    void hydrateCurrentUserProfile()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, currentUser, currentUserRole, loadCurrentUserProfile])

  useEffect(() => {
    setTestShiftLinkApiKey(currentUserProfile?.apiKey || '')
  }, [currentUserProfile?.apiKey])

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setRunningNormalAdsCount(0)
      setRunningMatrixAdsCount(0)
      return
    }

    void loadRunningAdsCounts()
  }, [currentUser, currentUserProfile, isAuthenticated, loadRunningAdsCounts])

  useEffect(() => {
    if (!isAuthenticated || !showAdminOwnerFilter) {
      setOwnerFilterOptionsSource([])
      setOwnerFilterOptionsLoading(false)
      return
    }

    void loadOwnerFilterOptions()
  }, [isAuthenticated, showAdminOwnerFilter, loadOwnerFilterOptions])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    if (accessibleMenus.length === 0) {
      return
    }

    const defaultMenu = getDefaultMenuForRole(currentUserRole) || accessibleMenus[0]
    if (!accessibleMenus.includes(activeMenu)) {
      setActiveMenu(defaultMenu)
    }
  }, [accessibleMenus, activeMenu, currentUserRole, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    if (activeMenu === 'user-management') {
      void loadUsers()
      void loadRoles()
      return
    }

    if (activeMenu === 'role-management') {
      void loadRoles()
      return
    }

    if (activeMenu === 'ads-url-management') {
      void loadAdsUrls(adsUrlQueryApplied ? adsUrlFiltersRef.current : {})
      void loadShiftLinkLogCatalog()
      void loadPlatformOptions()
      return
    }

    if (activeMenu === 'shift-link-log') {
      void loadShiftLinkLogCatalog()
      void loadShiftLinkLogs(
        shiftLinkLogQueryApplied ? shiftLinkLogFiltersRef.current : {},
        shiftLinkLogPaginationRef.current,
      )
      return
    }

    if (activeMenu === 'normal-ads-management') {
      void loadNormalAds(normalAdsQueryApplied ? normalAdsFiltersRef.current : {})
      void loadPlatformOptions()
      return
    }

    if (activeMenu === 'matrix-ads-management') {
      void loadMatrixAds(matrixAdsQueryApplied ? matrixAdsFiltersRef.current : {})
      void loadPlatformOptions()
      return
    }

    if (activeMenu === 'ads-platform-management') {
      void loadPlatformOptions()
      void loadPlatformList(platformPaginationRef.current)
      return
    }

    if (activeMenu === 'user-agent-management') {
      void loadUserAgents()
      return
    }

    if (activeMenu === 'email-management') {
      void loadToolEmails(emailQueryApplied ? emailFiltersRef.current : {})
      return
    }

    if (activeMenu === 'cash-bach-account') {
      void loadToolAccounts(accountQueryApplied ? accountFiltersRef.current : {})
      void loadPlatformOptions()
      void loadAccountEmailOptions()
      return
    }

    if (activeMenu === 'ads-account-management') {
      void loadAdsAccounts(adsAccountQueryApplied ? adsAccountFiltersRef.current : {})
      return
    }

    if (activeMenu === 'affiliate-job-detail') {
      void loadAffiliateJobDetails(
        affiliateJobDetailQueryApplied ? affiliateJobDetailFiltersRef.current : {},
      )
      return
    }

    if (activeMenu === 'affiliate-sync-config') {
      void loadAffiliateSyncConfigs(
        affiliateSyncConfigQueryApplied ? affiliateSyncConfigFiltersRef.current : {},
      )
      void loadPlatformOptions()
      return
    }

    if (activeMenu === 'affiliate-sync-task') {
      void loadAffiliateSyncTasks(
        affiliateSyncTaskQueryApplied ? affiliateSyncTaskFiltersRef.current : {},
      )
      void loadAffiliateSyncConfigOptions()
      return
    }

    if (activeMenu === 'affiliate-test-task') {
      void loadAffiliateTestTasks(
        affiliateTestTaskQueryApplied ? affiliateTestTaskFiltersRef.current : {},
      )
      void loadAffiliateSyncConfigOptions()
      void loadIpProxyOptions()
      return
    }

    if (activeMenu === 'affiliate-test-result') {
      void loadAffiliateTestResults(
        affiliateTestResultQueryApplied ? affiliateTestResultFiltersRef.current : {},
      )
      void loadPlatformOptions()
      return
    }

    if (activeMenu === 'affiliate-sync-result') {
      void loadAffiliateSyncResults(
        affiliateSyncResultQueryApplied ? affiliateSyncResultFiltersRef.current : {},
      )
      void loadPlatformOptions()
      return
    }

    if (activeMenu === 'affiliate-trigger') {
      void loadAffiliateTriggers(affiliateTriggerQueryApplied ? affiliateTriggerFiltersRef.current : {})
      return
    }

    if (activeMenu === 'affiliate-ip-proxy') {
      void loadIpProxies(ipProxyQueryApplied ? ipProxyFiltersRef.current : {})
      return
    }

    if (activeMenu === 'paypal-management') {
      void loadToolPaypals(paypalQueryApplied ? paypalFiltersRef.current : {})
      return
    }

    if (activeMenu === 'income-management') {
      void loadToolIncomes(incomeQueryApplied ? incomeFiltersRef.current : {})
      void loadPlatformOptions()
      void loadAccountEmailOptions()
      void loadPaypalAccountOptions()
      return
    }

    if (activeMenu === 'outcome-management') {
      void loadToolOutcomes(outcomeQueryApplied ? outcomeFiltersRef.current : {})
    }
  }, [
    isAuthenticated,
    activeMenu,
    loadUsers,
    loadRoles,
    loadUserAgents,
    loadAdsUrls,
    loadShiftLinkLogCatalog,
    loadShiftLinkLogs,
    shiftLinkLogQueryApplied,
    loadNormalAds,
    loadMatrixAds,
    loadPlatformList,
    loadPlatformOptions,
    loadToolEmails,
    loadToolAccounts,
    loadAdsAccounts,
    loadAffiliateJobDetails,
    loadAffiliateSyncConfigs,
    loadAffiliateTestResults,
    loadAffiliateTestTasks,
    loadAffiliateSyncResults,
    loadAffiliateSyncTasks,
    loadAffiliateTriggers,
    loadIpProxyOptions,
    loadIpProxies,
    loadToolPaypals,
    loadToolIncomes,
    loadToolOutcomes,
    loadAccountEmailOptions,
    loadAffiliateSyncConfigOptions,
    loadPaypalAccountOptions,
    emailQueryApplied,
    accountQueryApplied,
    adsAccountQueryApplied,
    affiliateJobDetailQueryApplied,
    affiliateSyncConfigQueryApplied,
    affiliateTestResultQueryApplied,
    affiliateTestTaskQueryApplied,
    affiliateSyncResultQueryApplied,
    affiliateSyncTaskQueryApplied,
    affiliateTriggerQueryApplied,
    ipProxyQueryApplied,
    paypalQueryApplied,
    incomeQueryApplied,
    outcomeQueryApplied,
    adsUrlQueryApplied,
    normalAdsQueryApplied,
    matrixAdsQueryApplied,
  ])

  async function handleLoginSubmit(event) {
    event.preventDefault()
    setLoginError('')
    setIsLoggingIn(true)

    try {
      const loginId = identifier.trim()
      const responseBody = await requestApi('/auth/login', {
        method: 'POST',
        body: {
          loginId,
          username: loginId,
          password,
        },
      })

      const token =
        responseBody?.amToken ||
        responseBody?.token ||
        responseBody?.accessToken ||
        responseBody?.data?.token

      if (!token) {
        throw new Error('Logon succeeded but AMtoken is missing from response.')
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      setToken(token)
      const nextCurrentUser =
        responseBody?.userName || responseBody?.data?.userName || loginId
      setCurrentUser(nextCurrentUser)
      setPassword('')
      const nextNormalAdsTotalCount = toOptionalCount(
        responseBody?.normalAdsTotalCount ?? responseBody?.data?.normalAdsTotalCount,
      )
      const nextMatrixAdsTotalCount = toOptionalCount(
        responseBody?.matrixAdsTotalCount ?? responseBody?.data?.matrixAdsTotalCount,
      )
      setNormalAdsTotalCount(nextNormalAdsTotalCount)
      setMatrixAdsTotalCount(nextMatrixAdsTotalCount)
      if (nextNormalAdsTotalCount == null) {
        localStorage.removeItem(NORMAL_ADS_TOTAL_STORAGE_KEY)
      } else {
        localStorage.setItem(NORMAL_ADS_TOTAL_STORAGE_KEY, String(nextNormalAdsTotalCount))
      }
      if (nextMatrixAdsTotalCount == null) {
        localStorage.removeItem(MATRIX_ADS_TOTAL_STORAGE_KEY)
      } else {
        localStorage.setItem(MATRIX_ADS_TOTAL_STORAGE_KEY, String(nextMatrixAdsTotalCount))
      }

      let role =
        responseBody?.userRole ||
        responseBody?.data?.userRole ||
        (Array.isArray(responseBody?.roles) ? responseBody.roles.join(',') : '') ||
        (Array.isArray(responseBody?.data?.roles) ? responseBody.data.roles.join(',') : '')

      if (!role) {
        try {
          role = await loadCurrentUserRole(nextCurrentUser)
        } catch {
          role = ''
        }
      }

      setCurrentUserRole(role)
      const defaultMenu = getDefaultMenuForRole(role)
      if (defaultMenu) {
        setActiveMenu(defaultMenu)
      }
      localStorage.setItem(USER_STORAGE_KEY, nextCurrentUser)
      localStorage.setItem(ROLE_STORAGE_KEY, role)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setLoginError(message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const [userNormalAdsNumber, setUserNormalAdsNumber] = useState('')
  const [userMatrixAdsNumber, setUserMatrixAdsNumber] = useState('')

  function startEditUser(user) {
    setEditingUserId(user.id)
    setUserName(user.userName || '')
    setUserEmail(user.userEmail || '')
    setUserPhoneNumber(user.userPhoneNumber || '')
    setUserPassword('')
    setUserRole(user.userRole || '')
    setExpireDate(toDateInputValue(getUserExpireDate(user)))
    setUserStatus(user.status || 'ENABLED')
    setUserNormalAdsNumber(user.normalAdsNumber ?? user.normalAds ?? user.normalAdsCount ?? '')
    setUserMatrixAdsNumber(user.matrixAdsNumber ?? user.matrixAds ?? user.matrixAdsCount ?? '')
    setShowUserModal(true)
  }

  function clearUserForm() {
    setEditingUserId(null)
    setUserName('')
    setUserEmail('')
    setUserPhoneNumber('')
    setUserPassword('')
    setUserRole('')
    setUserStatus('ENABLED')
    setUserNormalAdsNumber('')
    setUserMatrixAdsNumber('')
    setSavingUser(false)
    setShowUserModal(false)
    setUsersError('')
    setUsersMessage('')
  }

  function clearChangePasswordForm() {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangePasswordError('')
    setChangePasswordMessage('')
    setSavingChangePassword(false)
  }

  function openChangePasswordModal() {
    clearChangePasswordForm()
    setShowChangePasswordModal(true)
  }

  function closeChangePasswordModal() {
    clearChangePasswordForm()
    setShowChangePasswordModal(false)
  }

  async function handleSaveUser(event) {
    event.preventDefault()
    setSavingUser(true)
    setUsersError('')
    setUsersMessage('')

    try {
      const payload = {
        userName: validateUserName(userName),
        userEmail: validateUserEmail(userEmail),
        userPhoneNumber: validateUserPhoneNumber(userPhoneNumber),
        userRole,
        expireDate: toApiDateValue(expireDate),
        normalAdsNumber: userNormalAdsNumber ? Number(userNormalAdsNumber) : undefined,
        matrixAdsNumber: userMatrixAdsNumber ? Number(userMatrixAdsNumber) : undefined,
        status: userStatus,
      }

      if (userPassword) {
        payload.userPassword = userPassword
      }

      if (editingUserId) {
        await requestApi(`/users/${editingUserId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setUsersMessage('User updated successfully.')
      } else {
        if (!userPassword) {
          throw new Error('Password is required when adding a user.')
        }
        await requestApi('/users/register', {
          method: 'POST',
          token,
          body: {
            ...payload,
            userPassword,
          },
        })
        setUsersMessage('User added successfully.')
      }

      clearUserForm()
      setShowUserModal(false)
      await loadUsers()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUsersError(message)
    } finally {
      setSavingUser(false)
    }
  }

  async function handleDeleteUser(userId) {
    setUsersError('')
    setUsersMessage('')

    try {
      await requestApi(`/users/${userId}`, {
        method: 'DELETE',
        token,
      })
      setUsersMessage('User deleted successfully.')
      await loadUsers()
      if (editingUserId === userId) {
        clearUserForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUsersError(message)
    }
  }

  async function handleChangePasswordSubmit(event) {
    event.preventDefault()
    setSavingChangePassword(true)
    setChangePasswordError('')
    setChangePasswordMessage('')

    try {
      if (!currentPassword.trim()) {
        throw new Error('Current Password is required.')
      }

      if (!newPassword.trim()) {
        throw new Error('New Password is required.')
      }

      if (newPassword !== confirmPassword) {
        throw new Error('New Password and Confirm New Password must match.')
      }

      await requestApi('/users/change-password', {
        method: 'POST',
        token,
        body: {
          oldPassword: currentPassword,
          newPassword,
        },
      })

      setChangePasswordMessage('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setChangePasswordError(message)
    } finally {
      setSavingChangePassword(false)
    }
  }

  async function handleToggleUser(userId, shouldEnable) {
    setUsersError('')
    setUsersMessage('')

    try {
      await requestApi(`/users/${userId}/${shouldEnable ? 'enable' : 'disable'}`, {
        method: 'POST',
        token,
      })
      setUsersMessage(`User ${shouldEnable ? 'enabled' : 'disabled'} successfully.`)
      await loadUsers()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUsersError(message)
    }
  }

  function startEditRole(role) {
    setEditingRoleId(role.id)
    setRoleName(role.roleName || '')
    setShowRoleModal(true)
  }

  async function handleSaveRole(event) {
    event.preventDefault()
    setSavingRole(true)
    setRolesError('')
    setRolesMessage('')

    try {
      const payload = {
        roleName,
      }

      if (editingRoleId) {
        await requestApi(`/roles/${editingRoleId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setRolesMessage('User role updated successfully.')
      } else {
        await requestApi('/roles', {
          method: 'POST',
          token,
          body: payload,
        })
        setRolesMessage('User role created successfully.')
      }

      clearRoleForm()
      setShowRoleModal(false)
      await loadRoles()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setRolesError(message)
    } finally {
      setSavingRole(false)
    }
  }

  async function handleDeleteRole(id) {
    setRolesError('')
    setRolesMessage('')

    try {
      await requestApi(`/roles/${id}`, {
        method: 'DELETE',
        token,
      })
      setRolesMessage('User role deleted successfully.')
      await loadRoles()
      if (editingRoleId === id) {
        clearRoleForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setRolesError(message)
    }
  }

  function startEditUserAgent(item) {
    setEditingUserAgentId(item.id)
    setUserAgentDevice(item.device || '')
    setUserAgentValue(item.userAgent || '')
    setShowUserAgentModal(true)
  }

  async function handleSaveUserAgent(event) {
    event.preventDefault()
    setSavingUserAgent(true)
    setUserAgentsError('')
    setUserAgentsMessage('')

    try {
      const device = toOptionalTrimmedString(userAgentDevice)
      const userAgent = toOptionalTrimmedString(userAgentValue)

      if (!device) {
        throw new Error('Device is required.')
      }

      if (!userAgent) {
        throw new Error('User Agent is required.')
      }

      const payload = { device, userAgent }

      if (editingUserAgentId) {
        await requestApi(`/refer-user-agents/${editingUserAgentId}`, {
          method: 'PUT',
          token,
          body: {
            id: editingUserAgentId,
            ...payload,
          },
        })
        setUserAgentsMessage('User Agent updated successfully.')
      } else {
        await requestApi('/refer-user-agents', {
          method: 'POST',
          token,
          body: payload,
        })
        setUserAgentsMessage('User Agent created successfully.')
      }

      clearUserAgentForm()
      setShowUserAgentModal(false)
      await loadUserAgents()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUserAgentsError(message)
    } finally {
      setSavingUserAgent(false)
    }
  }

  async function handleDeleteUserAgent(id) {
    setUserAgentsError('')
    setUserAgentsMessage('')

    try {
      await requestApi(`/refer-user-agents/${id}`, {
        method: 'DELETE',
        token,
      })
      setUserAgentsMessage('User Agent deleted successfully.')
      await loadUserAgents()
      if (editingUserAgentId === id) {
        clearUserAgentForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUserAgentsError(message)
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(ROLE_STORAGE_KEY)
    localStorage.removeItem(NORMAL_ADS_TOTAL_STORAGE_KEY)
    localStorage.removeItem(MATRIX_ADS_TOTAL_STORAGE_KEY)
    setToken('')
    setIdentifier('')
    setPassword('')
    setLoginError('')
    setCurrentUser('')
    setCurrentUserRole('')
    setCurrentUserProfile(null)
    setNormalAdsTotalCount(null)
    setMatrixAdsTotalCount(null)
    setRunningNormalAdsCount(0)
    setRunningMatrixAdsCount(0)
    setUsers([])
    setUsersError('')
    setUsersMessage('')
    setUsersPagination(createInitialPagination())
    setRoles([])
    setRolesError('')
    setRolesMessage('')
    setUserAgents([])
    setUserAgentsError('')
    setUserAgentsMessage('')
    setAdsUrls([])
    setAdsError('')
    setAdsMessage('')
    setAdsUrlPagination(createInitialPagination())
    setShowBulkAdsModal(false)
    setBulkAdsFile(null)
    setBulkAdsSaving(false)
    setBulkAdsError('')
    setBulkAdsMessage('')
    setAdsUrlFilters({
      adsType: defaultShiftLinkLogAdsType,
      adsName: '',
      platformName: '',
      ownerPhoneNumber: '',
    })
    setAdsUrlQueryApplied(false)
    setNormalAds([])
    setNormalAdsError('')
    setNormalAdsMessage('')
    setNormalAdsPagination(createInitialPagination())
    setNormalAdsFilters({ campainName: '', platformName: '', status: '', ownerPhoneNumber: '' })
    setNormalAdsQueryApplied(false)
    setMatrixAds([])
    setMatrixAdsError('')
    setMatrixAdsMessage('')
    setMatrixAdsPagination(createInitialPagination())
    setMatrixAdsFilters({ campainName: '', platformName: '', status: '', ownerPhoneNumber: '' })
    setMatrixAdsQueryApplied(false)
    setPlatforms([])
    setPlatformList([])
    setPlatformPagination(createInitialPagination())
    setPlatformsError('')
    setPlatformsMessage('')
    setEmails([])
    setEmailsError('')
    setEmailsMessage('')
    setEmailPagination(createInitialPagination())
    setEmailFilters({ userName: '', emailAddress: '', ownerPhoneNumber: '' })
    setEmailQueryApplied(false)
    setAccounts([])
    setAccountsError('')
    setAccountsMessage('')
    setAccountPagination(createInitialPagination())
    setAccountEmailOptionsSource([])
    setAccountEmailOptionsLoading(false)
    setOwnerFilterOptionsSource([])
    setOwnerFilterOptionsLoading(false)
    setAccountFilters({ userName: '', platformName: '', status: '', ownerPhoneNumber: '' })
    setAccountQueryApplied(false)
    setAffiliateJobDetails([])
    setAffiliateJobDetailsLoading(false)
    setAffiliateJobDetailsError('')
    setAffiliateJobDetailsMessage('')
    setAffiliateJobDetailPagination(createInitialPagination())
    setAffiliateJobDetailFilters({
      schedName: '',
      jobName: '',
      jobGroup: '',
      jobClassName: '',
      description: '',
    })
    setAffiliateJobDetailQueryApplied(false)
    setAffiliateSyncConfigs([])
    setAffiliateSyncConfigsLoading(false)
    setAffiliateSyncConfigsError('')
    setAffiliateSyncConfigsMessage('')
    setAffiliateSyncConfigPagination(createInitialPagination())
    setAffiliateSyncConfigFilters({
      affiliateNetwork: '',
      ownerPhoneNumber: '',
    })
    setAffiliateSyncConfigQueryApplied(false)
    setAffiliateSyncConfigOptionsSource([])
    setAffiliateSyncConfigOptionsLoading(false)
    setAffiliateSyncResults([])
    setAffiliateSyncResultsLoading(false)
    setAffiliateSyncResultsError('')
    setAffiliateSyncResultsMessage('')
    setAffiliateSyncResultPagination(createInitialPagination())
    setRunningAffiliateSyncResultId(null)
    setAffiliateSyncResultFilters({
      affiliateNetwork: '',
      siteName: '',
      status: '',
      ownerPhoneNumber: '',
    })
    setAffiliateSyncResultQueryApplied(false)
    setAffiliateSyncTasks([])
    setAffiliateSyncTasksLoading(false)
    setAffiliateSyncTasksError('')
    setAffiliateSyncTasksMessage('')
    setAffiliateSyncTaskPagination(createInitialPagination())
    setRunningAffiliateSyncTaskId(null)
    setAffiliateSyncTaskFilters({
      affiliateAdsSyncConfigId: '',
      ownerPhoneNumber: '',
    })
    setAffiliateSyncTaskQueryApplied(false)
    setAffiliateTestTasks([])
    setAffiliateTestTasksLoading(false)
    setAffiliateTestTasksError('')
    setAffiliateTestTasksMessage('')
    setAffiliateTestTaskPagination(createInitialPagination())
    setRunningAffiliateTestTaskId(null)
    setAffiliateTestTaskFilters({
      affiliateAdsSyncConfigId: '',
      ownerPhoneNumber: '',
    })
    setAffiliateTestTaskQueryApplied(false)
    setAffiliateTestResults([])
    setAffiliateTestResultsLoading(false)
    setAffiliateTestResultsError('')
    setAffiliateTestResultsMessage('')
    setAffiliateTestResultPagination(createInitialPagination())
    setAffiliateTestResultFilters({
      affiliateNetwork: '',
      region: '',
      status: '',
      ownerPhoneNumber: '',
    })
    setAffiliateTestResultQueryApplied(false)
    setIpProxyOptionsSource([])
    setIpProxyOptionsLoading(false)
    setAffiliateTriggers([])
    setAffiliateTriggersLoading(false)
    setAffiliateTriggersError('')
    setAffiliateTriggersMessage('')
    setAffiliateTriggerPagination(createInitialPagination())
    setAffiliateTriggerFilters({
      schedName: '',
      triggerName: '',
      triggerGroup: '',
      jobName: '',
      jobGroup: '',
      triggerState: '',
      triggerType: '',
    })
    setAffiliateTriggerQueryApplied(false)
    setIpProxies([])
    setIpProxiesLoading(false)
    setIpProxiesError('')
    setIpProxiesMessage('')
    setIpProxyPagination(createInitialPagination())
    setIpProxyFilters({
      proxyType: '',
      proxyProtocol: '',
      status: '',
      ownerPhoneNumber: '',
    })
    setIpProxyQueryApplied(false)
    setPaypals([])
    setPaypalsError('')
    setPaypalsMessage('')
    setPaypalPagination(createInitialPagination())
    setPaypalFilters({ paypalEmail: '', primaryEmail: '', ownerPhoneNumber: '' })
    setPaypalQueryApplied(false)
    setIncomes([])
    setIncomesError('')
    setIncomesMessage('')
    setIncomePagination(createInitialPagination())
    setPaypalAccountOptionsSource([])
    setPaypalAccountOptionsLoading(false)
    setIncomeFilters({
      platformName: '',
      userName: '',
      paypalAccount: '',
      payoutDateBegin: '',
      payoutDateEnd: '',
      ownerPhoneNumber: '',
    })
    setIncomeQueryApplied(false)
    setOutcomes([])
    setOutcomesError('')
    setOutcomesMessage('')
    setOutcomePagination(createInitialPagination())
    setOutcomeFilters({ outcomeType: '', payDateBegin: '', payDateEnd: '', ownerPhoneNumber: '' })
    setOutcomeQueryApplied(false)
    setTestShiftLinkCampainName('')
    setTestShiftLinkApiKey('')
    setTestShiftLinkError('')
    setNormalAdsTestResponse(null)
    setMatrixAdsTestResponse(null)
    setNormalAdsTestLoading(false)
    setMatrixAdsTestLoading(false)
    setShiftLinkLogFilters({
      adsType: defaultShiftLinkLogAdsType,
      adsName: '',
      platformName: '',
      ownerPhoneNumber: '',
    })
    setShiftLinkLogCatalog([])
    setShiftLinkLogCatalogLoading(false)
    setShiftLinkLogCatalogError('')
    setShiftLinkLogs([])
    setShiftLinkLogsLoading(false)
    setShiftLinkLogsError('')
    setShiftLinkLogsLoaded(false)
    setShiftLinkLogPagination(createInitialPagination())
    setShiftLinkLogQueryApplied(false)
    setShowEmailModal(false)
    setShowAccountModal(false)
    setShowAffiliateSyncConfigModal(false)
    setShowAffiliateSyncTaskModal(false)
    setShowIpProxyModal(false)
    setShowPaypalModal(false)
    setShowIncomeModal(false)
    setShowOutcomeModal(false)
    setShowUserModal(false)
    setShowUserAgentModal(false)
    setShowAdsModal(false)
    setShowPlatformModal(false)
    clearUserForm()
    clearUserAgentForm()
    clearAdsForm()
    clearPlatformForm()
    clearRoleForm()
    clearEmailForm()
    clearAccountForm()
    clearPaypalForm()
    clearIncomeForm()
    clearOutcomeForm()
    clearNormalAdsForm()
    clearMatrixAdsForm()
    clearAffiliateSyncConfigForm()
    clearAffiliateSyncTaskForm()
    clearIpProxyForm()
  }

  const logoutHandlerRef = useRef(handleLogout)
  logoutHandlerRef.current = handleLogout

  useEffect(() => {
    function handleUnauthorized() {
      logoutHandlerRef.current()
    }

    window.addEventListener(UNAUTHORIZED_EVENT_NAME, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT_NAME, handleUnauthorized)
  }, [])

  async function runTestShiftLink(endpointType) {
    const campainName = toOptionalTrimmedString(testShiftLinkCampainName)
    const apiKey = toOptionalTrimmedString(testShiftLinkApiKey)
    const isNormalAdsTest = endpointType === 'normal'
    const setLoading = isNormalAdsTest ? setNormalAdsTestLoading : setMatrixAdsTestLoading
    const setResponse = isNormalAdsTest ? setNormalAdsTestResponse : setMatrixAdsTestResponse
    const path = isNormalAdsTest ? '/normal/ads' : '/matrix/ads'

    if (!campainName) {
      setTestShiftLinkError('Campaign Name is required.')
      return
    }

    if (!apiKey) {
      setTestShiftLinkError('API Key is not available for the current user.')
      return
    }

    setTestShiftLinkError('')
    setLoading(true)

    try {
      const response = await requestApi(
        `${path}${buildQueryString({ campaign_name: campainName, api_key: apiKey })}`,
        { token },
      )
      setResponse(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setResponse(null)
      setTestShiftLinkError(message)
    } finally {
      setLoading(false)
    }
  }

  function startEditAds(item) {
    setEditingAdsId(item.id)
    setEditingAdsOriginal(item)
    setCapMainName(item.adsName || item.capMainName || item.campainName || '')
    setAdsType(item.adsType || item.ads_type || '')
    setPlatform(item.platformName || item.platform || '')
    setFullUrl(item.fullUrl || '')
    setDisplayNumber(
      firstDefinedValue(item, ['displayNumber']) != null
        ? String(firstDefinedValue(item, ['displayNumber']))
        : '',
    )
    setRemark(item.remarks || item.remark || '')
    setShowAdsModal(true)
  }

  async function handleSaveAds(event) {
    event.preventDefault()
    setSavingAds(true)
    setAdsError('')
    setAdsMessage('')

    try {
      const parsedUrl = parseAdsUrl(fullUrl)
      const normalizedDisplayNumber = toOptionalTrimmedString(displayNumber)
      const payload = {
        adsName: capMainName,
        adsType: adsType || firstDefinedValue(editingAdsOriginal, ['adsType', 'ads_type']) || undefined,
        platformName:
          platform ||
          firstDefinedValue(editingAdsOriginal, ['platformName', 'platform']) ||
          undefined,
        adsOwner:
          firstDefinedValue(editingAdsOriginal, ['adsOwner']) ||
          getLoggedInAdsOwner(identifier, currentUser) ||
          undefined,
        displayNumber:
          normalizedDisplayNumber === undefined ? undefined : Number(normalizedDisplayNumber),
        fullUrl,
        landingPageUrl: parsedUrl.landingUrl,
        urlSuffix: parsedUrl.urlSuffix,
        remarks: remark || undefined,
      }

      if (
        normalizedDisplayNumber !== undefined &&
        !Number.isFinite(payload.displayNumber)
      ) {
        throw new Error('Display Number must be a valid number.')
      }

      if (editingAdsId && editingAdsOriginal) {
        await requestApi(`/shift-links/${editingAdsId}`, {
          method: 'PUT',
          token,
          body: {
            ...editingAdsOriginal,
            ...payload,
            id: editingAdsId,
          },
        })
        setAdsMessage('Shift Link updated successfully.')
      } else {
        await requestApi('/shift-links', {
          method: 'POST',
          token,
          body: payload,
        })
        setAdsMessage('Shift Link created successfully.')
      }

      clearAdsForm()
      setShowAdsModal(false)
      await loadAdsUrls({}, { page: 0, size: adsUrlPaginationRef.current.size })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAdsError(message)
    } finally {
      setSavingAds(false)
    }
  }

  async function handleDeleteAds(id) {
    setAdsError('')
    setAdsMessage('')

    try {
      await requestApi(`/shift-links/${id}`, {
        method: 'DELETE',
        token,
      })
      setAdsMessage('Shift Link deleted successfully.')
      await loadAdsUrls({}, { page: 0, size: adsUrlPaginationRef.current.size })
      if (editingAdsId === id) {
        clearAdsForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAdsError(message)
    }
  }

  async function handleDownloadAdsTemplate() {
    try {
      downloadStaticFile(SHIFT_LINK_TEMPLATE_FILE_URL, 'Shift_Link_Temp.xlsx')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAdsError(message)
    }
  }

  function startEditNormalAds(item) {
    setEditingNormalAdsId(item.id)
    setNormalCampainName(item.campainName || '')
    setNormalCampainCountry(toCountryCode(item.campainCountry || ''))
    setNormalPlatformName(item.platformName || '')
    setNormalAffiliteUrl(item.affiliteUrl || '')
    setNormalLandingPageUrl(item.landingPageUrl || '')
    setNormalDynamicProxyInfo(item.dynamicProxyInfo || '')
    setNormalDynamicProxyInfoBackup(item.dynamicProxyInfoBackup || '')
    setNormalIntervalTime(item.intervalTime != null ? String(item.intervalTime) : '')
    setNormalStatus(normalizeAdsStatusValue(item.status) || 'RUNNING')
    setShowNormalAdsModal(true)
  }

  async function handleSaveNormalAds(event) {
    event.preventDefault()
    setSavingNormalAds(true)
    setNormalAdsError('')
    setNormalAdsMessage('')

    try {
      const payload = {
        campainName: normalCampainName,
        campainCountry: normalCampainCountry || undefined,
        platformName: normalPlatformName || undefined,
        affiliteUrl: normalAffiliteUrl || undefined,
        landingPageUrl: normalLandingPageUrl || undefined,
        dynamicProxyInfo: normalDynamicProxyInfo || undefined,
        dynamicProxyInfoBackup: normalDynamicProxyInfoBackup || undefined,
        intervalTime: normalIntervalTime ? Number(normalIntervalTime) : undefined,
        status: normalStatus || undefined,
        adsOwner: getLoggedInAdsOwner(identifier, currentUser) || undefined,
      }

      if (editingNormalAdsId) {
        await requestApi(`/normal-ads/${editingNormalAdsId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setNormalAdsMessage('Normal ads updated successfully.')
      } else {
        await requestApi('/normal-ads', {
          method: 'POST',
          token,
          body: payload,
        })
        setNormalAdsMessage('Normal ads created successfully.')
      }

      clearNormalAdsForm()
      setShowNormalAdsModal(false)
      await loadNormalAds(
        normalAdsQueryApplied ? normalAdsFilters : {},
        normalAdsPaginationRef.current,
      )
      await loadRunningAdsCounts()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setNormalAdsError(message)
    } finally {
      setSavingNormalAds(false)
    }
  }

  async function handleDeleteNormalAds(id) {
    setNormalAdsError('')
    setNormalAdsMessage('')

    try {
      await requestApi(`/normal-ads/${id}`, {
        method: 'DELETE',
        token,
      })
      setNormalAdsMessage('Normal ads deleted successfully.')
      await loadNormalAds(
        normalAdsQueryApplied ? normalAdsFilters : {},
        normalAdsPaginationRef.current,
      )
      await loadRunningAdsCounts()
      if (editingNormalAdsId === id) {
        clearNormalAdsForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setNormalAdsError(message)
    }
  }

  function startEditMatrixAds(item) {
    setEditingMatrixAdsId(item.id)
    setMatrixCampainName(item.campainName || '')
    setMatrixCampainCountry(toCountryCode(item.campainCountry || ''))
    setMatrixLandingPageUrl(item.landingPageUrl || '')
    setMatrixDynamicProxyInfo(item.dynamicProxyInfo || '')
    setMatrixDynamicProxyInfoBackup(item.dynamicProxyInfoBackup || '')
    setMatrixIntervalTime(item.intervalTime != null ? String(item.intervalTime) : '')
    setMatrixStatus(normalizeAdsStatusValue(item.status) || 'RUNNING')
    setMatrixAffiliateRows(
      Array.isArray(item.affiliateInfos) && item.affiliateInfos.length > 0
        ? item.affiliateInfos.map((affiliate) => normalizeAffiliateRow(affiliate))
        : [createEmptyAffiliateRow()],
    )
    setShowMatrixAdsModal(true)
  }

  async function handleSaveMatrixAds(event) {
    event.preventDefault()
    setSavingMatrixAds(true)
    setMatrixAdsError('')
    setMatrixAdsMessage('')

    try {
      const payload = {
        campainName: matrixCampainName,
        campainCountry: matrixCampainCountry || undefined,
        landingPageUrl: matrixLandingPageUrl || undefined,
        dynamicProxyInfo: matrixDynamicProxyInfo || undefined,
        dynamicProxyInfoBackup: matrixDynamicProxyInfoBackup || undefined,
        intervalTime: matrixIntervalTime ? Number(matrixIntervalTime) : undefined,
        status: matrixStatus || undefined,
        adsOwner: getLoggedInAdsOwner(identifier, currentUser) || undefined,
        affiliateInfos: matrixAffiliateRows
          .map((row) => normalizeAffiliateRow(row))
          .filter(
            (row) =>
              row.platformName || row.affiliteUrl || row.displayNumber || row.remarks,
          )
          .map((row, index) => {
            if (!row.platformName) {
              throw new Error(`Affiliate row ${index + 1}: Platform Name is required.`)
            }

            if (!row.affiliteUrl) {
              throw new Error(`Affiliate row ${index + 1}: Affiliate URL is required.`)
            }

            if (!row.displayNumber) {
              throw new Error(`Affiliate row ${index + 1}: Display Number is required.`)
            }

            const displayNumber = Number(row.displayNumber)
            if (!Number.isFinite(displayNumber)) {
              throw new Error(`Affiliate row ${index + 1}: Display Number must be a number.`)
            }

            return {
              platformName: row.platformName,
              affiliteUrl: row.affiliteUrl,
              displayNumber,
              remarks: row.remarks || undefined,
            }
          }),
      }

      if (payload.affiliateInfos.length === 0) {
        throw new Error('At least one affiliate row is required.')
      }

      if (editingMatrixAdsId) {
        await requestApi(`/matrix-ads/${editingMatrixAdsId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setMatrixAdsMessage('Matrix ads updated successfully.')
      } else {
        await requestApi('/matrix-ads', {
          method: 'POST',
          token,
          body: payload,
        })
        setMatrixAdsMessage('Matrix ads created successfully.')
      }

      clearMatrixAdsForm()
      setShowMatrixAdsModal(false)
      await loadMatrixAds(
        matrixAdsQueryApplied ? matrixAdsFilters : {},
        matrixAdsPaginationRef.current,
      )
      await loadRunningAdsCounts()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setMatrixAdsError(message)
    } finally {
      setSavingMatrixAds(false)
    }
  }

  async function handleDeleteMatrixAds(id) {
    setMatrixAdsError('')
    setMatrixAdsMessage('')

    try {
      await requestApi(`/matrix-ads/${id}`, {
        method: 'DELETE',
        token,
      })
      setMatrixAdsMessage('Matrix ads deleted successfully.')
      await loadMatrixAds(
        matrixAdsQueryApplied ? matrixAdsFilters : {},
        matrixAdsPaginationRef.current,
      )
      await loadRunningAdsCounts()
      if (editingMatrixAdsId === id) {
        clearMatrixAdsForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setMatrixAdsError(message)
    }
  }

  function applyAdsUrlFilters(event) {
    event.preventDefault()
    setAdsUrlQueryApplied(true)
    void loadAdsUrls(adsUrlFilters, { page: 0, size: adsUrlPaginationRef.current.size })
  }

  function reloadAdsUrlFilters() {
    setAdsUrlFilters({
      adsType: defaultShiftLinkLogAdsType,
      adsName: '',
      platformName: '',
      ownerPhoneNumber: '',
    })
    setAdsUrlQueryApplied(false)
    void loadShiftLinkLogCatalog()
    void loadAdsUrls({}, { page: 0, size: adsUrlPaginationRef.current.size })
  }

  function applyNormalAdsFilters(event) {
    event.preventDefault()
    setNormalAdsQueryApplied(true)
    void loadNormalAds(normalAdsFilters, { page: 0, size: normalAdsPaginationRef.current.size })
  }

  function applyMatrixAdsFilters(event) {
    event.preventDefault()
    setMatrixAdsQueryApplied(true)
    void loadMatrixAds(matrixAdsFilters, { page: 0, size: matrixAdsPaginationRef.current.size })
  }

  function applyEmailFilters(event) {
    event.preventDefault()
    setEmailQueryApplied(true)
    void loadToolEmails(emailFilters, { page: 0, size: emailPaginationRef.current.size })
  }

  function reloadEmailFilters() {
    setEmailFilters({ userName: '', emailAddress: '', ownerPhoneNumber: '' })
    setEmailQueryApplied(false)
    void loadToolEmails({}, { page: 0, size: emailPaginationRef.current.size })
  }

  function applyAccountFilters(event) {
    event.preventDefault()
    setAccountQueryApplied(true)
    void loadToolAccounts(accountFilters, { page: 0, size: accountPaginationRef.current.size })
  }

  function reloadAccountFilters() {
    setAccountFilters({ userName: '', platformName: '', status: '', ownerPhoneNumber: '' })
    setAccountQueryApplied(false)
    void loadToolAccounts({}, { page: 0, size: accountPaginationRef.current.size })
  }

  function applyAdsAccountFilters(event) {
    event.preventDefault()
    setAdsAccountQueryApplied(true)
    void loadAdsAccounts(adsAccountFilters, { page: 0, size: adsAccountPaginationRef.current.size })
  }

  function reloadAdsAccountFilters() {
    setAdsAccountFilters({
      adsAccount: '',
      mccAccount: '',
      agencyPlatform: '',
      accountType: '',
      status: '',
      ownerPhoneNumber: '',
    })
    setAdsAccountQueryApplied(false)
    void loadAdsAccounts({}, { page: 0, size: adsAccountPaginationRef.current.size })
  }

  function applyIpProxyFilters(event) {
    event.preventDefault()
    setIpProxyQueryApplied(true)
    void loadIpProxies(ipProxyFilters, { page: 0, size: ipProxyPaginationRef.current.size })
  }

  function reloadIpProxyFilters() {
    setIpProxyFilters({
      proxyType: '',
      proxyProtocol: '',
      status: '',
      ownerPhoneNumber: '',
    })
    setIpProxyQueryApplied(false)
    void loadIpProxies({}, { page: 0, size: ipProxyPaginationRef.current.size })
  }

  function applyAffiliateSyncConfigFilters(event) {
    event.preventDefault()
    setAffiliateSyncConfigQueryApplied(true)
    void loadAffiliateSyncConfigs(affiliateSyncConfigFilters, {
      page: 0,
      size: affiliateSyncConfigPaginationRef.current.size,
    })
  }

  function reloadAffiliateSyncConfigFilters() {
    setAffiliateSyncConfigFilters({
      affiliateNetwork: '',
      ownerPhoneNumber: '',
    })
    setAffiliateSyncConfigQueryApplied(false)
    void loadAffiliateSyncConfigs({}, { page: 0, size: affiliateSyncConfigPaginationRef.current.size })
  }

  function applyAffiliateSyncTaskFilters(event) {
    event.preventDefault()
    setAffiliateSyncTaskQueryApplied(true)
    void loadAffiliateSyncTasks(affiliateSyncTaskFilters, {
      page: 0,
      size: affiliateSyncTaskPaginationRef.current.size,
    })
  }

  function reloadAffiliateSyncTaskFilters() {
    setAffiliateSyncTaskFilters({
      affiliateAdsSyncConfigId: '',
      ownerPhoneNumber: '',
    })
    setAffiliateSyncTaskQueryApplied(false)
    void loadAffiliateSyncTasks({}, { page: 0, size: affiliateSyncTaskPaginationRef.current.size })
  }

  function applyAffiliateTestTaskFilters(event) {
    event.preventDefault()
    setAffiliateTestTaskQueryApplied(true)
    void loadAffiliateTestTasks(affiliateTestTaskFilters, {
      page: 0,
      size: affiliateTestTaskPaginationRef.current.size,
    })
  }

  function reloadAffiliateTestTaskFilters() {
    setAffiliateTestTaskFilters({
      affiliateAdsSyncConfigId: '',
      ownerPhoneNumber: '',
    })
    setAffiliateTestTaskQueryApplied(false)
    void loadAffiliateTestTasks({}, { page: 0, size: affiliateTestTaskPaginationRef.current.size })
  }

  function applyAffiliateTestResultFilters(event) {
    event.preventDefault()
    setAffiliateTestResultQueryApplied(true)
    void loadAffiliateTestResults(affiliateTestResultFilters, {
      page: 0,
      size: affiliateTestResultPaginationRef.current.size,
    })
  }

  function reloadAffiliateTestResultFilters() {
    setAffiliateTestResultFilters({
      affiliateNetwork: '',
      region: '',
      status: '',
      ownerPhoneNumber: '',
    })
    setAffiliateTestResultQueryApplied(false)
    void loadAffiliateTestResults({}, { page: 0, size: affiliateTestResultPaginationRef.current.size })
  }

  function applyAffiliateSyncResultFilters(event) {
    event.preventDefault()
    setAffiliateSyncResultQueryApplied(true)
    void loadAffiliateSyncResults(affiliateSyncResultFilters, {
      page: 0,
      size: affiliateSyncResultPaginationRef.current.size,
    })
  }

  function reloadAffiliateSyncResultFilters() {
    setAffiliateSyncResultFilters({
      affiliateNetwork: '',
      siteName: '',
      status: '',
      ownerPhoneNumber: '',
    })
    setAffiliateSyncResultQueryApplied(false)
    void loadAffiliateSyncResults({}, { page: 0, size: affiliateSyncResultPaginationRef.current.size })
  }

  function applyAffiliateJobDetailFilters(event) {
    event.preventDefault()
    setAffiliateJobDetailQueryApplied(true)
    void loadAffiliateJobDetails(affiliateJobDetailFilters, {
      page: 0,
      size: affiliateJobDetailPaginationRef.current.size,
    })
  }

  function reloadAffiliateJobDetailFilters() {
    setAffiliateJobDetailFilters({
      schedName: '',
      jobName: '',
      jobGroup: '',
      jobClassName: '',
      description: '',
    })
    setAffiliateJobDetailQueryApplied(false)
    void loadAffiliateJobDetails({}, { page: 0, size: affiliateJobDetailPaginationRef.current.size })
  }

  function applyAffiliateTriggerFilters(event) {
    event.preventDefault()
    setAffiliateTriggerQueryApplied(true)
    void loadAffiliateTriggers(affiliateTriggerFilters, {
      page: 0,
      size: affiliateTriggerPaginationRef.current.size,
    })
  }

  function reloadAffiliateTriggerFilters() {
    setAffiliateTriggerFilters({
      schedName: '',
      triggerName: '',
      triggerGroup: '',
      jobName: '',
      jobGroup: '',
      triggerState: '',
      triggerType: '',
    })
    setAffiliateTriggerQueryApplied(false)
    void loadAffiliateTriggers({}, { page: 0, size: affiliateTriggerPaginationRef.current.size })
  }

  function applyPaypalFilters(event) {
    event.preventDefault()
    setPaypalQueryApplied(true)
    void loadToolPaypals(paypalFilters, { page: 0, size: paypalPaginationRef.current.size })
  }

  function reloadPaypalFilters() {
    setPaypalFilters({ paypalEmail: '', primaryEmail: '', ownerPhoneNumber: '' })
    setPaypalQueryApplied(false)
    void loadToolPaypals({}, { page: 0, size: paypalPaginationRef.current.size })
  }

  function applyIncomeFilters(event) {
    event.preventDefault()
    setIncomeQueryApplied(true)
    void loadToolIncomes(incomeFilters, { page: 0, size: incomePaginationRef.current.size })
  }

  function reloadIncomeFilters() {
    setIncomeFilters({
      platformName: '',
      userName: '',
      paypalAccount: '',
      payoutDateBegin: '',
      payoutDateEnd: '',
      ownerPhoneNumber: '',
    })
    setIncomeQueryApplied(false)
    void loadToolIncomes({}, { page: 0, size: incomePaginationRef.current.size })
  }

  function applyOutcomeFilters(event) {
    event.preventDefault()
    setOutcomeQueryApplied(true)
    void loadToolOutcomes(outcomeFilters, { page: 0, size: outcomePaginationRef.current.size })
  }

  function reloadOutcomeFilters() {
    setOutcomeFilters({ outcomeType: '', payDateBegin: '', payDateEnd: '', ownerPhoneNumber: '' })
    setOutcomeQueryApplied(false)
    void loadToolOutcomes({}, { page: 0, size: outcomePaginationRef.current.size })
  }

  async function handleBulkUploadAds(event) {
    event.preventDefault()
    setBulkAdsSaving(true)
    setBulkAdsError('')
    setBulkAdsMessage('')

    try {
      if (!bulkAdsFile) {
        throw new Error('Please choose an Excel file to upload.')
      }

      const uploadFile = await createShiftLinkUploadFile(
        bulkAdsFile,
        getLoggedInAdsOwner(identifier, currentUser),
      )
      await uploadApiFile('/shift-links/bulk-upload', token, uploadFile)
      await loadAdsUrls(
        adsUrlQueryApplied ? adsUrlFiltersRef.current : {},
        adsUrlPaginationRef.current,
      )

      setAdsMessage('Bulk uploaded Shift Links successfully.')
      setBulkAdsMessage('Uploaded Shift Links successfully.')
      setShowBulkAdsModal(false)
      setBulkAdsFile(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setBulkAdsError(message)
    } finally {
      setBulkAdsSaving(false)
    }
  }

  // 从文件夹批量导入 Shift Link / Bulk import shift links from a folder.
  // 结构 / Structure: root/platform/campaign-file，文件内每行一个 Full URL，DisplayNumber 默认 100。
  async function handleFolderImportShiftLinks(event) {
    event.preventDefault()
    setFolderImportSaving(true)
    setFolderImportError('')
    setFolderImportMessage('')

    try {
      if (!folderImportFiles || folderImportFiles.length === 0) {
        throw new Error('Please choose a folder to import.')
      }

      const adsTypeValue = toOptionalTrimmedString(folderImportAdsType)
      if (!adsTypeValue) {
        throw new Error('Please select an Ads Type.')
      }

      // Display Number：用户输入，默认 100 / user input, defaults to 100
      const parsedDisplayNumber = Number.parseInt(folderImportDisplayNumber, 10)
      if (!Number.isFinite(parsedDisplayNumber) || parsedDisplayNumber < 0) {
        throw new Error('Please enter a valid Display Number (0 or greater).')
      }
      const resolvedDisplayNumber = parsedDisplayNumber

      const { entries, platformNames } = await parseFolderShiftLinks(folderImportFiles)

      // platform 不存在则直接新增 / create missing platforms directly
      const existingPlatforms = new Set(platformOptions)
      const createdPlatforms = []
      for (const platformNameValue of platformNames) {
        if (existingPlatforms.has(platformNameValue)) {
          continue
        }
        try {
          await requestApi('/platforms', {
            method: 'POST',
            token,
            body: { platformName: platformNameValue },
          })
          createdPlatforms.push(platformNameValue)
        } catch (error) {
          // 已存在则忽略 / ignore when the platform already exists
          const message = error instanceof Error ? error.message : ''
          if (!/already exists/i.test(message)) {
            throw error
          }
        }
      }

      const fallbackAdsOwner = getLoggedInAdsOwner(identifier, currentUser)
      let createdCount = 0
      const failures = []
      for (const entry of entries) {
        try {
          const parsedUrl = parseAdsUrl(entry.fullUrl)
          const payload = {
            adsType: adsTypeValue,
            adsName: entry.campaignName,
            platformName: entry.platformName,
            fullUrl: entry.fullUrl,
            landingPageUrl: parsedUrl.landingUrl,
            urlSuffix: parsedUrl.urlSuffix,
            displayNumber: resolvedDisplayNumber,
          }
          if (fallbackAdsOwner) {
            payload.adsOwner = fallbackAdsOwner
          }
          await requestApi('/shift-links', { method: 'POST', token, body: payload })
          createdCount += 1
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          failures.push(`${entry.platformName}/${entry.campaignName}: ${message}`)
        }
      }

      if (createdPlatforms.length > 0) {
        await loadPlatformOptions()
      }
      await loadAdsUrls(
        adsUrlQueryApplied ? adsUrlFiltersRef.current : {},
        adsUrlPaginationRef.current,
      )

      const summaryParts = [`Imported ${createdCount} shift links.`]
      if (createdPlatforms.length > 0) {
        summaryParts.push(`Created ${createdPlatforms.length} new platform(s).`)
      }
      if (failures.length > 0) {
        summaryParts.push(`${failures.length} failed.`)
      }
      const summary = summaryParts.join(' ')

      setAdsMessage(summary)

      if (failures.length > 0) {
        setFolderImportError(failures.slice(0, 5).join('\n'))
        setFolderImportMessage(summary)
      } else {
        setFolderImportMessage(summary)
        setShowFolderImportModal(false)
        setFolderImportFiles(null)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setFolderImportError(message)
    } finally {
      setFolderImportSaving(false)
    }
  }

  // 按 Campaign Name 或 Platform Name 整体删除 Shift Link / bulk delete shift links by campaign or platform
  async function handleBulkDeleteShiftLinks(event) {
    event.preventDefault()
    setBulkDeleteSaving(true)
    setBulkDeleteError('')
    setBulkDeleteMessage('')

    try {
      const value = toOptionalTrimmedString(bulkDeleteValue)
      const isPlatform = bulkDeleteMode === 'platform'
      if (!value) {
        throw new Error(isPlatform ? 'Please enter a Platform Name.' : 'Please enter a Campaign Name.')
      }

      const confirmed = window.confirm(
        `All shift links matching ${isPlatform ? 'Platform Name' : 'Campaign Name'} "${value}" will be permanently deleted. Continue?`,
      )
      if (!confirmed) {
        return
      }

      const params = isPlatform ? { platformName: value } : { campaignName: value }
      const response = await requestApi(`/shift-links/bulk-delete${buildQueryString(params)}`, {
        method: 'DELETE',
        token,
      })
      const deletedCount = response && typeof response.deletedCount === 'number' ? response.deletedCount : 0
      const summary = `Deleted ${deletedCount} shift link(s).`

      await loadAdsUrls(
        adsUrlQueryApplied ? adsUrlFiltersRef.current : {},
        adsUrlPaginationRef.current,
      )

      setAdsMessage(summary)
      setBulkDeleteMessage(summary)
      setShowBulkDeleteModal(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setBulkDeleteError(message)
    } finally {
      setBulkDeleteSaving(false)
    }
  }

  async function handleShiftLinkLogSearch(event) {
    event.preventDefault()
    setShiftLinkLogCatalogError('')
    await loadShiftLinkLogs({
      adsType: toOptionalTrimmedString(shiftLinkLogFilters.adsType),
      adsName: toOptionalTrimmedString(shiftLinkLogFilters.adsName),
      platformName: toOptionalTrimmedString(shiftLinkLogFilters.platformName),
      ownerPhoneNumber: toOptionalTrimmedString(shiftLinkLogFilters.ownerPhoneNumber),
    }, {
      page: 0,
      size: shiftLinkLogPaginationRef.current.size,
    })
  }

  function handleReloadShiftLinkLogs() {
    setShiftLinkLogFilters({
      adsType: defaultShiftLinkLogAdsType,
      adsName: '',
      platformName: '',
      ownerPhoneNumber: '',
    })
    setShiftLinkLogQueryApplied(false)
    setShiftLinkLogCatalogError('')
    setShiftLinkLogs([])
    setShiftLinkLogsError('')
    setShiftLinkLogsLoaded(false)
    setShiftLinkLogPagination((current) => createInitialPagination(current.size))
    void loadShiftLinkLogCatalog()
    void loadShiftLinkLogs({}, { page: 0, size: shiftLinkLogPaginationRef.current.size })
  }

  function handleShiftLinkLogPageChange(page) {
    if (!shiftLinkLogQueryApplied) {
      return
    }

    void loadShiftLinkLogs(shiftLinkLogFiltersRef.current, {
      page,
      size: shiftLinkLogPaginationRef.current.size,
    })
  }

  function handleShiftLinkLogPageSizeChange(size) {
    if (!shiftLinkLogQueryApplied) {
      setShiftLinkLogPagination(createInitialPagination(size))
      return
    }

    void loadShiftLinkLogs(shiftLinkLogFiltersRef.current, {
      page: 0,
      size,
    })
  }

  function startEditPlatform(item) {
    setEditingPlatformId(item.id)
    setPlatformName(item.platformName || '')
    setPaymentMethod(item.paymentMethod || '')
    setPlatformRemarks(item.remarks || '')
    setShowPlatformModal(true)
  }

  async function handleSavePlatform(event) {
    event.preventDefault()
    setSavingPlatform(true)
    setPlatformsError('')
    setPlatformsMessage('')

    try {
      const payload = {
        platformName,
        paymentMethod: paymentMethod || undefined,
        remarks: platformRemarks || undefined,
      }

      if (editingPlatformId) {
        await requestApi(`/platforms/${editingPlatformId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setPlatformsMessage('ADS platform updated successfully.')
      } else {
        await requestApi('/platforms', {
          method: 'POST',
          token,
          body: payload,
        })
        setPlatformsMessage('ADS platform created successfully.')
      }

      clearPlatformForm()
      setShowPlatformModal(false)
      await Promise.all([loadPlatformOptions(), loadPlatformList(platformPaginationRef.current)])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setPlatformsError(message)
    } finally {
      setSavingPlatform(false)
    }
  }

  async function handleDeletePlatform(id) {
    setPlatformsError('')
    setPlatformsMessage('')

    try {
      await requestApi(`/platforms/${id}`, {
        method: 'DELETE',
        token,
      })
      setPlatformsMessage('ADS platform deleted successfully.')
      await Promise.all([loadPlatformOptions(), loadPlatformList(platformPaginationRef.current)])
      if (editingPlatformId === id) {
        clearPlatformForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setPlatformsError(message)
    }
  }

  function startEditEmail(item) {
    setEditingEmailId(item.id)
    setEmailUserName(item.userName || '')
    setEmailBirthdayDate(toDateInputValue(item.birthdayDate))
    setEmailAddress(item.emailAddress || '')
    setEmailPassword(item.emailPwd || '')
    setEmailParentEmail(item.parentEmail || '')
    setEmailHomeAddress(item.address || '')
    setEmailRemarks(item.remarks || '')
    setShowEmailModal(true)
  }

  async function handleSaveEmail(event) {
    event.preventDefault()
    setSavingEmail(true)
    setEmailsError('')
    setEmailsMessage('')

    try {
      const userName = toOptionalTrimmedString(emailUserName)
      if (!userName) {
        throw new Error('User Name is required.')
      }

      const payload = {
        userName,
        birthdayDate: toApiDateValue(emailBirthdayDate),
        emailAddress: toOptionalTrimmedString(emailAddress),
        emailPwd: toOptionalTrimmedString(emailPassword),
        parentEmail: toOptionalTrimmedString(emailParentEmail),
        address: toOptionalTrimmedString(emailHomeAddress),
        remarks: toOptionalTrimmedString(emailRemarks),
      }

      if (editingEmailId) {
        await requestApi(`/tool-emails/${editingEmailId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setEmailsMessage('Email updated successfully.')
      } else {
        await requestApi('/tool-emails', {
          method: 'POST',
          token,
          body: payload,
        })
        setEmailsMessage('Email created successfully.')
      }

      clearEmailForm()
      setShowEmailModal(false)
      await loadToolEmails(emailQueryApplied ? emailFiltersRef.current : {}, emailPaginationRef.current)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setEmailsError(message)
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleDeleteEmail(id) {
    setEmailsError('')
    setEmailsMessage('')

    try {
      await requestApi(`/tool-emails/${id}`, {
        method: 'DELETE',
        token,
      })
      setEmailsMessage('Email deleted successfully.')
      await loadToolEmails(emailQueryApplied ? emailFiltersRef.current : {}, emailPaginationRef.current)
      if (editingEmailId === id) {
        clearEmailForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setEmailsError(message)
    }
  }

  function startEditAccount(item) {
    setEditingAccountId(item.id)
    setAccountEmailAddress(item.emailAddress || '')
    setAccountUserName(item.userName || '')
    setAccountPlatformName(item.platformName || '')
    setAccountPaymentStatus(item.paymentStatus || '')
    setAccountStatus(item.status || '')
    setAccountRegisterDate(toDateInputValue(item.registerDate))
    setAccountBalance(item.balance != null ? String(item.balance) : '')
    setAccountCurrency(item.currency || '')
    setAccountRemarks(item.remarks || '')
    setShowAccountModal(true)
  }

  function startEditAdsAccount(item) {
    setEditingAdsAccountId(item.id)
    setAdsAccountValue(item.adsAccount || '')
    setAdsAccountType(item.accountType || '')
    setAdsAccountAgencyPlatform(item.agencyPlatform || '')
    setAdsAccountMccAccount(item.mccAccount || '')
    setAdsAccountStatus(item.status || '')
    setShowAdsAccountModal(true)
  }

  function startEditIpProxy(item) {
    setEditingIpProxyId(item.id)
    setIpProxyType(item.proxyType || '')
    setIpProxyProtocol(item.proxyProtocol || '')
    setIpProxyInfo(item.proxyInfo || '')
    setIpProxyStatus(item.status || '')
    setIpProxyAdsOwner(item.adsOwner || '')
    setShowIpProxyModal(true)
  }

  function startEditAffiliateSyncConfig(item) {
    try {
      const responsePayloadState = parseResponsePayloadState(item.responsePayload)
      setEditingAffiliateSyncConfigId(item.id)
      setAffiliateSyncConfigNetwork(item.affiliateNetwork || '')
      setAffiliateSyncConfigName(item.syncName || '')
      setAffiliateSyncConfigUrl(item.url || '')
      setAffiliateSyncConfigMethod(item.method || '')
      setAffiliateSyncConfigRequestHeaderRows(parseParameterRows(item.requestHeaders))
      setAffiliateSyncConfigRequestPayloadRows(parseParameterRows(item.requestPayload))
      setAffiliateSyncConfigResponsePayloadFormat(responsePayloadState.format)
      setAffiliateSyncConfigResponsePayload(responsePayloadState.content)
      setShowAffiliateSyncConfigModal(true)
      setAffiliateSyncConfigsError('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateSyncConfigsError(message)
    }
  }

  async function handleSaveAccount(event) {
    event.preventDefault()
    setSavingAccount(true)
    setAccountsError('')
    setAccountsMessage('')

    try {
      const userName = toOptionalTrimmedString(accountUserName)
      if (!userName) {
        throw new Error('User Name is required.')
      }

      const normalizedBalance = toOptionalTrimmedString(accountBalance)
      const balance = normalizedBalance === undefined ? undefined : Number(normalizedBalance)

      if (normalizedBalance !== undefined && !Number.isFinite(balance)) {
        throw new Error('Balance must be a valid number.')
      }

      const payload = {
        emailAddress: toOptionalTrimmedString(accountEmailAddress),
        userName,
        platformName: toOptionalTrimmedString(accountPlatformName),
        paymentStatus: toOptionalTrimmedString(accountPaymentStatus),
        status: toOptionalTrimmedString(accountStatus),
        registerDate: toApiDateValue(accountRegisterDate),
        balance,
        currency: toOptionalTrimmedString(accountCurrency),
        remarks: toOptionalTrimmedString(accountRemarks),
      }

      if (editingAccountId) {
        await requestApi(`/tool-accounts/${editingAccountId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setAccountsMessage('Cash Bach Account updated successfully.')
      } else {
        await requestApi('/tool-accounts', {
          method: 'POST',
          token,
          body: payload,
        })
        setAccountsMessage('Cash Bach Account created successfully.')
      }

      clearAccountForm()
      setShowAccountModal(false)
      await loadToolAccounts(accountQueryApplied ? accountFiltersRef.current : {}, accountPaginationRef.current)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAccountsError(message)
    } finally {
      setSavingAccount(false)
    }
  }

  async function handleSaveAdsAccount(event) {
    event.preventDefault()
    setSavingAdsAccount(true)
    setAdsAccountsError('')
    setAdsAccountsMessage('')

    try {
      const normalizedAdsAccount = toOptionalTrimmedString(adsAccountValue)
      if (!normalizedAdsAccount) {
        throw new Error('Ads Account is required.')
      }

      const payload = {
        adsAccount: normalizedAdsAccount,
        accountType: toOptionalTrimmedString(adsAccountType),
        agencyPlatform:
          adsAccountType === 'Agency' ? toOptionalTrimmedString(adsAccountAgencyPlatform) : undefined,
        mccAccount: toOptionalTrimmedString(adsAccountMccAccount),
        status: toOptionalTrimmedString(adsAccountStatus),
      }

      if (editingAdsAccountId) {
        await requestApi(`/ads-accounts/${editingAdsAccountId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setAdsAccountsMessage('Ads Account updated successfully.')
      } else {
        await requestApi('/ads-accounts', {
          method: 'POST',
          token,
          body: payload,
        })
        setAdsAccountsMessage('Ads Account created successfully.')
      }

      clearAdsAccountForm()
      setShowAdsAccountModal(false)
      await loadAdsAccounts(
        adsAccountQueryApplied ? adsAccountFiltersRef.current : {},
        adsAccountPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAdsAccountsError(message)
    } finally {
      setSavingAdsAccount(false)
    }
  }

  async function handleSaveIpProxy(event) {
    event.preventDefault()
    setSavingIpProxy(true)
    setIpProxiesError('')
    setIpProxiesMessage('')

    try {
      const normalizedProxyInfo = toOptionalTrimmedString(ipProxyInfo)
      if (!normalizedProxyInfo) {
        throw new Error('Proxy Info is required.')
      }

      const payload = {
        proxyType: toOptionalTrimmedString(ipProxyType),
        proxyProtocol: toOptionalTrimmedString(ipProxyProtocol),
        proxyInfo: normalizedProxyInfo,
        status: toOptionalTrimmedString(ipProxyStatus),
        adsOwner: toOptionalTrimmedString(ipProxyAdsOwner),
      }

      if (editingIpProxyId) {
        await requestApi(`/ip-proxy-info/${editingIpProxyId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setIpProxiesMessage('IP Proxy updated successfully.')
      } else {
        await requestApi('/ip-proxy-info', {
          method: 'POST',
          token,
          body: payload,
        })
        setIpProxiesMessage('IP Proxy created successfully.')
      }

      clearIpProxyForm()
      setShowIpProxyModal(false)
      await loadIpProxies(ipProxyQueryApplied ? ipProxyFiltersRef.current : {}, ipProxyPaginationRef.current)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setIpProxiesError(message)
    } finally {
      setSavingIpProxy(false)
    }
  }

  async function handleSaveAffiliateSyncConfig(event) {
    event.preventDefault()
    setSavingAffiliateSyncConfig(true)
    setAffiliateSyncConfigsError('')
    setAffiliateSyncConfigsMessage('')

    try {
      const affiliateNetwork = toOptionalTrimmedString(affiliateSyncConfigNetwork)
      const syncName = toOptionalTrimmedString(affiliateSyncConfigName)
      const url = toOptionalTrimmedString(affiliateSyncConfigUrl)
      const method = toOptionalTrimmedString(affiliateSyncConfigMethod)

      if (!affiliateNetwork) {
        throw new Error('Affiliate Network is required.')
      }

      if (!syncName) {
        throw new Error('Sync Name is required.')
      }

      if (!url) {
        throw new Error('URL is required.')
      }

      if (!method) {
        throw new Error('Method is required.')
      }

      const payload = {
        affiliateNetwork,
        syncName,
        url,
        method,
        requestHeaders: serializeParameterRows(affiliateSyncConfigRequestHeaderRows),
        requestPayload: serializeParameterRows(affiliateSyncConfigRequestPayloadRows),
        responsePayload: serializeResponsePayloadState(
          affiliateSyncConfigResponsePayloadFormat,
          affiliateSyncConfigResponsePayload,
        ),
      }

      if (editingAffiliateSyncConfigId) {
        await requestApi(`/affiliate-ads-sync-config/${editingAffiliateSyncConfigId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setAffiliateSyncConfigsMessage('Ads Sync Config updated successfully.')
      } else {
        await requestApi('/affiliate-ads-sync-config', {
          method: 'POST',
          token,
          body: payload,
        })
        setAffiliateSyncConfigsMessage('Ads Sync Config created successfully.')
      }

      clearAffiliateSyncConfigForm()
      setShowAffiliateSyncConfigModal(false)
      await loadAffiliateSyncConfigs(
        affiliateSyncConfigQueryApplied ? affiliateSyncConfigFiltersRef.current : {},
        affiliateSyncConfigPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateSyncConfigsError(message)
    } finally {
      setSavingAffiliateSyncConfig(false)
    }
  }

  async function handleSaveAffiliateSyncTask(event) {
    event.preventDefault()
    setSavingAffiliateSyncTask(true)
    setAffiliateSyncTasksError('')
    setAffiliateSyncTasksMessage('')

    try {
      const configIdText = toOptionalTrimmedString(affiliateSyncTaskConfigId)
      const configId = configIdText == null ? Number.NaN : Number(configIdText)

      if (!Number.isFinite(configId)) {
        throw new Error('Ads Sync Config is required.')
      }

      const region = toCountryCode(affiliateSyncTaskRegion)
      if (!region) {
        throw new Error('Region is required.')
      }

      const syncType = toOptionalTrimmedString(affiliateSyncTaskType)
      if (!syncType) {
        throw new Error('Sync Type is required.')
      }

      const cron = syncType === 'SCHEDULER' ? toOptionalTrimmedString(affiliateSyncTaskCron) : undefined
      if (syncType === 'SCHEDULER' && !cron) {
        throw new Error('Cron is required when Sync Type is SCHEDULER.')
      }

      const payload = {
        affiliateAdsSyncConfigId: configId,
        region,
        syncType,
        cron,
        totalCount: affiliateSyncTaskTotalCount,
        successCount: affiliateSyncTaskSuccessCount,
        failedCount: affiliateSyncTaskFailedCount,
        status: affiliateSyncTaskStatus || 'WAITING',
        adsOwner: toOptionalTrimmedString(affiliateSyncTaskAdsOwner),
      }

      if (editingAffiliateSyncTaskId) {
        await requestApi(`/affiliate-ads-sync-task/${editingAffiliateSyncTaskId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setAffiliateSyncTasksMessage('Ads Sync Task updated successfully.')
      } else {
        await requestApi('/affiliate-ads-sync-task', {
          method: 'POST',
          token,
          body: payload,
        })
        setAffiliateSyncTasksMessage('Ads Sync Task created successfully.')
      }

      clearAffiliateSyncTaskForm()
      setShowAffiliateSyncTaskModal(false)
      await loadAffiliateSyncTasks(
        affiliateSyncTaskQueryApplied ? affiliateSyncTaskFiltersRef.current : {},
        affiliateSyncTaskPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateSyncTasksError(message)
    } finally {
      setSavingAffiliateSyncTask(false)
    }
  }

  async function handleSaveAffiliateTestTask(event) {
    event.preventDefault()
    setSavingAffiliateTestTask(true)
    setAffiliateTestTasksError('')
    setAffiliateTestTasksMessage('')

    try {
      const configIdText = toOptionalTrimmedString(affiliateTestTaskConfigId)
      const configId = configIdText == null ? Number.NaN : Number(configIdText)
      if (!Number.isFinite(configId)) {
        throw new Error('Ads Sync Config is required.')
      }

      const region = toCountryCode(affiliateTestTaskRegion)
      if (!region) {
        throw new Error('Region is required.')
      }

      const ipProxyInfoIdText = toOptionalTrimmedString(affiliateTestTaskIpProxyInfoId)
      const ipProxyInfoId = ipProxyInfoIdText == null ? Number.NaN : Number(ipProxyInfoIdText)
      if (!Number.isFinite(ipProxyInfoId)) {
        throw new Error('IP Proxy is required.')
      }

      const payload = {
        affiliateAdsSyncConfigId: configId,
        region,
        ipProxyInfoId,
        totalCount: affiliateTestTaskTotalCount,
        successCount: affiliateTestTaskSuccessCount,
        failedCount: affiliateTestTaskFailedCount,
        status: affiliateTestTaskStatus || 'WAITING',
        adsOwner: toOptionalTrimmedString(affiliateTestTaskAdsOwner),
      }

      if (editingAffiliateTestTaskId) {
        await requestApi(`/affiliate-ads-test-task/${editingAffiliateTestTaskId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setAffiliateTestTasksMessage('Ads Test Task updated successfully.')
      } else {
        await requestApi('/affiliate-ads-test-task', {
          method: 'POST',
          token,
          body: payload,
        })
        setAffiliateTestTasksMessage('Ads Test Task created successfully.')
      }

      clearAffiliateTestTaskForm()
      setShowAffiliateTestTaskModal(false)
      await loadAffiliateTestTasks(
        affiliateTestTaskQueryApplied ? affiliateTestTaskFiltersRef.current : {},
        affiliateTestTaskPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateTestTasksError(message)
    } finally {
      setSavingAffiliateTestTask(false)
    }
  }

  async function handleSaveAffiliateTestResult(event) {
    event.preventDefault()
    setSavingAffiliateTestResult(true)
    setAffiliateTestResultsError('')
    setAffiliateTestResultsMessage('')

    try {
      const affiliateNetwork = toOptionalTrimmedString(affiliateTestResultNetwork)
      const region = toCountryCode(affiliateTestResultRegion)
      const siteName = toOptionalTrimmedString(affiliateTestResultSiteName)

      if (!affiliateNetwork) {
        throw new Error('Affiliate Network is required.')
      }

      if (!region) {
        throw new Error('Region is required.')
      }

      if (!siteName) {
        throw new Error('Site Name is required.')
      }

      const payload = {
        affiliateNetwork,
        region,
        siteName,
        siteUrl: toOptionalTrimmedString(affiliateTestResultSiteUrl),
        trackingUrl: toOptionalTrimmedString(affiliateTestResultTrackingUrl),
        finalUrl: toOptionalTrimmedString(affiliateTestResultFinalUrl),
        status: toOptionalTrimmedString(affiliateTestResultStatus),
        adsOwner: toOptionalTrimmedString(affiliateTestResultAdsOwner || loggedInAdsOwner),
      }

      if (editingAffiliateTestResultId) {
        await requestApi(`/affiliate-ads-test-result/${editingAffiliateTestResultId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setAffiliateTestResultsMessage('Ads Test Result updated successfully.')
      } else {
        await requestApi('/affiliate-ads-test-result', {
          method: 'POST',
          token,
          body: payload,
        })
        setAffiliateTestResultsMessage('Ads Test Result created successfully.')
      }

      clearAffiliateTestResultForm()
      setShowAffiliateTestResultModal(false)
      await loadAffiliateTestResults(
        affiliateTestResultQueryApplied ? affiliateTestResultFiltersRef.current : {},
        affiliateTestResultPaginationRef.current,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateTestResultsError(message)
    } finally {
      setSavingAffiliateTestResult(false)
    }
  }

  async function handleDeleteAccount(id) {
    setAccountsError('')
    setAccountsMessage('')

    try {
      await requestApi(`/tool-accounts/${id}`, {
        method: 'DELETE',
        token,
      })
      setAccountsMessage('Cash Bach Account deleted successfully.')
      await loadToolAccounts(accountQueryApplied ? accountFiltersRef.current : {}, accountPaginationRef.current)
      if (editingAccountId === id) {
        clearAccountForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAccountsError(message)
    }
  }

  async function handleDeleteAdsAccount(id) {
    setAdsAccountsError('')
    setAdsAccountsMessage('')

    try {
      await requestApi(`/ads-accounts/${id}`, {
        method: 'DELETE',
        token,
      })
      setAdsAccountsMessage('Ads Account deleted successfully.')
      await loadAdsAccounts(
        adsAccountQueryApplied ? adsAccountFiltersRef.current : {},
        adsAccountPaginationRef.current,
      )
      if (editingAdsAccountId === id) {
        clearAdsAccountForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAdsAccountsError(message)
    }
  }

  async function handleDeleteIpProxy(id) {
    setIpProxiesError('')
    setIpProxiesMessage('')

    try {
      await requestApi(`/ip-proxy-info/${id}`, {
        method: 'DELETE',
        token,
      })
      setIpProxiesMessage('IP Proxy deleted successfully.')
      await loadIpProxies(ipProxyQueryApplied ? ipProxyFiltersRef.current : {}, ipProxyPaginationRef.current)
      if (editingIpProxyId === id) {
        clearIpProxyForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setIpProxiesError(message)
    }
  }

  async function handleDeleteAffiliateSyncConfig(id) {
    setAffiliateSyncConfigsError('')
    setAffiliateSyncConfigsMessage('')

    try {
      await requestApi(`/affiliate-ads-sync-config/${id}`, {
        method: 'DELETE',
        token,
      })
      setAffiliateSyncConfigsMessage('Ads Sync Config deleted successfully.')
      await loadAffiliateSyncConfigs(
        affiliateSyncConfigQueryApplied ? affiliateSyncConfigFiltersRef.current : {},
        affiliateSyncConfigPaginationRef.current,
      )
      if (editingAffiliateSyncConfigId === id) {
        clearAffiliateSyncConfigForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setAffiliateSyncConfigsError(message)
    }
  }

  function startEditPaypal(item) {
    setEditingPaypalId(item.id)
    setPaypalEmail(item.paypalEmail || '')
    setPaypalPrimaryEmail(item.primaryEmail || '')
    setPaypalIdValue(item.paypalId || '')
    setShowPaypalModal(true)
  }

  async function handleSavePaypal(event) {
    event.preventDefault()
    setSavingPaypal(true)
    setPaypalsError('')
    setPaypalsMessage('')

    try {
      const normalizedPaypalEmail = toOptionalTrimmedString(paypalEmail)
      if (!normalizedPaypalEmail) {
        throw new Error('PayPal Email is required.')
      }

      const payload = {
        paypalEmail: normalizedPaypalEmail,
        primaryEmail: toOptionalTrimmedString(paypalPrimaryEmail),
        paypalId: toOptionalTrimmedString(paypalIdValue),
      }

      if (editingPaypalId) {
        await requestApi(`/tool-paypals/${editingPaypalId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setPaypalsMessage('PayPal account updated successfully.')
      } else {
        await requestApi('/tool-paypals', {
          method: 'POST',
          token,
          body: payload,
        })
        setPaypalsMessage('PayPal account created successfully.')
      }

      clearPaypalForm()
      setShowPaypalModal(false)
      await loadToolPaypals(paypalQueryApplied ? paypalFiltersRef.current : {}, paypalPaginationRef.current)
      await loadPaypalAccountOptions()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setPaypalsError(message)
    } finally {
      setSavingPaypal(false)
    }
  }

  async function handleDeletePaypal(id) {
    setPaypalsError('')
    setPaypalsMessage('')

    try {
      await requestApi(`/tool-paypals/${id}`, {
        method: 'DELETE',
        token,
      })
      setPaypalsMessage('PayPal account deleted successfully.')
      await loadToolPaypals(paypalQueryApplied ? paypalFiltersRef.current : {}, paypalPaginationRef.current)
      await loadPaypalAccountOptions()
      if (editingPaypalId === id) {
        clearPaypalForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setPaypalsError(message)
    }
  }

  function startEditIncome(item) {
    setEditingIncomeId(item.id)
    setIncomePlatformName(item.platformName || '')
    setIncomeUserName(item.userName || '')
    setIncomeAmount(item.incomeAmount != null ? String(item.incomeAmount) : '')
    setIncomeCurrency(item.currency || '')
    setIncomePaymentMethod(item.paymentMethod || '')
    setIncomePaypalAccount(item.paypalAccount || '')
    setIncomePayoutDate(toDateInputValue(item.payoutDate))
    setIncomeRemarks(item.remarks || '')
    setShowIncomeModal(true)
  }

  async function handleSaveIncome(event) {
    event.preventDefault()
    setSavingIncome(true)
    setIncomesError('')
    setIncomesMessage('')

    try {
      const platformName = toOptionalTrimmedString(incomePlatformName)
      if (!platformName) {
        throw new Error('Platform Name is required.')
      }

      const userName = toOptionalTrimmedString(incomeUserName)
      if (!userName) {
        throw new Error('User Name is required.')
      }

      const normalizedAmount = toOptionalTrimmedString(incomeAmount)
      const parsedAmount = normalizedAmount === undefined ? Number.NaN : Number(normalizedAmount)
      if (!Number.isFinite(parsedAmount)) {
        throw new Error('Income Amount must be a valid number.')
      }

      const payload = {
        platformName,
        userName,
        incomeAmount: parsedAmount,
        currency: toOptionalTrimmedString(incomeCurrency),
        paymentMethod: toOptionalTrimmedString(incomePaymentMethod),
        paypalAccount: toOptionalTrimmedString(incomePaypalAccount),
        payoutDate: toApiDateValue(incomePayoutDate),
        remarks: toOptionalTrimmedString(incomeRemarks),
      }

      if (editingIncomeId) {
        await requestApi(`/tool-incomes/${editingIncomeId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setIncomesMessage('Income record updated successfully.')
      } else {
        await requestApi('/tool-incomes', {
          method: 'POST',
          token,
          body: payload,
        })
        setIncomesMessage('Income record created successfully.')
      }

      clearIncomeForm()
      setShowIncomeModal(false)
      await loadToolIncomes(incomeQueryApplied ? incomeFiltersRef.current : {}, incomePaginationRef.current)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setIncomesError(message)
    } finally {
      setSavingIncome(false)
    }
  }

  async function handleDeleteIncome(id) {
    setIncomesError('')
    setIncomesMessage('')

    try {
      await requestApi(`/tool-incomes/${id}`, {
        method: 'DELETE',
        token,
      })
      setIncomesMessage('Income record deleted successfully.')
      await loadToolIncomes(incomeQueryApplied ? incomeFiltersRef.current : {}, incomePaginationRef.current)
      if (editingIncomeId === id) {
        clearIncomeForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setIncomesError(message)
    }
  }

  function startEditOutcome(item) {
    setEditingOutcomeId(item.id)
    setOutcomeType(item.outcomeType || '')
    setOutcomeAmount(item.outcomeAmount != null ? String(item.outcomeAmount) : '')
    setOutcomeCurrency(item.currency || '')
    setOutcomePayDate(toDateInputValue(item.payDate))
    setOutcomeRemarks(item.remarks || '')
    setShowOutcomeModal(true)
  }

  async function handleSaveOutcome(event) {
    event.preventDefault()
    setSavingOutcome(true)
    setOutcomesError('')
    setOutcomesMessage('')

    try {
      const normalizedOutcomeType = toOptionalTrimmedString(outcomeType)
      if (!normalizedOutcomeType) {
        throw new Error('Outcome Type is required.')
      }

      const normalizedAmount = toOptionalTrimmedString(outcomeAmount)
      const parsedAmount = normalizedAmount === undefined ? Number.NaN : Number(normalizedAmount)
      if (!Number.isFinite(parsedAmount)) {
        throw new Error('Outcome Amount must be a valid number.')
      }

      const payload = {
        outcomeType: normalizedOutcomeType,
        outcomeAmount: parsedAmount,
        currency: toOptionalTrimmedString(outcomeCurrency),
        payDate: toApiDateValue(outcomePayDate),
        remarks: toOptionalTrimmedString(outcomeRemarks),
      }

      if (editingOutcomeId) {
        await requestApi(`/tool-outcomes/${editingOutcomeId}`, {
          method: 'PUT',
          token,
          body: payload,
        })
        setOutcomesMessage('Outcome record updated successfully.')
      } else {
        await requestApi('/tool-outcomes', {
          method: 'POST',
          token,
          body: payload,
        })
        setOutcomesMessage('Outcome record created successfully.')
      }

      clearOutcomeForm()
      setShowOutcomeModal(false)
      await loadToolOutcomes(outcomeQueryApplied ? outcomeFiltersRef.current : {}, outcomePaginationRef.current)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setOutcomesError(message)
    } finally {
      setSavingOutcome(false)
    }
  }

  async function handleDeleteOutcome(id) {
    setOutcomesError('')
    setOutcomesMessage('')

    try {
      await requestApi(`/tool-outcomes/${id}`, {
        method: 'DELETE',
        token,
      })
      setOutcomesMessage('Outcome record deleted successfully.')
      await loadToolOutcomes(outcomeQueryApplied ? outcomeFiltersRef.current : {}, outcomePaginationRef.current)
      if (editingOutcomeId === id) {
        clearOutcomeForm()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setOutcomesError(message)
    }
  }

  const currentPageTitle =
    activeMenu === 'user-management'
      ? 'User'
      : activeMenu === 'role-management'
        ? 'User Role'
        : activeMenu === 'user-agent-management'
          ? 'User Agent'
        : activeMenu === 'auto-script'
          ? 'Auto Script'
        : activeMenu === 'email-management'
          ? 'Email Management'
        : activeMenu === 'cash-bach-account'
          ? 'Cash Bach Account'
        : activeMenu === 'ads-account-management'
          ? 'Ads Account Management'
        : activeMenu === 'affiliate-job-detail'
          ? 'Auto Job'
        : activeMenu === 'affiliate-sync-config'
          ? 'API Config'
        : activeMenu === 'affiliate-sync-task'
          ? 'Auto Sync Task'
        : activeMenu === 'affiliate-test-task'
          ? 'Auto Test Task'
        : activeMenu === 'affiliate-test-result'
          ? 'Auto Test Report'
        : activeMenu === 'affiliate-sync-result'
          ? 'Auto Sync Report'
        : activeMenu === 'affiliate-trigger'
          ? 'Auto Trigger'
        : activeMenu === 'affiliate-ip-proxy'
          ? 'Proxy Config'
        : activeMenu === 'paypal-management'
          ? 'PayPal Management'
        : activeMenu === 'income-management'
          ? 'Income Management'
        : activeMenu === 'outcome-management'
          ? 'Expenditure Management'
        : activeMenu === 'ads-url-management'
          ? 'Shift Link'
          : activeMenu === 'shift-link-log'
            ? 'Shift Link Log'
          : activeMenu === 'test-shift-link'
            ? 'Shift Link Testing'
          : activeMenu === 'normal-ads-management'
            ? 'Normal Ads Tasks'
            : activeMenu === 'matrix-ads-management'
              ? 'Matrix Ads Tasks'
              : 'Platform'

  const currentUserRecord = users.find(
    (user) => user.userName === currentUser || user.userEmail === currentUser,
  ) || currentUserProfile

  if (!isAuthenticated) {
    return (
      <LoginForm
        identifier={identifier}
        password={password}
        loginError={loginError}
        isLoggingIn={isLoggingIn}
        onIdentifierChange={setIdentifier}
        onPasswordChange={setPassword}
        onSubmit={handleLoginSubmit}
      />
    )
  }

  let activeSection = null

  if (activeMenu === 'user-management') {
    activeSection = (
      <UserManagementSection
        users={users}
        usersLoading={usersLoading}
        usersError={usersError}
        usersMessage={usersMessage}
        onCreateUser={openCreateUser}
        onEditUser={startEditUser}
        onDeleteUser={handleDeleteUser}
        onToggleUser={handleToggleUser}
        formatDateDisplayValue={formatDateDisplayValue}
        getUserExpireDate={getUserExpireDate}
        showUserModal={showUserModal}
        editingUserId={editingUserId}
        onCloseUserModal={() => setShowUserModal(false)}
        onSaveUser={handleSaveUser}
        userName={userName}
        onUserNameChange={setUserName}
        userEmail={userEmail}
        onUserEmailChange={setUserEmail}
        userPhoneNumber={userPhoneNumber}
        onUserPhoneNumberChange={setUserPhoneNumber}
        userRole={userRole}
        onUserRoleChange={setUserRole}
        rolesLoading={rolesLoading}
        roleOptions={roleOptions}
        expireDate={expireDate}
        onExpireDateChange={setExpireDate}
        userNormalAdsNumber={userNormalAdsNumber}
        onUserNormalAdsNumberChange={setUserNormalAdsNumber}
        userMatrixAdsNumber={userMatrixAdsNumber}
        onUserMatrixAdsNumberChange={setUserMatrixAdsNumber}
        userPassword={userPassword}
        onUserPasswordChange={setUserPassword}
        userStatus={userStatus}
        onUserStatusChange={setUserStatus}
        savingUser={savingUser}
        pagination={usersPagination}
        onPageChange={handleUsersPageChange}
        onPageSizeChange={handleUsersPageSizeChange}
      />
    )
  } else if (activeMenu === 'user-agent-management') {
    activeSection = (
      <UserAgentManagementSection
        userAgents={userAgents}
        userAgentsLoading={userAgentsLoading}
        userAgentsError={userAgentsError}
        userAgentsMessage={userAgentsMessage}
        onCreateUserAgent={openCreateUserAgent}
        onEditUserAgent={startEditUserAgent}
        onDeleteUserAgent={handleDeleteUserAgent}
        showUserAgentModal={showUserAgentModal}
        editingUserAgentId={editingUserAgentId}
        userAgentDevice={userAgentDevice}
        onUserAgentDeviceChange={setUserAgentDevice}
        userAgentValue={userAgentValue}
        onUserAgentValueChange={setUserAgentValue}
        onSaveUserAgent={handleSaveUserAgent}
        savingUserAgent={savingUserAgent}
        onCloseUserAgentModal={() => setShowUserAgentModal(false)}
      />
    )
  } else if (activeMenu === 'role-management') {
    activeSection = (
      <RoleManagementSection
        roles={roles}
        rolesLoading={rolesLoading}
        rolesError={rolesError}
        rolesMessage={rolesMessage}
        onCreateRole={openCreateRole}
        onEditRole={startEditRole}
        onDeleteRole={handleDeleteRole}
        showRoleModal={showRoleModal}
        editingRoleId={editingRoleId}
        roleName={roleName}
        onRoleNameChange={setRoleName}
        onSaveRole={handleSaveRole}
        savingRole={savingRole}
        onCloseRoleModal={() => setShowRoleModal(false)}
      />
    )
  } else if (activeMenu === 'ads-url-management') {
    activeSection = (
      <ShiftLinkManagementSection
        adsUrls={adsUrls}
        adsLoading={adsLoading}
        adsError={adsError}
        adsMessage={adsMessage}
        adsUrlColumns={adsUrlColumns}
        adsUrlFilters={adsUrlFilters}
        adsTypeOptions={adsTypeOptions}
        adsNameOptions={adsUrlAdsNameOptions}
        filterPlatformOptions={adsUrlPlatformOptions}
        catalogLoading={shiftLinkLogCatalogLoading}
        catalogError={shiftLinkLogCatalogError}
        platformOptions={platformOptions}
        platformsLoading={platformsLoading}
        platformsError={platformsError}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        onCreateAds={openCreateAds}
        onOpenBulkAdsUpload={openBulkAdsUpload}
        onOpenFolderImport={openFolderImport}
        onDownloadAdsTemplate={handleDownloadAdsTemplate}
        onAdsUrlFiltersChange={handleAdsUrlFiltersChange}
        onApplyAdsUrlFilters={applyAdsUrlFilters}
        onReloadAdsUrlFilters={reloadAdsUrlFilters}
        onToggleAdsStatus={(item, status) => void updateAdsUrlStatus(item, status)}
        onEditAds={startEditAds}
        onDeleteAds={handleDeleteAds}
        formatAdsStatusLabel={formatAdsStatusLabel}
        getAdsStatusActionLabel={getAdsStatusActionLabel}
        getNextAdsStatus={getNextAdsStatus}
        showAdsModal={showAdsModal}
        editingAdsId={editingAdsId}
        capMainName={capMainName}
        onCapMainNameChange={setCapMainName}
        adsType={adsType}
        onAdsTypeChange={setAdsType}
        platform={platform}
        onPlatformChange={setPlatform}
        fullUrl={fullUrl}
        onFullUrlChange={setFullUrl}
        displayNumber={displayNumber}
        onDisplayNumberChange={setDisplayNumber}
        remark={remark}
        onRemarkChange={setRemark}
        onSaveAds={handleSaveAds}
        savingAds={savingAds}
        onCloseAdsModal={() => setShowAdsModal(false)}
        showBulkAdsModal={showBulkAdsModal}
        bulkAdsSaving={bulkAdsSaving}
        bulkAdsError={bulkAdsError}
        bulkAdsMessage={bulkAdsMessage}
        onBulkAdsFileChange={setBulkAdsFile}
        onBulkUploadAds={handleBulkUploadAds}
        onCloseBulkAdsModal={() => setShowBulkAdsModal(false)}
        showFolderImportModal={showFolderImportModal}
        folderImportAdsType={folderImportAdsType}
        onFolderImportAdsTypeChange={setFolderImportAdsType}
        folderImportDisplayNumber={folderImportDisplayNumber}
        onFolderImportDisplayNumberChange={setFolderImportDisplayNumber}
        folderImportSaving={folderImportSaving}
        folderImportError={folderImportError}
        folderImportMessage={folderImportMessage}
        onFolderImportFilesChange={setFolderImportFiles}
        onFolderImportShiftLinks={handleFolderImportShiftLinks}
        onCloseFolderImportModal={() => setShowFolderImportModal(false)}
        onOpenBulkDelete={openBulkDelete}
        showBulkDeleteModal={showBulkDeleteModal}
        bulkDeleteMode={bulkDeleteMode}
        onBulkDeleteModeChange={setBulkDeleteMode}
        bulkDeleteValue={bulkDeleteValue}
        onBulkDeleteValueChange={setBulkDeleteValue}
        bulkDeleteSaving={bulkDeleteSaving}
        bulkDeleteError={bulkDeleteError}
        bulkDeleteMessage={bulkDeleteMessage}
        onBulkDeleteShiftLinks={handleBulkDeleteShiftLinks}
        onCloseBulkDeleteModal={() => setShowBulkDeleteModal(false)}
        pagination={adsUrlPagination}
        onPageChange={handleAdsUrlPageChange}
        onPageSizeChange={handleAdsUrlPageSizeChange}
      />
    )
  } else if (activeMenu === 'shift-link-log') {
    activeSection = (
      <ShiftLinkLogSection
        filters={shiftLinkLogFilters}
        adsTypeOptions={adsTypeOptions}
        adsNameOptions={shiftLinkLogAdsNameOptions}
        platformOptions={shiftLinkLogPlatformOptions}
        catalogLoading={shiftLinkLogCatalogLoading}
        catalogError={shiftLinkLogCatalogError}
        logs={shiftLinkLogs}
        logsLoading={shiftLinkLogsLoading}
        logsError={shiftLinkLogsError}
        hasLoadedLogs={shiftLinkLogsLoaded}
        logColumns={shiftLinkLogColumns}
        pagination={shiftLinkLogPagination}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        onFiltersChange={handleShiftLinkLogFiltersChange}
        onSearch={(event) => void handleShiftLinkLogSearch(event)}
        onReload={handleReloadShiftLinkLogs}
        onPageChange={handleShiftLinkLogPageChange}
        onPageSizeChange={handleShiftLinkLogPageSizeChange}
      />
    )
  } else if (activeMenu === 'test-shift-link') {
    activeSection = (
      <TestShiftLinkSection
        campainName={testShiftLinkCampainName}
        onCampainNameChange={setTestShiftLinkCampainName}
        apiKey={testShiftLinkApiKey}
        onApiKeyChange={setTestShiftLinkApiKey}
        testError={testShiftLinkError}
        normalAdsTestLoading={normalAdsTestLoading}
        matrixAdsTestLoading={matrixAdsTestLoading}
        normalAdsTestResponse={normalAdsTestResponse}
        matrixAdsTestResponse={matrixAdsTestResponse}
        onTestNormalAds={() => void runTestShiftLink('normal')}
        onTestMatrixAds={() => void runTestShiftLink('matrix')}
      />
    )
  } else if (activeMenu === 'auto-script') {
    activeSection = <GoogleAdsScriptPanel currentUserApiKey={currentUserRecord?.apiKey || ''} />
  } else if (activeMenu === 'normal-ads-management') {
    activeSection = (
      <NormalAdsManagementSection
        normalAds={normalAds}
        normalAdsLoading={normalAdsLoading}
        normalAdsError={normalAdsError}
        normalAdsMessage={normalAdsMessage}
        normalAdsColumns={normalAdsColumns}
        normalAdsFilters={normalAdsFilters}
        adsStatusOptions={adsStatusOptions}
        countryOptions={COUNTRY_OPTIONS}
        platformOptions={platformOptions}
        platformsLoading={platformsLoading}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        onCreateNormalAds={openCreateNormalAds}
        canCreateNormalAds={canCreateNormalAds}
        normalAdsQuotaMessage={normalAdsQuotaMessage}
        onNormalAdsFiltersChange={setNormalAdsFilters}
        onApplyNormalAdsFilters={applyNormalAdsFilters}
        onToggleNormalAdsStatus={(item, status) => void updateNormalAdsStatus(item, status)}
        onEditNormalAds={startEditNormalAds}
        onDeleteNormalAds={handleDeleteNormalAds}
        formatAdsStatusLabel={formatAdsStatusLabel}
        getAdsStatusActionLabel={getAdsStatusActionLabel}
        getNextAdsStatus={getNextAdsStatus}
        showNormalAdsModal={showNormalAdsModal}
        editingNormalAdsId={editingNormalAdsId}
        normalCampainName={normalCampainName}
        onNormalCampainNameChange={setNormalCampainName}
        normalCampainCountry={normalCampainCountry}
        onNormalCampainCountryChange={setNormalCampainCountry}
        normalPlatformName={normalPlatformName}
        onNormalPlatformNameChange={setNormalPlatformName}
        normalAffiliteUrl={normalAffiliteUrl}
        onNormalAffiliteUrlChange={setNormalAffiliteUrl}
        normalLandingPageUrl={normalLandingPageUrl}
        onNormalLandingPageUrlChange={setNormalLandingPageUrl}
        normalDynamicProxyInfo={normalDynamicProxyInfo}
        onNormalDynamicProxyInfoChange={setNormalDynamicProxyInfo}
        normalDynamicProxyInfoBackup={normalDynamicProxyInfoBackup}
        onNormalDynamicProxyInfoBackupChange={setNormalDynamicProxyInfoBackup}
        normalIntervalTime={normalIntervalTime}
        onNormalIntervalTimeChange={setNormalIntervalTime}
        normalStatus={normalStatus}
        onNormalStatusChange={setNormalStatus}
        onSaveNormalAds={handleSaveNormalAds}
        savingNormalAds={savingNormalAds}
        onCloseNormalAdsModal={() => setShowNormalAdsModal(false)}
        pagination={normalAdsPagination}
        onPageChange={handleNormalAdsPageChange}
        onPageSizeChange={handleNormalAdsPageSizeChange}
      />
    )
  } else if (activeMenu === 'matrix-ads-management') {
    activeSection = (
      <MatrixAdsManagementSection
        matrixAds={matrixAds}
        matrixAdsLoading={matrixAdsLoading}
        matrixAdsError={matrixAdsError}
        matrixAdsMessage={matrixAdsMessage}
        matrixAdsColumns={matrixAdsColumns}
        matrixAdsFilters={matrixAdsFilters}
        adsStatusOptions={adsStatusOptions}
        countryOptions={COUNTRY_OPTIONS}
        platformOptions={platformOptions}
        platformsLoading={platformsLoading}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        onCreateMatrixAds={openCreateMatrixAds}
        canCreateMatrixAds={canCreateMatrixAds}
        matrixAdsQuotaMessage={matrixAdsQuotaMessage}
        onMatrixAdsFiltersChange={setMatrixAdsFilters}
        onApplyMatrixAdsFilters={applyMatrixAdsFilters}
        onToggleMatrixAdsStatus={(item, status) => void updateMatrixAdsStatus(item, status)}
        onEditMatrixAds={startEditMatrixAds}
        onDeleteMatrixAds={handleDeleteMatrixAds}
        formatAdsStatusLabel={formatAdsStatusLabel}
        getAdsStatusActionLabel={getAdsStatusActionLabel}
        getNextAdsStatus={getNextAdsStatus}
        showMatrixAdsModal={showMatrixAdsModal}
        editingMatrixAdsId={editingMatrixAdsId}
        matrixCampainName={matrixCampainName}
        onMatrixCampainNameChange={setMatrixCampainName}
        matrixCampainCountry={matrixCampainCountry}
        onMatrixCampainCountryChange={setMatrixCampainCountry}
        matrixLandingPageUrl={matrixLandingPageUrl}
        onMatrixLandingPageUrlChange={setMatrixLandingPageUrl}
        matrixDynamicProxyInfo={matrixDynamicProxyInfo}
        onMatrixDynamicProxyInfoChange={setMatrixDynamicProxyInfo}
        matrixDynamicProxyInfoBackup={matrixDynamicProxyInfoBackup}
        onMatrixDynamicProxyInfoBackupChange={setMatrixDynamicProxyInfoBackup}
        matrixIntervalTime={matrixIntervalTime}
        onMatrixIntervalTimeChange={setMatrixIntervalTime}
        matrixStatus={matrixStatus}
        onMatrixStatusChange={setMatrixStatus}
        matrixAffiliateRows={matrixAffiliateRows}
        onAddMatrixAffiliateRow={addMatrixAffiliateRow}
        onUpdateMatrixAffiliateRow={updateMatrixAffiliateRow}
        onRemoveMatrixAffiliateRow={removeMatrixAffiliateRow}
        onSaveMatrixAds={handleSaveMatrixAds}
        savingMatrixAds={savingMatrixAds}
        onCloseMatrixAdsModal={() => setShowMatrixAdsModal(false)}
        pagination={matrixAdsPagination}
        onPageChange={handleMatrixAdsPageChange}
        onPageSizeChange={handleMatrixAdsPageSizeChange}
      />
    )
  } else if (activeMenu === 'email-management') {
    activeSection = (
      <EmailManagementSection
        emails={emails}
        emailsLoading={emailsLoading}
        emailsError={emailsError}
        emailsMessage={emailsMessage}
        emailFilters={emailFilters}
        onEmailFiltersChange={setEmailFilters}
        onApplyEmailFilters={applyEmailFilters}
        onReloadEmailFilters={reloadEmailFilters}
        onCreateEmail={openCreateEmail}
        onEditEmail={startEditEmail}
        onDeleteEmail={handleDeleteEmail}
        showEmailModal={showEmailModal}
        editingEmailId={editingEmailId}
        emailUserName={emailUserName}
        onEmailUserNameChange={setEmailUserName}
        emailBirthdayDate={emailBirthdayDate}
        onEmailBirthdayDateChange={setEmailBirthdayDate}
        emailAddress={emailAddress}
        onEmailAddressChange={setEmailAddress}
        emailPassword={emailPassword}
        onEmailPasswordChange={setEmailPassword}
        emailParentEmail={emailParentEmail}
        onEmailParentEmailChange={setEmailParentEmail}
        emailHomeAddress={emailHomeAddress}
        onEmailHomeAddressChange={setEmailHomeAddress}
        emailRemarks={emailRemarks}
        onEmailRemarksChange={setEmailRemarks}
        onSaveEmail={handleSaveEmail}
        savingEmail={savingEmail}
        onCloseEmailModal={() => setShowEmailModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={emailPagination}
        onPageChange={handleEmailPageChange}
        onPageSizeChange={handleEmailPageSizeChange}
      />
    )
  } else if (activeMenu === 'cash-bach-account') {
    activeSection = (
      <CashBachAccountManagementSection
        accounts={accounts}
        accountsLoading={accountsLoading}
        accountsError={accountsError}
        accountsMessage={accountsMessage}
        accountFilters={accountFilters}
        onAccountFiltersChange={setAccountFilters}
        onApplyAccountFilters={applyAccountFilters}
        onReloadAccountFilters={reloadAccountFilters}
        onCreateAccount={openCreateAccount}
        onEditAccount={startEditAccount}
        onDeleteAccount={handleDeleteAccount}
        showAccountModal={showAccountModal}
        editingAccountId={editingAccountId}
        accountEmailAddress={accountEmailAddress}
        accountUserName={accountUserName}
        onAccountUserNameChange={handleAccountUserNameSelection}
        accountPlatformName={accountPlatformName}
        onAccountPlatformNameChange={setAccountPlatformName}
        accountPaymentStatus={accountPaymentStatus}
        onAccountPaymentStatusChange={setAccountPaymentStatus}
        accountStatus={accountStatus}
        onAccountStatusChange={setAccountStatus}
        accountRegisterDate={accountRegisterDate}
        onAccountRegisterDateChange={setAccountRegisterDate}
        accountBalance={accountBalance}
        onAccountBalanceChange={setAccountBalance}
        accountCurrency={accountCurrency}
        onAccountCurrencyChange={setAccountCurrency}
        accountRemarks={accountRemarks}
        onAccountRemarksChange={setAccountRemarks}
        onSaveAccount={handleSaveAccount}
        savingAccount={savingAccount}
        onCloseAccountModal={() => setShowAccountModal(false)}
        userNameOptions={toolEmailUserOptions}
        userNameOptionsLoading={accountEmailOptionsLoading}
        accountStatusOptions={accountStatusOptions}
        accountPaymentStatusOptions={accountPaymentStatusOptions}
        accountCurrencyOptions={accountCurrencyOptions}
        platformOptions={platformOptions}
        platformsLoading={platformsLoading}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={accountPagination}
        onPageChange={handleAccountPageChange}
        onPageSizeChange={handleAccountPageSizeChange}
      />
    )
  } else if (activeMenu === 'ads-account-management') {
    activeSection = (
      <AdsAccountManagementSection
        adsAccounts={adsAccounts}
        adsAccountsLoading={adsAccountsLoading}
        adsAccountsError={adsAccountsError}
        adsAccountsMessage={adsAccountsMessage}
        adsAccountFilters={adsAccountFilters}
        onAdsAccountFiltersChange={handleAdsAccountFiltersChange}
        onApplyAdsAccountFilters={applyAdsAccountFilters}
        onReloadAdsAccountFilters={reloadAdsAccountFilters}
        onCreateAdsAccount={openCreateAdsAccount}
        onEditAdsAccount={startEditAdsAccount}
        onDeleteAdsAccount={handleDeleteAdsAccount}
        showAdsAccountModal={showAdsAccountModal}
        editingAdsAccountId={editingAdsAccountId}
        adsAccountValue={adsAccountValue}
        onAdsAccountValueChange={setAdsAccountValue}
        adsAccountType={adsAccountType}
        onAdsAccountTypeChange={handleAdsAccountTypeChange}
        adsAccountAgencyPlatform={adsAccountAgencyPlatform}
        onAdsAccountAgencyPlatformChange={setAdsAccountAgencyPlatform}
        adsAccountMccAccount={adsAccountMccAccount}
        onAdsAccountMccAccountChange={setAdsAccountMccAccount}
        adsAccountStatus={adsAccountStatus}
        onAdsAccountStatusChange={setAdsAccountStatus}
        onSaveAdsAccount={handleSaveAdsAccount}
        savingAdsAccount={savingAdsAccount}
        onCloseAdsAccountModal={() => setShowAdsAccountModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        adsAccountTypeOptions={adsAccountTypeOptions}
        adsAccountAgencyPlatformOptions={adsAccountAgencyPlatformOptions}
        adsAccountStatusOptions={adsAccountStatusOptions}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={adsAccountPagination}
        onPageChange={handleAdsAccountPageChange}
        onPageSizeChange={handleAdsAccountPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-job-detail') {
    activeSection = (
      <AffiliateJobDetailSection
        affiliateJobDetails={affiliateJobDetails}
        affiliateJobDetailsLoading={affiliateJobDetailsLoading}
        affiliateJobDetailsError={affiliateJobDetailsError}
        affiliateJobDetailsMessage={affiliateJobDetailsMessage}
        affiliateJobDetailFilters={affiliateJobDetailFilters}
        onAffiliateJobDetailFiltersChange={setAffiliateJobDetailFilters}
        onApplyAffiliateJobDetailFilters={applyAffiliateJobDetailFilters}
        onReloadAffiliateJobDetailFilters={reloadAffiliateJobDetailFilters}
        pagination={affiliateJobDetailPagination}
        onPageChange={handleAffiliateJobDetailPageChange}
        onPageSizeChange={handleAffiliateJobDetailPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-sync-config') {
    activeSection = (
      <AffiliateSyncConfigManagementSection
        affiliateSyncConfigs={affiliateSyncConfigs}
        affiliateSyncConfigsLoading={affiliateSyncConfigsLoading}
        affiliateSyncConfigsError={affiliateSyncConfigsError}
        affiliateSyncConfigsMessage={affiliateSyncConfigsMessage}
        affiliateSyncConfigFilters={affiliateSyncConfigFilters}
        onAffiliateSyncConfigFiltersChange={setAffiliateSyncConfigFilters}
        onApplyAffiliateSyncConfigFilters={applyAffiliateSyncConfigFilters}
        onReloadAffiliateSyncConfigFilters={reloadAffiliateSyncConfigFilters}
        onCreateAffiliateSyncConfig={openCreateAffiliateSyncConfig}
        onEditAffiliateSyncConfig={startEditAffiliateSyncConfig}
        onDeleteAffiliateSyncConfig={handleDeleteAffiliateSyncConfig}
        showAffiliateSyncConfigModal={showAffiliateSyncConfigModal}
        editingAffiliateSyncConfigId={editingAffiliateSyncConfigId}
        affiliateSyncConfigNetwork={affiliateSyncConfigNetwork}
        onAffiliateSyncConfigNetworkChange={setAffiliateSyncConfigNetwork}
        affiliateSyncConfigName={affiliateSyncConfigName}
        onAffiliateSyncConfigNameChange={setAffiliateSyncConfigName}
        affiliateSyncConfigUrl={affiliateSyncConfigUrl}
        onAffiliateSyncConfigUrlChange={setAffiliateSyncConfigUrl}
        affiliateSyncConfigMethod={affiliateSyncConfigMethod}
        onAffiliateSyncConfigMethodChange={setAffiliateSyncConfigMethod}
        affiliateSyncConfigRequestHeaderRows={affiliateSyncConfigRequestHeaderRows}
        onAddAffiliateSyncConfigRequestHeaderRow={addAffiliateSyncConfigRequestHeaderRow}
        onUpdateAffiliateSyncConfigRequestHeaderRow={updateAffiliateSyncConfigRequestHeaderRow}
        onRemoveAffiliateSyncConfigRequestHeaderRow={removeAffiliateSyncConfigRequestHeaderRow}
        affiliateSyncConfigRequestPayloadRows={affiliateSyncConfigRequestPayloadRows}
        onAddAffiliateSyncConfigRequestPayloadRow={addAffiliateSyncConfigRequestPayloadRow}
        onUpdateAffiliateSyncConfigRequestPayloadRow={updateAffiliateSyncConfigRequestPayloadRow}
        onRemoveAffiliateSyncConfigRequestPayloadRow={removeAffiliateSyncConfigRequestPayloadRow}
        affiliateSyncConfigResponsePayloadFormat={affiliateSyncConfigResponsePayloadFormat}
        onAffiliateSyncConfigResponsePayloadFormatChange={setAffiliateSyncConfigResponsePayloadFormat}
        affiliateSyncConfigResponsePayload={affiliateSyncConfigResponsePayload}
        onAffiliateSyncConfigResponsePayloadChange={setAffiliateSyncConfigResponsePayload}
        onSaveAffiliateSyncConfig={handleSaveAffiliateSyncConfig}
        savingAffiliateSyncConfig={savingAffiliateSyncConfig}
        onCloseAffiliateSyncConfigModal={() => setShowAffiliateSyncConfigModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        affiliateNetworkOptions={platformOptions}
        methodOptions={affiliateSyncMethodOptions}
        responseFormatOptions={affiliateSyncResponseFormatOptions}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={affiliateSyncConfigPagination}
        onPageChange={handleAffiliateSyncConfigPageChange}
        onPageSizeChange={handleAffiliateSyncConfigPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-sync-task') {
    activeSection = (
      <AffiliateSyncTaskManagementSection
        affiliateSyncTasks={affiliateSyncTasks}
        affiliateSyncTasksLoading={affiliateSyncTasksLoading}
        affiliateSyncTasksError={affiliateSyncTasksError}
        affiliateSyncTasksMessage={affiliateSyncTasksMessage}
        affiliateSyncTaskFilters={affiliateSyncTaskFilters}
        onAffiliateSyncTaskFiltersChange={setAffiliateSyncTaskFilters}
        onApplyAffiliateSyncTaskFilters={applyAffiliateSyncTaskFilters}
        onReloadAffiliateSyncTaskFilters={reloadAffiliateSyncTaskFilters}
        onCreateAffiliateSyncTask={openCreateAffiliateSyncTask}
        onEditAffiliateSyncTask={startEditAffiliateSyncTask}
        onDeleteAffiliateSyncTask={handleDeleteAffiliateSyncTask}
        onRunAffiliateSyncTask={handleRunAffiliateSyncTask}
        showAffiliateSyncTaskModal={showAffiliateSyncTaskModal}
        editingAffiliateSyncTaskId={editingAffiliateSyncTaskId}
        affiliateSyncTaskConfigId={affiliateSyncTaskConfigId}
        onAffiliateSyncTaskConfigIdChange={setAffiliateSyncTaskConfigId}
        affiliateSyncTaskRegion={affiliateSyncTaskRegion}
        onAffiliateSyncTaskRegionChange={setAffiliateSyncTaskRegion}
        affiliateSyncTaskType={affiliateSyncTaskType}
        onAffiliateSyncTaskTypeChange={handleAffiliateSyncTaskTypeChange}
        affiliateSyncTaskCron={affiliateSyncTaskCron}
        onAffiliateSyncTaskCronChange={setAffiliateSyncTaskCron}
        onSaveAffiliateSyncTask={handleSaveAffiliateSyncTask}
        savingAffiliateSyncTask={savingAffiliateSyncTask}
        runningAffiliateSyncTaskId={runningAffiliateSyncTaskId}
        onCloseAffiliateSyncTaskModal={() => setShowAffiliateSyncTaskModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        affiliateSyncConfigOptions={affiliateSyncConfigOptions}
        affiliateSyncConfigOptionsLoading={affiliateSyncConfigOptionsLoading}
        countryOptions={COUNTRY_OPTIONS}
        syncTypeOptions={affiliateSyncTypeOptions}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={affiliateSyncTaskPagination}
        onPageChange={handleAffiliateSyncTaskPageChange}
        onPageSizeChange={handleAffiliateSyncTaskPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-sync-result') {
    activeSection = (
      <AffiliateSyncResultManagementSection
        affiliateSyncResults={affiliateSyncResults}
        affiliateSyncResultsLoading={affiliateSyncResultsLoading}
        affiliateSyncResultsError={affiliateSyncResultsError}
        affiliateSyncResultsMessage={affiliateSyncResultsMessage}
        affiliateSyncResultFilters={affiliateSyncResultFilters}
        onAffiliateSyncResultFiltersChange={setAffiliateSyncResultFilters}
        onApplyAffiliateSyncResultFilters={applyAffiliateSyncResultFilters}
        onReloadAffiliateSyncResultFilters={reloadAffiliateSyncResultFilters}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        affiliateNetworkOptions={platformOptions}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={affiliateSyncResultPagination}
        runningAffiliateSyncResultId={runningAffiliateSyncResultId}
        onTestAffiliateSyncResult={handleTestAffiliateSyncResult}
        onPageChange={handleAffiliateSyncResultPageChange}
        onPageSizeChange={handleAffiliateSyncResultPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-test-task') {
    activeSection = (
      <AffiliateTestTaskManagementSection
        affiliateTestTasks={affiliateTestTasks}
        affiliateTestTasksLoading={affiliateTestTasksLoading}
        affiliateTestTasksError={affiliateTestTasksError}
        affiliateTestTasksMessage={affiliateTestTasksMessage}
        affiliateTestTaskFilters={affiliateTestTaskFilters}
        onAffiliateTestTaskFiltersChange={setAffiliateTestTaskFilters}
        onApplyAffiliateTestTaskFilters={applyAffiliateTestTaskFilters}
        onReloadAffiliateTestTaskFilters={reloadAffiliateTestTaskFilters}
        onCreateAffiliateTestTask={openCreateAffiliateTestTask}
        onEditAffiliateTestTask={startEditAffiliateTestTask}
        onDeleteAffiliateTestTask={handleDeleteAffiliateTestTask}
        onRunAffiliateTestTask={handleRunAffiliateTestTask}
        showAffiliateTestTaskModal={showAffiliateTestTaskModal}
        editingAffiliateTestTaskId={editingAffiliateTestTaskId}
        affiliateTestTaskConfigId={affiliateTestTaskConfigId}
        onAffiliateTestTaskConfigIdChange={setAffiliateTestTaskConfigId}
        affiliateTestTaskRegion={affiliateTestTaskRegion}
        onAffiliateTestTaskRegionChange={setAffiliateTestTaskRegion}
        affiliateTestTaskIpProxyInfoId={affiliateTestTaskIpProxyInfoId}
        onAffiliateTestTaskIpProxyInfoIdChange={setAffiliateTestTaskIpProxyInfoId}
        onSaveAffiliateTestTask={handleSaveAffiliateTestTask}
        savingAffiliateTestTask={savingAffiliateTestTask}
        runningAffiliateTestTaskId={runningAffiliateTestTaskId}
        onCloseAffiliateTestTaskModal={() => setShowAffiliateTestTaskModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        affiliateSyncConfigOptions={affiliateSyncConfigOptions}
        affiliateSyncConfigOptionsLoading={affiliateSyncConfigOptionsLoading}
        ipProxyOptions={ipProxyOptions}
        ipProxyOptionsLoading={ipProxyOptionsLoading}
        countryOptions={COUNTRY_OPTIONS}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={affiliateTestTaskPagination}
        onPageChange={handleAffiliateTestTaskPageChange}
        onPageSizeChange={handleAffiliateTestTaskPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-test-result') {
    activeSection = (
      <AffiliateTestResultManagementSection
        affiliateTestResults={affiliateTestResults}
        affiliateTestResultsLoading={affiliateTestResultsLoading}
        affiliateTestResultsError={affiliateTestResultsError}
        affiliateTestResultsMessage={affiliateTestResultsMessage}
        affiliateTestResultFilters={affiliateTestResultFilters}
        onAffiliateTestResultFiltersChange={setAffiliateTestResultFilters}
        onApplyAffiliateTestResultFilters={applyAffiliateTestResultFilters}
        onReloadAffiliateTestResultFilters={reloadAffiliateTestResultFilters}
        onCreateAffiliateTestResult={openCreateAffiliateTestResult}
        onEditAffiliateTestResult={startEditAffiliateTestResult}
        onDeleteAffiliateTestResult={handleDeleteAffiliateTestResult}
        showAffiliateTestResultModal={showAffiliateTestResultModal}
        editingAffiliateTestResultId={editingAffiliateTestResultId}
        affiliateTestResultNetwork={affiliateTestResultNetwork}
        onAffiliateTestResultNetworkChange={setAffiliateTestResultNetwork}
        affiliateTestResultRegion={affiliateTestResultRegion}
        onAffiliateTestResultRegionChange={setAffiliateTestResultRegion}
        affiliateTestResultSiteName={affiliateTestResultSiteName}
        onAffiliateTestResultSiteNameChange={setAffiliateTestResultSiteName}
        affiliateTestResultSiteUrl={affiliateTestResultSiteUrl}
        onAffiliateTestResultSiteUrlChange={setAffiliateTestResultSiteUrl}
        affiliateTestResultTrackingUrl={affiliateTestResultTrackingUrl}
        onAffiliateTestResultTrackingUrlChange={setAffiliateTestResultTrackingUrl}
        affiliateTestResultFinalUrl={affiliateTestResultFinalUrl}
        onAffiliateTestResultFinalUrlChange={setAffiliateTestResultFinalUrl}
        affiliateTestResultStatus={affiliateTestResultStatus}
        onAffiliateTestResultStatusChange={setAffiliateTestResultStatus}
        onSaveAffiliateTestResult={handleSaveAffiliateTestResult}
        savingAffiliateTestResult={savingAffiliateTestResult}
        onCloseAffiliateTestResultModal={() => setShowAffiliateTestResultModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        affiliateNetworkOptions={platformOptions}
        countryOptions={COUNTRY_OPTIONS}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={affiliateTestResultPagination}
        onPageChange={handleAffiliateTestResultPageChange}
        onPageSizeChange={handleAffiliateTestResultPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-trigger') {
    activeSection = (
      <AffiliateTriggerSection
        affiliateTriggers={affiliateTriggers}
        affiliateTriggersLoading={affiliateTriggersLoading}
        affiliateTriggersError={affiliateTriggersError}
        affiliateTriggersMessage={affiliateTriggersMessage}
        affiliateTriggerFilters={affiliateTriggerFilters}
        onAffiliateTriggerFiltersChange={setAffiliateTriggerFilters}
        onApplyAffiliateTriggerFilters={applyAffiliateTriggerFilters}
        onReloadAffiliateTriggerFilters={reloadAffiliateTriggerFilters}
        pagination={affiliateTriggerPagination}
        onPageChange={handleAffiliateTriggerPageChange}
        onPageSizeChange={handleAffiliateTriggerPageSizeChange}
      />
    )
  } else if (activeMenu === 'affiliate-ip-proxy') {
    activeSection = (
      <IpProxyManagementSection
        ipProxies={ipProxies}
        ipProxiesLoading={ipProxiesLoading}
        ipProxiesError={ipProxiesError}
        ipProxiesMessage={ipProxiesMessage}
        ipProxyFilters={ipProxyFilters}
        onIpProxyFiltersChange={setIpProxyFilters}
        onApplyIpProxyFilters={applyIpProxyFilters}
        onReloadIpProxyFilters={reloadIpProxyFilters}
        onCreateIpProxy={openCreateIpProxy}
        onEditIpProxy={startEditIpProxy}
        onDeleteIpProxy={handleDeleteIpProxy}
        showIpProxyModal={showIpProxyModal}
        editingIpProxyId={editingIpProxyId}
        ipProxyType={ipProxyType}
        onIpProxyTypeChange={setIpProxyType}
        ipProxyProtocol={ipProxyProtocol}
        onIpProxyProtocolChange={setIpProxyProtocol}
        ipProxyInfo={ipProxyInfo}
        onIpProxyInfoChange={setIpProxyInfo}
        ipProxyStatus={ipProxyStatus}
        onIpProxyStatusChange={setIpProxyStatus}
        onSaveIpProxy={handleSaveIpProxy}
        savingIpProxy={savingIpProxy}
        onCloseIpProxyModal={() => setShowIpProxyModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ipProxyTypeOptions={IP_PROXY_TYPE_OPTIONS}
        ipProxyProtocolOptions={IP_PROXY_PROTOCOL_OPTIONS}
        ipProxyStatusOptions={IP_PROXY_STATUS_OPTIONS}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={ipProxyPagination}
        onPageChange={handleIpProxyPageChange}
        onPageSizeChange={handleIpProxyPageSizeChange}
      />
    )
  } else if (activeMenu === 'paypal-management') {
    activeSection = (
      <PaypalManagementSection
        paypals={paypals}
        paypalsLoading={paypalsLoading}
        paypalsError={paypalsError}
        paypalsMessage={paypalsMessage}
        paypalFilters={paypalFilters}
        onPaypalFiltersChange={setPaypalFilters}
        onApplyPaypalFilters={applyPaypalFilters}
        onReloadPaypalFilters={reloadPaypalFilters}
        onCreatePaypal={openCreatePaypal}
        onEditPaypal={startEditPaypal}
        onDeletePaypal={handleDeletePaypal}
        showPaypalModal={showPaypalModal}
        editingPaypalId={editingPaypalId}
        paypalEmail={paypalEmail}
        onPaypalEmailChange={setPaypalEmail}
        paypalPrimaryEmail={paypalPrimaryEmail}
        onPaypalPrimaryEmailChange={setPaypalPrimaryEmail}
        paypalIdValue={paypalIdValue}
        onPaypalIdValueChange={setPaypalIdValue}
        onSavePaypal={handleSavePaypal}
        savingPaypal={savingPaypal}
        onClosePaypalModal={() => setShowPaypalModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={paypalPagination}
        onPageChange={handlePaypalPageChange}
        onPageSizeChange={handlePaypalPageSizeChange}
      />
    )
  } else if (activeMenu === 'income-management') {
    activeSection = (
      <IncomeManagementSection
        incomes={incomes}
        incomesLoading={incomesLoading}
        incomesError={incomesError}
        incomesMessage={incomesMessage}
        incomeFilters={incomeFilters}
        onIncomeFiltersChange={setIncomeFilters}
        onApplyIncomeFilters={applyIncomeFilters}
        onReloadIncomeFilters={reloadIncomeFilters}
        onCreateIncome={openCreateIncome}
        onEditIncome={startEditIncome}
        onDeleteIncome={handleDeleteIncome}
        showIncomeModal={showIncomeModal}
        editingIncomeId={editingIncomeId}
        incomePlatformName={incomePlatformName}
        onIncomePlatformNameChange={setIncomePlatformName}
        incomeUserName={incomeUserName}
        onIncomeUserNameChange={setIncomeUserName}
        incomeAmount={incomeAmount}
        onIncomeAmountChange={setIncomeAmount}
        incomeCurrency={incomeCurrency}
        onIncomeCurrencyChange={setIncomeCurrency}
        incomePaymentMethod={incomePaymentMethod}
        onIncomePaymentMethodChange={setIncomePaymentMethod}
        incomePaypalAccount={incomePaypalAccount}
        onIncomePaypalAccountChange={setIncomePaypalAccount}
        incomePayoutDate={incomePayoutDate}
        onIncomePayoutDateChange={setIncomePayoutDate}
        incomeRemarks={incomeRemarks}
        onIncomeRemarksChange={setIncomeRemarks}
        onSaveIncome={handleSaveIncome}
        savingIncome={savingIncome}
        onCloseIncomeModal={() => setShowIncomeModal(false)}
        platformOptions={platformOptions}
        paymentMethodOptions={paymentMethodOptions}
        accountCurrencyOptions={accountCurrencyOptions}
        userNameOptions={toolEmailUserOptions}
        userNameOptionsLoading={accountEmailOptionsLoading}
        paypalAccountOptions={paypalAccountOptions}
        paypalAccountOptionsLoading={paypalAccountOptionsLoading}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={incomePagination}
        onPageChange={handleIncomePageChange}
        onPageSizeChange={handleIncomePageSizeChange}
      />
    )
  } else if (activeMenu === 'outcome-management') {
    activeSection = (
      <OutcomeManagementSection
        outcomes={outcomes}
        outcomesLoading={outcomesLoading}
        outcomesError={outcomesError}
        outcomesMessage={outcomesMessage}
        outcomeFilters={outcomeFilters}
        onOutcomeFiltersChange={setOutcomeFilters}
        onApplyOutcomeFilters={applyOutcomeFilters}
        onReloadOutcomeFilters={reloadOutcomeFilters}
        onCreateOutcome={openCreateOutcome}
        onEditOutcome={startEditOutcome}
        onDeleteOutcome={handleDeleteOutcome}
        showOutcomeModal={showOutcomeModal}
        editingOutcomeId={editingOutcomeId}
        outcomeType={outcomeType}
        onOutcomeTypeChange={setOutcomeType}
        outcomeAmount={outcomeAmount}
        onOutcomeAmountChange={setOutcomeAmount}
        outcomeCurrency={outcomeCurrency}
        onOutcomeCurrencyChange={setOutcomeCurrency}
        outcomePayDate={outcomePayDate}
        onOutcomePayDateChange={setOutcomePayDate}
        outcomeRemarks={outcomeRemarks}
        onOutcomeRemarksChange={setOutcomeRemarks}
        onSaveOutcome={handleSaveOutcome}
        savingOutcome={savingOutcome}
        onCloseOutcomeModal={() => setShowOutcomeModal(false)}
        showOwnerFilter={showAdminOwnerFilter}
        ownerOptions={ownerFilterOptions}
        ownerOptionsLoading={ownerFilterOptionsLoading}
        accountCurrencyOptions={accountCurrencyOptions}
        outcomeTypeOptions={outcomeTypeOptions}
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={outcomePagination}
        onPageChange={handleOutcomePageChange}
        onPageSizeChange={handleOutcomePageSizeChange}
      />
    )
  } else {
    activeSection = (
      <PlatformManagementSection
        platforms={platformList}
        platformsLoading={platformListLoading}
        platformsError={platformsError}
        platformsMessage={platformsMessage}
        onCreatePlatform={openCreatePlatform}
        onEditPlatform={startEditPlatform}
        onDeletePlatform={handleDeletePlatform}
        showPlatformModal={showPlatformModal}
        editingPlatformId={editingPlatformId}
        platformName={platformName}
        onPlatformNameChange={setPlatformName}
        paymentMethod={paymentMethod}
        paymentMethodOptions={paymentMethodOptions}
        onPaymentMethodChange={setPaymentMethod}
        platformRemarks={platformRemarks}
        onPlatformRemarksChange={setPlatformRemarks}
        onSavePlatform={handleSavePlatform}
        savingPlatform={savingPlatform}
        onClosePlatformModal={() => setShowPlatformModal(false)}
        pagination={platformPagination}
        onPageChange={handlePlatformPageChange}
        onPageSizeChange={handlePlatformPageSizeChange}
      />
    )
  }

  return (
    <main className="main-page">
      <Sidebar
        activeMenu={activeMenu}
        accessibleMenus={accessibleMenus}
        currentRole={currentUserRole}
        currentUserName={currentUser}
        menuGroups={MENU_GROUPS}
        onOpenChangePassword={openChangePasswordModal}
        onLogout={handleLogout}
        onSelectMenu={setActiveMenu}
      />

      <section className="content">
        <PageHeader
          title={currentPageTitle}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          currentUserApiKey={currentUserRecord?.apiKey}
          currentUserExpireDate={formatDateDisplayValue(getUserExpireDate(currentUserRecord))}
          runningNormalAdsCount={runningNormalAdsCount}
          normalAdsTotalCount={normalAdsTotalCount}
          runningMatrixAdsCount={runningMatrixAdsCount}
          matrixAdsTotalCount={matrixAdsTotalCount}
        />

        {activeSection}
        <ChangePasswordModal
          show={showChangePasswordModal}
          currentPassword={currentPassword}
          onCurrentPasswordChange={setCurrentPassword}
          newPassword={newPassword}
          onNewPasswordChange={setNewPassword}
          confirmPassword={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleChangePasswordSubmit}
          onClose={closeChangePasswordModal}
          saving={savingChangePassword}
          error={changePasswordError}
          message={changePasswordMessage}
        />
      </section>
    </main>
  )
}

export default App
