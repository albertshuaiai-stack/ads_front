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
function buildGoogleAdsScript(apiBaseUrl, modeLabel) {
  return `// Google Ads auto tracking template script (high frequency safe)
// Server: ${apiBaseUrl}
// Mode: ${modeLabel}
// Note: unchanged templates are skipped, so frequent runs do not spam mutations.

var API_BASE_URL = '${apiBaseUrl}';
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

function processAccount() {
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
  'normal / tracking template'
)

const MATRIX_GOOGLE_ADS_SCRIPT = buildGoogleAdsScript(
  `${ADS_SCRIPT_MATRIX_BASE_URL}/api/matrix/ads?api_key={API_KEY}&campaign_name=`,
  'matrix'
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
