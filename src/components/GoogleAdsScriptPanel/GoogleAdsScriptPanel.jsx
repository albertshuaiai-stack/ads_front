import { useState } from 'react'
import './GoogleAdsScriptPanel.css'

const NORMAL_GOOGLE_ADS_SCRIPT = `// Google Ads自动跟踪模板脚本
// 服务器: https://ads.admirecars.com

var API_BASE_URL = 'https://ads.admirecars.com/api//normal/ads?api_key={API_KEY}&campaign_name=';

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
    
    if (response) {
      var trackingTemplate = response.trim();
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

const MATRIX_GOOGLE_ADS_SCRIPT = `// Google Ads自动跟踪模板脚本
// 服务器: https://ads.admirecars.com

var API_BASE_URL = 'https://ads.admirecars.com/api/matrix/ads?api_key={API_KEY}&campaign_name=';

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

function GoogleAdsScriptPanel({ currentUserApiKey = '' }) {
  const [copyMessage, setCopyMessage] = useState('')
  const [copyError, setCopyError] = useState('')
  const [activeTemplateId, setActiveTemplateId] = useState('normal')
  const [isExpanded, setIsExpanded] = useState(false)

  const scriptTemplates = [
    {
      id: 'normal',
      title: 'Normal Ads Template',
      content: injectApiKey(NORMAL_GOOGLE_ADS_SCRIPT, currentUserApiKey),
    },
    {
      id: 'matrix',
      title: 'Matrix Ads Template',
      content: injectApiKey(MATRIX_GOOGLE_ADS_SCRIPT, currentUserApiKey),
    },
  ]
  const activeTemplate =
    scriptTemplates.find((template) => template.id === activeTemplateId) || scriptTemplates[0]

  async function handleCopyScript(templateTitle, scriptContent) {
    setCopyMessage('')
    setCopyError('')

    try {
      await navigator.clipboard.writeText(scriptContent)
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
    </section>
  )
}

export default GoogleAdsScriptPanel
