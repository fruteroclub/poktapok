/**
 * Check authentication methods for admin users
 */

import { db, closeDatabase } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq, isNull, or } from 'drizzle-orm';

async function checkAdminAuth() {
  try {
    // Get all admins
    const admins = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.role, 'admin'),
          eq(users.role, 'moderator')
        )
      )
      .where(isNull(users.deletedAt));

    console.log(`\n👑 ADMIN AUTHENTICATION DETAILS (${admins.length} total)\n`);
    console.log('='.repeat(80));

    for (const admin of admins) {
      console.log(`\n📧 ${admin.displayName || admin.username || 'Unknown'}`);
      console.log('─'.repeat(80));
      console.log(`  Email:              ${admin.email || 'N/A'}`);
      console.log(`  Role:               ${admin.role}`);
      console.log(`  Status:             ${admin.accountStatus}`);
      console.log(`  Primary Auth:       ${admin.primaryAuthMethod}`);
      console.log(`  Privy DID:          ${admin.privyDid}`);
      console.log(`  External Wallet:    ${admin.extWallet || 'None'}`);
      console.log(`  App Wallet:         ${admin.appWallet || 'None'}`);
      
      // Parse privy metadata to see linked accounts
      if (admin.privyMetadata && typeof admin.privyMetadata === 'object') {
        const metadata = admin.privyMetadata as any;
        console.log(`  Privy Metadata:     ${JSON.stringify(metadata, null, 2)}`);
      }
      
      // Analyze auth method
      const authMethod = admin.primaryAuthMethod;
      const email = admin.email || '';
      
      let authNote = '';
      if (authMethod === 'email') {
        authNote = '✉️  Email authentication';
      } else if (authMethod === 'wallet') {
        authNote = '💰 Wallet authentication';
      } else if (authMethod === 'social') {
        if (email.includes('@github.incomplete.user')) {
          authNote = '🐙 GitHub authentication (incomplete profile)';
        } else {
          authNote = '🔗 Social authentication (Google/GitHub/Discord)';
        }
      }
      
      console.log(`  Auth Note:          ${authNote}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Summary by Auth Method:\n');
    
    const byAuthMethod = admins.reduce((acc, admin) => {
      const method = admin.primaryAuthMethod;
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byAuthMethod).forEach(([method, count]) => {
      console.log(`  ${method.padEnd(15)} ${count} admins`);
    });

    console.log('\n🔍 Email Patterns:\n');
    admins.forEach(admin => {
      const email = admin.email || 'N/A';
      const isGithub = email.includes('@github.incomplete.user');
      const isFrutero = email.includes('@frutero.club');
      const pattern = isGithub ? '🐙 GitHub' : isFrutero ? '🍊 Frutero' : '📧 External';
      console.log(`  ${pattern}  ${email}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

checkAdminAuth()
  .then(() => {
    console.log('\n✅ Check complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
