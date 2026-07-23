// 广告归属判断纯函数 / Pure helpers for ads ownership
import { normalizeHeader } from '../lib/adsPortal'

// 当前用户身份候选集合 / Candidate identities of current user
export function getUserIdentityCandidates(currentUserProfile, currentUser, identifier) {
  return [
    currentUserProfile?.userName,
    currentUserProfile?.userEmail,
    currentUserProfile?.userPhoneNumber,
    currentUser,
    identifier,
  ]
    .map((value) => normalizeHeader(value))
    .filter(Boolean)
}

// 判断某条数据是否属于当前用户 / Whether an item is owned by current user
export function isOwnedByCurrentUser(item, currentUserProfile, currentUser, identifier) {
  const owner = normalizeHeader(item?.adsOwner)
  if (!owner) {
    return false
  }

  return getUserIdentityCandidates(currentUserProfile, currentUser, identifier).includes(owner)
}
