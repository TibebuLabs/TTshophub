# Implementation Plan: Code Cleanup and Database Fixes

## Overview

This implementation plan breaks down the comprehensive cleanup and fixes into discrete, incremental coding tasks. The plan follows a phased approach where foundational infrastructure is built first, followed by security and validation layers, then data layer improvements, observability features, and finally advanced features. Each task is designed to be independently executable while building on previous work, with checkpoints to validate progress.

The implementation focuses on production-readiness: database reliability, request validation, security hardening, error handling, monitoring, and code quality improvements.

## Tasks

### Phase 1: Foundation and Infrastructure

- [-] 1. Set up environment variable validation and constants
  - Create `libs/common/src/config/env-validator.service.ts`
  - Validate all required environment variables on startup (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, JWT_SECRET, etc.)
  - Implement `JwtValidator` to ensure JWT_SECRET is at least 32 characters and not default value
  - Update `libs/common/src/constants.ts` to extract all magic numbers (bcrypt rounds=12, timeouts, port numbers, rate limits)
  - Add validation that ADMIN_INVITE_CODE is changed from default in production (NODE_ENV=production)
  - Fail fast with clear error messages if validation fails
  - _Requirements: 1.7, 5.3, 5.6, 7.2, 7.6_

- [~] 2. Implement structured logging service
  - Create `libs/common/src/observability/logger.service.ts`
  - Implement LoggerService with methods: debug(), info(), warn(), error()
  - Include timestamp, service name, context, correlationId in all log entries
  - Output JSON format when NODE_ENV=production, human-readable format in development
  - Replace all console.log statements across services with LoggerService calls
  - Ensure database passwords are never logged
  - _Requirements: 7.4, 7.5, 1.5, 10.3_

- [~] 3. Create database configuration service with schema auto-creation
  - Create `libs/common/src/database/database-config.service.ts`
  - Implement `ensureSchema()` method that creates PostgreSQL schemas (auth, catalog, orders, notify) if they don't exist using raw SQL
  - Update `createTypeOrmOptions()` to return properly typed TypeOrmModuleOptions (fix TypeScript error in db.ts)
  - Configure connection pooling: min 5, max 20 connections
  - Implement retry logic: 5 attempts with exponential backoff starting at 1000ms
  - Set synchronize: false when NODE_ENV=production, true in development
  - Set logging to proper LogLevel[] type: ['error', 'warn', 'query'] for development, ['error'] for production
  - Update db.ts to use DatabaseConfigService
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [~] 4. Implement enhanced error handling filters
  - Update `apps/api-gateway/src/core/http-exception.filter.ts` to match design specification
  - Create `RpcExceptionMapper` utility class for RPC-to-HTTP status code mapping
  - Add correlationId to error responses
  - Implement proper error response format: { statusCode, message, error, timestamp, path, correlationId }
  - Map RPC timeouts to 504 Gateway Timeout
  - Map service unavailable to 503 with retry-after header
  - Log all 500-level errors with full stack traces
  - Create RpcExceptionFilter for microservices to standardize RPC error responses
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [~] 5. Checkpoint - Verify foundation
  - Ensure all services start successfully with new environment validation
  - Verify structured logging outputs properly in both dev and prod modes
  - Test database connection with schema auto-creation (check that schemas exist in database)
  - Test error responses have proper format with all required fields
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Security and Validation

- [~] 6. Create validation DTOs for authentication
  - Create `apps/api-gateway/src/dto/register.dto.ts` with full validation
  - Create `apps/api-gateway/src/dto/login.dto.ts`
  - Create `apps/api-gateway/src/dto/profile.dto.ts`
  - Create `apps/api-gateway/src/dto/password.dto.ts`
  - Implement RegisterDto with: name (max 100), email (valid format, lowercase transform), phone (Ethiopian format regex), password (min 8, complexity regex)
  - Implement custom Ethiopian phone validator: /^(\+251|0)[79]\d{8}$/
  - Add @Transform decorators for sanitization (trim whitespace, toLowerCase for email)
  - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7_

