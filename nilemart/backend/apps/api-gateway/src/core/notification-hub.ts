import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

// ─── NotificationHub ─────────────────────────────────────────────────────────
//
// In-process event bus that bridges the notification microservice and the SSE
// endpoint exposed to browsers.
//
// Flow:
//   notification-service  →(TCP emit)→  NotificationsController.onCreated
//   NotificationsController  →  hub.stream$.next(notification)
//   NotificationsController.stream()  →  hub.stream$.pipe(filter, map)  →  SSE
//

@Injectable()
export class NotificationHub {
  /**
   * All new notifications flow through this Subject.
   * The SSE handler filters by audience before forwarding to the browser.
   */
  readonly stream$ = new Subject<any>();
}
