import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/privy/middleware'
import { getPulpaBalance } from '@/lib/blockchain/pulpa-service'
import { apiSuccess, apiErrors } from '@/lib/api/response'

/**
 * GET /api/profile/pulpa-balance
 *
 * Fetches the authenticated user's PULPA token balance from the blockchain.
 * Returns the balance for the user's app wallet (Privy embedded) or external wallet.
 */
export const GET = requireAuth(async (_request: NextRequest, authUser) => {
  try {
    // Get user's wallet addresses from database using privyDid
    const [user] = await db
      .select({
        appWallet: users.appWallet,
        extWallet: users.extWallet,
      })
      .from(users)
      .where(eq(users.privyDid, authUser.privyDid))
      .limit(1)

    if (!user) {
      return apiErrors.notFound('User')
    }

    // Prefer app wallet (Privy embedded), fallback to external wallet
    const walletAddress = user.appWallet || user.extWallet

    if (!walletAddress) {
      return apiSuccess({
        balance: '0',
        formattedBalance: '0',
        walletAddress: null,
        hasWallet: false,
      })
    }

    // Fetch balance from blockchain
    const { balance } = await getPulpaBalance(walletAddress)

    // Format balance (remove trailing zeros, max 4 decimals for display)
    const numericBalance = parseFloat(balance)
    const formattedBalance =
      numericBalance === Math.floor(numericBalance)
        ? Math.floor(numericBalance).toString()
        : numericBalance.toFixed(4).replace(/\.?0+$/, '')

    return apiSuccess({
      balance,
      formattedBalance,
      walletAddress,
      hasWallet: true,
    })
  } catch (error) {
    console.error('Error fetching PULPA balance:', error)
    return apiErrors.internal(
      error instanceof Error ? error.message : 'Failed to fetch PULPA balance'
    )
  }
})
