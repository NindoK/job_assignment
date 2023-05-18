import { defineConfig } from '@dethcrypto/eth-sdk'

export default defineConfig({
  contracts: {
    mainnet: {
      dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
      mkr: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
  },
})
