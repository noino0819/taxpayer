import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function createMockReq(overrides: Record<string, unknown> = {}) {
  return {
    method: 'GET',
    headers: { authorization: 'Bearer test-cron-secret' },
    ...overrides,
  }
}

function createMockRes() {
  const res: Record<string, unknown> = {
    _status: 200,
    _json: null as unknown,
    _ended: false,
  }
  res.status = (code: number) => { res._status = code; return res }
  res.json = (data: unknown) => { res._json = data; return res }
  res.end = () => { res._ended = true; return res }
  return res
}

describe('close-market 핸들러', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'test-cron-secret')
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('GET이 아닌 요청은 405를 반환한다', async () => {
    const { default: handler } = await import('../../api/cron/close-market')
    const req = createMockReq({ method: 'POST' })
    const res = createMockRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(405)
    expect(res._ended).toBe(true)
  })

  it('잘못된 인증 토큰은 401을 반환한다', async () => {
    const { default: handler } = await import('../../api/cron/close-market')
    const req = createMockReq({ headers: { authorization: 'Bearer wrong-token' } })
    const res = createMockRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(401)
    expect(res._json).toEqual({ error: 'Unauthorized' })
  })

  it('인증 헤더가 없으면 401을 반환한다', async () => {
    const { default: handler } = await import('../../api/cron/close-market')
    const req = createMockReq({ headers: {} })
    const res = createMockRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(401)
  })
})

describe('pay-salaries 핸들러', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'test-cron-secret')
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('GET이 아닌 요청은 405를 반환한다', async () => {
    const { default: handler } = await import('../../api/cron/pay-salaries')
    const req = createMockReq({ method: 'DELETE' })
    const res = createMockRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(405)
    expect(res._ended).toBe(true)
  })

  it('잘못된 인증 토큰은 401을 반환한다', async () => {
    const { default: handler } = await import('../../api/cron/pay-salaries')
    const req = createMockReq({ headers: { authorization: 'Bearer invalid' } })
    const res = createMockRes()
    await handler(req as never, res as never)
    expect(res._status).toBe(401)
    expect(res._json).toEqual({ error: 'Unauthorized' })
  })
})
