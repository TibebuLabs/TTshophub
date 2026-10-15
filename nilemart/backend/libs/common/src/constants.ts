// ---------------------------------------------------------------------------
// Helper utilities (module-private)
// ---------------------------------------------------------------------------

/** Read an env var, falling back to a default string. */
const env = (key: string, defaultValue: string): string =>
  process.env[key] ?? defaultValue;

/** Build a TCP endpoint descriptor from env vars. */
const ep = (
  hostKey: string,
  portKey: string,
  defaultHost: string,
  defaultPort: string,
): { host: string; port: number } => ({
  host: env(hostKey, defaultHost),
  port: +env(portKey, defaultPort),
});

// ---------------------------------------------------------------------------
// Service injection tokens
// ---------------------------------------------------------------------------

/** Injection tokens for the TCP ClientProxy instances. */
export const SVC = {
  AUTH: 'AUTH_SERVICE',
  CATALOG: 'CATALOG_SERVICE',
  ORDER: 'ORDER_SERVICE',
  NOTIFY: 'NOTIFY_SERVICE',
  GATEWAY: 'GATEWAY_EVENTS',
} as const;

// ---------------------------------------------------------------------------
// Service TCP endpoints
// ---------------------------------------------------------------------------

/** Where each microservice listens for TCP connections. */
export const ENDPOINTS = {
  AUTH: ep('AUTH_HOST', 'AUTH_PORT', 'localhost', '4001'),
  CATALOG: ep('CATALOG_HOST', 'CATALOG_PORT', 'localhost', '4002'),
  ORDER: ep('ORDER_HOST', 'ORDER_PORT', 'localhost', '4003'),
  NOTIFY: ep('NOTIFY_HOST', 'NOTIFY_PORT', 'localhost', '4004'),
  GATEWAY: ep('GATEWAY_HOST', 'GATEWAY_TCP_PORT', 'localhost', '4010'),
};

// ---------------------------------------------------------------------------
// MessagePattern commands (request / response)
// ---------------------------------------------------------------------------

/** Strongly-typed command strings for every MessagePattern in the system. */
export const CMD = {
  auth: {
    register: 'auth.register',
    login: 'auth.login',
    me: 'auth.me',
    list: 'auth.list',
    create: 'auth.create',
    update: 'auth.update',
    suspend: 'auth.suspend',
    resetPassword: 'auth.resetPassword',
    remove: 'auth.remove',
    profile: 'auth.profile',
    password: 'auth.password',
  },
  catalog: {
    list: 'catalog.list',
    get: 'catalog.get',
    create: 'catalog.create',
    update: 'catalog.update',
    remove: 'catalog.remove',
    reserve: 'catalog.reserve',
    release: 'catalog.release',
  },
  order: {
    create: 'order.create',
    mine: 'order.mine',
    all: 'order.all',
    advance: 'order.advance',
    cancel: 'order.cancel',
    stats: 'order.stats',
    userStats: 'order.userStats',
  },
  notify: {
    list: 'notify.list',
    read: 'notify.read',
  },
} as const;

// ---------------------------------------------------------------------------
// EventPattern fire-and-forget events
// ---------------------------------------------------------------------------

/** Domain events emitted with `ClientProxy.emit()` (fire-and-forget). */
export const EVT = {
  orderCreated: 'order.created',
  orderCancelled: 'order.cancelled',
  orderStatus: 'order.status',
  stockLow: 'stock.low',
  userRegistered: 'user.registered',
  notificationCreated: 'notification.created',
} as const;

// ---------------------------------------------------------------------------
// Business domain constants
// ---------------------------------------------------------------------------

/** Product categories shown in the storefront. */
export const CATEGORIES = [
  'Coffee & Food',
  'Fashion',
  'Electronics',
  'Home',
  'Beauty',
  'Sports',
  'Gift Finds',
] as const;

/** Cart subtotal threshold (ETB) above which delivery is free. */
export const FREE_SHIPPING_OVER = 5000;

