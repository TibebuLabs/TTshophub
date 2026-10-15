import { bootstrapService, ENDPOINTS } from '@app/common';
import { NotificationsModule } from './notifications.module';
bootstrapService(NotificationsModule, 'notification-service', ENDPOINTS.NOTIFY.port);
