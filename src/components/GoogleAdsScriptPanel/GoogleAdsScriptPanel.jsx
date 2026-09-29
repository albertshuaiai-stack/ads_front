import { useState } from 'react'
import './GoogleAdsScriptPanel.css'

// 脚本服务器地址走环境变量配置(见 .env.production / .env.development.local), 未配置时回退默认域名
// Script server base URL comes from env config; falls back to the default domain
const ADS_SCRIPT_NORMAL_BASE_URL =
  import.meta.env.VITE_ADS_SCRIPT_NORMAL_BASE_URL || 'https://ads.admirecars.com'
const ADS_SCRIPT_MATRIX_BASE_URL =
  import.meta.env.VITE_ADS_SCRIPT_MATRIX_BASE_URL || 'https://ads.admirecars.com'

// 旧方案: 服务器返回联盟链接, 作为 campaign 级跟踪模板
// Legacy mode: server returns the affiliate link used as the campaign tracking template
const NORMAL_GOOGLE_ADS_SCRIPT = `// Google Ads自动跟踪模板脚本
// 服务器: ${ADS_SCRIPT_NORMAL_BASE_URL}/
// 模式: Tracking Template (旧方案 / legacy)

var API_BASE_URL = '${ADS_SCRIPT_NORMAL_BASE_URL}/api/normal/ads?api_key={API_KEY}&campaign_name=';

function main() {
  if (isMccAccount()) {
    var accountIterator = MccApp
      .accounts()
      .withCondition('CanManageClients = FALSE')
      .get();

    while (accountIterator.hasNext()) {
      var account = accountIterator.next();
      MccApp.select(account);
      processAccount(); 
    }
  } else {
    processAccount();
  }
}

function isMccAccount() {
  try {
    var accIter = MccApp.accounts().get();
    return accIter.hasNext();
  } catch (e) {
    return false;
  }
}

function processAccount() {
  var campaignIterator = AdsApp
    .campaigns()
    .withCondition('Status = ENABLED')
    .get();

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var campaignName = campaign.getName();
    Logger.log('process campaign: ' + campaignName);

    var apiUrl = API_BASE_URL + encodeURIComponent(campaignName);
    var response = fetchWithRetries(apiUrl, 3); 
    
    if (response) {
      var trackingTemplate = sanitizeTemplate(response);
      if (trackingTemplate) {
        Logger.log('raw length=' + response.length + ' clean length=' + trackingTemplate.length);
        Logger.log('has &amp; = ' + (response.indexOf('&amp;') !== -1));
        Logger.log('template = ' + trackingTemplate);
        try {
          campaign.urls().setTrackingTemplate(trackingTemplate);
          Logger.log('OK set: ' + campaignName);
        } catch (setErr) {
          Logger.log('SET ERROR [' + campaignName + ']: ' + setErr);
        }
      } else {
        Logger.log('WARN empty template: ' + campaignName);
      }
    } else {
      Logger.log('FAIL fetch: ' + campaignName);
    }
  }
}

// 清洗服务器返回：去 BOM、还原被转义的 & 、去首尾空白与不可见字符
// Sanitize server response: strip BOM, unescape &amp;, trim whitespace/invisible chars
function sanitizeTemplate(text) {
  if (!text) {
    return '';
  }
  var cleaned = text
    .replace(/^\uFEFF/, '')          // 去 BOM / strip BOM
    .replace(/&amp;/g, '&')          // 还原被转义的 & / unescape ampersand
    .replace(/[\r\n\t]/g, '')        // 去换行制表符 / remove line breaks & tabs
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // 去零宽字符 / remove zero-width chars
  return cleaned.trim();
}

function fetchWithRetries(url, maxRetries) {
  for (var i = 1; i <= maxRetries; i++) {
    try {
      // 不设置timeoutSeconds，使用Google默认超时
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });

      var code = response.getResponseCode();
      
      if (code == 200) {
        return response.getContentText();
      }
      
      Logger.log('请求失败 (尝试' + i + '/' + maxRetries + '): HTTP ' + code);
    } catch (e) {
      Logger.log('请求异常 (尝试' + i + '/' + maxRetries + '): ' + e);
    }
    
    if (i < maxRetries) {
      Utilities.sleep(2000);
    }
  }
  return null;
}`

