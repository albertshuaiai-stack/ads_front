import './InlineFormCard.css'

function InlineFormCard({ title, description, actions, onClose, children }) {
  return (
    <section className="inline-form-card">
      <div className="inline-form-card__header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        <div className="inline-form-card__actions">
          {actions ? <div>{actions}</div> : null}
          {onClose ? (
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
              ×
            </button>
          ) : null}
        </div>
      </div>
      <div className="inline-form-card__body">{children}</div>
    </section>
  )
}

export default InlineFormCard
