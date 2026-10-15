import { bootstrapService, ENDPOINTS } from '@app/common';
import { AuthModule } from './auth.module';
bootstrapService(AuthModule, 'auth-service', ENDPOINTS.AUTH.port);
