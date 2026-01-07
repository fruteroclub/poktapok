import { db, closeDatabase } from '@/lib/db'
import { programs } from '@/lib/db/schema'

const initialPrograms = [
  {
    name: 'De Cero a Chamba',
    description: 'Learn web development fundamentals and land your first client. Build practical skills in HTML, CSS, JavaScript, and modern frameworks while completing real-world projects.',
    programType: 'cohort',
    isActive: true,
  },
  {
    name: 'DeFi-esta',
    description: 'Master DeFi protocols and build decentralized applications. Learn smart contract development, Web3 integration, and blockchain fundamentals through hands-on projects.',
    programType: 'cohort',
    isActive: true,
  },
  {
    name: 'Open',
    description: 'Self-directed learning with community support. Work on your own projects while staying connected with the community. Perfect for independent learners and ongoing skill development.',
    programType: 'evergreen',
    isActive: true,
  },
]

async function seed() {
  try {
    console.log('Seeding programs...')

    const seededPrograms = await db
      .insert(programs)
      .values(initialPrograms)
      .returning()

    console.log(`✅ Seeded ${seededPrograms.length} programs:`)
    seededPrograms.forEach(p => console.log(`  - ${p.name} (${p.programType})`))

  } catch (error) {
    console.error('Error seeding programs:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

seed()
