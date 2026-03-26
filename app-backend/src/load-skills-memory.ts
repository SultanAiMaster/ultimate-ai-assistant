import dotenv from 'dotenv';
import { connectRedis } from './db/redis';
import { SkillParser } from './skills/SkillParser';
import { inMemorySkillStore } from './db/in-memory-store';

// Load environment variables
dotenv.config();

/**
 * CLI to load skills (without MongoDB - uses in-memory storage)
 */
async function main() {
  console.log('\n╔═════════════════════════════════════════════╗');
  console.log('║   🎭 ULTIMATE AI ASSISTANT - SKILL LOADER      ║');
  console.log('╠═════════════════════════════════════════════╣');
  console.log('║   Loading Skills (In-Memory Mode)...            ║');
  console.log('╚═════════════════════════════════════════════╝\n');

  try {
    // Connect to Redis (optional)
    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (err) {
      console.warn('⚠️  Redis not available (optional)');
    }

    // Parse skills from directory
    const skillsPath = process.env.SKILLS_PATH || '/home/openclaw/.openclaw/workspace/antigravity-awesome-skills/skills';
    console.log(`\n📂 Loading skills from: ${skillsPath}`);

    const parser = new SkillParser();
    const skills = await parser.parseSkillsDirectory(skillsPath);

    console.log(`✅ Found ${skills.length} skills`);

    // Save to in-memory store
    console.log('💾 Saving to in-memory store...\n');

    const result = await inMemorySkillStore.saveSkills(skills);

    console.log('\n╠═════════════════════════════════════════════╣');
    console.log(`║   ✅ Loading Complete                              ║`);
    console.log('╠═════════════════════════════════════════════╣');
    console.log(`║   Total Skills:    ${result.saved}                                    ║`);
    console.log('╚═════════════════════════════════════════════╝\n');

    // Show statistics
    await showStatistics();

    console.log('✅ Skill loading complete!\n');
    console.log('📝 Note: Skills loaded in memory. Restarting server will clear data.\n');
    console.log('🚀 Run server with: npm run dev');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Skill loading failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Show skill statistics
 */
async function showStatistics(): Promise<void> {
  const allSkills = await inMemorySkillStore.find();
  const total = allSkills.length;

  const categories = await inMemorySkillStore.distinct('category');
  const riskLevels = await inMemorySkillStore.distinct('riskLevel');

  console.log('📊 SKILL STATISTICS');
  console.log('═'.repeat(50));
  console.log(`\nTotal Skills: ${total}\n`);
  console.log('Categories:');
  for (const cat of categories) {
    const skills = await inMemorySkillStore.find({ category: cat });
    const percentage = ((skills.length / total) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(20)}: ${String(skills.length).padStart(5)} (${percentage}%)`);
  }

  console.log('\nRisk Levels:');
  for (const risk of riskLevels) {
    const skills = await inMemorySkillStore.find({ riskLevel: risk });
    const percentage = ((skills.length / total) * 100).toFixed(1);
    console.log(`  ${risk.padEnd(20)}: ${String(skills.length).padStart(5)} (${percentage}%)`);
  }
  console.log('\n' + '═'.repeat(50) + '\n');
}

// Run
main();