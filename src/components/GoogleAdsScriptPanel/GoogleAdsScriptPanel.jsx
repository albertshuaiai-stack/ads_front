import { useState } from 'react'
import './GoogleAdsScriptPanel.css'

// 脚本服务器地址走环境变量配置(见 .env.production / .env.development.local), 未配置时回退默认域名
// Script server base URL comes from env config; falls back to the default domain
const ADS_SCRIPT_NORMAL_BASE_URL =
  import.meta.env.VITE_ADS_SCRIPT_NORMAL_BASE_URL || 'https://track.lunalvabeau.com'
const ADS_SCRIPT_MATRIX_BASE_URL =
  import.meta.env.VITE_ADS_SCRIPT_MATRIX_BASE_URL || 'https://track.lunalvabeau.com'

// 高频替换场景: setTrackingTemplate 不返回服务端结果, 失败只写进更改日志, 文本日志会一直显示成功。
// 改为 mutateAll + partialFailure, 逐条读取 isSuccessful/getErrorMessages, 并对瞬时错误自动重试。
// High-frequency sync: mutateAll exposes per-campaign server errors and retries transient failures.
function buildGoogleAdsScript(apiBaseUrl, modeLabel, reportUrl, dailyUrl) {
  return `// Google Ads auto tracking template script (high frequency safe)
// Server: ${apiBaseUrl}
// Mode: ${modeLabel}
// Note: unchanged templates are skipped, so frequent runs do not spam mutations.
// Clicks: real campaign clicks are reported first, and the server rotates links by clicks.
// Daily: per-day stats, campaign settings and search terms are reported for the daily review.

var API_BASE_URL = '${apiBaseUrl}';
var API_REPORT_URL = '${reportUrl}';
var API_DAILY_URL = '${dailyUrl}';
var DAILY_LOOKBACK_DAYS = 7;
var MAX_SEARCH_TERMS = 1000;
var BATCH_SIZE = 50;
var MAX_RETRIES = 3;
var MAX_TEMPLATE_BYTES = 2048;

function main() {
  if (isMccAccount()) {
    var accountIterator = MccApp
      .accounts()
      .withCondition('CanManageClients = FALSE')
      .get();

    while (accountIterator.hasNext()) {
      MccApp.select(accountIterator.next());
      processAccount();
    }
  } else {
    processAccount();
  }
}

function isMccAccount() {
  try {
    return MccApp.accounts().get().hasNext();
  } catch (e) {
    return false;
  }
}

// 先上报 campaign 累计真实点击数, 服务端据此换链; 上报失败不影响模板同步
// 换链只由真实点击驱动: 与上次换链时的点击数差值达到 displayNumber 才换, 与脚本执行频率无关
// Report lifetime clicks; rotation happens only when clicks grow past the recorded base
function reportClicks() {
  try {
    var rows = AdsApp.search(
        'SELECT campaign.name, metrics.clicks, metrics.cost_micros FROM campaign ' +
        'WHERE campaign.status = ENABLED');
    // 花费单位是账户币种, 服务端按汇率折算 USD / cost is in account currency; the server converts it to USD
    var currency = AdsApp.currentAccount().getCurrencyCode();
    var data = [];
    while (rows.hasNext()) {
      var row = rows.next();
      // AdsApp.search 返回嵌套对象 row.campaign.name, 不是扁平键 'campaign.name'
      var name = row.campaign ? row.campaign.name : null;
      var clicks = row.metrics ? Number(row.metrics.clicks) : 0;
      var costMicros = row.metrics ? Number(row.metrics.costMicros) : 0;
      if (!name) {
        continue;
      }
      data.push({
        name: name,
        clicks: isNaN(clicks) ? 0 : clicks,
        cost: isNaN(costMicros) ? 0 : Math.round(costMicros / 10000) / 100,
        currency: currency
      });
    }
    console.log('click report payload=' + JSON.stringify(data));
    var response = UrlFetchApp.fetch(API_REPORT_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({data: data}),
      muteHttpExceptions: true,
      followRedirects: true
    });
    console.log('click report sent campaigns=' + data.length +
        ' http=' + response.getResponseCode());
  } catch (e) {
    console.error('click report failed: ' + e);
  }
}

// 按天 x 网络数据、广告系列设置、近 7 天搜索词, 供后台每日复盘; 失败不影响换链
// Daily stats per network, campaign settings and last-7-day search terms for the review; never blocks rotation
function reportDaily() {
  try {
    var account = AdsApp.currentAccount();
    var tz = account.getTimeZone();
    var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var from = Utilities.formatDate(new Date(Date.now() - DAILY_LOOKBACK_DAYS * 86400000), tz, 'yyyy-MM-dd');
    var during = "segments.date BETWEEN '" + from + "' AND '" + today + "'";

    var campaigns = {};
    var settingFields = 'campaign.name, campaign.network_settings.target_google_search, ' +
        'campaign.network_settings.target_search_network, campaign.network_settings.target_content_network, ' +
        'campaign.geo_target_type_setting.positive_geo_target_type, campaign.bidding_strategy_type, ' +
        'campaign_budget.amount_micros';
    var settingRows = safeSearch('SELECT ' + settingFields + ', campaign.target_spend.cpc_bid_ceiling_micros ' +
        'FROM campaign WHERE campaign.status = ENABLED') ||
        safeSearch('SELECT ' + settingFields + ' FROM campaign WHERE campaign.status = ENABLED') || [];
    settingRows.forEach(function (row) {
      var c = row.campaign || {};
      var ns = c.networkSettings || {};
      var geo = c.geoTargetTypeSetting || {};
      var ts = c.targetSpend || {};
      if (!c.name) {
        return;
      }
      campaigns[c.name] = {
        name: c.name,
        googleSearch: ns.targetGoogleSearch === true,
        searchPartners: ns.targetSearchNetwork === true,
        displayNetwork: ns.targetContentNetwork === true,
        geoTargetType: geo.positiveGeoTargetType || null,
        biddingStrategy: c.biddingStrategyType || null,
        dailyBudget: micros(row.campaignBudget ? row.campaignBudget.amountMicros : null),
        cpcCeiling: micros(ts.cpcBidCeilingMicros)
      };
    });

    (safeSearch('SELECT campaign.name, metrics.search_impression_share, ' +
        'metrics.search_budget_lost_impression_share, metrics.search_rank_lost_impression_share ' +
        'FROM campaign WHERE campaign.status = ENABLED AND ' + during) || []).forEach(function (row) {
      var item = row.campaign ? campaigns[row.campaign.name] : null;
      var m = row.metrics || {};
      if (!item) {
        return;
      }
      item.searchImpressionShare = ratio(m.searchImpressionShare);
      item.budgetLostShare = ratio(m.searchBudgetLostImpressionShare);
      item.rankLostShare = ratio(m.searchRankLostImpressionShare);
    });

    var daily = [];
    (safeSearch('SELECT campaign.name, segments.date, segments.ad_network_type, metrics.impressions, ' +
        'metrics.clicks, metrics.cost_micros FROM campaign WHERE campaign.status != REMOVED AND ' + during) || [])
        .forEach(function (row) {
          var m = row.metrics || {};
          if (!row.campaign || !row.segments) {
            return;
          }
          daily.push({
            name: row.campaign.name,
            date: row.segments.date,
            network: row.segments.adNetworkType || 'UNKNOWN',
            impressions: Number(m.impressions) || 0,
            clicks: Number(m.clicks) || 0,
            cost: micros(m.costMicros) || 0
          });
        });

    var terms = [];
    (safeSearch('SELECT campaign.name, search_term_view.search_term, metrics.impressions, metrics.clicks, ' +
        'metrics.cost_micros FROM search_term_view WHERE metrics.clicks > 0 AND ' + during +
        ' ORDER BY metrics.cost_micros DESC LIMIT ' + MAX_SEARCH_TERMS) || []).forEach(function (row) {
      var m = row.metrics || {};
      if (!row.campaign || !row.searchTermView) {
        return;
      }
      terms.push({
        name: row.campaign.name,
        term: row.searchTermView.searchTerm,
        impressions: Number(m.impressions) || 0,
        clicks: Number(m.clicks) || 0,
        cost: micros(m.costMicros) || 0
      });
    });

    var payload = {
      currency: account.getCurrencyCode(),
      reportDate: today,
      campaigns: Object.keys(campaigns).map(function (key) { return campaigns[key]; }),
      daily: daily,
      searchTerms: terms
    };
    var response = UrlFetchApp.fetch(API_DAILY_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      followRedirects: true
    });
    console.log('daily report sent campaigns=' + payload.campaigns.length + ' daily=' + daily.length +
        ' terms=' + terms.length + ' http=' + response.getResponseCode());
  } catch (e) {
    console.error('daily report failed: ' + e);
  }
}

function safeSearch(query) {
  try {
    var iterator = AdsApp.search(query);
    var rows = [];
    while (iterator.hasNext()) {
      rows.push(iterator.next());
    }
    return rows;
  } catch (e) {
    console.error('daily query failed: ' + e + ' query=' + query);
    return null;
  }
}

function micros(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  var number = Number(value);
  return isNaN(number) ? null : Math.round(number / 10000) / 100;
}

function ratio(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  var number = Number(value);
  return isNaN(number) ? null : number;
}

function processAccount() {
  reportClicks();
  reportDaily();
  var customerId = AdsApp.currentAccount().getCustomerId().replace(/-/g, '');
  var stats = {applied: 0, unchanged: 0, failed: 0};
  var ops = [];
  var metas = [];
  var campaignIterator = AdsApp
    .campaigns()
    .withCondition('Status = ENABLED')
    .get();

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var campaignName = campaign.getName();

    var raw = fetchWithRetries(API_BASE_URL + encodeURIComponent(campaignName), MAX_RETRIES);
    if (!raw) {
      stats.failed++;
      console.error('fetch failed: ' + campaignName);
      continue;
    }

    var trackingTemplate = sanitizeTemplate(raw);
    var check = validateTemplate(trackingTemplate, campaign);
    if (!check.valid) {
      stats.failed++;
      console.error('invalid template [' + campaignName + ']: ' + check.reason);
      continue;
    }

    // 值相同不提交, 避免高频运行产生重复变更与并发冲突 / skip no-op writes
    if (campaign.urls().getTrackingTemplate() === trackingTemplate) {
      stats.unchanged++;
      continue;
    }

    ops.push({
      campaignOperation: {
        update: {
          resourceName: 'customers/' + customerId + '/campaigns/' + campaign.getId(),
          trackingUrlTemplate: trackingTemplate
        },
        updateMask: 'trackingUrlTemplate'
      }
    });
    metas.push({name: campaignName});

    if (ops.length >= BATCH_SIZE) {
      flush(ops, metas, stats);
      ops = [];
      metas = [];
    }
  }

  if (ops.length > 0) {
    flush(ops, metas, stats);
  }
  console.log('summary applied=' + stats.applied +
      ' unchanged=' + stats.unchanged + ' failed=' + stats.failed);
}

// 批量提交, 瞬时错误(并发冲突/内部错误/限流)自动退避重试一轮
// Batch mutate with one backoff round for transient errors
function flush(ops, metas, stats) {
  var pendingOps = ops;
  var pendingMetas = metas;

  for (var round = 1; round <= 2 && pendingOps.length > 0; round++) {
    var results = mutateWithRetries(pendingOps);
    if (!results) {
      stats.failed += pendingOps.length;
      return;
    }

    var retryOps = [];
    var retryMetas = [];
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      var name = pendingMetas[i].name;
      if (result.isSuccessful()) {
        stats.applied++;
        console.log('applied: ' + name);
        continue;
      }

      var transient = false;
      var errors = result.getErrorMessages();
      for (var j = 0; j < errors.length; j++) {
        console.error('rejected [' + name + ']: ' + errors[j]);
        if (/CONCURRENT_MODIFICATION|INTERNAL_ERROR|RESOURCE_EXHAUSTED|DEADLINE/i.test(errors[j])) {
          transient = true;
        }
      }

      if (transient && round < 2) {
        retryOps.push(pendingOps[i]);
        retryMetas.push(pendingMetas[i]);
      } else {
        stats.failed++;
      }
    }

    if (retryOps.length > 0) {
      Utilities.sleep(3000);
    }
    pendingOps = retryOps;
    pendingMetas = retryMetas;
  }
}

function mutateWithRetries(ops) {
  for (var attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return AdsApp.mutateAll(ops, {partialFailure: true});
    } catch (e) {
      console.error('mutateAll exception (attempt ' + attempt + '): ' + e);
      if (attempt < MAX_RETRIES) {
        Utilities.sleep(1000 * Math.pow(2, attempt));
      }
    }
  }
  return null;
}

// 清洗服务器返回: 去 BOM、还原 &amp;、去换行与零宽字符
// Sanitize server response: strip BOM, unescape &amp;, remove line breaks and zero-width chars
function sanitizeTemplate(text) {
  if (!text) {
    return '';
  }
  return text
    .replace(/^\\uFEFF/, '')
    .replace(/&amp;/g, '&')
    .replace(/[\\r\\n\\t]/g, '')
    .replace(/[\\u200B-\\u200D\\uFEFF]/g, '')
    .trim();
}

// 提交前拦截必然失败的模板, 避免产生垃圾变更 / reject invalid templates before mutating
function validateTemplate(template, campaign) {
  if (!template) {
    return {valid: false, reason: 'empty template'};
  }
  if (/\\s/.test(template)) {
    return {valid: false, reason: 'contains whitespace'};
  }
  if (/[<>"']/.test(template)) {
    return {valid: false, reason: 'contains illegal characters'};
  }
  if (byteLength(template) > MAX_TEMPLATE_BYTES) {
    return {valid: false, reason: 'exceeds ' + MAX_TEMPLATE_BYTES + ' bytes'};
  }
  if (template.indexOf('{lpurl}') === -1) {
    return {valid: false, reason: 'missing {lpurl}; add {lpurl} or &redirection_url={lpurl}'};
  }

  // 自定义参数必须已定义, 名称只能含字母数字, 值不能超过 200 字节
  // Custom params must exist, names alphanumeric only, values <= 200 bytes
  var custom = {};
  try {
    custom = campaign.urls().getCustomParameters() || {};
  } catch (e) {
    custom = {};
  }
  var re = /\\{_([A-Za-z0-9_]+)\\}/g;
  var match;
  while ((match = re.exec(template)) !== null) {
    var key = match[1];
    if (!/^[A-Za-z0-9]+$/.test(key)) {
      return {valid: false, reason: 'custom param name invalid: ' + key};
    }
    if (!custom.hasOwnProperty(key)) {
      return {valid: false, reason: 'custom param not defined: {_' + key + '}'};
    }
    if (byteLength(String(custom[key])) > 200) {
      return {valid: false, reason: 'custom param value too long: ' + key};
    }
  }
  return {valid: true, reason: 'ok'};
}

function fetchWithRetries(url, maxRetries) {
  for (var i = 1; i <= maxRetries; i++) {
    try {
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      var code = response.getResponseCode();
      if (code == 200) {
        return response.getContentText();
      }
      console.error('fetch http ' + code + ' (attempt ' + i + '/' + maxRetries + ')');
    } catch (e) {
      console.error('fetch exception (attempt ' + i + '/' + maxRetries + '): ' + e);
    }
    if (i < maxRetries) {
      Utilities.sleep(1000 * Math.pow(2, i));
    }
  }
  return null;
}

function byteLength(str) {
  return unescape(encodeURIComponent(str)).length;
}`
}

