import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbModuleConfig, ENDPOINTS, SVC, tcpClient } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './user.entity';

@Module({
  imports: [
    // Keep application users separate from Supabase's reserved `auth` schema.
    TypeOrmModule.forRootAsync(dbModuleConfig('auth')),
    TypeOrmModule.forFeature([User]),

    // JWT for signing access tokens
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),

    // TCP client to emit domain events to the notification service
    ClientsModule.register([tcpClient(SVC.NOTIFY, ENDPOINTS.NOTIFY)]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
