# System Overview - Inventory & Order Management System

## Document Information

| Field        | Value              |
| ------------ | ------------------ |
| Version      | 1.0                |
| Status       | Draft              |
| Last Updated | January 2026       |
| Author       | System Design Team |

---

## 1. Executive Summary

This document outlines the system architecture for a production-grade **Inventory Management**, **Order Management**, **Fulfillment**, and **Package Tracking** system for Gauss Electromagnetics. The system enables:

- Real-time inventory tracking with audit trails
- Order lifecycle management from placement to delivery
- Shipment fulfillment with multi-warehouse support
- Public package tracking (Amazon/BlueDart style)

### Target Users

| User Type  | Access Level | Primary Functions                     |
| ---------- | ------------ | ------------------------------------- |
| Admin      | Full         | System configuration, user management |
| Operations | Warehouse    | Inventory management, fulfillment     |
| Sales      | Limited      | Order creation, customer management   |
| Customer   | Public       | Order tracking only                   |

---

## 2. Technology Stack

### Core Stack

| Layer    | Technology              | Rationale                        |
| -------- | ----------------------- | -------------------------------- |
| Frontend | Next.js 16 (App Router) | Existing codebase, RSC support   |
| API      | Next.js API Routes      | Colocation, type safety          |
| ORM      | Drizzle ORM             | Type-safe, performant, SQL-first |
| Database | PostgreSQL              | ACID compliance, JSON support    |
| Caching  | Redis (optional)        | Tracking page performance        |
| Auth     | NextAuth.js / Clerk     | Role-based access control        |

### Development Tools

| Tool            | Purpose                 |
| --------------- | ----------------------- |
| TypeScript      | Type safety             |
| Zod             | Runtime validation      |
| React Hook Form | Form management         |
| TanStack Query  | Server state management |

---

