import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { buildQueryString, formatTableValue, requestApi } from '../../lib/adsPortal'
import '../AffiliatePostBackManagementSection/AffiliatePostBackManagementSection.css'
import './AdsAdvisorSection.css'

const TABS = [
  { id: 'review', label: 'Daily Review' },
  { id: 'plan', label: 'Pre-launch Plan' },
]

const DECISION_HINTS = {
  STOP: 'Pause today',
  NO_DATA: 'Cannot judge',
  OPTIMIZE: 'Fix bids / keywords',
  WATCH: 'Keep testing',
  SCALE: 'Raise budget',
  CONTINUE: 'Keep running',
  PAUSED: 'Not running',
}

const VERDICT_HINTS = {
  GO: 'Worth launching',
  TEST_SMALL: 'Small test only',
  NO_GO: 'Do not launch',
  NEED_INFO: 'Missing commission info',
}

// 推广词带来的流量类型 / traffic each keyword brings
const CATEGORY_LABELS = {
  BRAND_BUY: 'Brand + buying',
  BRAND: 'Brand',
  GENERIC: 'Generic',
  COUPON: 'Coupon',
  NON_BUYING: 'Non-buying',
}

const EMPTY_PLAN = {
  id: null,
  campaignName: '',
  brandName: '',
  country: '',
  commissionType: 'FIXED',
  commissionValue: '',
  avgOrderValue: '',
  approvalPercent: '',
  expectedCpc: '',
  keywords: '',
  negativeKeywords: '',
  notes: '',
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function formatUsd(value) {
  const number = Number(value)
  return value === null || value === undefined || value === '' || !Number.isFinite(number) ? '—' : `$${number.toFixed(2)}`
}

function formatRatio(value) {
  const number = Number(value)
  return value === null || value === undefined || !Number.isFinite(number) ? '—' : `${number.toFixed(2)}x`
}

function formatPct(value) {
  const number = Number(value)
  return value === null || value === undefined || !Number.isFinite(number) ? '—' : `${(number * 100).toFixed(1)}%`
}

// 表单 -> 接口: 确认率按 % 输入, 存 0~1 / approval rate is typed in percent and stored as 0..1
function formToPayload(form) {
  const approval = toNumberOrNull(form.approvalPercent)
  return {
    id: form.id || null,
    campaignName: form.campaignName.trim(),
    brandName: form.brandName,
    country: form.country,
    commissionType: form.commissionType,
    commissionValue: toNumberOrNull(form.commissionValue),
    avgOrderValue: toNumberOrNull(form.avgOrderValue),
    expectedApprovalRate: approval === null ? null : approval / 100,
    expectedCpc: toNumberOrNull(form.expectedCpc),
    keywords: form.keywords,
    negativeKeywords: form.negativeKeywords,
    notes: form.notes,
  }
}

function planToForm(plan) {
  const text = (value) => (value === null || value === undefined ? '' : String(value))
  return {
    ...Object.fromEntries(Object.keys(EMPTY_PLAN).map((key) => [key, text(plan?.[key])])),
    id: plan?.id ?? null,
    commissionType: plan?.commissionType || 'FIXED',
    approvalPercent: plan?.expectedApprovalRate == null ? '' : String(Number(plan.expectedApprovalRate) * 100),
  }
}

async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = document.createElement('textarea')
  area.value = text
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  document.body.removeChild(area)
}

