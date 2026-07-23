// 用户模块状态与数据加载 / User module state and data loading
import { useCallback, useEffect, useRef, useState } from 'react'
import { buildQueryString, extractItems, requestApi } from '../lib/adsPortal'
import { createInitialPagination, buildPaginationState } from '../utils/pagination'

export function useUsers(token) {
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [usersMessage, setUsersMessage] = useState('')
  const [usersPagination, setUsersPagination] = useState(() => createInitialPagination())
  const usersPaginationRef = useRef(usersPagination)
  const [editingUserId, setEditingUserId] = useState(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhoneNumber, setUserPhoneNumber] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userRole, setUserRole] = useState('')
  const [expireDate, setExpireDate] = useState('')
  const [userStatus, setUserStatus] = useState('ENABLED')
  const [savingUser, setSavingUser] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    usersPaginationRef.current = usersPagination
  }, [usersPagination])

  const loadUsers = useCallback(async (pageConfig = usersPaginationRef.current) => {
    setUsersLoading(true)
    setUsersError('')

    try {
      const response = await requestApi(
        `/users${buildQueryString({
          page: pageConfig.page,
          size: pageConfig.size,
        })}`,
        { token },
      )
      setUsers(extractItems(response))
      setUsersPagination(buildPaginationState(response, pageConfig))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setUsersError(message)
    } finally {
      setUsersLoading(false)
    }
  }, [token])

  return {
    users, setUsers,
    usersLoading, setUsersLoading,
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
  }
}
