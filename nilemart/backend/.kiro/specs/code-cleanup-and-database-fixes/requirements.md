# Requirements Document

## Introduction

NileMart is a microservices-based e-commerce platform built with NestJS, TypeORM, and PostgreSQL. The system currently has critical issues with database configuration, API validation, data integrity, security, and code quality that prevent it from being production-ready. This specification addresses comprehensive cleanup and fixes to ensure the application works correctly with proper validation, error handling, and data integrity.

## Glossary

- **System**: The NileMart backend microservices platform
- **Database_Manager**: The TypeORM database configuration and connection management module
- **API_Gateway**: The REST API entry point service (port 4000)
- **Auth_Service**: The user authentication and management microservice (port 4001)
- **Catalog_Service**: The product management microservice (port 4002)
- **Order_Service**: The order processing microservice (port 4003)
- **Notification_Service**: The event-driven notification microservice (port 4004)
- **DTO**: Data Transfer Object - validation classes for request bodies
- **Schema**: PostgreSQL schema namespace (auth, catalog, orders, notify)
- **Entity**: TypeORM entity representing a database table
- **RPC**: Remote Procedure Call - inter-service communication mechanism
- **Migration**: Database schema version control and evolution mechanism

## Requirements

### Requirement 1: Database Configuration and Schema Management

**User Story:** As a system administrator, I want the database configuration to be consistent and reliable, so that all services connect properly and schemas are created automatically.

#### Acceptance Criteria

1. THE Database_Manager SHALL use a single unified configuration approach that matches the environment variables defined in .env.example
2. WHEN the System starts, THE Database_Manager SHALL automatically create PostgreSQL schemas (auth, catalog, orders, notify) if they do not exist
3. THE Database_Manager SHALL implement connection pooling with configurable pool size (minimum 5, maximum 20 connections)
4. WHEN a database connection fails, THE Database_Manager SHALL retry up to 5 times with exponential backoff (starting at 1000ms)
5. THE Database_Manager SHALL NOT log database passwords in any log output
6. THE Database_Manager SHALL disable synchronize mode and use migrations for production environments
7. WHEN the NODE_ENV is "production", THE Database_Manager SHALL require migrations to be run explicitly

### Requirement 2: Request Validation and DTOs

**User Story:** As a developer, I want all API requests to be validated using DTOs, so that invalid data is rejected before processing.

#### Acceptance Criteria

1. THE API_Gateway SHALL define DTO classes for all request bodies using class-validator decorators
2. WHEN a request body fails validation, THE API_Gateway SHALL return a 400 Bad Request with detailed field-level error messages
3. THE System SHALL validate user registration requests for name (non-empty string, max 100 chars), email (valid email format), phone (valid format), and password (minimum 8 chars, at least one uppercase, one lowercase, one number)
4. THE System SHALL validate product creation requests for name (non-empty string, max 200 chars), price (positive number), stock (non-negative integer), category (valid CATEGORIES value)
5. THE System SHALL validate order creation requests for items (non-empty array), city (valid CITIES key), payment (valid payment method), customer details (name, phone, address all non-empty)
6. THE System SHALL sanitize all string inputs by trimming whitespace and escaping special characters before database queries
7. THE System SHALL reject requests with unknown or extra fields not defined in the DTO

### Requirement 3: Data Integrity and Relationships

**User Story:** As a data administrator, I want proper foreign key constraints and entity relationships defined, so that data integrity is maintained across the database.

#### Acceptance Criteria

1. THE Order_Service SHALL define a foreign key constraint from Order.userId to User.id in the Auth_Service schema
2. WHEN a User is deleted, THE System SHALL either prevent deletion if orders exist (restrict) or mark the user as deleted without removing the record (soft delete)
3. THE Catalog_Service SHALL define TypeORM relations between Product and Review entities (one-to-many)
4. THE Catalog_Service SHALL define TypeORM relations between Product and Wishlist entities (many-to-many through join table)
5. THE System SHALL create composite indexes on frequently queried columns: (Order.userId, Order.status), (Order.status, Order.createdAt), (Product.category, Product.price)
6. THE System SHALL add audit fields (createdBy, updatedBy, deletedAt) to User, Product, and Order entities
7. WHEN stock reservation fails due to timeout, THE Catalog_Service SHALL automatically release reserved stock through a compensation transaction

### Requirement 4: Error Handling and HTTP Exception Mapping

