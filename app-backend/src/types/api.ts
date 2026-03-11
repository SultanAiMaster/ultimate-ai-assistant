/**
 * API request and response types
 */

import { SkillMetadata, SkillExecution } from './skills';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Skill API
export interface ListSkillsQuery {
  category?: string;
  tags?: string[];
  riskLevel?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ExecuteSkillRequest {
  skillId: string;
  parameters: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface ExecuteSkillResponse {
  executionId: string;
  status: string;
  estimatedDuration?: number;
}

export interface GetExecutionResponse {
  execution: SkillExecution;
  isComplete: boolean;
  progress: number;
}

// Task API
export interface ScheduleTaskRequest {
  skillId: string;
  parameters: Record<string, any>;
  schedule: {
    type: 'cron' | 'once' | 'interval';
    expression: string; // CRON expression or ISO date or interval
    timezone?: string;
  };
  enabled?: boolean;
  name?: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  skillId: string;
  parameters: Record<string, any>;
  schedule: {
    type: 'cron' | 'once' | 'interval';
    expression: string;
    timezone?: string;
  };
  nextRunAt?: Date;
  lastRunAt?: Date;
  runs: number;
  enabled: boolean;
}

// API Token Management
export interface ConnectServiceRequest {
  service: string;
  oauthCode?: string;
  scopes?: string[];
  permissions?: string[];
}

export interface ServiceConnection {
  service: string;
  serviceName: string;
  status: 'connected' | 'pending' | 'disconnected' | 'error';
  permissions: string[];
  lastUsedAt?: Date;
}

// Health check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected';
    cache: 'connected' | 'disconnected';
    queue: 'connected' | 'disconnected';
  };
  metrics: {
    activeExecutions: number;
    queuedTasks: number;
    errorRate: number;
  };
}

// WebSocket events
export interface WebSocketEvent {
  type: 'execution_update' | 'log' | 'error' | 'progress';
  data: any;
  timestamp: Date;
}

export interface ExecutionUpdateEvent extends WebSocketEvent {
  type: 'execution_update';
  data: {
    executionId: string;
    status: string;
    progress: number;
    result?: any;
  };
}

export interface LogEvent extends WebSocketEvent {
  type: 'log';
  data: {
    executionId: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
  };
}
