import dotenv from 'dotenv';
import { connectDatabase } from './db/mongoose';
import { loadAntigravitySkills, getSkillStatistics } from './loaders/SkillLoader';

// Load environment variables
dotenv.config();

/**
 * CLI to load Antigravity skills into MongoDB
 */
async function main() {
  console.log('\n╔═════════════════════════════════════════════╗');
  console.log('║   🎭 ULTIMATE AI ASSISTANT - SKILL LOADER      ║');
  console.log('╠═════════════════════════════════════════════╣');
  console.log('║   Loading Antigravity Skills into MongoDB...    ║');
  console.log('╚═════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    await connectDatabase();

    // Load all Antigravity skills
    await loadAntigravitySkills();

    // Show statistics
    await getSkillStatistics();

    console.log('✅ Skill loading complete!\n');

    // Exit
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Skill loading failed:', error);
    process.exit(1);
  }
}

// Run
main();
