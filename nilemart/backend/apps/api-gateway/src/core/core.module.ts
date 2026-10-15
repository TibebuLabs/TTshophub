import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { ENDPOINTS, SVC, tcpClient } from '@app/common';
import { NotificationHub } from './notification-hub';
import { SessionState } from './session-state';

// ─── CoreModule ───────────────────────────────────────────────────────────────
//
// Marked @Global so every feature module in the gateway can inject:
//   - JwtService  (token verification)
//   - ClientProxy instances for each microservice
//   - SessionState (suspended-user cache)
//   - NotificationHub (SSE bus)
//
// ClientsModule is registered here once so TCP connections are reused
// across all controllers.
//

@Global()
@Module({
  imports: [
    // JWT verification — the same secret used by auth-service to sign tokens
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
    }),

    // TCP clients for all four microservices
    ClientsModule.register([
      tcpClient(SVC.AUTH,    ENDPOINTS.AUTH),
      tcpClient(SVC.CATALOG, ENDPOINTS.CATALOG),
      tcpClient(SVC.ORDER,   ENDPOINTS.ORDER),
      tcpClient(SVC.NOTIFY,  ENDPOINTS.NOTIFY),
    ]),
  ],
  providers: [SessionState, NotificationHub],
  exports:   [JwtModule, ClientsModule, SessionState, NotificationHub],
})
export class CoreModule {}
