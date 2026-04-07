import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CoreModule.register({
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'backend_core_dev',
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
        jwtExpiration: process.env.JWT_EXPIRATION || '1d',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
        jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
      },
      modules: {
        audit: true,
        health: true,
        taxonomies: true,
        settings: true,
        files: {
          storage: 'local',
          path: './uploads/files',
        },
        media: {
          storage: 'local',
          path: './uploads/media',
        },
        notifications: {
          email: {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
            from: process.env.SMTP_FROM || 'noreply@example.com',
            fromName: process.env.SMTP_FROM_NAME || 'Backend Core',
          },
        },
      },
    }),
  ],
})
export class AppModule {}
