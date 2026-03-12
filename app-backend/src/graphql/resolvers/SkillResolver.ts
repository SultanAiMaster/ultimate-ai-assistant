import { Arg, Args, Mutation, Query, Resolver } from 'type-graphql';
import { Skill, SkillsData, CategoryCount, MetadataStats } from '../types/Skill';
import { SkillFilterInput, PaginationInput } from '../types/Skill';
import { SkillModel } from '../../models/Skill';
import { Types } from 'mongoose';

@Resolver(() => Skill)
export class SkillResolver {
  /**
   * Get all skills with filters
   */
  @Query(() => SkillsData)
  async skills(
    @Args(() => SkillFilterInput, { defaultValue: {} }) filter: SkillFilterInput,
    @Args(() => PaginationInput, { defaultValue: {} }) pagination: PaginationInput
  ): Promise<SkillsData> {
    const { category, riskLevel, tags, search } = filter;
    const limit = Math.min(pagination.limit || 50, 100);
    const offset = pagination.offset || 0;

    // Build filter
    const mongoFilter: any = {};

    if (category) {
      mongoFilter.category = category;
    }

    if (riskLevel) {
      mongoFilter.riskLevel = riskLevel;
    }

    if (tags && tags.length > 0) {
      mongoFilter.tags = { $in: tags };
    }

    if (search) {
      mongoFilter.$text = { $search: search };
    }

    // Get skills
    const skills = await SkillModel.find(mongoFilter)
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Get total count
    const total = await SkillModel.countDocuments(mongoFilter);

    return {
      skills: skills as unknown as Skill[],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + skills.length < total
      }
    };
  }

  /**
   * Get skill by ID
   */
  @Query(() => Skill, { nullable: true })
  async skill(
    @Arg('id', () => String!) id: string
  ): Promise<Skill | null> {
    const skill = await SkillModel.findOne({ id }).lean();
    return skill as unknown as Skill | null;
  }

  /**
   * Get skill by name
   */
  @Query(() => Skill, { nullable: true })
  async skillByName(
    @Arg('name', () => String!) name: string
  ): Promise<Skill | null> {
    const skill = await SkillModel.findOne({ name }).lean();
    return skill as unknown as Skill | null;
  }

  /**
   * Get all categories
   */
  @Query(() => [CategoryCount])
  async categories(): Promise<CategoryCount[]> {
    const categories = await SkillModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return categories.map(cat => ({
      _id: cat._id,
      count: cat.count
    }));
  }

  /**
   * Get category by name
   */
  @Query(() => [String])
  async categoryList(): Promise<string[]> {
    return await SkillModel.distinct('category').sort();
  }

  /**
   * Get all risk levels with counts
   */
  @Query(() => [CategoryCount])
  async riskLevels(): Promise<CategoryCount[]> {
    const levels = await SkillModel.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return levels.map(level => ({
      _id: level._id,
      count: level.count
    }));
  }

  /**
   * Get popular tags
   */
  @Query(() => [CategoryCount])
  async tags(
    @Arg('limit', () => Int, { defaultValue: 50 }) limit: number
  ): Promise<CategoryCount[]> {
    const tags = await SkillModel.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit }
    ]);

    return tags.map(tag => ({
      _id: tag._id,
      count: tag.count
    }));
  }

  /**
   * Get metadata statistics
   */
  @Query(() => MetadataStats)
  async metadataStats(): Promise<MetadataStats> {
    const total = await SkillModel.countDocuments();
    const categories = await SkillModel.distinct('category').sort();
    const riskLevels = await SkillModel.distinct('riskLevel').sort();
    const tags = await SkillModel.distinct('tags');

    return {
      totalSkills: total,
      totalCategories: categories.length,
      totalRiskLevels: riskLevels.length,
      totalTags: tags.length,
      categories,
      riskLevels
    };
  }

  /**
   * Search skills by text
   */
  @Query(() => SkillsData)
  async searchSkills(
    @Arg('query', () => String!) query: string,
    @Args(() => PaginationInput, { defaultValue: {} }) pagination: PaginationInput
  ): Promise<SkillsData> {
    return this.skills(
      { search: query },
      pagination
    );
  }

  /**
   * Get skills by category
   */
  @Query(() => SkillsData)
  async skillsByCategory(
    @Arg('category', () => String!) category: string,
    @Args(() => PaginationInput, { defaultValue: {} }) pagination: PaginationInput
  ): Promise<SkillsData> {
    return this.skills(
      { category },
      pagination
    );
  }

  /**
   * Get skills by risk level
   */
  @Query(() => SkillsData)
  async skillsByRiskLevel(
    @Arg('riskLevel', () => String!) riskLevel: string,
    @Args(() => PaginationInput, { defaultValue: {} }) pagination: PaginationInput
  ): Promise<SkillsData> {
    return this.skills(
      { riskLevel },
      pagination
    );
  }

  /**
   * Get skills by tags
   */
  @Query(() => SkillsData)
  async skillsByTags(
    @Arg('tags', () => [String]!) tags: string[],
    @Args(() => PaginationInput, { defaultValue: {} }) pagination: PaginationInput
  ): Promise<SkillsData> {
    return this.skills(
      { tags },
      pagination
    );
  }
}
