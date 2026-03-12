import {
  Field,
  ObjectType,
  Arg,
  Int,
  ID,
  String,
  List,
  Float,
  InputType,
  registerEnumType
} from 'type-graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';

// Enums
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  FILE = 'file',
  URL = 'url'
}

// Input Types
@InputType()
export class SkillFilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => RiskLevel, { nullable: true })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 50 })
  @IsOptional()
  limit?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  offset?: number;
}

@InputType()
export class SkillParameterInput {
  @Field(() => String)
  name!: string;

  @Field(() => ParameterType)
  type!: ParameterType;

  @Field(() => Boolean)
  required!: boolean;

  @Field(() => String)
  description!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  default?: string;
}

// Types
@ObjectType()
export class SkillParameter {
  @Field(() => String)
  name!: string;

  @Field(() => ParameterType)
  type!: ParameterType;

  @Field(() => Boolean)
  required!: boolean;

  @Field(() => String)
  description!: string;

  @Field(() => String, { nullable: true })
  default?: string;

  @Field(() => [String], { nullable: true })
  enum?: string[];
}

@ObjectType()
export class Skill {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  description!: string;

  @Field(() => String)
  category!: string;

  @Field(() => [String])
  tags!: string[];

  @Field(() => String)
  version!: string;

  @Field(() => String)
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

  @Field(() => String)
  documentation!: string;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  updatedAt!: string;
}

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  offset!: number;

  @Field(() => Boolean)
  hasMore!: boolean;
}

@ObjectType()
export class SkillsData {
  @Field(() => [Skill])
  skills!: Skill[];

  @Field(() => PaginationInfo)
  pagination!: PaginationInfo;
}

@ObjectType()
export class CategoryCount {
  @Field(() => String)
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
