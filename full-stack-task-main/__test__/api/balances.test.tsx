import handler, { savedBalances } from '@/pages/api/balances' // Adjust the import path if needed

describe('API Route: /api/handler', () => {
  let req: any, res: any

  beforeEach(() => {
    req = {
      method: '',
      body: {},
    }
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    beforeEach(() => {
      req.method = 'POST'
      req.body = {
        address: '0x1234567890123456789012345678901234567890',
        balances: [
          { token: 'DAI', balance: 1 },
          { token: 'USDC', balance: 2 },
          { token: 'MKR', balance: 3 },
        ],
      }
    })

    it('should save balances for new address', () => {
      handler(req, res)

      expect(savedBalances).toHaveLength(1)
      expect(savedBalances[0]).toEqual({
        address: '0x1234567890123456789012345678901234567890',
        balances: [
          { token: 'DAI', balance: 1 },
          { token: 'USDC', balance: 2 },
          { token: 'MKR', balance: 3 },
        ],
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('should not save balances for existing address', () => {
      handler(req, res)

      expect(savedBalances).toHaveLength(1)
      expect(savedBalances[0]).toEqual({
        address: '0x1234567890123456789012345678901234567890',
        balances: [
          { token: 'DAI', balance: 1 },
          { token: 'USDC', balance: 2 },
          { token: 'MKR', balance: 3 },
        ],
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })

    it('should add balances for a new address', () => {
      req.method = 'POST'
      req.body = {
        address: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2',
        balances: [
          { token: 'DAI', balance: 1 },
          { token: 'USDC', balance: 2 },
          { token: 'MKR', balance: 3 },
        ],
      }
      handler(req, res)

      expect(savedBalances).toHaveLength(2)
      expect(savedBalances).toEqual([
        {
          address: '0x1234567890123456789012345678901234567890',
          balances: [
            { token: 'DAI', balance: 1 },
            { token: 'USDC', balance: 2 },
            { token: 'MKR', balance: 3 },
          ],
        },
        {
          address: '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2',
          balances: [
            { token: 'DAI', balance: 1 },
            { token: 'USDC', balance: 2 },
            { token: 'MKR', balance: 3 },
          ],
        },
      ])
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ success: true })
    })
  })

  it('should return 405 when req is empty', () => {
    req = {
      method: '',
      body: {},
    }

    handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' })
  })
})