function LevelList({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null
  }
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${item.level}-${index}`} className={`adv-level adv-level-${String(item.level).toLowerCase()}`}>
          <b>{item.level}</b>
          <span>{item.message}</span>
        </li>
      ))}
    </ul>
  )
}

function AdsAdvisorSection({ token, showOwnerFilter, ownerOptions }) {
  const [activeTab, setActiveTab] = useState('review')
  const [owner, setOwner] = useState('')
  const [review, setReview] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [expanded, setExpanded] = useState(() => new Set())
  const [plans, setPlans] = useState([])
  const [plansError, setPlansError] = useState('')
  const [form, setForm] = useState(EMPTY_PLAN)
  const [evaluation, setEvaluation] = useState(null)
  const [planMessage, setPlanMessage] = useState('')
  const [planError, setPlanError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')

  const ownerQuery = useMemo(
    () => buildQueryString({ adsOwner: showOwnerFilter ? owner : undefined }),
    [owner, showOwnerFilter],
  )

  const loadReview = useCallback(async () => {
    if (!token) {
      return
    }
    setReviewLoading(true)
    setReviewError('')
    try {
      setReview(await requestApi(`/advisor/review${ownerQuery}`, { token }))
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setReviewLoading(false)
    }
  }, [token, ownerQuery])

  const loadPlans = useCallback(async () => {
    if (!token) {
      return
    }
    setPlansError('')
    try {
      const response = await requestApi(`/advisor/plans${ownerQuery}`, { token })
      setPlans(Array.isArray(response) ? response : [])
    } catch (error) {
      setPlansError(error instanceof Error ? error.message : 'Unknown error')
    }
  }, [token, ownerQuery])

  useEffect(() => {
    loadReview()
    loadPlans()
  }, [loadReview, loadPlans])

  const reviewTasks = useMemo(() => (Array.isArray(review?.tasks) ? review.tasks : []), [review])
  const campaignChoices = useMemo(
    () => [...new Set(reviewTasks.map((task) => task.campaignName).filter(Boolean))],
    [reviewTasks],
  )

  const handleCopy = async (text, label) => {
    try {
      await copyText(text || '')
      setCopyMessage(`${label} copied. Paste it into the chat for a deeper review.`)
    } catch {
      setCopyMessage('Copy failed, please select the text manually.')
    }
  }

  const toggleRow = (id) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const updateForm = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const evaluatePlan = async () => {
    setBusy(true)
    setPlanError('')
    try {
      setEvaluation(await requestApi('/advisor/plans/evaluate', { method: 'POST', token, body: formToPayload(form) }))
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  const savePlan = async () => {
    if (!form.campaignName.trim()) {
      setPlanError('Campaign name is required (same as the Google Ads campaign / normal task name).')
      return
    }
    setBusy(true)
    setPlanError('')
    setPlanMessage('')
    try {
      const saveQuery = form.id ? '' : ownerQuery
      const response = await requestApi(`/advisor/plans${saveQuery}`, {
        method: 'POST',
        token,
        body: formToPayload(form),
      })
      setForm(planToForm(response?.plan))
      setEvaluation(response?.evaluation || null)
      setPlanMessage(`Saved plan for ${response?.plan?.campaignName}.`)
      await Promise.all([loadPlans(), loadReview()])
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  const editPlan = (item) => {
    setForm(planToForm(item.plan))
    setEvaluation(item.evaluation || null)
    setPlanMessage('')
    setPlanError('')
    setActiveTab('plan')
  }

  const startPlanFor = (campaignName) => {
    const existing = plans.find((item) => item.plan?.campaignName === campaignName)
    if (existing) {
      editPlan(existing)
      return
    }
    setForm({ ...EMPTY_PLAN, campaignName })
    setEvaluation(null)
    setActiveTab('plan')
  }

  const deletePlan = async (item) => {
    if (!window.confirm(`Delete the plan for ${item.plan?.campaignName}?`)) {
      return
    }
    try {
      await requestApi(`/advisor/plans/${item.plan.id}`, { method: 'DELETE', token })
      if (form.id === item.plan.id) {
        setForm(EMPTY_PLAN)
        setEvaluation(null)
      }
      await Promise.all([loadPlans(), loadReview()])
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const summary = review?.summary || {}
  const economics = evaluation?.economics || {}

  return (
    <div className="panel pb-panel">
      <div className="pb-head">
        <h3>Ads Advisor</h3>
        <span className="pb-sub">Decide before launch, review every day after launch</span>
      </div>

      <div className="pb-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`pb-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showOwnerFilter ? (
        <div className="pb-toolbar">
          <label className="pb-field">
            Owner
            <select value={owner} onChange={(event) => setOwner(event.target.value)}>
              <option value="">All owners</option>
              {(ownerOptions || []).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {copyMessage ? <p className="pb-status success">{copyMessage}</p> : null}

      {activeTab === 'review' ? (
        <div className="pb-section">
          <div className="pb-toolbar">
            <button type="button" className="pb-btn pb-btn-primary" onClick={loadReview} disabled={reviewLoading}>
              {reviewLoading ? 'Loading...' : 'Refresh review'}
            </button>
            <button
              type="button"
              className="pb-btn"
              disabled={!review?.markdown}
              onClick={() => handleCopy(review?.markdown, 'Daily review pack')}
            >
              Copy review pack
            </button>
            {review?.generatedAt ? <span className="pb-hint">Generated {review.generatedAt}</span> : null}
          </div>
          {reviewError ? <p className="pb-status error" role="alert">{reviewError}</p> : null}
          <p className="pb-hint">
            Commission counts approved orders plus pending orders at the approval rate. Stop line = 3x net commission
            per order with no order (under 5% chance to break even). After the stop line: ROAS below 0.5 = STOP,
            0.5-1 = OPTIMIZE, at least 1 = CONTINUE, at least 1.3 with 5+ orders = SCALE. Money is in USD.
            Click a row for the reasons, actions and negative keyword candidates.
          </p>

          <div className="pb-cards">
            {Object.keys(DECISION_HINTS).map((decision) => (
              <div key={decision} className={`pb-card adv-card adv-decision-${decision.toLowerCase()}`}>
                <span>{decision} · {DECISION_HINTS[decision]}</span>
                <strong>{formatTableValue(summary[decision] ?? 0)}</strong>
              </div>
            ))}
          </div>

          <div className="pb-table-wrap">
            <table className="pb-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Country</th>
                  <th>Decision</th>
                  <th>Spend</th>
                  <th>Spend 7d</th>
                  <th>Clicks</th>
                  <th>CPC</th>
                  <th>Break-even CPC</th>
                  <th>Orders a/p/r</th>
                  <th>Eff. commission</th>
                  <th>ROAS</th>
                  <th>ROAS 7d</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {reviewTasks.length === 0 ? (
                  <tr><td className="pb-empty" colSpan={13}>{reviewLoading ? 'Loading...' : 'No normal tasks found.'}</td></tr>
                ) : reviewTasks.map((task) => {
                  const m = task.metrics || {}
                  const isOpen = expanded.has(task.normalAdsId)
                  return (
                    <Fragment key={task.normalAdsId}>
                      <tr className="adv-row" onClick={() => toggleRow(task.normalAdsId)}>
                        <td>{isOpen ? '▾ ' : '▸ '}{formatTableValue(task.campaignName)}</td>
                        <td>{formatTableValue(task.country)}</td>
                        <td>
                          <span className={`adv-badge adv-decision-${String(task.decision).toLowerCase()}`}>
                            {task.decision}
                          </span>
                        </td>
                        <td>{formatUsd(m.lifetimeCostUsd)}</td>
                        <td>{formatUsd(m.cost7dUsd)}</td>
                        <td>{formatTableValue(m.lifetimeClicks)}</td>
                        <td className={Number(m.cpc) > Number(m.breakEvenCpc) && m.breakEvenCpc != null ? 'pb-negative' : ''}>
                          {formatUsd(m.cpc)}
                        </td>
                        <td>{formatUsd(m.breakEvenCpc)}</td>
                        <td>{`${m.approved ?? 0}/${m.pending ?? 0}/${m.rejected ?? 0}`}</td>
                        <td>{formatUsd(m.effectiveCommission)}</td>
                        <td className={m.roas != null && Number(m.roas) < 1 ? 'pb-negative' : ''}>{formatRatio(m.roas)}</td>
                        <td>{formatRatio(m.roas7d)}</td>
                        <td>
                          <button
                            type="button"
                            className="pb-btn"
                            onClick={(event) => { event.stopPropagation(); startPlanFor(task.campaignName) }}
                          >
                            {task.hasPlan ? 'Edit plan' : 'Add plan'}
                          </button>
                        </td>
                      </tr>
                      {isOpen ? (
                        <tr className="adv-detail-row">
                          <td colSpan={13}>
                            <div className="adv-detail">
                              <div>
                                <div className="adv-subtitle">Why</div>
                                <ul>{(task.reasons || []).map((reason) => <li key={reason}>{reason}</li>)}</ul>
                                <div className="adv-subtitle">Do</div>
                                {(task.actions || []).length === 0
                                  ? <p className="pb-hint">Nothing to change.</p>
                                  : <ul>{task.actions.map((action) => <li key={action}>{action}</li>)}</ul>}
                              </div>
                              <div>
                                <div className="adv-subtitle">Last 7 days</div>
                                <p className="pb-hint">
                                  Impressions {formatTableValue(m.impressions7d)}, clicks {formatTableValue(m.clicks7d)},
                                  orders {formatTableValue(m.orders7d)}. Networks:{' '}
                                  {Object.entries(m.networkClicks7d || {}).map(([network, clicks]) => `${network} ${clicks}`).join(', ') || '—'}.
                                  Last daily data: {task.lastDailyDate || 'none'}.
                                </p>
                                <div className="adv-subtitle">Campaign settings</div>
                                {task.settings ? (
                                  <p className="pb-hint">
                                    Search partners {String(task.settings.searchPartners)}, display {String(task.settings.displayNetwork)},
                                    location {task.settings.geoTargetType || '—'}, bidding {task.settings.biddingStrategy || '—'},
                                    budget {formatTableValue(task.settings.dailyBudget)} {task.settings.currency || ''},
                                    impression share {formatPct(task.settings.searchImpressionShare)},
                                    lost to budget {formatPct(task.settings.budgetLostShare)},
                                    lost to rank {formatPct(task.settings.rankLostShare)}.
                                  </p>
                                ) : <p className="pb-hint">Not reported yet (update the Google Ads script).</p>}
                                <div className="adv-subtitle">Negative keyword candidates (last 7 days)</div>
                                {(task.negativeCandidates || []).length === 0 ? (
                                  <p className="pb-hint">None found.</p>
                                ) : (
                                  <>
                                    <ul>
                                      {task.negativeCandidates.map((item) => (
                                        <li key={item.term}>
                                          <code>{item.term}</code> clicks {item.clicks}, cost {formatTableValue(item.cost)} ({item.reason})
                                        </li>
                                      ))}
                                    </ul>
                                    <button
                                      type="button"
                                      className="pb-btn"
                                      onClick={() => handleCopy(task.negativeCandidates.map((item) => `[${item.term}]`).join('\n'), 'Negative keywords')}
                                    >
                                      Copy as exact negatives
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === 'plan' ? (
        <div className="pb-section">
          <div className="pb-block-title">Saved plans</div>
          {plansError ? <p className="pb-status error" role="alert">{plansError}</p> : null}
          <div className="pb-table-wrap">
            <table className="pb-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  {showOwnerFilter ? <th>Owner</th> : null}
                  <th>Verdict</th>
                  <th>Net / order</th>
                  <th>Max CPC (brand)</th>
                  <th>Required CVR</th>
                  <th>Test budget</th>
                  <th>Keyword errors / warnings</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td className="pb-empty" colSpan={showOwnerFilter ? 9 : 8}>No plans yet. Fill in the form below.</td></tr>
                ) : plans.map((item) => (
                  <tr key={item.plan.id}>
                    <td>{item.plan.campaignName}</td>
                    {showOwnerFilter ? <td>{item.plan.adsOwner}</td> : null}
                    <td>
                      <span className={`adv-badge adv-verdict-${String(item.evaluation?.verdict).toLowerCase()}`}>
                        {item.evaluation?.verdict}
                      </span>
                    </td>
                    <td>{formatUsd(item.evaluation?.economics?.netCommissionPerOrder)}</td>
                    <td>{formatUsd(item.evaluation?.economics?.maxCpcBrand)}</td>
                    <td>{formatPct(item.evaluation?.economics?.requiredCvr)}</td>
                    <td>{formatUsd(item.evaluation?.economics?.testBudget)}</td>
                    <td>{`${item.evaluation?.errorCount ?? 0} / ${item.evaluation?.warnCount ?? 0}`}</td>
                    <td className="adv-actions">
                      <button type="button" className="pb-btn" onClick={() => editPlan(item)}>Edit</button>
                      <button type="button" className="pb-btn pb-btn-danger" onClick={() => deletePlan(item)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pb-block-title">
            {form.id ? `Edit plan: ${form.campaignName}` : 'New plan'}
          </div>
          <p className="pb-hint">
            Two questions only: does the commission cover the click price, and do the keywords bring buyers.
            Keywords one per line: [exact], &quot;phrase&quot;, plain text = broad. Money in USD.
            {showOwnerFilter && !form.id ? ' Admins must pick an owner above before saving a new plan.' : ''}
          </p>
          <div className="adv-form">
            <label className="pb-field">
              Campaign name *
              <input list="adv-campaigns" value={form.campaignName} onChange={updateForm('campaignName')} />
              <datalist id="adv-campaigns">
                {campaignChoices.map((name) => <option key={name} value={name} />)}
              </datalist>
            </label>
            <label className="pb-field">Brand (aliases with comma)<input value={form.brandName} onChange={updateForm('brandName')} /></label>
            <label className="pb-field">Country<input value={form.country} onChange={updateForm('country')} placeholder="US" /></label>
            <label className="pb-field">
              Commission type
              <select value={form.commissionType} onChange={updateForm('commissionType')}>
                <option value="FIXED">Fixed USD per order</option>
                <option value="PERCENT">Percent of order</option>
              </select>
            </label>
            <label className="pb-field">
              {form.commissionType === 'PERCENT' ? 'Commission %' : 'Commission USD / order'}
              <input type="number" step="0.01" value={form.commissionValue} onChange={updateForm('commissionValue')} />
            </label>
            {form.commissionType === 'PERCENT' ? (
              <label className="pb-field">Avg order value USD<input type="number" step="0.01" value={form.avgOrderValue} onChange={updateForm('avgOrderValue')} /></label>
            ) : null}
            <label className="pb-field">Expected approval %<input type="number" step="1" value={form.approvalPercent} onChange={updateForm('approvalPercent')} placeholder="70" /></label>
            <label className="pb-field">Expected CPC USD<input type="number" step="0.01" value={form.expectedCpc} onChange={updateForm('expectedCpc')} /></label>
            <label className="pb-field adv-text">Keywords<textarea rows={8} value={form.keywords} onChange={updateForm('keywords')} /></label>
            <label className="pb-field adv-text">Negative keywords<textarea rows={8} value={form.negativeKeywords} onChange={updateForm('negativeKeywords')} /></label>
            <label className="pb-field adv-wide">Notes<input value={form.notes} onChange={updateForm('notes')} /></label>
          </div>
          <div className="pb-toolbar">
            <button type="button" className="pb-btn" onClick={evaluatePlan} disabled={busy}>Evaluate</button>
            <button type="button" className="pb-btn pb-btn-primary" onClick={savePlan} disabled={busy}>Save plan</button>
            <button type="button" className="pb-btn" onClick={() => { setForm(EMPTY_PLAN); setEvaluation(null) }}>Clear</button>
            <button
              type="button"
              className="pb-btn"
              disabled={!evaluation?.markdown}
              onClick={() => handleCopy(evaluation?.markdown, 'Pre-launch brief')}
            >
              Copy brief
            </button>
          </div>
          {planError ? <p className="pb-status error" role="alert">{planError}</p> : null}
          {planMessage ? <p className="pb-status success">{planMessage}</p> : null}

          {evaluation ? (
            <div className="adv-evaluation">
              <div className="adv-subtitle">1. Is it worth it?</div>
              <div className="adv-verdict-line">
                <span className={`adv-badge adv-verdict-${String(evaluation.verdict).toLowerCase()}`}>{evaluation.verdict}</span>
                <b>{VERDICT_HINTS[evaluation.verdict] || ''}</b>
                <span>{evaluation.readyToLaunch ? 'Ready to launch' : 'Not ready to launch'}</span>
              </div>
              <LevelList items={evaluation.reasons} />
              <div className="pb-cards">
                {[
                  ['Net commission / order', formatUsd(economics.netCommissionPerOrder)],
                  ['Max CPC on brand keywords', formatUsd(economics.maxCpcBrand)],
                  ['Max CPC on generic keywords', formatUsd(economics.maxCpcGeneric)],
                  ['Required CVR at expected CPC', formatPct(economics.requiredCvr)],
                  ['Test budget (stop line)', formatUsd(economics.testBudget)],
                  ['Clicks needed to judge', formatTableValue(economics.minClicksToJudge)],
                ].map(([label, value]) => (
                  <div key={label} className="pb-card"><span>{label}</span><strong>{value}</strong></div>
                ))}
              </div>
              {economics.breakEvenCpc ? (
                <p className="pb-hint">
                  Break-even CPC by conversion rate:{' '}
                  {Object.entries(economics.breakEvenCpc).map(([cvr, cpc]) => `${cvr} → ${formatUsd(cpc)}`).join(' · ')}.
                  {economics.stopRule ? ` ${economics.stopRule}` : ''}
                </p>
              ) : null}

              <div className="adv-subtitle">2. Do the keywords bring the right traffic?</div>
              {(evaluation.keywords?.items || []).length > 0 ? (
                <div className="pb-table-wrap">
                  <table className="pb-table">
                    <thead>
                      <tr><th>Keyword</th><th>Match</th><th>Traffic</th><th>Level</th><th>Advice</th></tr>
                    </thead>
                    <tbody>
                      {evaluation.keywords.items.map((item, index) => (
                        <tr key={`${item.keyword}-${index}`}>
                          <td><code>{item.keyword}</code></td>
                          <td>{item.matchType}</td>
                          <td>{CATEGORY_LABELS[item.category] || item.category}</td>
                          <td className={`adv-level adv-level-${String(item.level).toLowerCase()}`}><b>{item.level}</b></td>
                          <td className="adv-advice">{item.advice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <LevelList items={evaluation.keywords?.issues} />
              {(evaluation.keywords?.suggested || []).length > 0 ? (
                <div className="adv-issues">
                  <div className="adv-subtitle">Suggested brand keywords</div>
                  <code className="adv-block">{evaluation.keywords.suggested.join('\n')}</code>
                  <button type="button" className="pb-btn" onClick={() => handleCopy(evaluation.keywords.suggested.join('\n'), 'Suggested keywords')}>Copy</button>
                </div>
              ) : null}
              {(evaluation.keywords?.negativesToAdd || []).length > 0 ? (
                <div className="adv-issues">
                  <div className="adv-subtitle">Negative keywords to add</div>
                  <code className="adv-block">{evaluation.keywords.negativesToAdd.join('\n')}</code>
                  <button type="button" className="pb-btn" onClick={() => handleCopy(evaluation.keywords.negativesToAdd.join('\n'), 'Negative keywords')}>Copy</button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default AdsAdvisorSection
