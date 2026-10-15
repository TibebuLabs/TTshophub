import { HttpException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

// ---------------------------------------------------------------------------
// RPC error helpers
// ---------------------------------------------------------------------------

/**
 * Create an RpcException that carries an HTTP status code.
 * Throw this inside a microservice handler so the status travels back to the
 * API gateway, where `call()` converts it into an HttpException.
 */
export const rpcError = (status: number, message: string): RpcException =>
  new RpcException({ status, message });

// ---------------------------------------------------------------------------
// Service → service call
// ---------------------------------------------------------------------------

/**
 * Send a TCP request from one microservice to another and await the reply.
 *
 * Errors are re-thrown as RpcException so they propagate cleanly through the
 * microservice mesh. The call times out after 8 seconds.
 *
 * @param client  The injected ClientProxy for the target service.
 * @param cmd     The MessagePattern string (from CMD constants).
 * @param data    Payload to send.
 * @returns       The typed response from the target service.
 */
export async function ask<T = unknown>(
  client: ClientProxy,
  cmd: string,
  data: unknown = {},
): Promise<T> {
  try {
    return await firstValueFrom(
      client.send<T>(cmd, data).pipe(timeout(8_000)),
    );
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 503;
    throw rpcError(status, e?.message || 'Service unavailable');
  }
}

// ---------------------------------------------------------------------------
// Gateway → service call
// ---------------------------------------------------------------------------

/**
 * Send a TCP request from the API gateway to a microservice and await the
 * reply. Errors from the service are converted into HttpExceptions so NestJS
 * can return the correct HTTP status code to the browser.
 *
 * @param client  The injected ClientProxy for the target service.
 * @param cmd     The MessagePattern string (from CMD constants).
 * @param data    Payload to send.
 * @returns       The typed response from the target service.
 */
export async function call<T = unknown>(
  client: ClientProxy,
  cmd: string,
  data: unknown = {},
): Promise<T> {
  try {
    return await firstValueFrom(
      client.send<T>(cmd, data).pipe(timeout(8_000)),
    );
  } catch (e: any) {
    const status = typeof e?.status === 'number' ? e.status : 503;
    throw new HttpException(e?.message || 'Service unavailable', status);
  }
}
