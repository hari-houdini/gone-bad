import { ScanQuotaService, DAILY_SCAN_LIMIT } from './scan-quota.service'

describe('ScanQuotaService — DAILY_SCAN_LIMIT', () => {
  it('is 20', () => {
    expect(DAILY_SCAN_LIMIT).toBe(20)
  })
})

// ---------------------------------------------------------------------------
// isQuotaExceeded
// ---------------------------------------------------------------------------

describe('ScanQuotaService.isQuotaExceeded', () => {
  it('returns false at 0 scans', () => {
    expect(ScanQuotaService.isQuotaExceeded(0)).toBe(false)
  })

  it('returns false at 19 scans (one below limit)', () => {
    expect(ScanQuotaService.isQuotaExceeded(19)).toBe(false)
  })

  it('returns true at exactly 20 scans', () => {
    expect(ScanQuotaService.isQuotaExceeded(20)).toBe(true)
  })

  it('returns true at 21 scans (above limit)', () => {
    expect(ScanQuotaService.isQuotaExceeded(21)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// remainingScans
// ---------------------------------------------------------------------------

describe('ScanQuotaService.remainingScans', () => {
  it('returns 20 at 0 scans', () => {
    expect(ScanQuotaService.remainingScans(0)).toBe(20)
  })

  it('returns 1 at 19 scans', () => {
    expect(ScanQuotaService.remainingScans(19)).toBe(1)
  })

  it('returns 0 at exactly 20 scans', () => {
    expect(ScanQuotaService.remainingScans(20)).toBe(0)
  })

  it('clamps to 0 when scan count exceeds the limit', () => {
    expect(ScanQuotaService.remainingScans(25)).toBe(0)
  })
})
