// 用户角色模块状态与数据加载 / Role module state and data loading
import { useCallback, useState } from 'react'
import { extractItems, requestApi } from '../lib/adsPortal'

export function useRoles(token) {
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [rolesError, setRolesError] = useState('')
  const [rolesMessage, setRolesMessage] = useState('')
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [roleName, setRoleName] = useState('')
  const [savingRole, setSavingRole] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)

  const loadRoles = useCallback(async () => {
    setRolesLoading(true)
    setRolesError('')

    try {
      const response = await requestApi('/roles', { token })
      setRoles(extractItems(response))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setRolesError(message)
    } finally {
      setRolesLoading(false)
    }
  }, [token])

  return {
    roles, setRoles,
    rolesLoading, setRolesLoading,
    rolesError, setRolesError,
    rolesMessage, setRolesMessage,
    editingRoleId, setEditingRoleId,
    roleName, setRoleName,
    savingRole, setSavingRole,
    showRoleModal, setShowRoleModal,
    loadRoles,
  }
}
