import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Sécurité HTTP headers (OWASP A05, A06) ──────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // autoriser les GIFs d'exercices
    }),
  );

  // ── CORS — origine depuis variable d'environnement ───────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // ── Validation globale des DTO (OWASP A03 — injection) ──────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // erreur si champ inconnu envoyé
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // ── Swagger / OpenAPI ────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Ybuddy API')
    .setDescription('Ybuddy fitness platform API documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Ybuddy API running on http://localhost:${port}/api`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}
bootstrap();
