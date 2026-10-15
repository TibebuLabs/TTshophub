import {
  Controller,
  Get,
  Inject,
  MessageEvent,
  Patch,
  Sse,
} from '@nestjs/common';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { filter, map, Observable } from 'rxjs';
import { call, CMD, EVT, JwtUser, SVC } from '@app/common';
import { Auth, CurrentUser } from '../core/auth.guard';
import { NotificationHub } from '../core/notification-hub';

// ─── Notifications controller (gateway) ──────────────────────────────────────
//
// Handles two concerns:
//   1. HTTP routes for the browser (list, mark-read, SSE stream).
//   2. TCP event from notification-service that feeds the SSE stream.
//

@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(SVC.NOTIFY) private readonly notify: ClientProxy,
    private readonly hub: NotificationHub,
  ) {}

  /** Build the audience scope object for the calling user. */
  private scope(user: JwtUser): { audience: 'admin' | 'user'; userId: string } {
    return {
      audience: user.role === 'admin' ? 'admin' : 'user',
      userId:   user.sub,
    };
  }

  /** Fetch the 30 most recent notifications for the signed-in user. */
  @Get()
  @Auth()
  list(@CurrentUser() user: JwtUser) {
    return call(this.notify, CMD.notify.list, this.scope(user));
  }

  /** Mark all notifications as read for the signed-in user. */
  @Patch('read')
  @Auth()
  read(@CurrentUser() user: JwtUser) {
    return call(this.notify, CMD.notify.read, this.scope(user));
  }

  /**
   * Server-Sent Events stream for real-time notifications.
   *
   * The JWT token is passed as a query parameter (`?token=…`) because the
   * browser's `EventSource` API does not support custom headers.
   *
   * Admins receive all admin-audience events; customers receive only events
   * targeted at their own user ID.
   */
  @Sse('stream')
  @Auth()
  stream(@CurrentUser() user: JwtUser): Observable<MessageEvent> {
    return this.hub.stream$.pipe(
      filter((notification) =>
        notification.audience === 'admin'
          ? user.role === 'admin'
          : notification.userId === user.sub,
      ),
      map((notification) => ({ data: notification })),
    );
  }

  /**
   * TCP event handler: receives `notification.created` from notification-service
   * and pushes it into the in-memory hub so connected SSE clients receive it.
   */
  @EventPattern(EVT.notificationCreated)
  onCreated(@Payload() notification: any): void {
    this.hub.stream$.next(notification);
  }
}
