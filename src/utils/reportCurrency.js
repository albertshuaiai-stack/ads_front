// 报表货币换算工具 / Report currency helpers

// 默认 USD:CNY 汇率, 接口为空或无效时兜底 / Fallback USD:CNY rate when endpoint value is empty or invalid
export const DEFAULT_EXCHANGE_RATE = 7.2

// 解析接口返回的汇率值, 无效时回退默认值 / Parse endpoint rate value, fallback to default when invalid
export function resolveExchangeRate(value) {
  if (value === null || value === undefined) {
    return DEFAULT_EXCHANGE_RATE
  }

  // 接口为空时 App 会传 '—' 占位 / App passes '—' placeholder when rate is missing
  const text = String(value).trim()
  if (!text || text === '—' || text === '-') {
    return DEFAULT_EXCHANGE_RATE
  }

  const rate = Number(text)
  if (!Number.isFinite(rate) || rate <= 0) {
    return DEFAULT_EXCHANGE_RATE
  }

  return rate
}

// 归一化币种代码 / Normalize currency code
function normalizeCurrencyCode(currency) {
  return String(currency ?? '').trim().toUpperCase()
}

// 换算金额, 无效金额按 0 处理 / Convert amount across currencies, invalid amount counts as 0
export function convertCurrencyAmount(amount, fromCurrency, toCurrency, exchangeRate) {
  const value = Number(amount)
  if (!Number.isFinite(value)) {
    return 0
  }

  const from = normalizeCurrencyCode(fromCurrency)
  const to = normalizeCurrencyCode(toCurrency)
  if (!from || !to || from === to) {
    return value
  }

  const rate = resolveExchangeRate(exchangeRate)
  if (from === 'USD' && to === 'CNY') {
    return value * rate
  }
  if (from === 'CNY' && to === 'USD') {
    return value / rate
  }

  // 未知币种不做换算, 原样计入 / Unknown currency passes through unconverted
  return value
}
