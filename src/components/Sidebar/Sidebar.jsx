import { useEffect, useMemo, useState } from 'react'
import './Sidebar.css'

function getIconFor(id) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  switch (id) {
    case 'user-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'role-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M12 2l3 6 6 .5-4.5 3 1.5 6L12 15l-6 3 1.5-6L3 8.5 9 8z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'ads-platform-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'user-agent-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'ads-url-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M10 14a4 4 0 005.657 0l1.414-1.414a4 4 0 10-5.657-5.657L9.343 8.343" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 10a4 4 0 00-5.657 0L6.93 11.414a4 4 0 105.657 5.657L14 15.656" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'email-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'cash-bach-account':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 12h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M9 9h6M9 15h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'cb-account-report':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M5 19V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M10 19V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M15 19v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M20 19v-11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M3 19h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'income-expenditure-report':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M4 18h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 18v-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12 18V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M17 18v-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M5 10l4-3 3 2 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'ads-account-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 14h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="17" cy="14" r="2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'affiliate-job-detail':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'affiliate-trigger':
      return (
        <svg {...common} aria-hidden focusable="false">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'affiliate-ip-proxy':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M7 12a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 17h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'affiliate-sync-result':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M16 7l2 2-4 4-2-2 4-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'affiliate-post-back':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M15 6l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'paypal-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 16l1.2-8h3.4a2.2 2.2 0 0 1 .4 4.36l-2.8.04" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 12.4h2.2a2 2 0 0 1 0 4H9.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'income-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M12 20V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 11l5-5 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'outcome-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M12 4v14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M17 13l-5 5-5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 4h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'shift-link-log':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M7 4h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 9h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 14h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M17 14l2 2-4 4-2-2 4-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'shift-link-dashboard':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M5 19V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M12 19V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M19 19v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M3 19h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'test-shift-link':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M9 3h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M10 3v4l-4.5 7.5A4 4 0 0 0 8.93 21h6.14a4 4 0 0 0 3.43-6.5L14 7V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 14h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'auto-script':
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M8 7h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8 17h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'normal-ads-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 20c1.5-4 5-6 7-6s5.5 2 7 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'matrix-ads-management':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
          <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
          <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
          <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    case 'ads-task-log':
      return (
        <svg {...common} aria-hidden focusable="false">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M15.5 6.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg {...common} aria-hidden focusable="false">
          <path d="M3 7h18v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 3h10v4H7z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
  }
}

function Sidebar({
  currentUserName,
  currentRole,
  activeMenu,
  accessibleMenus,
  onOpenChangePassword,
  onSelectMenu,
  onLogout,
  menuGroups,
}) {
  const visibleGroups = useMemo(
    () =>
      menuGroups
        .map((group) => {
          if (group.item) {
            return {
              ...group,
              visibleItem: accessibleMenus.includes(group.item.id) ? group.item : null,
              visibleItems: [],
            }
          }

          return {
            ...group,
            visibleItems: group.items.filter((item) => accessibleMenus.includes(item.id)),
          }
        })
        .filter((group) => group.visibleItem || group.visibleItems.length > 0),
    [accessibleMenus, menuGroups],
  )

  const [expandedGroups, setExpandedGroups] = useState({})

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = {}

      visibleGroups.forEach((group) => {
        if (group.visibleItem) {
          return
        }

        const hasActiveItem = group.visibleItems.some((item) => item.id === activeMenu)
        next[group.id] = hasActiveItem || current[group.id] !== false
      })

      return next
    })
  }, [activeMenu, visibleGroups])

  function toggleGroup(groupId) {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: current[groupId] === false,
    }))
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__title">ADS Portal</div>
        <div className="sidebar__meta">
          {currentUserName || 'Guest'} {currentRole ? `· ${currentRole}` : ''}
        </div>
      </div>

      <nav className="sidebar__nav">
        {visibleGroups.map((group) => {
          if (group.visibleItem) {
            const item = group.visibleItem
            const icon = getIconFor(item.id)
            return (
              <button
                className={`sidebar-item ${activeMenu === item.id ? 'sidebar-item--active' : ''}`}
                key={group.id}
                onClick={() => onSelectMenu(item.id)}
                type="button"
              >
                <span className="sidebar-item__icon" aria-hidden>{icon}</span>
                <span className="sidebar-item__label">{item.label}</span>
              </button>
            )
          }

          const isExpanded = expandedGroups[group.id] !== false
          return (
            <section className="sidebar-group" key={group.id}>
              <button
                type="button"
                className={`sidebar-group__toggle ${isExpanded ? 'sidebar-group__toggle--expanded' : ''}`}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isExpanded}
              >
                <span className="sidebar-group__title">{group.title}</span>
                <span className="sidebar-group__chevron" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {isExpanded ? (
                <div className="sidebar-group__items">
                  {group.visibleItems.map((item) => {
                  const icon = getIconFor(item.id)
                  return (
                    <button
                      className={`sidebar-item ${activeMenu === item.id ? 'sidebar-item--active' : ''}`}
                      key={item.id}
                      onClick={() => onSelectMenu(item.id)}
                      type="button"
                    >
                      <span className="sidebar-item__icon" aria-hidden>{icon}</span>
                      <span className="sidebar-item__label">{item.label}</span>
                    </button>
                  )
                  })}
                </div>
              ) : null}
            </section>
          )
        })}
        {!currentRole && accessibleMenus.length === 0 ? (
          <p className="field-help">Loading your access rights...</p>
        ) : null}
        {currentRole && accessibleMenus.length === 0 ? (
          <p className="field-help">No accessible menus for this role.</p>
        ) : null}
      </nav>

      <div className="sidebar__account-actions">
        <button className="sidebar__account-button" onClick={onOpenChangePassword} type="button">
          Change Password
        </button>
        <button className="sidebar__logout" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
