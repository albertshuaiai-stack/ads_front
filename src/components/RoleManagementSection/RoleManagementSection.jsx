import InlineFormCard from '../InlineFormCard/InlineFormCard'
import './RoleManagementSection.css'

function RoleManagementSection({
  roles,
  rolesLoading,
  rolesError,
  rolesMessage,
  onCreateRole,
  onEditRole,
  onDeleteRole,
  showRoleModal,
  editingRoleId,
  roleName,
  onRoleNameChange,
  onSaveRole,
  savingRole,
  onCloseRoleModal,
}) {
  return (
    <>
      <div className="panel role-management">
        <div className="user-list">
          <div className="list-header">
            <h3>User Roles</h3>
            <div className="toolbar-actions">
              <button type="button" className="primary" onClick={onCreateRole}>
                Add Role
              </button>
            </div>
          </div>

          {rolesError ? (
            <p className="status error" role="alert">
              {rolesError}
            </p>
          ) : null}
          {rolesMessage ? <p className="status success">{rolesMessage}</p> : null}
          {rolesLoading ? <p>Loading roles...</p> : null}

          {!rolesLoading && roles.length === 0 ? (
            <p>No roles found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Role Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.id}</td>
                      <td>{role.roleName}</td>
                      <td className="actions">
                        <button type="button" className="secondary" onClick={() => onEditRole(role)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => onDeleteRole(role.id)}
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

      {showRoleModal ? (
        <InlineFormCard
          title={editingRoleId ? `Update Role #${editingRoleId}` : 'Add Role'}
          onClose={onCloseRoleModal}
        >
          <form className="modal-form" onSubmit={onSaveRole}>
            <label htmlFor="roleName">Role Name</label>
            <input
              id="roleName"
              value={roleName}
              onChange={(event) => onRoleNameChange(event.target.value)}
              required
            />

            <div className="form-actions">
              <button type="submit" className="primary" disabled={savingRole}>
                {savingRole ? 'Saving...' : editingRoleId ? 'Update Role' : 'Add Role'}
              </button>
              <button type="button" className="secondary" onClick={onCloseRoleModal}>
                Cancel
              </button>
            </div>
          </form>
        </InlineFormCard>
      ) : null}
    </>
  )
}

export default RoleManagementSection
