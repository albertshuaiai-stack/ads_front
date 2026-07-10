import { getData } from 'country-list'

const COUNTRY_DATA = getData().sort((left, right) => left.code.localeCompare(right.code))

const COUNTRY_NAME_TO_CODE = new Map(
  COUNTRY_DATA.map((item) => [String(item.name).trim().toLowerCase(), item.code]),
)

const COUNTRY_CODE_SET = new Set(COUNTRY_DATA.map((item) => item.code))

const COUNTRY_OPTIONS = COUNTRY_DATA.map((item) => ({
  value: item.code,
  label: item.code,
}))

function toCountryCode(value) {
  const text = String(value ?? '').trim()
  if (!text) {
    return ''
  }

  const upperCode = text.toUpperCase()
  if (COUNTRY_CODE_SET.has(upperCode)) {
    return upperCode
  }

  return COUNTRY_NAME_TO_CODE.get(text.toLowerCase()) || text
}

export { COUNTRY_OPTIONS, toCountryCode }
