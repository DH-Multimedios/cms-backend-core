import { resolve } from 'node:path';
import { jest as jestRuntime } from '@jest/globals';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core.module.js';
import { CoreModuleConfig } from './interfaces/core-config.interface.js';

const config: CoreModuleConfig = {
  database: { host: 'localhost', port: 5432, username: 'test', password: 'test', database: 'test' },
  auth: {},
};

const originalEnv = {
  legacy: process.env.UPLOADS_PATH,
  files: process.env.FILES_UPLOAD_PATH,
  media: process.env.MEDIA_UPLOAD_PATH,
};

const resetPaths = () => {
  for (const key of ['UPLOADS_PATH', 'FILES_UPLOAD_PATH', 'MEDIA_UPLOAD_PATH']) {
    delete process.env[key];
  }
};

afterEach(() => {
  resetPaths();
  if (originalEnv.legacy !== undefined) process.env.UPLOADS_PATH = originalEnv.legacy;
  if (originalEnv.files !== undefined) process.env.FILES_UPLOAD_PATH = originalEnv.files;
  if (originalEnv.media !== undefined) process.env.MEDIA_UPLOAD_PATH = originalEnv.media;
});

describe('CoreModule upload storage boundary', () => {
  it('rejects the legacy shared UPLOADS_PATH before exposing its contents as Media', () => {
    resetPaths();
    process.env.UPLOADS_PATH = 'uploads';
    expect(() => CoreModule.register(config)).toThrow(/UPLOADS_PATH/);
  });

  it('rejects a private Files root inside the public Media root', () => {
    resetPaths();
    process.env.MEDIA_UPLOAD_PATH = 'uploads';
    process.env.FILES_UPLOAD_PATH = 'uploads/files';
    expect(() => CoreModule.register(config)).toThrow(/FILES_UPLOAD_PATH/);
  });

  it('keeps the separate default paths usable', () => {
    resetPaths();
    expect(() => CoreModule.register(config)).not.toThrow();
  });

  it('validates and serves the path loaded by the synchronous config module', () => {
    resetPaths();
    const loader = jestRuntime.spyOn(ConfigModule, 'forRoot').mockImplementation(() => {
      process.env.FILES_UPLOAD_PATH = 'uploads/media/private';
      process.env.MEDIA_UPLOAD_PATH = 'custom-public';
      return {} as ReturnType<typeof ConfigModule.forRoot>;
    });
    try {
      const module = CoreModule.register(config);
      const staticModule = module.imports?.find(
        (entry: any) => entry.module?.name === 'ServeStaticModule',
      ) as any;
      expect(staticModule.providers[0].useValue[0].rootPath).toBe(resolve('custom-public'));
    } finally {
      loader.mockRestore();
    }
  });

  it('serves an absolute public path from the same location where Media writes', () => {
    resetPaths();
    process.env.MEDIA_UPLOAD_PATH = resolve('uploads/media');
    const module = CoreModule.register(config);
    const staticModule = module.imports?.find(
      (entry: any) => entry.module?.name === 'ServeStaticModule',
    ) as any;
    expect(staticModule.providers[0].useValue[0].rootPath).toBe(process.env.MEDIA_UPLOAD_PATH);
  });
});
