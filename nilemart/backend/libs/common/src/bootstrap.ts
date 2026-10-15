import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from 'dotenv';
import { EnvValidatorService } from './config/env-validator.service';

// Load .env before anything else reads process.env
config();

// Fail fast if required environment variables are missing
const envValidator = new EnvValidatorService();
envValidator.validateEnvironment();

/**
 * Start a TCP microservice and log the address.
 *
 * @param module  The NestJS module class for this service.
 * @param name    Human-readable service name used in log output.
 * @param port    TCP port this service will listen on.
 */
export async function bootstrapService(
  module: any,
  name: string,
  port: number,
): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    module,
    {
      transport: Transport.TCP,
      options: { host: '0.0.0.0', port },
    },
  );

  await app.listen();
  new Logger(name).log(`${name} listening on tcp://0.0.0.0:${port}`);
}

/**
 * Build a `ClientsModule.register()` entry for a TCP microservice.
 *
 * @param name  Injection token (use a `SVC.*` constant).
 * @param ep    Host / port object (use an `ENDPOINTS.*` constant).
 */
export const tcpClient = (
  name: string,
  ep: { host: string; port: number },
) => ({
  name,
  transport: Transport.TCP as const,
  options: { host: ep.host, port: ep.port },
});
