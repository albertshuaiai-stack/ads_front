// 分页状态构建纯函数 / Pure helpers for pagination state
import { extractItems } from '../lib/adsPortal'
import { toOptionalCount } from './formatters'

// 初始分页状态 / Initial pagination state
export function createInitialPagination(size = 10) {
  return {
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
  }
}

// 根据后端响应构建分页状态 / Build pagination state from API response
export function buildPaginationState(response, fallback) {
  const page = toOptionalCount(response?.number) ?? fallback.page
  const size = toOptionalCount(response?.size) ?? fallback.size
  const totalElements = toOptionalCount(response?.totalElements) ?? extractItems(response).length
  const totalPages =
    toOptionalCount(response?.totalPages) ??
    (size > 0 ? Math.ceil(totalElements / size) : 0)

  return {
    page,
    size,
    totalElements,
    totalPages,
  }
}
