import 'reflect-metadata';
import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class SkillFilterInput {
  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  riskLevel?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  search?: string;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 50 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}