**User Story:** As a frontend developer, I want all RPC errors to be properly converted to HTTP exceptions, so that I can handle errors consistently in the UI.

#### Acceptance Criteria

1. WHEN an RPC call returns an error, THE API_Gateway SHALL convert it to the appropriate HTTP exception (400, 401, 403, 404, 409, 500)
2. THE API_Gateway SHALL implement a global exception filter that catches all unhandled errors and returns structured JSON responses
3. THE System SHALL return error responses in the format: { statusCode: number, message: string, error: string, timestamp: ISO8601, path: string }
4. WHEN an RPC call times out after 8000ms, THE API_Gateway SHALL return a 504 Gateway Timeout error
5. THE System SHALL log all 500-level errors with full stack traces to the console
6. WHEN a service is unavailable, THE API_Gateway SHALL return a 503 Service Unavailable error with retry-after header

### Requirement 5: Security Enhancements

**User Story:** As a security administrator, I want proper security measures implemented, so that the application is protected against common vulnerabilities.

#### Acceptance Criteria

1. THE Auth_Service SHALL enforce password complexity requirements: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character
2. THE Auth_Service SHALL hash passwords using bcrypt with a cost factor of 12 (not 10)
3. THE System SHALL validate that JWT_SECRET environment variable is set and at least 32 characters long on startup
4. THE Database_Manager SHALL use parameterized queries for all dynamic WHERE clauses (never string interpolation)
5. THE API_Gateway SHALL implement rate limiting: 100 requests per minute per IP address for authenticated endpoints, 20 requests per minute for authentication endpoints
6. THE System SHALL validate that ADMIN_INVITE_CODE is changed from default value in production environments
7. WHEN a user fails login 5 times within 15 minutes, THE Auth_Service SHALL temporarily lock the account for 15 minutes

### Requirement 6: Service Communication Reliability

**User Story:** As a system architect, I want reliable inter-service communication, so that temporary failures do not cascade across the system.

#### Acceptance Criteria

1. THE API_Gateway SHALL implement circuit breaker pattern for RPC calls with failure threshold of 5 consecutive failures
2. WHEN a circuit is open, THE API_Gateway SHALL return cached responses or degraded functionality for 30 seconds before retrying
3. THE System SHALL implement health check endpoints at /health for each microservice
4. THE System SHALL implement distributed request tracing with correlation IDs passed through all RPC calls
5. WHEN an RPC call is made, THE System SHALL include a correlation ID in the request metadata
6. THE System SHALL configure RPC timeout to 5000ms (reduced from 8000ms) with configurable override per endpoint
7. THE System SHALL log all RPC calls with duration, status, and correlation ID

### Requirement 7: Code Quality and Consistency

**User Story:** As a developer, I want consistent code quality and naming conventions, so that the codebase is maintainable.

#### Acceptance Criteria

1. THE System SHALL use consistent file naming: all service files named {entity}.service.ts (orders.service.ts, not order.service.ts)
2. THE System SHALL extract all magic numbers to named constants in constants.ts (bcrypt rounds, timeout values, port numbers)
3. THE System SHALL replace all "any" types with proper TypeScript interfaces or types
4. THE System SHALL use structured logging with log levels (debug, info, warn, error) instead of console.log
5. THE System SHALL implement a Logger service that includes timestamps, service names, and correlation IDs in all log entries
6. THE System SHALL use environment variable validation on startup: fail fast if required variables are missing
7. THE System SHALL document all public methods with JSDoc comments including parameters, return types, and throws clauses

### Requirement 8: API Documentation

**User Story:** As an API consumer, I want comprehensive API documentation, so that I can integrate with the system easily.

#### Acceptance Criteria

1. THE API_Gateway SHALL configure Swagger/OpenAPI documentation at /api/docs endpoint
2. THE System SHALL document all endpoints with descriptions, request schemas, response schemas, and error responses
3. THE System SHALL include example request and response payloads for all endpoints
4. THE System SHALL group endpoints by resource (Auth, Users, Products, Orders, Notifications) in Swagger UI
5. THE System SHALL document authentication requirements using Swagger security schemes
6. THE System SHALL include API versioning in the documentation (v1)

### Requirement 9: Migration System Implementation

**User Story:** As a DevOps engineer, I want database migrations instead of auto-sync, so that schema changes are tracked and versioned.

#### Acceptance Criteria

