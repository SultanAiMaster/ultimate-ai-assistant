import { SkillSchemaZod } from '../models/Skill';
import { z } from 'zod';

// In-memory skill store (for development/testing)
let inMemorySkills: Map<string, any> = new Map();

/**
 * Load skills from SkillParser to memory
 */
export class InMemorySkillStore {
  /**
   * Save a skill to memory
   */
  async saveSkill(skill: any): Promise<void> {
    const validated = SkillSchemaZod.parse(skill);
    inMemorySkills.set(validated.id, validated);
  }

  /**
   * Save multiple skills to memory
   */
  async saveSkills(skills: any[]): Promise<{ saved: number }> {
    for (const skill of skills) {
      await this.saveSkill(skill);
    }
    return { saved: skills.length };
  }

  /**
   * Find a skill by ID
   */
  async findById(id: string): Promise<any | null> {
    return inMemorySkills.get(id) || null;
  }

  /**
   * Find skills with filters
   */
  async find(filter: any = {}, options: any = {}): Promise<any[]> {
    let results = Array.from(inMemorySkills.values());

    // Filter by category
    if (filter.category) {
      results = results.filter(s => s.category === filter.category);
    }

    // Filter by risk level
    if (filter.riskLevel) {
      results = results.filter(s => s.riskLevel === filter.riskLevel);
    }

    // Filter by tags
    if (filter.tags && filter.tags.$in) {
      results = results.filter(s =>
        s.tags && s.tags.some(t => filter.tags.$in.includes(t))
      );
    }

    // Text search
    if (filter.$text && filter.$text.$search) {
      const search = filter.$text.$search.toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search) ||
        (s.documentation && s.documentation.toLowerCase().includes(search))
      );
    }

    // Sort
    const sortKey = options.sort?.name ? 'name' : '_id';
    const sortOrder = options.sort?.[sortKey] === 1 ? 1 : -1;
    results.sort((a, b) => {
      const aVal = a[sortKey] || (sortKey === '_id' ? a.id : '');
      const bVal = b[sortKey] || (sortKey === '_id' ? b.id : '');
      if (sortOrder === 1) {
        return aVal.localeCompare(bVal);
      }
      return bVal.localeCompare(aVal);
    });

    // Pagination
    if (options.skip) {
      results = results.slice(options.skip);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Count documents with filters
   */
  async countDocuments(filter: any = {}): Promise<number> {
    const results = await this.find(filter);
    return results.length;
  }

  /**
   * Distinct values for a field
   */
  async distinct(field: string, filter: any = {}): Promise<any[]> {
    const results = await this.find(filter);
    const values = results.map(r => r[field]).flat().filter(Boolean);
    return [...new Set(values)];
  }

  /**
   * Aggregate pipeline
   * (Simplified implementation)
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    let results = Array.from(inMemorySkills.values());

    // Simplified $group and $sort for now
    for (const stage of pipeline) {
      if (stage.$group) {
        const groups: Map<string, any> = new Map();
        const groupBy = stage.$group._id;

        for (const skill of results) {
          const key = groupBy === '$category' ? skill.category :
                     groupBy === '$riskLevel' ? skill.riskLevel :
                     skill[groupBy];

          if (!groups.has(key)) {
            groups.set(key, { _id: key, count: 0 });
          }
          groups.get(key)!.count++;
        }
        results = Array.from(groups.values());

        if (stage.$sort) {
          const sortField = Object.keys(stage.$sort)[0];
          const sortOrder = Object.values(stage.$sort)[0];
          results.sort((a, b) =>
            sortOrder === 1 ?
            a[sortField] - b[sortField] :
            b[sortField] - a[sortField]
          );
        }
      }

      if (stage.$limit) {
        results = results.slice(0, stage.$limit);
      }

      if (stage.$unwind) {
        results = results.flatMap(r =>
          r.tags ? r.tags.map(t => ({ ...r, [stage.$unwind]: t })) : [r]
        );
      }
    }

    return results;
  }

  /**
   * Update one skill
   */
  async updateOne(filter: any, update: any): Promise<any> {
    const exists = await this.findById(filter.id);
    if (!exists) {
      return { upsertedCount: 0, modifiedCount: 0 };
    }

    if (update.$set) {
      inMemorySkills.set(filter.id, { ...exists, ...update.$set });
    }
    return { upsertedCount: 0, modifiedCount: 1 };
  }

  /**
   * Delete all skills
   */
  async deleteMany(): Promise<{ deletedCount: number }> {
    const count = inMemorySkills.size;
    inMemorySkills.clear();
    return { deletedCount: count };
  }

  /**
   * Get total skills count
   */
  static async count(): Promise<number> {
    return inMemorySkills.size;
  }
}

// Export singleton instance
export const inMemorySkillStore = new InMemorySkillStore();

// Simplified Skill model for in-memory use
export class SimpleSkill {
  static find(filter?: any): any {
    return {
      sort: (sort: any) => ({
        skip: (skip: number) => ({
          limit: (limit: number) => ({
            lean: () => inMemorySkillStore.find(filter, { sort, skip, limit })
          })
        })
      })
    };
  }

  static findOne(filter: any): Promise<any> {
    return inMemorySkillStore.findById(filter.id);
  }

  static countDocuments(filter?: any): Promise<number> {
    return inMemorySkillStore.countDocuments(filter);
  }

  static distinct(field: string, filter?: any): Promise<any[]> {
    return inMemorySkillStore.distinct(field, filter);
  }

  static aggregate(pipeline: any[]): Promise<any[]> {
    return inMemorySkillStore.aggregate(pipeline);
  }

  static updateOne(filter: any, update: any): Promise<any> {
    return inMemorySkillStore.updateOne(filter, update);
  }

  static deleteMany(): Promise<{ deletedCount: number }> {
    return inMemorySkillStore.deleteMany();
  }
}