import { getTokenBalances } from '@/lib/eth'
import { getMainnetSdk } from '@dethcrypto/eth-sdk-client'
import { ethers } from 'ethers'

jest.mock('@dethcrypto/eth-sdk-client')

describe('getTokenBalances', () => {
  it('should return token balances for the given address', async () => {
    // Mock data
    const address = '0x1B7BAa734C00298b9429b518D621753Bb0f6efF2'

    const sdkMock = {
      dai: { decimals: jest.fn(), balanceOf: jest.fn() },
      usdc: { decimals: jest.fn(), balanceOf: jest.fn() },
      mkr: { decimals: jest.fn(), balanceOf: jest.fn() },
    }

    ;(getMainnetSdk as jest.Mock).mockReturnValueOnce(sdkMock)

    // Set up mock return values for the contract functions
    sdkMock.dai.decimals.mockResolvedValueOnce(18)
    sdkMock.usdc.decimals.mockResolvedValueOnce(6)
    sdkMock.mkr.decimals.mockResolvedValueOnce(18)

    sdkMock.dai.balanceOf.mockResolvedValueOnce(ethers.BigNumber.from('1000000000000000000'))
    sdkMock.usdc.balanceOf.mockResolvedValueOnce(ethers.BigNumber.from('2000000'))
    sdkMock.mkr.balanceOf.mockResolvedValueOnce(ethers.BigNumber.from('3000000000000000000'))

    // Call the function
    const result = await getTokenBalances(address)

    // Verify the result
    expect(result).toEqual([
      { name: 'Dai', symbol: 'DAI', balance: '1' },
      { name: 'USD Coin', symbol: 'USDC', balance: '2' },
      { name: 'Maker', symbol: 'MKR', balance: '3' },
    ])

    // Verify contract calls
    expect(sdkMock.dai.decimals).toHaveBeenCalled()
    expect(sdkMock.usdc.decimals).toHaveBeenCalled()
    expect(sdkMock.mkr.decimals).toHaveBeenCalled()
    expect(sdkMock.dai.balanceOf).toHaveBeenCalledWith(address)
    expect(sdkMock.usdc.balanceOf).toHaveBeenCalledWith(address)
    expect(sdkMock.mkr.balanceOf).toHaveBeenCalledWith(address)
  })
})
