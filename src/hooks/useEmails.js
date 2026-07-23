// 邮箱管理模块状态与数据加载 / Email management module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useEmails(token) {
  const [emails, setEmails] = useState([])
  const [emailsLoading, setEmailsLoading] = useState(false)
  const [emailsError, setEmailsError] = useState('')
  const [emailsMessage, setEmailsMessage] = useState('')
  const [emailPagination, setEmailPagination] = useState(() => createInitialPagination())
  const emailPaginationRef = useRef(emailPagination)
  const [emailFilters, setEmailFilters] = useState({
    userName: '',
    emailAddress: '',
  })
  const [emailQueryApplied, setEmailQueryApplied] = useState(false)
  const emailFiltersRef = useRef(emailFilters)
  const [editingEmailId, setEditingEmailId] = useState(null)
  const [emailUserName, setEmailUserName] = useState('')
  const [emailBirthdayDate, setEmailBirthdayDate] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailParentEmail, setEmailParentEmail] = useState('')
  const [emailHomeAddress, setEmailHomeAddress] = useState('')
  const [emailRemarks, setEmailRemarks] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  useEffect(() => {
    emailFiltersRef.current = emailFilters
  }, [emailFilters])

  useEffect(() => {
    emailPaginationRef.current = emailPagination
  }, [emailPagination])

  const loadToolEmails = useCallback(
    async (filters = emailFiltersRef.current, pageConfig = emailPaginationRef.current) => {
      setEmailsLoading(true)
      setEmailsError('')

      try {
        const response = await requestApi(
          `/tool-emails${buildQueryString({
            userName: filters.userName,
            emailAddress: filters.emailAddress,
            page: pageConfig.page,
            size: pageConfig.size,
          })}`,
          { token },
        )
        setEmails(extractItems(response))
        setEmailPagination(buildPaginationState(response, pageConfig))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        setEmailsError(message)
      } finally {
        setEmailsLoading(false)
      }
    },
    [token],
  )

  return {
    emails, setEmails,
    emailsLoading, setEmailsLoading,
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
  }
}
