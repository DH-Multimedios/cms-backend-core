import 'dotenv/config'; // Cargar .env ANTES de todo
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir uploads/media como carpeta estática (imágenes públicas)
  const uploadsPath = process.env.UPLOADS_PATH || 'uploads/media';
  app.useStaticAssets(join(process.cwd(), uploadsPath), {
    prefix: '/uploads/media/',
  });

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Backend Core API')
    .setDescription('Core reutilizable para APIs en NestJS')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs\n`);
}

bootstrap();
