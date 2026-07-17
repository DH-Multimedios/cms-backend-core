export interface CoreModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<CoreModuleConfig> | CoreModuleConfig;
  inject?: any[];
}

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
  /**
   * Duración de la sesión en días. Default: 365.
   * Ejemplo: '365' → 1 año, '30' → 30 días.
   */
  sessionExpiration?: string;
  cookiePath?: string;
  cookieDomain?: string;
  cookieSecure?: boolean;
  cookieSameSite?: 'strict' | 'lax' | 'none';
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
  enabled?: boolean;
}
