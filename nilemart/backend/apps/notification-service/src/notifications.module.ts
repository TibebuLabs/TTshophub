import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbModuleConfig, ENDPOINTS, SVC, tcpClient } from '@app/common';
import { Notification } from './notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    // Use the notify schema locally and shophub_notify on Supabase.
    TypeOrmModule.forRootAsync(dbModuleConfig('notify')),
    TypeOrmModule.forFeature([Notification]),

    // Push live events to the gateway so it can fan them out to browsers via SSE
    ClientsModule.register([
      tcpClient(SVC.GATEWAY, ENDPOINTS.GATEWAY),
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
