import fs from 'fs/promises';
import path from 'path';
import { Skill } from '../models/Skill';
import { SkillParser } from '../skills/SkillParser';
import { connectDatabase, getDatabaseStatus } from '../db/mongoose';

/**
 * Load Antigravity skills from directory and save to MongoDB
 */
export class SkillLoader {
  private parser: SkillParser;
  private skillsPath: string;

  constructor(skillsPath: string) {
    this.parser = new SkillParser();
    this.skillsPath = skillsPath;
  }

  /**
   * Load all skills from Antigravity directory
   */
  async loadAllSkills(): Promise<{ total: number; loaded: number; failed: number }> {
    const startTime = Date.now();

    console.log('\n╔═════════════════════════════════════════════╗');
    console.log('║   📦 SKILL LOADER - Loading Antigravity Skills     ║');
    console.log('╠═════════════════════════════════════════════╣');

    try {
      // Check database connection
      const dbStatus = getDatabaseStatus();
      if (!dbStatus.connected) {
        console.log('❌ Database not connected. Attempting to connect...');
        await connectDatabase();
      }

      // Parse all skills
      console.log(`\n📂 Skills directory: ${this.skillsPath}`);
      console.log('🔍 Scanning for SKILL.md files...\n');

      const skills = await this.parser.parseSkillsDirectory(this.skillsPath);

      console.log(`\n✅ Found ${skills.length} skills`);
      console.log('💾 Saving to MongoDB...\n');

      // Save skills in batches
      const batchSize = 50;
      let loaded = 0;
      let failed = 0;

      for (let i = 0; i < skills.length; i += batchSize) {
        const batch = skills.slice(i, i + batchSize);
        const progress = Math.min(i + batchSize, skills.length);

        try {
          const result = await this.saveSkillsBatch(batch);
          loaded += result.saved;
          failed += result.failed;

          // Show progress
          const percentage = ((progress / skills.length) * 100).toFixed(1);
          const progressBar = this.createProgressBar(progress / skills.length);
          console.log(`\r[${progressBar}] ${progress}/${skills.length} skills processed (${percentage}%)`);
        } catch (error) {
          console.error(`\n❌ Batch ${i / batchSize + 1} failed:`, error);
          failed += batch.length;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n\n╠═════════════════════════════════════════════╣');
      console.log(`║   ✅ Loading Complete                              ║`);
      console.log('╠═════════════════════════════════════════════╣');
      console.log(`║   Total Skills:    ${this.formatNumber(skills.length).padEnd(25)}      ║`);
      console.log(`║   Loaded:          ${this.formatNumber(loaded).padEnd(25)}      ║`);
      console.log(`║   Failed:          ${this.formatNumber(failed).padEnd(25)}      ║`);
      console.log(`║   Duration:        ${duration.padEnd(25)}s     ║`);
      console.log('╚═════════════════════════════════════════════╝');

      return { total: skills.length, loaded, failed };

    } catch (error) {
      console.error('\n❌ Skill loading failed:', error);
      return { total: 0, loaded: 0, failed: 0 };
    }
  }

  /**
   * Save a batch of skills to MongoDB
   */
  private async saveSkillsBatch(skills: any[]): Promise<{ saved: number; failed: number }> {
    let saved = 0;
    let failed = 0;

    for (const skill of skills) {
      try {
        // Use updateOne with upsert to avoid duplicates
        const result = await Skill.updateOne(
          { id: skill.id },
          {
            $set: {
              ...skill,
              paths: skill.paths,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { upsert: true }
        );

        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
          saved++;
        }
      } catch (error) {
        // Log error but continue
        failed++;
      }
    }

    return { saved, failed };
  }

  /**
   * Create a progress bar
   */
  private createProgressBar(progress: number): string {
    const width = 30;
    const filled = Math.round(width * progress);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Format large numbers with commas
   */
  private formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Clear all skills from database
   */
  async clearAllSkills(): Promise<number> {
    console.log('🗑️  Clearing all skills from database...');
    const result = await Skill.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} skills`);
    return result.deletedCount || 0;
  }

  /**
   * Get loading statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byRiskLevel: Record<string, number>;
  }> {
    const total = await Skill.countDocuments();
    const byCategory = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byRiskLevel = await Skill.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      total,
      byCategory: Object.fromEntries(
        byCategory.map((item: any) => [item._id, item.count])
      ),
      byRiskLevel: Object.fromEntries(
        byRiskLevel.map((item: any) => [item._id, item.count])
      )
    };
  }
}

/**
 * Load skills with Antigravity path
 */
export async function loadAntigravitySkills(): Promise<void> {
  const antigravityPath = '/home/openclaw/.openclaw/workspace/antigravity-awesome-skills/skills';

  const loader = new SkillLoader(antigravityPath);
  await loader.loadAllSkills();
}

/**
 * Get skill statistics
 */
export async function getSkillStatistics(): Promise<void> {
  const loader = new SkillLoader('');
  const stats = await loader.getStatistics();

  console.log('\n📊 SKILL STATISTICS');
  console.log('═'.repeat(50));
  console.log(`\nTotal Skills: ${stats.total}\n`);
  console.log('By Category:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    console.log(`  ${category.padEnd(20)}: ${String(count).padStart(5)} (${percentage}%)`);
  });

  console.log('\nBy Risk Level:');
  Object.entries(stats.byRiskLevel).forEach(([risk, count]) => {
    const percentage = ((count / stats.total) * 100).toFixed(1);
    console.log(`  ${risk.padEnd(20)}: ${String(count).padStart(5)} (${percentage}%)`);
  });
  console.log('\n' + '═'.repeat(50) + '\n');
}