// 旧方案: 服务器返回联盟链接, 作为 campaign 级跟踪模板
// Legacy mode: server returns the affiliate link used as the campaign tracking template
const NORMAL_GOOGLE_ADS_SCRIPT = buildGoogleAdsScript(
  `${ADS_SCRIPT_NORMAL_BASE_URL}/api/normal/ads?api_key={API_KEY}&campaign_name=`,
  'normal / tracking template',
  `${ADS_SCRIPT_NORMAL_BASE_URL}/api/track/report?api_key={API_KEY}`,
  `${ADS_SCRIPT_NORMAL_BASE_URL}/api/track/daily?api_key={API_KEY}`
)

const MATRIX_GOOGLE_ADS_SCRIPT = buildGoogleAdsScript(
  `${ADS_SCRIPT_MATRIX_BASE_URL}/api/matrix/ads?api_key={API_KEY}&campaign_name=`,
  'matrix',
  `${ADS_SCRIPT_MATRIX_BASE_URL}/api/track/report?api_key={API_KEY}`,
  `${ADS_SCRIPT_MATRIX_BASE_URL}/api/track/daily?api_key={API_KEY}`
)

function injectApiKey(scriptTemplate, currentUserApiKey) {
  return scriptTemplate.replaceAll('{API_KEY}', currentUserApiKey || '{API_KEY}')
}

