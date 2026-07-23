// Shift Link 测试模块状态 / Test Shift Link module state
import { useState } from 'react'

export function useTestShiftLink() {
  const [testShiftLinkCampainName, setTestShiftLinkCampainName] = useState('')
  const [testShiftLinkApiKey, setTestShiftLinkApiKey] = useState('')
  const [testShiftLinkError, setTestShiftLinkError] = useState('')
  const [normalAdsTestResponse, setNormalAdsTestResponse] = useState(null)
  const [matrixAdsTestResponse, setMatrixAdsTestResponse] = useState(null)
  const [normalAdsTestLoading, setNormalAdsTestLoading] = useState(false)
  const [matrixAdsTestLoading, setMatrixAdsTestLoading] = useState(false)

  return {
    testShiftLinkCampainName, setTestShiftLinkCampainName,
    testShiftLinkApiKey, setTestShiftLinkApiKey,
    testShiftLinkError, setTestShiftLinkError,
    normalAdsTestResponse, setNormalAdsTestResponse,
    matrixAdsTestResponse, setMatrixAdsTestResponse,
    normalAdsTestLoading, setNormalAdsTestLoading,
    matrixAdsTestLoading, setMatrixAdsTestLoading,
  }
}
