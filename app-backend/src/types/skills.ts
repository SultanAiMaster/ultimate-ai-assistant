/**
 * Skill-related type definitions
 */

export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
  riskLevel: RiskLevel;
  capabilities: string[];
  dependencies: string[];
  parameters: SkillParameter[];
  examples: string[];
  documentation: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SkillParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  description: string;
  default?: any;
  enum?: string[];
  validation?: ValidationRule[];
}

export type ParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'file'
  | 'url';

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message?: string;
}

export interface SkillExecution {
  id: string;
  skillId: string;
  userId: string;
  parameters: Record<string, any>;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  result?: any;
  logs: ExecutionLog[];
  error?: ErrorInfo;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export interface ErrorInfo {
  code: string;
  message: string;
  stack?: string;
  details?: any;
}

export interface SkillBundle {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  skills: string[]; // skill IDs
  estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'expert';
}
