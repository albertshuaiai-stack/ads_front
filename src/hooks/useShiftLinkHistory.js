// 历史投放数据录入：列表、单条维护、批量粘贴导入 / history data entry: list, single edit, bulk paste import
import { useCallback, useState } from 'react'
import { requestApi } from '../lib/adsPortal'

const EMPTY_FORM = { id: null, userName: '', platformName: '', adsName: '', linkCount: '', banned: false }

export function useShiftLinkHistory(token) {
  const [historyRows, setHistoryRows] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyMessage, setHistoryMessage] = useState('')
  const [historyForm, setHistoryForm] = useState(EMPTY_FORM)
  const [historyImportText, setHistoryImportText] = useState('')
  const [historySaving, setHistorySaving] = useState(false)

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const response = await requestApi('/shift-link-history', { token })
      setHistoryRows(Array.isArray(response) ? response : [])
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setHistoryLoading(false)
    }
  }, [token])

  // 每次写操作后刷新列表与统计 / refresh the list and stats after every write
  const runWrite = useCallback(
    async (action, onDone) => {
      setHistorySaving(true)
      setHistoryError('')
      setHistoryMessage('')
      try {
        const message = await action()
        setHistoryMessage(message)
        await loadHistory()
        if (onDone) await onDone()
      } catch (error) {
        setHistoryError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setHistorySaving(false)
      }
    },
    [loadHistory],
  )

  const saveHistory = useCallback(
    (onDone) =>
      runWrite(async () => {
        const body = {
          userName: historyForm.userName.trim(),
          platformName: historyForm.platformName.trim(),
          adsName: historyForm.adsName.trim(),
          banned: Boolean(historyForm.banned),
        }
        if (!body.userName || !body.platformName || !body.adsName) {
          throw new Error('Gmail, Platform and Merchant are required.')
        }
        const linkText = String(historyForm.linkCount ?? '').trim()
        if (linkText) {
          const linkCount = Number(linkText)
          if (!Number.isInteger(linkCount) || linkCount < 0) {
            throw new Error('Links must be a whole number of 0 or more.')
          }
          body.linkCount = linkCount
        }
        if (historyForm.id) {
          await requestApi(`/shift-link-history/${historyForm.id}`, { method: 'PUT', token, body })
        } else {
          await requestApi('/shift-link-history', { method: 'POST', token, body })
        }
        setHistoryForm(EMPTY_FORM)
        return 'History saved.'
      }, onDone),
    [historyForm, runWrite, token],
  )

  const importHistory = useCallback(
    (onDone) =>
      runWrite(async () => {
        if (!historyImportText.trim()) {
          throw new Error('Paste at least one line to import.')
        }
        const response = await requestApi('/shift-link-history/import', {
          method: 'POST',
          token,
          body: { text: historyImportText },
        })
        const errors = Array.isArray(response?.errors) ? response.errors : []
        if (errors.length === 0) {
          setHistoryImportText('')
        }
        const summary = `Imported: ${response?.createdCount ?? 0} created, ${response?.updatedCount ?? 0} updated.`
        return errors.length > 0 ? `${summary} ${errors.length} failed: ${errors.join(' | ')}` : summary
      }, onDone),
    [historyImportText, runWrite, token],
  )

  const toggleHistoryBanned = useCallback(
    (row, onDone) =>
      runWrite(async () => {
        await requestApi(`/shift-link-history/${row.id}`, {
          method: 'PUT',
          token,
          body: { ...row, banned: !row.banned },
        })
        return `${row.userName} / ${row.platformName} / ${row.adsName} marked as ${row.banned ? 'active' : 'banned'}.`
      }, onDone),
    [runWrite, token],
  )

  const deleteHistory = useCallback(
    (id, onDone) =>
      runWrite(async () => {
        await requestApi(`/shift-link-history/${id}`, { method: 'DELETE', token })
        return 'History deleted.'
      }, onDone),
    [runWrite, token],
  )

  const editHistory = useCallback((row) => {
    setHistoryForm({
      id: row.id,
      userName: row.userName || '',
      platformName: row.platformName || '',
      adsName: row.adsName || '',
      linkCount: row.linkCount == null ? '' : String(row.linkCount),
      banned: Boolean(row.banned),
    })
  }, [])

  const resetHistoryForm = useCallback(() => setHistoryForm(EMPTY_FORM), [])

  return {
    historyRows,
    historyLoading,
    historyError,
    historyMessage,
    historyForm,
    setHistoryForm,
    historyImportText,
    setHistoryImportText,
    historySaving,
    loadHistory,
    saveHistory,
    importHistory,
    toggleHistoryBanned,
    deleteHistory,
    editHistory,
    resetHistoryForm,
  }
}