async function copyTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall back for browsers or contexts that block the async Clipboard API.
    }
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is unavailable.')
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', '')
  textArea.style.position = 'fixed'
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  textArea.setSelectionRange(0, text.length)

  try {
    const copied = document.execCommand('copy')
    if (!copied) {
      throw new Error('Copy command failed.')
    }
  } finally {
    document.body.removeChild(textArea)
  }
}

function GoogleAdsScriptPanel({
  currentUserApiKey = '',
  showNormalTemplate = true,
  showMatrixTemplate = true,
}) {
  const [copyMessage, setCopyMessage] = useState('')
  const [copyError, setCopyError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const scriptTemplates = [
    showNormalTemplate
      ? {
          id: 'normal',
          title: 'Normal Ads Template',
          content: injectApiKey(NORMAL_GOOGLE_ADS_SCRIPT, currentUserApiKey),
        }
      : null,
    showMatrixTemplate
      ? {
          id: 'matrix',
          title: 'Matrix Ads Template',
          content: injectApiKey(MATRIX_GOOGLE_ADS_SCRIPT, currentUserApiKey),
        }
      : null,
  ].filter(Boolean)
  const [activeTemplateId, setActiveTemplateId] = useState(scriptTemplates[0]?.id || '')
  const activeTemplate =
    scriptTemplates.find((template) => template.id === activeTemplateId) || scriptTemplates[0]

  async function handleCopyScript(templateTitle, scriptContent) {
    setCopyMessage('')
    setCopyError('')

    try {
      await copyTextToClipboard(scriptContent)
      setCopyMessage(`${templateTitle} copied.`)
    } catch {
      setCopyError('Unable to copy script.')
    }
  }

  return (
    <section className="google-ads-script-panel">
      <div className="google-ads-script-panel__header">
        <h3>Google Ads Tracking Templates</h3>
      </div>
      {!activeTemplate ? <p className="field-help">No script template is available for this role.</p> : null}
      {!currentUserApiKey ? (
        <p className="field-help">
          API Key is not available yet. The copied script will keep the <code>{'{API_KEY}'}</code>{' '}
          placeholder.
        </p>
      ) : null}
      {copyError ? (
        <p className="status error" role="alert">
          {copyError}
        </p>
      ) : null}
      {copyMessage ? <p className="status success">{copyMessage}</p> : null}
      {activeTemplate ? (
        <>
          <div className="google-ads-script-panel__tabs" role="tablist" aria-label="Script templates">
            {scriptTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                role="tab"
                className={`google-ads-script-panel__tab${
                  template.id === activeTemplate.id ? ' google-ads-script-panel__tab--active' : ''
                }`}
                aria-selected={template.id === activeTemplate.id}
                onClick={() => setActiveTemplateId(template.id)}
              >
                {template.title}
              </button>
            ))}
          </div>

          <div className="google-ads-script-panel__templates">
            <section className="google-ads-script-panel__template" key={activeTemplate.id}>
              <div className="google-ads-script-panel__template-header">
                <div>
                  <h4>{activeTemplate.title}</h4>
                  <p className="field-help">
                    Showing a compact preview. Expand to view the full script content.
                  </p>
                </div>
                <div className="google-ads-script-panel__template-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setIsExpanded((current) => !current)}
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => handleCopyScript(activeTemplate.title, activeTemplate.content)}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <pre
                className={`google-ads-script-panel__code${
                  isExpanded ? ' google-ads-script-panel__code--expanded' : ''
                }`}
              >
                {activeTemplate.content}
              </pre>
            </section>
          </div>
        </>
      ) : null}
    </section>
  )
}

export default GoogleAdsScriptPanel
