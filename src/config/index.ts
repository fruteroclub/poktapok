import { Address } from 'viem'
import { arbitrum, base, optimism, polygon } from 'viem/chains'

const config = {
  tokens: {
    xoc: {
      address: '0xa411c9Aa00E020e4f88Bc19996d29c5B7ADB4ACf' as Address,
      decimals: 18,
      symbol: 'XOC',
      chains: {
        arbitrum,
        base,
        optimism,
        polygon,
      },
    },
  },
}

export default config
