import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  toOptionalTrimmedString,
  uploadApiFile,
} from './lib/adsPortal'

import { MENU_GROUPS, TOOL_MENU_IDS, SHIFT_LINK_TEMPLATE_FILE_URL } from './constants/menu'
import {
  ADS_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  OUTCOME_TYPE_OPTIONS,
  ACCOUNT_STATUS_OPTIONS,
  ACCOUNT_PAYMENT_STATUS_OPTIONS,
  ACCOUNT_CURRENCY_OPTIONS,
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
import { useRoles } from './hooks/useRoles'
import { usePlatforms } from './hooks/usePlatforms'
import { useNormalAds } from './hooks/useNormalAds'
import { useMatrixAds } from './hooks/useMatrixAds'
import { useShiftLinks } from './hooks/useShiftLinks'
import { useShiftLinkLogs } from './hooks/useShiftLinkLogs'
import { useTestShiftLink } from './hooks/useTestShiftLink'
import { useEmails } from './hooks/useEmails'
import { useAccounts } from './hooks/useAccounts'
import { usePaypals } from './hooks/usePaypals'
import { useIncomes } from './hooks/useIncomes'
import { useOutcomes } from './hooks/useOutcomes'

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
    folderImportSaving, setFolderImportSaving,
    folderImportError, setFolderImportError,
    folderImportMessage, setFolderImportMessage,
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

  const adsTypeOptions = useMemo(() => buildAdsTypeOptions(currentUserRole), [currentUserRole])

  const defaultShiftLinkLogAdsType = useMemo(
    () => (adsTypeOptions.length === 1 ? adsTypeOptions[0].value : ''),
    [adsTypeOptions],
  )

  const allowedShiftLinkLogAdsTypes = useMemo(
    () => new Set(adsTypeOptions.map((option) => option.value)),
    [adsTypeOptions],
  )

  const availableShiftLinkLogCatalog = useMemo(() => {
    return shiftLinkLogCatalog.filter((item) => {
      const adsType = normalizeShiftLinkAdsType(firstDefinedValue(item, ['adsType', 'ads_type']))
      return (
        adsType &&
        allowedShiftLinkLogAdsTypes.has(adsType) &&
        isOwnedByCurrentUser(item, currentUserProfile, currentUser, identifier)
      )
    })
  }, [shiftLinkLogCatalog, allowedShiftLinkLogAdsTypes, currentUserProfile, currentUser, identifier])

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
      collectCatalogFieldNames(availableShiftLinkLogCatalog, {
        field: CATALOG_ADS_NAME_FIELDS,
        adsType: adsUrlFilters.adsType,
      }),
    [adsUrlFilters.adsType, availableShiftLinkLogCatalog],
  )

  const adsUrlPlatformOptions = useMemo(
    () =>
      collectCatalogFieldNames(availableShiftLinkLogCatalog, {
        field: CATALOG_PLATFORM_NAME_FIELDS,
        adsType: adsUrlFilters.adsType,
        adsName: adsUrlFilters.adsName,
      }),
    [adsUrlFilters.adsName, adsUrlFilters.adsType, availableShiftLinkLogCatalog],
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
    setFolderImportSaving(false)
    setFolderImportError('')
    setFolderImportMessage('')
    setShowFolderImportModal(true)
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
        ...TOOL_MENU_IDS,
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
    loadToolPaypals,
    loadToolIncomes,
    loadToolOutcomes,
    loadAccountEmailOptions,
    loadPaypalAccountOptions,
    emailQueryApplied,
    accountQueryApplied,
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
    setAdsUrls([])
    setAdsError('')
    setAdsMessage('')
    setAdsUrlPagination(createInitialPagination())
    setShowBulkAdsModal(false)
    setBulkAdsFile(null)
    setBulkAdsSaving(false)
    setBulkAdsError('')
    setBulkAdsMessage('')
    setAdsUrlFilters({ adsType: defaultShiftLinkLogAdsType, adsName: '', platformName: '' })
    setAdsUrlQueryApplied(false)
    setNormalAds([])
    setNormalAdsError('')
    setNormalAdsMessage('')
    setNormalAdsPagination(createInitialPagination())
    setNormalAdsFilters({ campainName: '', platformName: '', status: '' })
    setNormalAdsQueryApplied(false)
    setMatrixAds([])
    setMatrixAdsError('')
    setMatrixAdsMessage('')
    setMatrixAdsPagination(createInitialPagination())
    setMatrixAdsFilters({ campainName: '', platformName: '', status: '' })
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
    setEmailFilters({ userName: '', emailAddress: '' })
    setEmailQueryApplied(false)
    setAccounts([])
    setAccountsError('')
    setAccountsMessage('')
    setAccountPagination(createInitialPagination())
    setAccountEmailOptionsSource([])
    setAccountEmailOptionsLoading(false)
    setAccountFilters({ userName: '', platformName: '', status: '' })
    setAccountQueryApplied(false)
    setPaypals([])
    setPaypalsError('')
    setPaypalsMessage('')
    setPaypalPagination(createInitialPagination())
    setPaypalFilters({ paypalEmail: '', primaryEmail: '' })
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
    })
    setIncomeQueryApplied(false)
    setOutcomes([])
    setOutcomesError('')
    setOutcomesMessage('')
    setOutcomePagination(createInitialPagination())
    setOutcomeFilters({ outcomeType: '', payDateBegin: '', payDateEnd: '' })
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
    setShowPaypalModal(false)
    setShowIncomeModal(false)
    setShowOutcomeModal(false)
    setShowUserModal(false)
    setShowAdsModal(false)
    setShowPlatformModal(false)
    clearUserForm()
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
    setEmailFilters({ userName: '', emailAddress: '' })
    setEmailQueryApplied(false)
    void loadToolEmails({}, { page: 0, size: emailPaginationRef.current.size })
  }

  function applyAccountFilters(event) {
    event.preventDefault()
    setAccountQueryApplied(true)
    void loadToolAccounts(accountFilters, { page: 0, size: accountPaginationRef.current.size })
  }

  function reloadAccountFilters() {
    setAccountFilters({ userName: '', platformName: '', status: '' })
    setAccountQueryApplied(false)
    void loadToolAccounts({}, { page: 0, size: accountPaginationRef.current.size })
  }

  function applyPaypalFilters(event) {
    event.preventDefault()
    setPaypalQueryApplied(true)
    void loadToolPaypals(paypalFilters, { page: 0, size: paypalPaginationRef.current.size })
  }

  function reloadPaypalFilters() {
    setPaypalFilters({ paypalEmail: '', primaryEmail: '' })
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
    setOutcomeFilters({ outcomeType: '', payDateBegin: '', payDateEnd: '' })
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
            displayNumber: 100,
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

  async function handleShiftLinkLogSearch(event) {
    event.preventDefault()
    setShiftLinkLogCatalogError('')
    await loadShiftLinkLogs({
      adsType: toOptionalTrimmedString(shiftLinkLogFilters.adsType),
      adsName: toOptionalTrimmedString(shiftLinkLogFilters.adsName),
      platformName: toOptionalTrimmedString(shiftLinkLogFilters.platformName),
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
        : activeMenu === 'auto-script'
          ? 'Auto Script'
        : activeMenu === 'email-management'
          ? 'Email Management'
        : activeMenu === 'cash-bach-account'
          ? 'Cash Bach Account'
        : activeMenu === 'paypal-management'
          ? 'PayPal Management'
        : activeMenu === 'income-management'
          ? 'Income Management'
        : activeMenu === 'outcome-management'
          ? 'Outcome Management'
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
        folderImportSaving={folderImportSaving}
        folderImportError={folderImportError}
        folderImportMessage={folderImportMessage}
        onFolderImportFilesChange={setFolderImportFiles}
        onFolderImportShiftLinks={handleFolderImportShiftLinks}
        onCloseFolderImportModal={() => setShowFolderImportModal(false)}
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
        formatDateDisplayValue={formatDateDisplayValue}
        pagination={accountPagination}
        onPageChange={handleAccountPageChange}
        onPageSizeChange={handleAccountPageSizeChange}
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