- [~] 7. Create validation DTOs for products and orders
  - Create `apps/api-gateway/src/dto/create-product.dto.ts`
  - Create `apps/api-gateway/src/dto/update-product.dto.ts`
  - Create `apps/api-gateway/src/dto/create-order.dto.ts`
  - Create `apps/api-gateway/src/dto/order-item.dto.ts`
  - Implement CreateProductDto with: name (max 200), price (positive), stock (non-negative), category (valid CATEGORIES)
  - Implement CreateOrderDto with: items (non-empty array, nested validation), city (valid CITIES key), payment (enum), customer fields (all non-empty)
  - Add ValidationPipe globally with whitelist: true and forbidNonWhitelisted: true
  - _Requirements: 2.4, 2.5, 2.6, 2.7_

- [~] 8. Configure global validation pipe in API Gateway
  - Update `apps/api-gateway/src/main.ts` to register global ValidationPipe
  - Configure whitelist: true to strip unknown properties
  - Configure forbidNonWhitelisted: true to reject requests with extra fields
  - Configure transform: true to enable @Transform decorators
  - Test validation errors return 400 with field-level error messages
  - _Requirements: 2.2, 2.7_

- [~] 9. Implement password policy service
  - Create `libs/common/src/security/password-policy.service.ts`
  - Implement validate() method with all complexity checks: min 8 chars, uppercase, lowercase, number, special character
  - Return ValidationResult with errors array for failed checks
  - Implement hash() method using bcrypt with cost factor 12 (not 10)
  - Implement compare() method for password verification
  - Update AuthService to use PasswordPolicyService for all password operations
  - _Requirements: 5.1, 5.2_

- [~] 10. Implement rate limiting guard
  - Create `libs/common/src/security/rate-limit.guard.ts`
  - Implement in-memory rate limit store with Map<string, RateLimitEntry>
  - Configure limits: 100 requests/minute for authenticated endpoints, 20 requests/minute for auth endpoints
  - Extract client IP from X-Forwarded-For header or request.ip
  - Return 429 Too Many Requests when limit exceeded
  - Apply rate limit decorator to auth routes (/auth/register, /auth/login) with 20/min limit
  - Apply global rate limit to all routes with 100/min limit
  - _Requirements: 5.5_

- [~] 11. Implement account lockout service
  - Create `libs/common/src/security/account-lockout.service.ts`
  - Track failed login attempts per email in-memory with timestamps
  - Implement lockout logic: 5 failed attempts within 15 minutes locks account for 15 minutes
  - Integrate with AuthService.login() to check lockout before authentication
  - Return 423 Locked response when account is locked
  - Reset attempts counter on successful login
  - _Requirements: 5.7_

- [~] 12. Implement SQL sanitization and parameterized queries
  - Create `libs/common/src/security/sql-sanitizer.ts` utility
  - Review all TypeORM queries to ensure parameterized queries (findOne({ where: { email } }) not raw strings)
  - Add sanitize() method to trim, remove special chars, limit length to 1000
  - Apply sanitization to all user inputs before database operations
  - Ensure no string interpolation in any SQL or WHERE clauses
  - _Requirements: 5.4, 2.6_

- [ ]* 13. Write unit tests for security components
  - Test PasswordPolicyService validates all complexity rules
  - Test PasswordPolicyService rejects weak passwords
  - Test RateLimitGuard blocks after limit exceeded
  - Test RateLimitGuard resets counter after window expires
  - Test AccountLockoutService locks after 5 failures
  - Test AccountLockoutService unlocks after 15 minutes
  - Test SqlSanitizer removes special characters
  - _Requirements: 14.2_

- [~] 14. Checkpoint - Verify security and validation
  - Test registration rejects weak passwords
  - Test registration rejects invalid email formats
  - Test rate limiting blocks excessive requests
  - Test account locks after failed login attempts
  - Test validation errors return proper 400 responses with field details
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Data Layer Improvements

