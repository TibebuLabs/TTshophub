import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from 'dotenv';
import { ENDPOINTS, EnvValidatorService } from '@app/common';
import { GlobalExceptionFilter } from './core/http-exception.filter';
import { RateLimitGuard } from './core/rate-limit.guard';
import { AppModule } from './app.module';

// Load .env before anything reads process.env
config();

// Fail fast on missing or insecure environment variables
const envValidator = new EnvValidatorService();
envValidator.validateEnvironment();

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(new RateLimitGuard());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // All REST routes are prefixed with /api
  app.setGlobalPrefix('api');

  // Allow the configured frontend origin(s) to make cross-origin requests
  const configuredOrigins = process.env.WEB_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (!configuredOrigins?.length) {
    throw new Error('WEB_ORIGIN must include at least one valid origin');
  }
  app.enableCors({ origin: configuredOrigins, credentials: true });

  // Validate and transform request bodies automatically
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Also behave as a TCP microservice so notification-service can push events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: ENDPOINTS.GATEWAY.port },
  });

  await app.startAllMicroservices();

  const httpPort = +(process.env.PORT || 4000);
  
  // FIXED: Explicitly bind to '0.0.0.0' so Render can detect open port and health checks succeed
  await app.listen(httpPort, '0.0.0.0');

  new Logger('api-gateway').log(
    `REST API listening on 0.0.0.0:${httpPort}/api` +
      `  ·  events on tcp://0.0.0.0:${ENDPOINTS.GATEWAY.port}`,
  );
}

bootstrap();