/**
 * User and authentication types
 */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  devices: Device[];
  permissions: Permission[];
  apiTokens: APIToken[];
  installedSkills: InstalledSkill[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  id: string;
  deviceType: 'android' | 'web' | 'desktop';
  deviceId: string;
  deviceName: string;
  platform: string;
  osVersion: string;
  lastActiveAt: Date;
  isActive: boolean;
}

export interface Permission {
  resource: string;
  actions: string[];
  grantedAt: Date;
}

export interface APIToken {
  id: string;
  service: string;
  serviceName: string;
  encryptedToken: string;
  encryptedRefreshToken?: string;
  permissions: string[];
  scopes: string[];
  expiresAt: Date;
  autoRotate: boolean;
  lastRotatedAt?: Date;
  status: 'active' | 'expired' | 'revoked';
}

export interface InstalledSkill {
  skillId: string;
  installedAt: Date;
  version: string;
  config?: Record<string, any>;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  automation: AutomationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  executionComplete: boolean;
  errors: boolean;
}

export interface SecurityPreferences {
  requireAuth: boolean;
  autoLockTimeout: number; // minutes
  biometricAuth: boolean;
  twoFactorEnabled: boolean;
  sandboxMode: boolean;
}

export interface AutomationPreferences {
  maxConcurrentTasks: number;
  taskTimeout: number; // seconds
  autoRetry: boolean;
  maxRetries: number;
  resourceLimits: ResourceLimits;
}

export interface ResourceLimits {
  maxCpuPercent: number;
  maxMemoryMB: number;
  maxNetworkRequests: number;
  maxFileOperations: number;
}

// API Request/Response types
export interface AuthRequest {
  email: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: Omit<User, 'passwordHash'>;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
