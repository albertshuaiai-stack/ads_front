import InlineFormCard from '../InlineFormCard/InlineFormCard'
import './ChangePasswordModal.css'

function ChangePasswordModal({
  show,
  currentPassword,
  onCurrentPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  onSubmit,
  onClose,
  saving,
  error,
  message,
}) {
  if (!show) {
    return null
  }

  return (
    <InlineFormCard
      title="Change Password"
      description="Update the password for the current logged-in user."
      onClose={onClose}
    >
      <form className="modal-form change-password-modal" onSubmit={onSubmit}>
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(event) => onCurrentPasswordChange(event.target.value)}
          placeholder="Enter your current password"
          autoComplete="current-password"
          required
        />

        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) => onNewPasswordChange(event.target.value)}
          placeholder="Enter your new password"
          autoComplete="new-password"
          required
        />

        <label htmlFor="confirmNewPassword">Confirm New Password</label>
        <input
          id="confirmNewPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          required
        />

        {error ? (
          <p className="status error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? <p className="status success">{message}</p> : null}

        <div className="form-actions">
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Updating...' : 'Change Password'}
          </button>
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </InlineFormCard>
  )
}

export default ChangePasswordModal
