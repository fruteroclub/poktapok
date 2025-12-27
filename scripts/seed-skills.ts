/**
 * Seed Skills Library
 *
 * Populates the skills table with preset skills for users to choose from.
 * Run with: bun run scripts/seed-skills.ts
 */

import { db, closeDatabase } from '../src/lib/db';
import { skills, type NewSkill } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Preset skills to seed
 * Categories: language, framework, tool, blockchain, other
 */
const presetSkills: Omit<NewSkill, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  // Languages
  { name: 'JavaScript', slug: 'javascript', category: 'language', description: 'Dynamic programming language for web development' },
  { name: 'TypeScript', slug: 'typescript', category: 'language', description: 'Typed superset of JavaScript' },
  { name: 'Python', slug: 'python', category: 'language', description: 'High-level general-purpose programming language' },
  { name: 'Rust', slug: 'rust', category: 'language', description: 'Systems programming language focused on safety and performance' },
  { name: 'Solidity', slug: 'solidity', category: 'language', description: 'Smart contract programming language for Ethereum' },
  { name: 'Go', slug: 'go', category: 'language', description: 'Statically typed compiled language designed at Google' },
  { name: 'Java', slug: 'java', category: 'language', description: 'Object-oriented programming language' },

  // Frontend Frameworks
  { name: 'React', slug: 'react', category: 'framework', description: 'JavaScript library for building user interfaces' },
  { name: 'Next.js', slug: 'nextjs', category: 'framework', description: 'React framework with SSR and SSG' },
  { name: 'Vue.js', slug: 'vuejs', category: 'framework', description: 'Progressive JavaScript framework' },
  { name: 'Angular', slug: 'angular', category: 'framework', description: 'TypeScript-based web application framework' },
  { name: 'Svelte', slug: 'svelte', category: 'framework', description: 'Cybernetically enhanced web apps' },
  { name: 'Tailwind CSS', slug: 'tailwind-css', category: 'framework', description: 'Utility-first CSS framework' },

  // Backend Frameworks
  { name: 'Node.js', slug: 'nodejs', category: 'framework', description: 'JavaScript runtime built on Chrome V8 engine' },
  { name: 'Express', slug: 'express', category: 'framework', description: 'Fast, unopinionated web framework for Node.js' },
  { name: 'NestJS', slug: 'nestjs', category: 'framework', description: 'Progressive Node.js framework for building server-side applications' },
  { name: 'Django', slug: 'django', category: 'framework', description: 'High-level Python web framework' },
  { name: 'FastAPI', slug: 'fastapi', category: 'framework', description: 'Modern, fast web framework for building APIs with Python' },
  { name: 'Ruby on Rails', slug: 'ruby-on-rails', category: 'framework', description: 'Server-side web application framework written in Ruby' },

  // Tools & Databases
  { name: 'Git', slug: 'git', category: 'tool', description: 'Distributed version control system' },
  { name: 'Docker', slug: 'docker', category: 'tool', description: 'Platform for developing, shipping, and running applications in containers' },
  { name: 'PostgreSQL', slug: 'postgresql', category: 'tool', description: 'Powerful, open-source relational database' },
  { name: 'MongoDB', slug: 'mongodb', category: 'tool', description: 'NoSQL document database' },
  { name: 'Redis', slug: 'redis', category: 'tool', description: 'In-memory data structure store' },
  { name: 'GraphQL', slug: 'graphql', category: 'tool', description: 'Query language for APIs' },
  { name: 'Prisma', slug: 'prisma', category: 'tool', description: 'Next-generation ORM for Node.js and TypeScript' },
  { name: 'Drizzle ORM', slug: 'drizzle-orm', category: 'tool', description: 'TypeScript ORM for SQL databases' },

  // Blockchain & Web3
  { name: 'Ethereum', slug: 'ethereum', category: 'blockchain', description: 'Decentralized blockchain platform' },
  { name: 'Wagmi', slug: 'wagmi', category: 'blockchain', description: 'React hooks for Ethereum' },
  { name: 'Ethers.js', slug: 'ethersjs', category: 'blockchain', description: 'Ethereum JavaScript library' },
  { name: 'Viem', slug: 'viem', category: 'blockchain', description: 'TypeScript interface for Ethereum' },
  { name: 'Arbitrum', slug: 'arbitrum', category: 'blockchain', description: 'Ethereum layer 2 scaling solution' },
  { name: 'Base', slug: 'base', category: 'blockchain', description: 'Coinbase layer 2 network' },
  { name: 'Polygon', slug: 'polygon', category: 'blockchain', description: 'Ethereum scaling and infrastructure development platform' },
  { name: 'Optimism', slug: 'optimism', category: 'blockchain', description: 'Ethereum layer 2 scaling solution' },
  { name: 'The Graph', slug: 'the-graph', category: 'blockchain', description: 'Indexing protocol for querying blockchain data' },

  // Other
  { name: 'Web3', slug: 'web3', category: 'other', description: 'Decentralized web technologies' },
  { name: 'DeFi', slug: 'defi', category: 'other', description: 'Decentralized finance protocols and applications' },
  { name: 'Smart Contracts', slug: 'smart-contracts', category: 'other', description: 'Self-executing contracts on blockchain' },
  { name: 'REST APIs', slug: 'rest-apis', category: 'other', description: 'RESTful web services and APIs' },
  { name: 'IPFS', slug: 'ipfs', category: 'other', description: 'InterPlanetary File System for decentralized storage' },
  { name: 'Hardhat', slug: 'hardhat', category: 'other', description: 'Ethereum development environment' },
  { name: 'Foundry', slug: 'foundry', category: 'other', description: 'Blazing fast Ethereum development toolkit' },
];

async function seedSkills() {
  console.log('🌱 Starting skills seed...');

  try {
    // Check if skills already exist
    const existingSkills = await db.select().from(skills);

    if (existingSkills.length > 0) {
      console.log(`⚠️  Found ${existingSkills.length} existing skills. Skipping seed.`);
      console.log('💡 To re-seed, truncate the skills table first: TRUNCATE TABLE skills CASCADE;');
      return;
    }

    // Insert all skills
    console.log(`📦 Inserting ${presetSkills.length} skills...`);

    const inserted = await db.insert(skills).values(presetSkills).returning();

    console.log(`✅ Successfully seeded ${inserted.length} skills!`);

    // Show categories breakdown
    const categories = inserted.reduce(
      (acc, skill) => {
        acc[skill.category] = (acc[skill.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('\n📊 Skills by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding skills:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run seed
seedSkills()
  .then(() => {
    console.log('\n✨ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
