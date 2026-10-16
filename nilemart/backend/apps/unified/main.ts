import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from 'dotenv';

// Load .env before anything reads process.env
config();

// ── Force all service hosts to loopback (single-container deploy) ────────────
// When all microservices run inside one container (e.g. on Render), they must
// communicate over the loopback interface. Override the HOST env vars so that
// the ENDPOINTS constants (read at import-time) resolve to 127.0.0.1.
process.env.AUTH_HOST    = '127.0.0.1';
process.env.CATALOG_HOST = '127.0.0.1';
process.env.ORDER_HOST   = '127.0.0.1';
process.env.NOTIFY_HOST  = '127.0.0.1';
process.env.GATEWAY_HOST = '127.0.0.1';

import { ENDPOINTS, EnvValidatorService } from '@app/common';
import { GlobalExceptionFilter } from '../api-gateway/src/core/http-exception.filter';
import { RateLimitGuard } from '../api-gateway/src/core/rate-limit.guard';
import { AppModule } from '../api-gateway/src/app.module';
import { AuthModule } from '../auth-service/src/auth.module';
import { CatalogModule } from '../catalog-service/src/catalog.module';
import { OrdersModule } from '../order-service/src/orders.module';
import { NotificationsModule } from '../notification-service/src/notifications.module';

// Fail fast on missing or insecure environment variables
const envValidator = new EnvValidatorService();
envValidator.validateEnvironment();

// ─── Bootstrap all services in a single process ──────────────────────────────

async function bootstrap(): Promise<void> {
  const logger = new Logger('UnifiedBootstrap');

  // ── 1. Start microservices (TCP, in-process) ──────────────────────────────

  const services: Array<{ name: string; module: any; port: number }> = [
    { name: 'auth-service',         module: AuthModule,          port: ENDPOINTS.AUTH.port },
    { name: 'catalog-service',      module: CatalogModule,       port: ENDPOINTS.CATALOG.port },
    { name: 'order-service',        module: OrdersModule,        port: ENDPOINTS.ORDER.port },
    { name: 'notification-service', module: NotificationsModule,  port: ENDPOINTS.NOTIFY.port },
  ];

  for (const svc of services) {
    const ms = await NestFactory.createMicroservice<MicroserviceOptions>(
      svc.module,
      {
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: svc.port },
      },
    );
    await ms.listen();
    logger.log(`${svc.name} listening on tcp://127.0.0.1:${svc.port}`);
  }

  // ── 2. Start the API gateway (HTTP + TCP event listener) ──────────────────

  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(new RateLimitGuard());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api');

  // Parse WEB_ORIGIN and provide sensible fallbacks for Render frontend and local development
  const defaultOrigins = [
    'https://ttshophub-frontend.onrender.com',
    'https://ttshophub.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const envOrigins = process.env.WEB_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim().replace(/\/$/, '')) // strip trailing slash if present
    .filter(Boolean) || [];

  const configuredOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

  app.enableCors({
    origin: configuredOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Also behave as a TCP microservice so notification-service can push events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: ENDPOINTS.GATEWAY.port },
  });

  await app.startAllMicroservices();

  const httpPort = +(process.env.PORT || 4000);
  await app.listen(httpPort, '0.0.0.0');

  logger.log(
    `API gateway listening on http://0.0.0.0:${httpPort}/api` +
      `  ·  events on tcp://127.0.0.1:${ENDPOINTS.GATEWAY.port}`,
  );
  logger.log('All services started successfully in unified mode');
}

bootstrap();
