import 'reflect-metadata';
import { Field, ObjectType, Int, registerEnumType } from 'type-graphql';

// Register enums
registerEnumType('RiskLevel', { name: 'RiskLevel' });

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@ObjectType()
export class Skill {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  category!: string;

  @Field(() => [String])
  tags!: string[];

  @Field()
  version!: string;

  @Field()
  author!: string;

  @Field(() => RiskLevel)
  riskLevel!: RiskLevel;

  @Field(() => [String])
  capabilities!: string[];

  @Field(() => [String])
  dependencies!: string[];

  @Field(() => [SkillParameter])
  parameters!: SkillParameter[];

  @Field(() => [String])
  examples!: string[];

  @Field()
  documentation!: string;

  @Field({ nullable: true })
  paths?: {
    skillFile?: string;
    directory?: string;
  };
}

@ObjectType()
export class SkillParameter {
  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  required!: boolean;

  @Field()
  description!: string;

  @Field({ nullable: true })
  default?: any;

  @Field(() => [String], { nullable: true })
  enum?: string[];
}

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  offset!: number;

  @Field()
  hasMore!: boolean;
}

@ObjectType()
export class SkillsData {
  @Field(() => [Skill])
  skills!: Skill[];

  @Field(() => PaginationMeta)
  pagination!: PaginationMeta;
}

@ObjectType()
export class CategoryCount {
  @Field()
  _id!: string;

  @Field(() => Int)
  count!: number;
}

@ObjectType()
export class MetadataStats {
  @Field(() => Int)
  totalSkills!: number;

  @Field(() => Int)
  totalCategories!: number;

  @Field(() => Int)
  totalRiskLevels!: number;

  @Field(() => Int)
  totalTags!: number;

  @Field(() => [String])
  categories!: string[];

  @Field(() => [String])
  riskLevels!: string[];
}