## 3. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Marketing Site  │  │  Admin Dashboard │  │  Public Tracking │  │
│  │  (existing)      │  │  /admin/*        │  │  /track/[id]     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼─────────────────────┼─────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Next.js)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ /api/catalog │ │/api/inventory│ │ /api/orders  │ │ /api/track │ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ │
└─────────┼────────────────┼────────────────┼───────────────┼─────────┘
          │                │                │               │
          ▼                ▼                ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │CatalogService│ │InventoryServ │ │ OrderService │ │TrackingSvc │ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ │
│         │                │                │               │         │
│         │         ┌──────┴───────┐        │               │         │
│         │         │FulfillmentSvc│◄───────┘               │         │
│         │         └──────┬───────┘                        │         │
└─────────┼────────────────┼────────────────────────────────┼─────────┘
          │                │                                │
          ▼                ▼                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │   Catalog    │ │  Inventory   │ │    Orders    │ │  Tracking  │ │
│  │  - products  │ │- transactions│ │  - orders    │ │- shipments │ │
│  │  - categories│ │- reservations│ │  - items     │ │- events    │ │
│  │  - warehouses│ │- snapshots   │ │              │ │            │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
Customer Request → API Route → Middleware (Auth) → Service Layer → Repository → Database
                                    ↓
                              Validation (Zod)
                                    ↓
                              Business Logic
                                    ↓
                              Transaction Boundary
```

---

## 4. Domain Model

### Bounded Contexts

The system is divided into six bounded contexts, each with clear responsibilities:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BOUNDED CONTEXTS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │   CATALOG   │     │ WAREHOUSING │     │  INVENTORY  │           │
│  │             │     │             │     │             │           │
│  │ - Products  │     │ - Warehouses│     │ - Ledger    │           │
│  │ - SKUs      │────▶│ - Locations │────▶│ - Reserve   │           │
│  │ - Categories│     │             │     │ - Snapshot  │           │
│  └─────────────┘     └─────────────┘     └──────┬──────┘           │
│                                                  │                  │
│                                                  ▼                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │  TRACKING   │◀────│ FULFILLMENT │◀────│   ORDERS    │           │
│  │             │     │             │     │             │           │
│  │ - Events    │     │ - Shipments │     │ - Orders    │           │
│  │ - Timeline  │     │ - Dispatch  │     │ - Items     │           │
│  │ - Public API│     │ - Delivery  │     │ - Lifecycle │           │
│  └─────────────┘     └─────────────┘     └─────────────┘           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Domain Definitions

#### 1. Catalog Domain

- **Purpose**: Define what exists in the system
- **Entities**: Product, Category
- **Key Concept**: SKU (Stock Keeping Unit) is the immutable product identifier

#### 2. Warehousing Domain

- **Purpose**: Define where inventory exists
- **Entities**: Warehouse
- **Key Concept**: Physical location management

#### 3. Inventory Domain

- **Purpose**: Track how much of each product exists
- **Entities**: InventoryTransaction, InventoryReservation, InventorySnapshot
- **Key Concept**: Ledger-based accounting (append-only)

#### 4. Orders Domain

- **Purpose**: Capture customer intent
- **Entities**: Order, OrderItem
- **Key Concept**: Order lifecycle state machine

#### 5. Fulfillment Domain

- **Purpose**: Execute order delivery
- **Entities**: Shipment, ShipmentItem
- **Key Concept**: Shipments consume inventory

#### 6. Tracking Domain

- **Purpose**: Provide delivery visibility
- **Entities**: ShipmentEvent
- **Key Concept**: Append-only event timeline

---

## 5. Key Design Principles

### 5.1 Inventory is Ledger-Based

**Principle**: Never store current stock as a mutable field. Always derive it from transaction history.

```
❌ WRONG: products.quantity = 120

✅ RIGHT: SUM(inventory_transactions.quantity_delta) WHERE product_id = X
```

**Benefits**:

- Complete audit trail
- Rollback capability
- Race condition immunity
- Accurate historical reporting

### 5.2 Two Core Operations

All inventory changes are expressed as one of two operations:

| Operation | Direction | Stock Effect                 |
| --------- | --------- | ---------------------------- |
| `TOP_UP`  | INCREASE  | Adds to available stock      |
| `DEBIT`   | DECREASE  | Removes from available stock |

### 5.3 Reason Codes

Each operation has a business reason:

| Reason         | Operation | Description                   |
| -------------- | --------- | ----------------------------- |
| `RECEIPT`      | TOP_UP    | Goods received into warehouse |
| `RETURN`       | TOP_UP    | Customer return               |
| `TRANSFER_IN`  | TOP_UP    | Inter-warehouse transfer in   |
| `SHIPMENT`     | DEBIT     | Goods shipped to customer     |
| `DAMAGE`       | DEBIT     | Damaged/lost stock            |
| `TRANSFER_OUT` | DEBIT     | Inter-warehouse transfer out  |
| `ADJUSTMENT`   | Either    | Audit correction              |

### 5.4 Reservations Prevent Overselling

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTORY STATES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ON_HAND = SUM(all transactions)                               │
│                                                                  │
│   RESERVED = SUM(active reservations)                           │
│                                                                  │
│   AVAILABLE = ON_HAND - RESERVED                                │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    ON_HAND: 100                          │   │
│   │  ┌───────────────────────┐  ┌───────────────────────┐   │   │
│   │  │    RESERVED: 30       │  │    AVAILABLE: 70      │   │   │
│   │  └───────────────────────┘  └───────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Stock Never Goes Negative

Enforced at multiple levels:

1. **Application**: Check available >= requested before DEBIT
2. **Database**: CHECK constraint on derived calculations
3. **Transaction**: SELECT FOR UPDATE on snapshot row

### 5.6 Tracking is Event-Sourced

Shipment status is derived from the latest event, never stored directly:

```
Events: CREATED → PICKED → SHIPPED → IN_TRANSIT → DELIVERED
                                          ↑
                              Status = Latest Event
```

---

## 6. Service Responsibilities

### 6.1 CatalogService

```typescript
interface CatalogService {
    // Products
    createProduct(data: CreateProductInput): Promise<Product>
    updateProduct(id: string, data: UpdateProductInput): Promise<Product>
    getProductBySku(sku: string): Promise<Product | null>
    listProducts(filters: ProductFilters): Promise<PaginatedResult<Product>>

    // Categories
    createCategory(data: CreateCategoryInput): Promise<Category>
    getCategoryTree(): Promise<CategoryTree>
    assignProductToCategories(
        productId: string,
        categoryIds: string[]
    ): Promise<void>
}
```

### 6.2 InventoryService

```typescript
interface InventoryService {
    // Core Operations
    topUp(params: TopUpParams): Promise<InventoryTransaction>
    debit(params: DebitParams): Promise<InventoryTransaction>

    // Reservations
    reserve(params: ReserveParams): Promise<InventoryReservation>
    releaseReservation(reservationId: string): Promise<void>
    consumeReservation(reservationId: string): Promise<void>

    // Queries
    getAvailableStock(productId: string, warehouseId: string): Promise<number>
    getStockLevels(productId: string): Promise<StockLevel[]>

    // Maintenance
    rebuildSnapshots(): Promise<void>
}
```

### 6.3 OrderService

```typescript
interface OrderService {
    // Lifecycle
    createOrder(data: CreateOrderInput): Promise<Order>
    confirmOrder(orderId: string): Promise<Order>
    cancelOrder(orderId: string, reason: string): Promise<Order>

    // Queries
    getOrder(orderId: string): Promise<Order | null>
    listOrders(filters: OrderFilters): Promise<PaginatedResult<Order>>
    getOrderHistory(orderId: string): Promise<OrderEvent[]>
}
```

### 6.4 FulfillmentService

```typescript
interface FulfillmentService {
    // Shipments
    createShipment(
        orderId: string,
        items: ShipmentItemInput[]
    ): Promise<Shipment>
    dispatchShipment(shipmentId: string): Promise<Shipment>
    markDelivered(shipmentId: string): Promise<Shipment>

    // Events
    addTrackingEvent(
        shipmentId: string,
        event: TrackingEventInput
    ): Promise<ShipmentEvent>

    // Queries
    getShipment(shipmentId: string): Promise<Shipment | null>
    getShipmentsByOrder(orderId: string): Promise<Shipment[]>
}
```

### 6.5 TrackingService

```typescript
interface TrackingService {
    // Public API (no auth required)
    getTrackingInfo(trackingNumber: string): Promise<PublicTrackingInfo | null>

    // Internal
    generateTrackingNumber(): string
    processCarrierWebhook(payload: CarrierWebhookPayload): Promise<void>
}
```

---

## 7. Authentication & Authorization

### Role-Based Access Control (RBAC)

| Role       | Catalog | Inventory | Orders | Fulfillment | Tracking   |
| ---------- | ------- | --------- | ------ | ----------- | ---------- |
| Admin      | Full    | Full      | Full   | Full        | Full       |
| Operations | Read    | Full      | Read   | Full        | Read       |
| Sales      | Read    | Read      | Full   | Read        | Read       |
| Viewer     | Read    | Read      | Read   | Read        | Read       |
| Public     | -       | -         | -      | -           | Track Only |

### API Protection

```typescript
// Protected routes require authentication
/api/inventory/*  → Auth + Role Check
/api/orders/*     → Auth + Role Check
/api/shipments/*  → Auth + Role Check
/api/admin/*      → Auth + Admin Role

// Public routes (no auth)
/api/track/[trackingNumber]  → No Auth, Rate Limited
```

---

## 8. Data Flow Examples

### 8.1 Order Placement Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│ Customer │────▶│ OrderService │────▶│InventoryService │────▶│ Database │
└──────────┘     └──────────────┘     └─────────────────┘     └──────────┘
     │                  │                      │                    │
     │  1. Place Order  │                      │                    │
     │─────────────────▶│                      │                    │
     │                  │  2. Reserve Stock    │                    │
     │                  │─────────────────────▶│                    │
     │                  │                      │ 3. Check Available │
     │                  │                      │───────────────────▶│
     │                  │                      │◀───────────────────│
     │                  │                      │ 4. Create Reserve  │
     │                  │                      │───────────────────▶│
     │                  │◀─────────────────────│                    │
     │                  │ 5. Create Order      │                    │
     │                  │─────────────────────────────────────────▶│
     │◀─────────────────│                      │                    │
     │  6. Confirmed    │                      │                    │
```

### 8.2 Shipment & Tracking Flow

```
┌───────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐
│ Warehouse │───▶│FulfillmentService│───▶│InventoryService │───▶│TrackingServ │
└───────────┘    └─────────────────┘    └─────────────────┘    └─────────────┘
      │                  │                       │                     │
      │ 1. Pick Items    │                       │                     │
      │─────────────────▶│                       │                     │
      │                  │ 2. Create Shipment    │                     │
      │                  │──────────────────────▶│                     │
      │                  │                       │                     │
      │ 3. Dispatch      │                       │                     │
      │─────────────────▶│                       │                     │
      │                  │ 4. Debit Inventory    │                     │
      │                  │──────────────────────▶│                     │
      │                  │                       │ 5. Consume Reserve  │
      │                  │                       │ 6. Write Ledger     │
      │                  │                       │                     │
      │                  │ 7. Emit SHIPPED Event │                     │
      │                  │────────────────────────────────────────────▶│
      │                  │                       │                     │
```

---

## 9. Error Handling Strategy

### Error Categories

| Category      | HTTP Status | Retry | Example             |
| ------------- | ----------- | ----- | ------------------- |
| Validation    | 400         | No    | Invalid SKU format  |
| Not Found     | 404         | No    | Product not found   |
| Conflict      | 409         | Maybe | Duplicate SKU       |
| Business Rule | 422         | No    | Insufficient stock  |
| Server Error  | 500         | Yes   | Database connection |

### Error Response Format

```typescript
interface ApiError {
    code: string // Machine-readable: "INSUFFICIENT_STOCK"
    message: string // Human-readable: "Not enough stock available"
    details?: Record<string, unknown> // Additional context
    requestId: string // For debugging
}
```

---

## 10. Scalability Considerations

### Current Design (MVP)

- Single PostgreSQL instance
- Next.js API routes (serverless-friendly)
- In-memory caching with React Query

### Future Scaling Path

| Bottleneck         | Solution                 |
| ------------------ | ------------------------ |
| Database reads     | Read replicas            |
| Tracking page load | Redis cache              |
| High write volume  | Queue + async processing |
| Multi-region       | Database per region      |

---

## 11. Security Measures

### Data Protection

| Measure          | Implementation              |
| ---------------- | --------------------------- |
| Authentication   | NextAuth.js / Clerk         |
| Authorization    | Role-based middleware       |
| Input Validation | Zod schemas                 |
| SQL Injection    | Drizzle ORM (parameterized) |
| Rate Limiting    | API middleware              |
| Audit Logging    | All mutations logged        |

### Public Tracking Security

- No PII in tracking responses
- Rate limiting per IP
- Tracking numbers are unguessable (UUID-based)
- No authentication required

---

## 12. Folder Structure

```
src/
├── app/
│   ├── (home)/              # Existing marketing site
│   ├── (admin)/             # Admin dashboard (new)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── orders/
│   │   └── fulfillment/
│   ├── track/               # Public tracking (new)
│   │   └── [trackingId]/
│   │       └── page.tsx
│   └── api/                 # API routes (new)
│       ├── catalog/
│       │   ├── products/
│       │   └── categories/
│       ├── inventory/
│       │   ├── transactions/
│       │   ├── reservations/
│       │   └── stock/
│       ├── orders/
│       ├── shipments/
│       └── track/
│           └── [trackingNumber]/
├── lib/
│   ├── db/                  # Database (new)
│   │   ├── schema/          # Drizzle schemas
│   │   ├── migrations/      # SQL migrations
│   │   └── index.ts         # DB connection
│   ├── services/            # Business logic (new)
│   │   ├── catalog/
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── fulfillment/
│   │   └── tracking/
│   └── validators/          # Zod schemas (new)
└── types/
    └── domain/              # Domain types (new)
```

---

## 13. Integration Points

### External Systems

| System           | Direction     | Purpose                   |
| ---------------- | ------------- | ------------------------- |
| Carrier APIs     | Outbound      | Get tracking updates      |
| Carrier Webhooks | Inbound       | Receive status changes    |
| Payment Gateway  | Outbound      | Process payments (future) |
| ERP System       | Bidirectional | Sync inventory (future)   |

### Webhook Handling

```typescript
// Carrier webhook endpoint
POST / api / webhooks / carrier / [carrierId]

// Idempotency: Use event ID + shipment ID as dedup key
// Retry: Return 200 even on processing failure, queue for retry
```

---

## 14. Monitoring & Observability

### Key Metrics

| Metric             | Description                 | Alert Threshold |
| ------------------ | --------------------------- | --------------- |
| Order Success Rate | Orders placed / attempts    | < 95%           |
| Inventory Accuracy | Snapshot vs Ledger delta    | > 0.1%          |
| Tracking Latency   | Public API response time    | > 500ms         |
| Reservation Expiry | Expired reservations / hour | > 10            |

### Logging Strategy

```typescript
// Structured logging for all operations
logger.info("inventory.debit", {
    productId,
    warehouseId,
    quantity,
    reason,
    referenceId,
    userId,
    timestamp,
})
```

---

## 15. Glossary

| Term           | Definition                                     |
| -------------- | ---------------------------------------------- |
| SKU            | Stock Keeping Unit - unique product identifier |
| Ledger         | Append-only transaction log                    |
| Reservation    | Promise of stock before shipment               |
| TOP_UP         | Operation that increases inventory             |
| DEBIT          | Operation that decreases inventory             |
| On-Hand        | Total physical stock                           |
| Available      | On-Hand minus Reserved                         |
| Shipment       | Physical package sent to customer              |
| Tracking Event | Status update in delivery timeline             |

---

## Related Documents

- [02-database-schema.md](./02-database-schema.md) - Complete database schema
- [03-inventory-service.md](./03-inventory-service.md) - Inventory business logic
- [04-order-fulfillment-service.md](./04-order-fulfillment-service.md) - Order & fulfillment flows
- [05-tracking-service.md](./05-tracking-service.md) - Public tracking system
- [06-effort-estimation.md](./06-effort-estimation.md) - Delivery timeline