1. THE System SHALL create initial migrations for all existing entities (users, products, orders, notifications)
2. THE System SHALL include migrations for creating PostgreSQL schemas (auth, catalog, orders, notify)
3. THE System SHALL include migrations for all indexes, foreign keys, and constraints
4. THE System SHALL provide npm scripts for generating, running, reverting, and showing migrations
5. WHEN a migration is run, THE System SHALL record it in a migrations table with timestamp and name
6. THE System SHALL prevent running the application if pending migrations exist in production
7. THE System SHALL support rolling back migrations in development environments

### Requirement 10: Monitoring and Observability

**User Story:** As a system operator, I want monitoring and observability features, so that I can detect and diagnose issues quickly.

#### Acceptance Criteria

1. THE System SHALL expose Prometheus metrics at /metrics endpoint for each service
2. THE System SHALL track metrics: request count, request duration, error rate, active connections, and database query duration
3. THE System SHALL implement structured logging that outputs JSON in production and human-readable format in development
4. THE System SHALL log all database queries with execution time when log level is set to debug
5. THE System SHALL include request/response logging middleware in API_Gateway with configurable exclusions (health checks, metrics)
6. THE System SHALL track and expose business metrics: total orders, revenue, active users, low stock products
7. WHEN an error occurs, THE System SHALL include contextual information: user ID, correlation ID, service name, and request path

### Requirement 11: CORS and Request Handling

**User Story:** As a frontend developer, I want proper CORS configuration and request timeout handling, so that the web application works reliably.

#### Acceptance Criteria

1. THE API_Gateway SHALL configure CORS to allow origins specified in WEB_ORIGIN environment variable
2. THE API_Gateway SHALL allow credentials (cookies, authorization headers) in CORS requests
3. THE API_Gateway SHALL set CORS headers: Access-Control-Allow-Methods (GET, POST, PUT, DELETE, PATCH), Access-Control-Allow-Headers (Content-Type, Authorization)
4. THE API_Gateway SHALL implement request timeout middleware that returns 408 Request Timeout after 30 seconds
5. THE API_Gateway SHALL compress responses using gzip for responses larger than 1KB
6. THE API_Gateway SHALL set security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Strict-Transport-Security

### Requirement 12: Stock Reservation Compensation

**User Story:** As an order manager, I want automatic stock compensation when orders fail, so that inventory remains accurate.

#### Acceptance Criteria

1. WHEN order creation fails after stock reservation, THE System SHALL automatically release all reserved stock
2. WHEN the API_Gateway times out during order creation, THE Catalog_Service SHALL implement a background job to check for orphaned reservations
3. THE Catalog_Service SHALL track stock reservations with timestamps in a separate table
4. WHEN a reservation is older than 5 minutes without a corresponding order, THE Catalog_Service SHALL automatically release the stock
5. THE System SHALL emit a compensation event when stock is released due to timeout or failure
6. THE System SHALL log all compensation transactions with order details and reason

### Requirement 13: Soft Delete Implementation

**User Story:** As a data compliance officer, I want soft delete functionality for users and products, so that historical data is preserved while hiding deleted records.

#### Acceptance Criteria

1. THE Auth_Service SHALL add a deletedAt timestamp field to the User entity
2. WHEN a User is deleted, THE Auth_Service SHALL set deletedAt to current timestamp instead of removing the record
3. THE Auth_Service SHALL exclude soft-deleted users from all queries by default using TypeORM's @DeleteDateColumn
4. THE Catalog_Service SHALL add a deletedAt timestamp field to the Product entity
5. WHEN a Product is deleted, THE Catalog_Service SHALL set deletedAt to current timestamp instead of removing the record
6. THE Catalog_Service SHALL exclude soft-deleted products from list and search queries
7. THE System SHALL provide admin endpoints to permanently delete (hard delete) soft-deleted records

### Requirement 14: Testing Infrastructure

**User Story:** As a quality assurance engineer, I want comprehensive testing infrastructure, so that code quality is maintained and regressions are prevented.

#### Acceptance Criteria

1. THE System SHALL configure Jest testing framework with TypeScript support
2. THE System SHALL provide unit tests for all service methods with minimum 80% code coverage
3. THE System SHALL provide integration tests for critical flows: user registration, order creation, stock reservation
4. THE System SHALL use test database configuration separate from development database
5. THE System SHALL implement test fixtures for seeding test data
6. THE System SHALL provide npm scripts: test, test:watch, test:cov, test:e2e
7. THE System SHALL run tests automatically in CI/CD pipeline before deployment

