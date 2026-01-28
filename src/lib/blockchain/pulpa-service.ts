import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { optimism } from 'viem/chains'
import { PULPA_CONFIG, ERC20_ABI } from './pulpa-config'

/**
 * PULPA Token Distribution Service
 *
 * Handles on-chain token transfers for activity rewards.
 * Uses a server-side private key stored in environment variables.
 */

// Validate environment variables
function getDistributorPrivateKey(): `0x${string}` {
  const privateKey = process.env.PULPA_DISTRIBUTOR_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('PULPA_DISTRIBUTOR_PRIVATE_KEY not configured')
  }
  if (!privateKey.startsWith('0x')) {
    return `0x${privateKey}` as `0x${string}`
  }
  return privateKey as `0x${string}`
}

// Create public client for read operations
const publicClient = createPublicClient({
  chain: optimism,
  transport: http(),
})

/**
 * Get the distributor wallet address
 */
export function getDistributorAddress(): `0x${string}` {
  const account = privateKeyToAccount(getDistributorPrivateKey())
  return account.address
}

/**
 * Get PULPA balance for any wallet address
 */
export async function getPulpaBalance(walletAddress: string): Promise<{
  balance: string
  balanceRaw: bigint
}> {
  try {
    const balance = await publicClient.readContract({
      address: PULPA_CONFIG.address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress as `0x${string}`],
    })

    return {
      balance: formatUnits(balance, PULPA_CONFIG.decimals),
      balanceRaw: balance,
    }
  } catch (error) {
    console.error('Error fetching PULPA balance:', error)
    throw new Error('Failed to fetch PULPA balance')
  }
}

/**
 * Get the distributor wallet's PULPA balance
 */
export async function getDistributorBalance(): Promise<{
  balance: string
  balanceRaw: bigint
  address: string
}> {
  const address = getDistributorAddress()
  const { balance, balanceRaw } = await getPulpaBalance(address)
  return { balance, balanceRaw, address }
}

/**
 * Distribute PULPA tokens to a recipient
 *
 * @param recipientAddress - The wallet address to send tokens to
 * @param amount - Amount of PULPA to send (human-readable, e.g., "2" for 2 PULPA)
 * @returns Transaction hash and details
 */
export async function distributePulpa(
  recipientAddress: string,
  amount: string
): Promise<{
  transactionHash: string
  recipient: string
  amount: string
  amountRaw: bigint
}> {
  // Validate recipient address
  if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error('Invalid recipient wallet address')
  }

  // Parse amount to token units
  const amountRaw = parseUnits(amount, PULPA_CONFIG.decimals)
  if (amountRaw <= BigInt(0)) {
    throw new Error('Amount must be greater than 0')
  }

  // Check distributor balance
  const { balanceRaw } = await getDistributorBalance()
  if (balanceRaw < amountRaw) {
    throw new Error(
      `Insufficient PULPA balance. Available: ${formatUnits(balanceRaw, PULPA_CONFIG.decimals)}, Required: ${amount}`
    )
  }

  // Create wallet client for write operations
  const account = privateKeyToAccount(getDistributorPrivateKey())
  const walletClient = createWalletClient({
    account,
    chain: optimism,
    transport: http(),
  })

  try {
    // Send the transfer transaction
    const hash = await walletClient.writeContract({
      address: PULPA_CONFIG.address,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [recipientAddress as `0x${string}`, amountRaw],
    })

    console.log(
      `PULPA Distribution: ${amount} PULPA sent to ${recipientAddress}. TX: ${hash}`
    )

    return {
      transactionHash: hash,
      recipient: recipientAddress,
      amount,
      amountRaw,
    }
  } catch (error) {
    console.error('PULPA Distribution failed:', error)
    if (error instanceof Error) {
      throw new Error(`Distribution failed: ${error.message}`)
    }
    throw new Error('Distribution failed: Unknown error')
  }
}

/**
 * Wait for a transaction to be confirmed
 */
export async function waitForTransaction(
  transactionHash: string
): Promise<{
  status: 'success' | 'reverted'
  blockNumber: bigint
  gasUsed: bigint
}> {
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionHash as `0x${string}`,
  })

  return {
    status: receipt.status,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
  }
}

/**
 * Get Optimism explorer URL for a transaction
 */
export function getExplorerUrl(transactionHash: string): string {
  return `https://optimistic.etherscan.io/tx/${transactionHash}`
}
