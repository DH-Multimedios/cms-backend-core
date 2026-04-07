export interface CoreModuleConfig {
  database: DatabaseConfig;
  auth: AuthConfig;
  modules?: ModulesConfig;
}

export interface DatabaseConfig {
  type?: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
  ssl?: boolean | any;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiration?: string;
  jwtRefreshSecret?: string;
  jwtRefreshExpiration?: string;
}

export interface ModulesConfig {
  audit?: boolean;
  health?: boolean;
  files?: FilesModuleConfig | boolean;
  media?: MediaModuleConfig | boolean;
  taxonomies?: boolean;
  settings?: boolean;
  notifications?: NotificationsModuleConfig | boolean;
}

export interface FilesModuleConfig {
  storage: 'local' | 's3';
  path?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface MediaModuleConfig {
  storage: 'local' | 's3';
  path?: string;
  maxSize?: number;
  allowedTypes?: string[];
  imageProcessing?: {
    enabled?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

export interface NotificationsModuleConfig {
  email?: EmailProviderConfig;
}

export interface EmailProviderConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName?: string;
  secure?: boolean;
}