/** Ordered lifecycle stages for a non-cancelled order. */
export const ORDER_FLOW = [
  'placed',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
] as const;

/** Delivery cities with fee (ETB) and estimated arrival window. */
export const CITIES: Record<string, { fee: number; eta: string }> = {
  'Addis Ababa': { fee: 120, eta: 'Same day' },
  Adama: { fee: 220, eta: '1–2 days' },
  Hawassa: { fee: 260, eta: '2–3 days' },
  'Bahir Dar': { fee: 300, eta: '2–4 days' },
  'Dire Dawa': { fee: 320, eta: '2–4 days' },
  Mekelle: { fee: 350, eta: '3–5 days' },
  Gondar: { fee: 330, eta: '3–5 days' },
};

// ---------------------------------------------------------------------------
// Security constants
// ---------------------------------------------------------------------------

/** Bcrypt salt rounds for password hashing. */
export const BCRYPT_ROUNDS = 12;

/** JWT access token lifetime. */
export const JWT_EXPIRATION = '7d';

// ---------------------------------------------------------------------------
// Timeout and rate-limit constants
// ---------------------------------------------------------------------------

/** RPC call timeout (ms). */
export const RPC_TIMEOUT_MS = 5000;

/** HTTP request timeout (ms). */
export const REQUEST_TIMEOUT_MS = 30_000;

/** Rate-limit sliding window (ms = 1 minute). */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** Max requests per window for auth endpoints. */
export const RATE_LIMIT_AUTH = 20;

/** Max requests per window for authenticated endpoints. */
export const RATE_LIMIT_AUTHENTICATED = 100;

/** Failed-login lockout window (ms = 15 minutes). */
export const ACCOUNT_LOCKOUT_WINDOW_MS = 15 * 60 * 1_000;

/** Max consecutive login failures before lockout. */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Duration the account stays locked (ms = 15 minutes). */
export const ACCOUNT_LOCKOUT_DURATION_MS = 15 * 60 * 1_000;

// ---------------------------------------------------------------------------
// Database constants
// ---------------------------------------------------------------------------

/** Minimum DB connection pool size. */
export const DB_POOL_MIN = 5;

/** Maximum DB connection pool size. */
export const DB_POOL_MAX = 20;

/** Slow-query threshold for logging (ms). */
export const DB_MAX_QUERY_TIME_MS = 1_000;

/** DB connection retry attempts. */
export const DB_RETRY_ATTEMPTS = 5;

/** Initial delay between DB connection retries (ms). */
export const DB_RETRY_DELAY_MS = 1_000;

// ---------------------------------------------------------------------------
// Stock reservation constants
// ---------------------------------------------------------------------------

/** How long a stock reservation is held before compensation (ms = 5 min). */
export const STOCK_RESERVATION_TIMEOUT_MS = 5 * 60 * 1_000;

/** Cron expression for the stock-compensation job. */
export const STOCK_COMPENSATION_CRON = '*/5 * * * *';

// ---------------------------------------------------------------------------
// Circuit-breaker constants
// ---------------------------------------------------------------------------

/** Consecutive failures before the circuit opens. */
export const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;

/** Consecutive successes needed to close the circuit again. */
export const CIRCUIT_BREAKER_SUCCESS_THRESHOLD = 2;

/** Time the circuit stays open before attempting a probe (ms). */
export const CIRCUIT_BREAKER_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// Default port assignments
// ---------------------------------------------------------------------------

/** HTTP port for the API Gateway. */
export const DEFAULT_GATEWAY_PORT = 4000;

/** TCP port for the Auth Service. */
export const DEFAULT_AUTH_PORT = 4001;

/** TCP port for the Catalog Service. */
export const DEFAULT_CATALOG_PORT = 4002;

/** TCP port for the Order Service. */
export const DEFAULT_ORDER_PORT = 4003;

/** TCP port for the Notification Service. */
export const DEFAULT_NOTIFY_PORT = 4004;

/** TCP port for the Gateway's inbound event listener. */
export const DEFAULT_GATEWAY_TCP_PORT = 4010;
