import { getMainnetSdk } from '@dethcrypto/eth-sdk-client'
import { ethers } from 'ethers'

interface TokenInfo {
  name: string
  symbol: string
  contract: any
}

export async function getTokenBalances(
  address: string,
): Promise<Array<{ name: string; symbol: string; balance: string }>> {
  //Changed to use Ankr's RPC otherwise too many requests error and too slow
  const customRpcUrl = 'https://rpc.ankr.com/eth'
  const customProvider = new ethers.providers.JsonRpcProvider(customRpcUrl)
  const sdk = getMainnetSdk(customProvider)

  //Handling data for multiple tokens
  const tokens: TokenInfo[] = [
    { name: 'Dai', symbol: 'DAI', contract: sdk.dai },
    { name: 'USD Coin', symbol: 'USDC', contract: sdk.usdc },
    { name: 'Maker', symbol: 'MKR', contract: sdk.mkr },
  ]

  //Get decimals and balances for each token
  const decimals = await Promise.all(tokens.map((token) => token.contract.decimals()))
  const balances = await Promise.all(tokens.map((token) => token.contract.balanceOf(address)))

  //Format balances to be ready for display in the frontend
  return balances.map((balance, index) => {
    const decimalValue = ethers.utils.formatUnits(balance, decimals[index])
    const formattedValue = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(parseFloat(decimalValue))

    return {
      name: tokens[index].name,
      symbol: tokens[index].symbol,
      balance: formattedValue,
    }
  })
}
