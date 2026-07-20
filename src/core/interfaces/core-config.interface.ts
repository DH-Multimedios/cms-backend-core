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
   * Duración de fallback y de la cookie en días. Default: 365.
   * La setting `auth.sessionExpiration` en base de datos controla la expiración
   * efectiva de las sesiones una vez que los seeds la crearon.
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