- [~] 15. Update User entity with audit fields and soft delete
  - Add createdBy, updatedBy fields (nullable string) to User entity
  - Add @DeleteDateColumn() deletedAt field
  - Update UserService to populate createdBy/updatedBy from request context
  - Test soft delete excludes deleted users from queries automatically
  - Create admin endpoint to hard delete soft-deleted users
  - _Requirements: 3.6, 13.1, 13.2, 13.3, 13.7_

- [~] 16. Update Product entity with audit fields, soft delete, and relationships
  - Add createdBy, updatedBy fields to Product entity
  - Add @DeleteDateColumn() deletedAt field
  - Add @OneToMany relationship to Review entity
  - Add @ManyToMany relationship to Wishlist entity through join table
  - Update CatalogService to populate createdBy/updatedBy
  - Update list and search queries to exclude soft-deleted products
  - _Requirements: 3.3, 3.4, 3.6, 13.4, 13.5, 13.6_

- [~] 17. Update Order entity with audit fields and indexes
  - Add createdBy, updatedBy fields to Order entity
  - Add composite index on (userId, status)
  - Verify existing indexes on (userId, createdAt) and (status, createdAt) are present
  - Update OrderService to populate createdBy/updatedBy
  - _Requirements: 3.5, 3.6_

- [~] 18. Create stock reservation entity and table
  - Create `apps/catalog-service/src/stock-reservation.entity.ts`
  - Define fields: id (uuid), productId (indexed), quantity (int), orderId (nullable), status (enum: reserved/confirmed/released), expiresAt (timestamp), createdAt, updatedAt
  - Add composite index on (productId, status)
  - Add index on createdAt for cleanup queries
  - Create repository injection in CatalogModule
  - _Requirements: 3.7, 12.3_

- [~] 19. Implement stock reservation logic
  - Update CatalogService.reserve() to create StockReservation record
  - Set expiresAt to current time + 5 minutes
  - Deduct stock from Product immediately
  - Return reservation ID to caller
  - Update CatalogService.release() to release stock reservation by ID
  - Update OrderService to confirm reservations when order is successfully created
  - _Requirements: 12.1, 12.3_

- [~] 20. Implement stock compensation service
  - Create `apps/catalog-service/src/compensation.service.ts`
  - Implement @Cron job running every 5 minutes to find expired reservations
  - Query for StockReservation where status='reserved' AND createdAt < now() - 5 minutes
  - Release stock for each expired reservation (add quantity back to Product.stock)
  - Set reservation status to 'released'
  - Log compensation with productId, quantity, and reason='timeout'
  - Emit EVT.stockReleased event
  - _Requirements: 12.2, 12.4, 12.5, 12.6_

- [~] 21. Implement compensation on order failure
  - Update OrderService to track reservation IDs during order creation
  - Wrap order creation in try-catch block
  - On error, call CatalogService.compensateFailedOrder(reservationIds)
  - Update API Gateway order creation to handle timeout (catch RPC timeout exception)
  - Call compensation RPC when timeout occurs
  - _Requirements: 12.1, 12.2_

- [ ]* 22. Write integration tests for stock reservation and compensation
  - Test stock reservation creates record and deducts stock
  - Test successful order confirms reservation
  - Test failed order releases stock automatically
  - Test expired reservations (>5 min) are released by cron job
  - Test stock compensation logs properly
  - _Requirements: 14.3, 12.1, 12.2, 12.4_

- [~] 23. Checkpoint - Verify data layer improvements
  - Test soft delete for users and products works correctly
  - Test audit fields are populated on create/update
  - Test stock reservation and compensation flow end-to-end
  - Run database queries to verify indexes exist
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Migration System

