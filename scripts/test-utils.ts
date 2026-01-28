import { PATTERNS } from '../drizzle/schema/utils'

console.log('🧪 Testing schema utility patterns...\n')

// Test patterns
const testCases = [
  // Email
  {
    name: 'EMAIL',
    pattern: PATTERNS.EMAIL,
    valid: ['user@example.com', 'test.user@domain.co.uk', 'name+tag@site.com'],
    invalid: ['notanemail', '@example.com', 'user@', 'user @example.com'],
  },

  // Ethereum address
  {
    name: 'ETH_ADDRESS',
    pattern: PATTERNS.ETH_ADDRESS,
    valid: [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
      '0x0000000000000000000000000000000000000000',
      '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    ],
    invalid: ['0x123', '742d35Cc6634C0532925a3b844Bc9e7595f0bEb5', '0xGGGG'],
  },

  // Username
  {
    name: 'USERNAME',
    pattern: PATTERNS.USERNAME,
    valid: ['carlos_dev', 'user123', 'a_b_c', 'test_user_name'],
    invalid: ['Carlos-Dev', 'User 123', 'AB', 'ab', 'UPPERCASE', 'user-name'],
  },

  // Country code
  {
    name: 'COUNTRY_CODE',
    pattern: PATTERNS.COUNTRY_CODE,
    valid: ['MX', 'US', 'AR', 'BR', 'ES'],
    invalid: ['Mexico', 'mx', 'USA', '1A', 'A'],
  },

  // Invite code
  {
    name: 'INVITE_CODE',
    pattern: PATTERNS.INVITE_CODE,
    valid: [
      'AbCdEf1234567890',
      'TEST_INVITE_CODE_123',
      'a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p',
    ],
    invalid: [
      'SHORT',
      'TOO_LONG_CODE_WITH_MORE_THAN_32_CHARACTERS_FAILS',
      'code with spaces',
    ],
  },
]

let allPassed = true

testCases.forEach(({ name, pattern, valid, invalid }) => {
  console.log(`\n📋 Testing ${name} pattern:`)
  console.log(`   Pattern: ${pattern}`)

  // PostgreSQL ~* is case-insensitive, but USERNAME and COUNTRY_CODE should be case-sensitive
  const caseSensitive = name === 'USERNAME' || name === 'COUNTRY_CODE'
  const regex = new RegExp(pattern, caseSensitive ? '' : 'i')

  // Test valid cases
  console.log('   Valid cases:')
  valid.forEach((test) => {
    const matches = regex.test(test)
    if (matches) {
      console.log(`     ✅ "${test}"`)
    } else {
      console.log(`     ❌ "${test}" (should be valid!)`)
      allPassed = false
    }
  })

  // Test invalid cases
  console.log('   Invalid cases:')
  invalid.forEach((test) => {
    const matches = regex.test(test)
    if (!matches) {
      console.log(`     ✅ "${test}" (correctly rejected)`)
    } else {
      console.log(`     ❌ "${test}" (should be invalid!)`)
      allPassed = false
    }
  })
})

console.log('\n' + '='.repeat(50))
if (allPassed) {
  console.log('✅ All pattern tests passed!')
} else {
  console.log('❌ Some pattern tests failed!')
  process.exit(1)
}

// Display helper information
console.log('\n📝 Helper exports:')
console.log('   - timestamps (createdAt, updatedAt)')
console.log('   - softDelete (deletedAt)')
console.log('   - metadata (JSONB field)')
console.log('   - checkPattern() helper function')
console.log('   - PATTERNS constant')

console.log('\n🎯 Ready to use in schema files!')
