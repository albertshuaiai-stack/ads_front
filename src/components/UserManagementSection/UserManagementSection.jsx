import InlineFormCard from '../InlineFormCard/InlineFormCard'
import PaginationControls from '../PaginationControls/PaginationControls'
import { getStatusToneClass } from '../../lib/adsPortal'
import './UserManagementSection.css'

function UserManagementSection({
  users,
  usersLoading,
  usersError,
  usersMessage,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onToggleUser,
  formatDateDisplayValue,
  getUserExpireDate,
  showUserModal,
  editingUserId,
  onCloseUserModal,
  onSaveUser,
  userName,
  onUserNameChange,
  userEmail,
  onUserEmailChange,
  userPhoneNumber,
  onUserPhoneNumberChange,
  userRole,
  onUserRoleChange,
  rolesLoading,
  roleOptions,
  expireDate,
  onExpireDateChange,
  userNormalAdsNumber,
  onUserNormalAdsNumberChange,
  userMatrixAdsNumber,
  onUserMatrixAdsNumberChange,
  userPassword,
  onUserPasswordChange,
  userStatus,
  onUserStatusChange,
  savingUser,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <>
      <div className="panel user-management">
        <div className="user-list">
          <div className="list-header">
            <h3>Users</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateUser}>
                Add User
              </button>
            </div>
          </div>

          {usersError ? (
            <p className="status error" role="alert">
              {usersError}
            </p>
          ) : null}
          {usersMessage ? <p className="status success">{usersMessage}</p> : null}
          {usersLoading ? <p>Loading users...</p> : null}

          {!usersLoading && users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Expire Date</th>
                    <th>Normal ADS</th>
                    <th>Matrix ADS</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={getStatusToneClass(user.status)}>
                      <td>{user.id}</td>
                      <td>{user.userName}</td>
                      <td>{user.userEmail}</td>
                      <td>{user.userPhoneNumber}</td>
                      <td>{user.userRole}</td>
                      <td>{formatDateDisplayValue(getUserExpireDate(user))}</td>
                      <td>{user.normalAdsNumber ?? user.normalAds ?? user.normalAdsCount ?? '—'}</td>
                      <td>{user.matrixAdsNumber ?? user.matrixAds ?? user.matrixAdsCount ?? '—'}</td>
                      <td>
                        <span className={`status-badge ${getStatusToneClass(user.status)}`}>
                          {user.status || '—'}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditUser(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() =>
                            onToggleUser(
                              user.id,
                              String(user.status).toUpperCase() !== 'ENABLED',
                            )
                          }
                        >
                          {String(user.status).toUpperCase() === 'ENABLED' ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <PaginationControls
            pagination={pagination}
            isLoading={usersLoading}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {showUserModal ? (
        <InlineFormCard
          title={editingUserId ? `Update User #${editingUserId}` : 'Add User'}
          onClose={onCloseUserModal}
        >
          <form className="modal-form user-management__modal" onSubmit={onSaveUser}>
            <label htmlFor="userName">Name</label>
            <input
              id="userName"
              value={userName}
              onChange={(event) => onUserNameChange(event.target.value)}
              placeholder="Enter user name, e.g. Albert Tan"
              maxLength={50}
              required
            />

            <label htmlFor="userEmail">Email</label>
            <input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(event) => onUserEmailChange(event.target.value)}
              placeholder="Enter email, e.g. albert@example.com"
              inputMode="email"
              required
            />

            <label htmlFor="userPhoneNumber">Phone</label>
            <input
              id="userPhoneNumber"
              value={userPhoneNumber}
              onChange={(event) => onUserPhoneNumberChange(event.target.value)}
              placeholder="Enter phone, e.g. +65 9123 4567"
              inputMode="tel"
              maxLength={20}
              required
            />

            <label htmlFor="userRole">Role</label>
            <select
              id="userRole"
              className="user-management__role-select"
              value={userRole}
              onChange={(event) => onUserRoleChange(event.target.value)}
              required
              disabled={rolesLoading || roleOptions.length === 0}
            >
              <option value="">Select a role</option>
              {roleOptions.map((roleNameOption) => (
                <option key={roleNameOption} value={roleNameOption}>
                  {roleNameOption}
                </option>
              ))}
            </select>
            {rolesLoading ? <p className="field-help">Loading roles...</p> : null}
            {!rolesLoading && roleOptions.length === 0 ? (
              <p className="field-help">Create a role first, then choose it here.</p>
            ) : null}

            <label htmlFor="expireDate">Expire Date</label>
            <input
              id="expireDate"
              type="date"
              value={expireDate}
              onChange={(event) => onExpireDateChange(event.target.value)}
            />
            <p className="field-help">Format: YYYY/MM/DD</p>

            <label htmlFor="userNormalAdsNumber">Normal ADS Number</label>
            <input
              id="userNormalAdsNumber"
              type="number"
              value={userNormalAdsNumber}
              onChange={(event) => onUserNormalAdsNumberChange(event.target.value)}
            />

            <label htmlFor="userMatrixAdsNumber">Matrix ADS Number</label>
            <input
              id="userMatrixAdsNumber"
              type="number"
              value={userMatrixAdsNumber}
              onChange={(event) => onUserMatrixAdsNumberChange(event.target.value)}
            />

            <label htmlFor="userPassword">
              Password {editingUserId ? '(leave blank to keep current password)' : ''}
            </label>
            <input
              id="userPassword"
              type="password"
              value={userPassword}
              onChange={(event) => onUserPasswordChange(event.target.value)}
              required={!editingUserId}
            />

            <label htmlFor="userStatus">Status</label>
            <select
              id="userStatus"
              value={userStatus}
              onChange={(event) => onUserStatusChange(event.target.value)}
            >
              <option value="ENABLED">ENABLED</option>
              <option value="DISABLED">DISABLED</option>
            </select>

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingUser}>
                {savingUser ? 'Saving...' : editingUserId ? 'Update User' : 'Add User'}
              </button>
              <button type="button" className="secondary" onClick={onCloseUserModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default UserManagementSection
