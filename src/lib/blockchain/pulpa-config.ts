import { optimism } from 'viem/chains'

/**
 * PULPA Token Configuration
 *
 * $PULPA is deployed on Optimism Mainnet
 * Used for rewarding community activities and learning milestones
 */

export const PULPA_CONFIG = {
  // Token contract address on Optimism
  address: '0x029263aA1BE88127f1794780D9eEF453221C2f30' as `0x${string}`,

  // Chain configuration
  chainId: 10,
  chain: optimism,

  // Token metadata
  name: 'PULPA',
  symbol: 'PULPA',
  decimals: 18,
} as const

/**
 * Standard ERC-20 ABI for transfer operations
 */
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const

/**
 * Convert human-readable amount to token units (with decimals)
 */
export function parseTokenAmount(amount: string | number): bigint {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount
  const [whole, fraction = ''] = amountStr.split('.')
  const paddedFraction = fraction.padEnd(PULPA_CONFIG.decimals, '0').slice(0, PULPA_CONFIG.decimals)
  return BigInt(whole + paddedFraction)
}

/**
 * Convert token units to human-readable amount
 */
export function formatTokenAmount(amount: bigint): string {
  const amountStr = amount.toString().padStart(PULPA_CONFIG.decimals + 1, '0')
  const whole = amountStr.slice(0, -PULPA_CONFIG.decimals) || '0'
  const fraction = amountStr.slice(-PULPA_CONFIG.decimals)
  // Remove trailing zeros
  const trimmedFraction = fraction.replace(/0+$/, '')
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole
}
