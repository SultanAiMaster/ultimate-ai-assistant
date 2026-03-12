import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

// Zod schema for validation
export const SkillSchemaZod = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  version: z.string(),
  author: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  capabilities: z.array(z.string()),
  dependencies: z.array(z.string()),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'file', 'url']),
    required: z.boolean(),
    description: z.string(),
    default: z.any().optional(),
    enum: z.array(z.string()).optional(),
    validation: z.array(z.object({
      type: z.string(),
      value: z.any(),
      message: z.string().optional()
    })).optional()
  })),
  examples: z.array(z.string()),
  documentation: z.string(),
  paths: z.object({
    skillFile: z.string(),
    directory: z.string()
  }).optional()
});

export type SkillSchemaType = z.infer<typeof SkillSchemaZod>;

// Mongoose document interface
export interface ISkill extends SkillSchemaType, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Individual parameter schema
const ParameterSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object', 'file', 'url'],
    required: true
  },
  required: { type: Boolean, default: false },
  description: { type: String, required: true },
  default: { type: Schema.Types.Mixed },
  enum: [{ type: [String] }],
  validation: [{
    type: { type: String },
    value: { type: Schema.Types.Mixed },
    message: { type: String }
  }]
}, { _id: false });

// Skill schema
const SkillSchema = new Schema<ISkill>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  tags: [{ type: String, index: true }],
  version: { type: String, default: '1.0.0' },
  author: { type: String, default: 'unknown' },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  capabilities: [{ type: String, index: true }],
  dependencies: [{ type: String }],
  parameters: [ParameterSchema],
  examples: [{ type: String }],
  documentation: { type: String, required: true },
  paths: {
    skillFile: String,
    directory: String
  }
}, {
  timestamps: true,
  collection: 'skills'
});

// Text indexes for search
SkillSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
  capabilities: 'text'
}, {
  name: 'skill_text_search'
});

// Compound indexes
SkillSchema.index({ category: 1, riskLevel: 1 });
SkillSchema.index({ tags: 1, riskLevel: 1 });

// Model - Prevent model recompilation in development
let SkillModel: Model<ISkill>;

if (mongoose.models.Skill) {
  SkillModel = mongoose.models.Skill as Model<ISkill>;
} else {
  SkillModel = mongoose.model<ISkill>('Skill', SkillSchema);
}

export { SkillModel as Skill };
