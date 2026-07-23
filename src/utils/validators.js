// 用户表单字段校验纯函数 / Pure validators for user form fields
import { firstDefinedValue, toOptionalTrimmedString } from '../lib/adsPortal'

// 读取用户过期日期字段 / Read user expire date field
export function getUserExpireDate(user) {
  return firstDefinedValue(user, ['expireDate', 'expireAt', 'expiry', 'expire'])
}

// 校验用户名 / Validate user name
export function validateUserName(value) {
  const text = toOptionalTrimmedString(value)
  if (!text) {
    throw new Error('User Name is required.')
  }

  if (text.length < 2) {
    throw new Error('User Name must be at least 2 characters.')
  }

  if (text.length > 50) {
    throw new Error('User Name must be 50 characters or fewer.')
  }

  return text
}

// 校验邮箱 / Validate email
export function validateUserEmail(value) {
  const text = toOptionalTrimmedString(value)
  if (!text) {
    throw new Error('Email is required.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    throw new Error('Please enter a valid email address.')
  }

  return text
}

// 校验手机号 / Validate phone number
export function validateUserPhoneNumber(value) {
  const text = toOptionalTrimmedString(value)
  if (!text) {
    throw new Error('Phone Number is required.')
  }

  if (!/^[0-9+\-()\s]{7,20}$/.test(text)) {
    throw new Error('Please enter a valid phone number using 7-20 digits and common symbols.')
  }

  return text
}
