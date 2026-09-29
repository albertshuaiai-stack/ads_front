const DEFAULT_EXCHANGE_RATE = 7

function normalizeCurrency(value) {
  const normalized = String(value ?? '').trim().toUpperCase()
  if (!normalized) {
    return ''
  }

  if (normalized === 'USD' || normalized === 'US$' || normalized === '$') {
    return 'USD'
  }

  if (normalized === 'CNY' || normalized === 'RMB' || normalized === 'CN¥' || normalized === '¥' || normalized === '￥') {
    return 'CNY'
  }

  return normalized
}

function resolveExchangeRate(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXCHANGE_RATE
}

function convertCurrencyAmount(value, itemCurrency, displayCurrency, exchangeRate) {
  const amount = Number(value)
  const normalizedAmount = Number.isFinite(amount) ? amount : 0
  const normalizedItemCurrency = normalizeCurrency(itemCurrency)
  const normalizedDisplayCurrency = normalizeCurrency(displayCurrency)

  if (!normalizedItemCurrency || normalizedItemCurrency === normalizedDisplayCurrency) {
    return normalizedAmount
  }

  if (normalizedDisplayCurrency === 'USD' && normalizedItemCurrency === 'CNY') {
    return normalizedAmount / exchangeRate
  }

  if (normalizedDisplayCurrency === 'CNY' && normalizedItemCurrency === 'USD') {
    return normalizedAmount * exchangeRate
  }

  return normalizedAmount
}

export {
  DEFAULT_EXCHANGE_RATE,
  normalizeCurrency,
  resolveExchangeRate,
  convertCurrencyAmount,
}
