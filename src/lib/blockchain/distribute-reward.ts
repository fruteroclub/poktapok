import { db } from '@/lib/db'
import { pulpaDistributions, activitySubmissions, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { distributePulpa, waitForTransaction } from './pulpa-service'
import { createDistribution, updateDistribution } from '@/lib/db/queries/activities'

interface DistributionResult {
  success: boolean
  distributionId?: string
  transactionHash?: string
  error?: string
}

/**
 * Distribute PULPA reward for an approved submission
 *
 * This function:
 * 1. Gets the user's wallet address
 * 2. Creates a pending distribution record
 * 3. Sends the PULPA tokens on-chain
 * 4. Updates the distribution record with transaction hash
 * 5. Updates the submission status to 'distributed'
 */
export async function distributeSubmissionReward(
  submissionId: string,
  activityId: string,
  userId: string,
  pulpaAmount: string,
  distributedByUserId: string
): Promise<DistributionResult> {
  try {
    // 1. Get user's wallet address
    const [user] = await db
      .select({
        appWallet: users.appWallet,
        extWallet: users.extWallet,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Prefer app wallet (Privy embedded), fallback to external wallet
    const recipientWallet = user.appWallet || user.extWallet

    if (!recipientWallet) {
      return { success: false, error: 'User has no wallet address configured' }
    }

    // 2. Create pending distribution record
    const distribution = await createDistribution({
      submissionId,
      activityId,
      userId,
      pulpaAmount,
      recipientWallet,
      chainId: 10, // Optimism
      distributionMethod: 'smart_contract',
      status: 'processing',
      distributedByUserId,
    })

    try {
      // 3. Send PULPA tokens on-chain
      const result = await distributePulpa(recipientWallet, pulpaAmount)

      // 4. Update distribution record with transaction hash
      await updateDistribution(distribution.id, {
        transactionHash: result.transactionHash,
        status: 'completed',
        distributedAt: new Date(),
      })

      // 5. Update submission status to 'distributed'
      await db
        .update(activitySubmissions)
        .set({
          status: 'distributed',
          updatedAt: new Date(),
        })
        .where(eq(activitySubmissions.id, submissionId))

      // Optionally wait for transaction confirmation (async, don't block)
      waitForTransaction(result.transactionHash)
        .then(async (receipt) => {
          if (receipt.status === 'success') {
            await updateDistribution(distribution.id, {
              confirmedAt: new Date(),
              metadata: {
                blockNumber: receipt.blockNumber.toString(),
                gasUsed: receipt.gasUsed.toString(),
              },
            })
          }
        })
        .catch((err) => {
          console.error('Error confirming transaction:', err)
        })

      return {
        success: true,
        distributionId: distribution.id,
        transactionHash: result.transactionHash,
      }
    } catch (txError) {
      // Transaction failed, update distribution record
      const errorMessage =
        txError instanceof Error ? txError.message : 'Unknown error'

      await updateDistribution(distribution.id, {
        status: 'failed',
        errorMessage,
        retryCount: 1,
      })

      return {
        success: false,
        distributionId: distribution.id,
        error: errorMessage,
      }
    }
  } catch (error) {
    console.error('Distribution error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check if a submission already has a distribution
 */
export async function hasExistingDistribution(
  submissionId: string
): Promise<boolean> {
  const existing = await db
    .select({ id: pulpaDistributions.id })
    .from(pulpaDistributions)
    .where(eq(pulpaDistributions.submissionId, submissionId))
    .limit(1)

  return existing.length > 0
}
