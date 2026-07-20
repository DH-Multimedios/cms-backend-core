import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from '../../src'; // Dev: importa source directamente

function parseDatabasePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535');
  }
  return port;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        database: {
          host: config.get('DB_HOST', 'localhost'),
          port: parseDatabasePort(config.get('DB_PORT', '5432')),
          username: config.get('DB_USERNAME', 'postgres'),
          password: config.get('DB_PASSWORD', 'postgres'),
          database: config.get('DB_NAME', 'backend_core_dev'),
          synchronize: false,
          logging: config.get('DB_LOGGING') === 'true',
        },
        auth: {
          sessionExpiration: config.get('SESSION_EXPIRATION', '365'),
        },
      }),
    }),
  ],
})
export class AppModule {}