// 预留: /r/{slug} 模式(按 campaign 独立配置 Final URL)的脚本模板, 当前未在面板展示
// Reserved: script template for the /r/{slug} mode, not shown in the panel for now
const NORMAL_TRACKER_GOOGLE_ADS_SCRIPT = `// Google Ads自动跟踪模板脚本
// 服务器: ${ADS_SCRIPT_NORMAL_BASE_URL}/
// 模式: Tracker Final URL (新方案 / new)
// 注意: 使用本模式前请清空 campaign 的 Tracking Template, 否则会被旧模板覆盖
// Note: clear the campaign Tracking Template before using this mode

var API_BASE_URL = '${ADS_SCRIPT_NORMAL_BASE_URL}/api/track/url?api_key={API_KEY}&campaign_name=';

function main() {
  if (isMccAccount()) {
    var accountIterator = MccApp
      .accounts()
      .withCondition('CanManageClients = FALSE')
      .get();

    while (accountIterator.hasNext()) {
      var account = accountIterator.next();
      MccApp.select(account);
      processAccount(); 
    }
  } else {
    processAccount();
  }
}

function isMccAccount() {
  try {
    var accIter = MccApp.accounts().get();
    return accIter.hasNext();
  } catch (e) {
    return false;
  }
}

function processAccount() {
  var campaignIterator = AdsApp
    .campaigns()
    .withCondition('Status = ENABLED')
    .get();

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var campaignName = campaign.getName();
    Logger.log('process campaign: ' + campaignName);

    var apiUrl = API_BASE_URL + encodeURIComponent(campaignName);
    var response = fetchWithRetries(apiUrl, 3); 
    
    if (response) {
      var finalUrl = sanitizeTemplate(response);
      if (finalUrl) {
        Logger.log('final url = ' + finalUrl);

        // 遍历广告设置 Final URL / set Final URL for each ad
        var ads = campaign.ads().get();
        var updatedCount = 0;
        while (ads.hasNext()) {
          var ad = ads.next();
          try {
            ad.urls().setFinalUrl(finalUrl);
            updatedCount++;
          } catch (adErr) {
            Logger.log('AD SET ERROR [' + campaignName + ']: ' + adErr);
          }
        }
        Logger.log('OK set ads: ' + campaignName + ' updated=' + updatedCount);
      } else {
        Logger.log('WARN empty url: ' + campaignName);
      }
    } else {
      Logger.log('FAIL fetch: ' + campaignName);
    }
  }
}

// 清洗服务器返回：去 BOM、还原被转义的 & 、去首尾空白与不可见字符
// Sanitize server response: strip BOM, unescape &amp;, trim whitespace/invisible chars
function sanitizeTemplate(text) {
  if (!text) {
    return '';
  }
  var cleaned = text
    .replace(/^\\uFEFF/, '')          // 去 BOM / strip BOM
    .replace(/&amp;/g, '&')          // 还原被转义的 & / unescape ampersand
    .replace(/[\\r\\n\\t]/g, '')        // 去换行制表符 / remove line breaks & tabs
    .replace(/[\\u200B-\\u200D\\uFEFF]/g, ''); // 去零宽字符 / remove zero-width chars
  return cleaned.trim();
}

function fetchWithRetries(url, maxRetries) {
  for (var i = 1; i <= maxRetries; i++) {
    try {
      // 不设置timeoutSeconds，使用Google默认超时
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });

      var code = response.getResponseCode();
      
      if (code == 200) {
        return response.getContentText();
      }
      
      Logger.log('fetch failed (try ' + i + '/' + maxRetries + '): HTTP ' + code);
    } catch (e) {
      Logger.log('fetch exception (try ' + i + '/' + maxRetries + '): ' + e);
    }
    
    if (i < maxRetries) {
      Utilities.sleep(2000);
    }
  }
  return null;
}`

const MATRIX_GOOGLE_ADS_SCRIPT = `// Google Ads自动跟踪模板脚本
// 服务器: ${ADS_SCRIPT_MATRIX_BASE_URL}

var API_BASE_URL = '${ADS_SCRIPT_MATRIX_BASE_URL}/api/matrix/ads?api_key={API_KEY}&campaign_name=';

function main() {
  if (isMccAccount()) {
    var accountIterator = MccApp
      .accounts()
      .withCondition('CanManageClients = FALSE')
      .get();

    while (accountIterator.hasNext()) {
      var account = accountIterator.next();
      MccApp.select(account);
      processAccount(); 
    }
  } else {
    processAccount();
  }
}

function isMccAccount() {
  try {
    var accIter = MccApp.accounts().get();
    return accIter.hasNext();
  } catch (e) {
    return false;
  }
}

function processAccount() {
  var campaignIterator = AdsApp
    .campaigns()
    .withCondition('Status = ENABLED')
    .get();

  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var campaignName = campaign.getName();
    Logger.log('处理广告系列: ' + campaignName);

    var apiUrl = API_BASE_URL + encodeURIComponent(campaignName);
    var response = fetchWithRetries(apiUrl, 3); 
    Logger.log('✅ response: ' + response);
    if (response) {
      var trackingTemplate = response.trim();
      Logger.log('✅ trackingTemplate: ' + trackingTemplate);
      if (trackingTemplate) {
        campaign.urls().setTrackingTemplate(trackingTemplate);
        Logger.log('✅ 成功设置: ' + campaignName);
      } else {
        Logger.log('⚠️ 返回空模板: ' + campaignName);
      }
    } else {
      Logger.log('❌ 获取失败: ' + campaignName);
    }
  }
}

function fetchWithRetries(url, maxRetries) {
  for (var i = 1; i <= maxRetries; i++) {
    try {
      // 不设置timeoutSeconds，使用Google默认超时
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true
      });

      var code = response.getResponseCode();
      
      if (code == 200) {
        return response.getContentText();
      }
      
      Logger.log('请求失败 (尝试' + i + '/' + maxRetries + '): HTTP ' + code);
    } catch (e) {
      Logger.log('请求异常 (尝试' + i + '/' + maxRetries + '): ' + e);
    }
    
    if (i < maxRetries) {
      Utilities.sleep(2000);
    }
  }
  return null;
}`

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
  showTrackerTemplate = true,
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