- [~] 24. Create ormconfig.ts for TypeORM CLI
  - Create `ormconfig.ts` in project root
  - Configure DataSource with database connection settings from environment
  - Point entities to all *.entity.ts files across services
  - Point migrations to migrations/*.ts directory
  - Set migrationsTableName to 'migrations'
  - _Requirements: 9.1, 9.4_

- [~] 25. Create initial migration for schemas
  - Run `npm run migration:generate -- migrations/CreateSchemas`
  - Edit migration to create schemas: auth, catalog, orders, notify
  - Use CREATE SCHEMA IF NOT EXISTS for each schema
  - Test migration runs successfully
  - Test migration is recorded in migrations table
  - _Requirements: 9.2_

- [~] 26. Create migrations for all entities
  - Generate migration for User entity: `npm run migration:generate -- migrations/CreateUsers`
  - Generate migration for Product entity: `npm run migration:generate -- migrations/CreateProducts`
  - Generate migration for Order entity: `npm run migration:generate -- migrations/CreateOrders`
  - Generate migration for Notification entity: `npm run migration:generate -- migrations/CreateNotifications`
  - Generate migration for Review entity: `npm run migration:generate -- migrations/CreateReviews`
  - Generate migration for Wishlist entity: `npm run migration:generate -- migrations/CreateWishlists`
  - Generate migration for StockReservation entity: `npm run migration:generate -- migrations/CreateStockReservations`
  - Review all migrations to ensure indexes, foreign keys, and constraints are included
  - _Requirements: 9.1, 9.3_

- [~] 27. Implement migration guard for production
  - Create migration check utility that queries migrations table
  - Compare pending migrations against applied migrations
  - If NODE_ENV=production and pending migrations exist, throw error and exit
  - Run check in bootstrap() before app.listen()
  - _Requirements: 9.6_

- [~] 28. Update database configuration for production
  - Set synchronize: false when NODE_ENV=production in DatabaseConfigService
  - Set migrationsRun: false (migrations must be run manually)
  - Update .env.example to document migration workflow
  - Create README section documenting migration commands
  - _Requirements: 1.6, 1.7, 9.4_

- [ ]* 29. Write tests for migration system
  - Test migration:run applies all migrations successfully
  - Test migration:revert rolls back last migration
  - Test migration:show displays applied migrations
  - Test application fails to start with pending migrations in production
  - _Requirements: 14.4_

- [~] 30. Checkpoint - Verify migration system
  - Run all migrations on clean database
  - Verify all tables, indexes, and constraints are created
  - Test migration revert works in development
  - Test production guard prevents startup with pending migrations
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Service Communication and Observability

- [~] 31. Implement correlation ID interceptor
  - Create `libs/common/src/rpc/correlation-id.interceptor.ts`
  - Generate UUID v4 for each incoming HTTP request
  - Store correlation ID in request context
  - Inject correlation ID into all RPC call metadata
  - Pass correlation ID to LoggerService for all log entries
  - Return correlation ID in error responses
  - _Requirements: 6.4, 6.5, 6.7_

- [~] 32. Implement circuit breaker for RPC calls
  - Create `libs/common/src/rpc/circuit-breaker.ts`
  - Implement state machine: CLOSED → OPEN (after 5 failures) → HALF_OPEN (after 30s) → CLOSED (after 2 successes)
  - Track consecutive failures and successes
  - When circuit OPEN, return cached response or throw 503 Service Unavailable
  - Wrap all RPC calls in CircuitBreaker.execute()
  - _Requirements: 6.1, 6.2_

- [~] 33. Create enhanced RPC client with circuit breaker
  - Create `libs/common/src/rpc/enhanced-rpc-client.ts`
  - Wrap ClientProxy with CircuitBreaker
  - Reduce default RPC timeout from 8000ms to 5000ms
  - Add per-endpoint timeout override capability
  - Log all RPC calls with duration, status, correlation ID
  - _Requirements: 6.6, 6.7_

- [~] 34. Implement health check endpoints
  - Create `libs/common/src/health/health.controller.ts`
  - Implement GET /health endpoint returning: status, timestamp, uptime, database health
  - Check database connection by running simple query (SELECT 1)
  - Return 200 OK if healthy, 503 Service Unavailable if degraded
  - Add health controller to all microservices
  - _Requirements: 6.3_

- [~] 35. Implement Prometheus metrics service
  - Create `libs/common/src/observability/metrics.service.ts`
  - Initialize counters: http_requests_total, http_errors_total, rpc_calls_total, rpc_errors_total
  - Initialize histograms: http_request_duration_seconds, db_query_duration_seconds, rpc_call_duration_seconds
  - Initialize gauges: db_connections_active, orders_total, orders_revenue_total, users_active, products_low_stock
  - Implement getMetrics() method returning Prometheus format
  - _Requirements: 10.1, 10.2, 10.6_

- [~] 36. Create metrics controller and middleware
  - Create `libs/common/src/observability/metrics.controller.ts` with GET /metrics endpoint
  - Create metrics interceptor to track HTTP request duration and count
  - Create RPC metrics interceptor to track RPC call duration and count
  - Increment counters and record histograms for each request/call
  - Add metrics controller to API Gateway and all microservices
  - _Requirements: 10.1, 10.2_

- [~] 37. Implement request/response logging middleware
  - Create `libs/common/src/observability/logging.interceptor.ts`
  - Log all incoming requests: method, path, correlation ID, user ID (if authenticated)
  - Log all outgoing responses: status code, duration
  - Exclude health check and metrics endpoints from logging (configurable)
  - Include contextual information in error logs: user ID, correlation ID, service name, request path
  - _Requirements: 10.3, 10.5, 10.7_

- [~] 38. Configure database query logging
  - Update DatabaseConfigService to include query duration logging when LOG_LEVEL=debug
  - Log slow queries (>1000ms) at warn level
  - Include correlation ID in query logs when available
  - _Requirements: 10.4_

- [ ]* 39. Write unit tests for observability components
  - Test correlation ID is generated and passed through RPC calls
  - Test circuit breaker state transitions correctly
  - Test metrics counters increment properly
  - Test health check returns correct status
  - Test logging includes all required fields
  - _Requirements: 14.2_

- [~] 40. Checkpoint - Verify service communication and observability
  - Test correlation IDs appear in logs across service boundaries
  - Test circuit breaker opens after failures and closes after recoveries
  - Test /health endpoint returns proper status
  - Test /metrics endpoint returns Prometheus format
  - Test slow queries are logged
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: API Documentation and Configuration

- [~] 41. Configure Swagger/OpenAPI documentation
  - Install @nestjs/swagger package
  - Update `apps/api-gateway/src/main.ts` to configure Swagger
  - Set up DocumentBuilder with title, description, version
  - Add tags for each resource: Auth, Users, Products, Orders, Notifications
  - Configure Bearer auth scheme for JWT tokens
  - Mount Swagger UI at /api/docs
  - _Requirements: 8.1, 8.4, 8.5, 8.6_

- [~] 42. Add Swagger decorators to DTOs
  - Add @ApiProperty() decorators to all DTO fields with descriptions and examples
  - Include validation rules in descriptions (min length, max length, format)
  - Add example values for Ethiopian context (phone numbers, addresses, cities)
  - _Requirements: 8.2, 8.3_

- [~] 43. Add Swagger decorators to controllers
  - Add @ApiTags() decorator to all controllers
  - Add @ApiOperation() with summary to all endpoints
  - Add @ApiResponse() decorators for success and error responses (200, 201, 400, 401, 403, 404, 409, 500)
  - Add @ApiBearerAuth() to protected endpoints
  - Include example request and response payloads using @ApiBody() and @ApiOkResponse()
  - _Requirements: 8.2, 8.3, 8.5_

- [~] 44. Configure CORS and security headers
  - Update `apps/api-gateway/src/main.ts` to enable CORS
  - Set origin to WEB_ORIGIN environment variable
  - Set credentials: true to allow cookies and auth headers
  - Set allowed methods: GET, POST, PUT, DELETE, PATCH
  - Set allowed headers: Content-Type, Authorization
  - Add helmet middleware for security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Strict-Transport-Security
  - _Requirements: 11.1, 11.2, 11.3, 11.6_

- [~] 45. Implement request timeout and compression
  - Add request timeout middleware that returns 408 Request Timeout after 30 seconds
  - Enable compression middleware with gzip for responses >1KB
  - Test large response is compressed
  - Test long-running request times out properly
  - _Requirements: 11.4, 11.5_

- [~] 46. Update .env.example and documentation
  - Remove deprecated variables: AUTH_DB, CATALOG_DB, ORDER_DB, NOTIFY_DB
  - Add NODE_ENV with description
  - Update JWT_SECRET with strong example and length requirement
  - Add comments documenting schema approach (single database, multiple schemas)
  - Create README section for environment setup
  - Create README section for migration workflow
  - _Requirements: 1.1, 9.4, 9.5_

- [~] 47. Checkpoint - Verify API documentation and configuration
  - Visit /api/docs and verify all endpoints are documented
  - Test CORS works from WEB_ORIGIN
  - Test security headers are present in responses
  - Test request timeout works for slow endpoints
  - Test compression works for large responses
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: Code Quality Improvements

- [~] 48. Replace any types with proper TypeScript interfaces
  - Search for all occurrences of `: any` in codebase
  - Create proper interfaces or types for each usage
  - Update function signatures to use specific types
  - Enable strict TypeScript compiler options (strict: true, noImplicitAny: true)
  - Fix all TypeScript errors
  - _Requirements: 7.3_

- [~] 49. Extract magic numbers to constants
  - Move all hardcoded numbers to `libs/common/src/constants.ts`
  - Create BCRYPT_ROUNDS = 12
  - Create RPC_TIMEOUT_MS = 5000
  - Create RATE_LIMIT_WINDOW_MS = 60000
  - Create RATE_LIMIT_AUTH = 20
  - Create RATE_LIMIT_AUTHENTICATED = 100
  - Create STOCK_RESERVATION_TIMEOUT_MS = 5 * 60 * 1000
  - Create REQUEST_TIMEOUT_MS = 30000
  - Create COMPRESSION_THRESHOLD = 1024
  - Update all usages to reference constants
  - _Requirements: 7.2_

- [~] 50. Standardize file naming conventions
  - Rename order.service.ts to orders.service.ts for consistency
  - Verify all service files follow {entity-plural}.service.ts pattern
  - Verify all controller files follow {entity-plural}.controller.ts pattern
  - Verify all entity files follow {entity-singular}.entity.ts pattern
  - Update imports across codebase
  - _Requirements: 7.1_

- [~] 51. Add JSDoc comments to public methods
  - Add JSDoc comments to all public methods in services
  - Include @param tags with types and descriptions
  - Include @returns tag with type and description
  - Include @throws tag for exceptions that can be thrown
  - Document business logic and edge cases
  - _Requirements: 7.7_

- [~] 52. Replace console.log with LoggerService
  - Find all remaining console.log, console.error, console.warn statements
  - Replace with appropriate LoggerService methods
  - Ensure proper log levels are used (debug for detailed info, info for normal operations, warn for issues, error for exceptions)
  - Remove any debug console.logs that are no longer needed
  - _Requirements: 7.4_

- [ ]* 53. Write unit tests for utilities and services
  - Test environment validator fails with missing variables
  - Test environment validator fails with weak JWT_SECRET
  - Test constants are properly exported
  - Test LoggerService formats messages correctly
  - Test all service methods with valid and invalid inputs
  - _Requirements: 14.2_

- [~] 54. Checkpoint - Verify code quality improvements
  - Run TypeScript compiler in strict mode with no errors
  - Verify all magic numbers replaced with constants
  - Verify all public methods have JSDoc comments
  - Verify no console.log statements remain
  - Verify file naming is consistent
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8: Testing Infrastructure

- [~] 55. Configure Jest testing framework
  - Create `jest.config.js` with proper TypeScript support
  - Configure module name mapper for @app/common alias
  - Set test regex to *.spec.ts
  - Configure coverage directory and thresholds (80% minimum)
  - Set testEnvironment to 'node'
  - Configure coverage exclusions (node_modules, dist, *.spec.ts files)
  - _Requirements: 14.1_

- [~] 56. Create test database configuration
  - Create `test/test-db.config.ts`
  - Configure test database connection (nilemart_test)
  - Set synchronize: true for tests (OK to auto-sync in test environment)
  - Set dropSchema: true to clean state each test run
  - Set logging: false to reduce test output noise
  - _Requirements: 14.4_

- [~] 57. Create test fixtures for entities
  - Create `test/fixtures/user.fixture.ts` with createTestUser()
  - Create `test/fixtures/product.fixture.ts` with createTestProduct()
  - Create `test/fixtures/order.fixture.ts` with createTestOrder()
  - Create `test/fixtures/notification.fixture.ts` with createTestNotification()
  - Each fixture should accept overrides parameter for customization
  - _Requirements: 14.5_

- [~] 58. Write unit tests for auth service
  - Test register creates new user with hashed password
  - Test register rejects duplicate email
  - Test login validates credentials correctly
  - Test login rejects invalid password
  - Test login enforces role matching
  - Test password reset generates temporary password
  - Target 80% code coverage
  - _Requirements: 14.2, 5.1, 5.2_

- [~] 59. Write unit tests for catalog service
  - Test product creation with valid data
  - Test product update modifies fields correctly
  - Test stock reservation deducts stock and creates reservation
  - Test stock release adds stock back
  - Test soft delete excludes products from queries
  - Target 80% code coverage
  - _Requirements: 14.2, 13.4, 13.5, 13.6_

- [~] 60. Write unit tests for order service
  - Test order creation calculates total correctly
  - Test order creation validates city is in CITIES
  - Test order status advancement follows ORDER_FLOW
  - Test order cancellation sets cancelledAt timestamp
  - Target 80% code coverage
  - _Requirements: 14.2_

- [~] 61. Write integration test for user registration flow
  - Test complete flow: register → login → me
  - Verify JWT token is returned on registration
  - Verify token can be used to access /me endpoint
  - Verify user data is persisted in database
  - Use test database configuration
  - _Requirements: 14.3_

- [~] 62. Write integration test for order creation flow
  - Test complete flow: register user → create products → reserve stock → create order
  - Verify stock is deducted after order creation
  - Verify order is persisted with correct total
  - Verify notification is sent to user
  - Use test fixtures for data setup
  - _Requirements: 14.3_

- [~] 63. Write integration test for stock compensation
  - Test flow: reserve stock → simulate timeout → wait for cron → verify stock released
  - Mock cron to run immediately instead of waiting 5 minutes
  - Verify StockReservation status changed to 'released'
  - Verify Product.stock increased by reserved quantity
  - Verify compensation event was emitted
  - _Requirements: 14.3, 12.4_

- [~] 64. Configure test scripts in package.json
  - Ensure test script runs all tests
  - Ensure test:watch runs tests in watch mode
  - Ensure test:cov generates coverage report
  - Ensure test:e2e runs integration tests
  - Add test:debug script for debugging tests
  - _Requirements: 14.6_

- [~] 65. Set up CI/CD test execution
  - Create GitHub Actions workflow (or equivalent CI config)
  - Run tests on every push and pull request
  - Fail build if tests fail or coverage drops below 80%
  - Run migrations before tests in CI environment
  - _Requirements: 14.7_

- [~] 66. Final checkpoint - Verify complete implementation
  - Run all tests with coverage report (npm run test:cov)
  - Verify coverage meets 80% threshold
  - Run integration tests (npm run test:e2e)
  - Start all services and verify they connect to database
  - Visit /api/docs and test endpoints through Swagger UI
  - Test complete user flow: register → login → create order
  - Verify all security measures are active (rate limiting, password policy, account lockout)
  - Check database for proper schemas, tables, indexes, and constraints
  - Review logs for proper structure and correlation IDs
  - Check /metrics endpoint returns Prometheus data
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test-related sub-tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and catch issues early
- Phase 1-2 can be partially parallelized (foundation + security)
- Phase 3-4 should be sequential (data layer depends on foundation, migrations depend on final entity structure)
- Phase 5-7 can be partially parallelized (observability, docs, code quality are independent)
- Phase 8 testing can be done throughout but is consolidated for clarity
- Some tasks may reveal issues requiring iteration back to earlier tasks
- All database operations use TypeORM - no raw SQL except for schema creation
- All RPC communication uses existing TCP transport with NestJS microservices
- All validation uses class-validator decorators on DTOs
- All configuration comes from environment variables validated on startup
