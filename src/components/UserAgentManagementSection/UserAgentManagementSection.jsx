import InlineFormCard from '../InlineFormCard/InlineFormCard'
import './UserAgentManagementSection.css'

function UserAgentManagementSection({
  userAgents,
  userAgentsLoading,
  userAgentsError,
  userAgentsMessage,
  onCreateUserAgent,
  onEditUserAgent,
  onDeleteUserAgent,
  showUserAgentModal,
  editingUserAgentId,
  userAgentDevice,
  onUserAgentDeviceChange,
  userAgentValue,
  onUserAgentValueChange,
  onSaveUserAgent,
  savingUserAgent,
  onCloseUserAgentModal,
}) {
  return (
    <>
      <div className="panel user-agent-management">
        <div className="user-list">
          <div className="list-header">
            <h3>User Agents</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateUserAgent}>
                Add User Agent
              </button>
            </div>
          </div>

          {userAgentsError ? (
            <p className="status error" role="alert">
              {userAgentsError}
            </p>
          ) : null}
          {userAgentsMessage ? <p className="status success">{userAgentsMessage}</p> : null}
          {userAgentsLoading ? <p>Loading user agents...</p> : null}

          {!userAgentsLoading && userAgents.length === 0 ? (
            <p>No user agents found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Device</th>
                    <th>User Agent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userAgents.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.device}</td>
                      <td className="user-agent-management__value">{item.userAgent}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onEditUserAgent(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteUserAgent(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showUserAgentModal ? (
        <InlineFormCard
          title={editingUserAgentId ? `Update User Agent #${editingUserAgentId}` : 'Add User Agent'}
          onClose={onCloseUserAgentModal}
        >
          <form className="modal-form" onSubmit={onSaveUserAgent}>
            <label htmlFor="userAgentDevice">Device</label>
            <input
              id="userAgentDevice"
              value={userAgentDevice}
              onChange={(event) => onUserAgentDeviceChange(event.target.value)}
              placeholder="Enter device, e.g. Android"
              required
            />

            <label htmlFor="userAgentValue">User Agent</label>
            <textarea
              id="userAgentValue"
              className="user-agent-management__textarea"
              value={userAgentValue}
              onChange={(event) => onUserAgentValueChange(event.target.value)}
              placeholder="Enter the full user agent string"
              required
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingUserAgent}>
                {savingUserAgent
                  ? 'Saving...'
                  : editingUserAgentId
                    ? 'Update User Agent'
                    : 'Add User Agent'}
              </button>
              <button type="button" className="secondary" onClick={onCloseUserAgentModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default UserAgentManagementSection
