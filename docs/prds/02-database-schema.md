# Database Schema - Inventory & Order Management System

## Document Information

| Field        | Value          |
| ------------ | -------------- |
| Version      | 1.0            |
| Status       | Draft          |
| Last Updated | January 2026   |
| Database     | PostgreSQL 15+ |
| ORM          | Drizzle ORM    |

---

## 1. Overview

This document defines the complete database schema for the Inventory & Order Management System. The schema follows these principles:

1. **Ledger-based inventory** - Append-only transactions
2. **Explicit operation/reason separation** - Business semantics preserved
3. **Idempotent writes** - Safe for retries
4. **Audit trail** - All changes tracked
5. **Referential integrity** - Foreign keys enforced

---

## 2. Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐         ┌─────────────────────┐                            │
│  │  categories │◄───────┐│  product_categories │                            │
│  └─────────────┘        ││                     │                            │
│        │ parent_id      │└─────────────────────┘                            │
│        └────────────────┘            │                                       │
│                                      │                                       │
│  ┌─────────────┐◄────────────────────┘                                      │
│  │  products   │◄──────────────────────────────────────────────┐            │
│  └─────────────┘                                               │            │
│        │                                                       │            │
│        │                                                       │            │
│        ▼                                                       │            │
│  ┌─────────────┐    ┌─────────────────────┐    ┌──────────────┴───────┐    │
│  │ warehouses  │◄───│inventory_transactions│───▶│inventory_reasons     │    │
│  └─────────────┘    └─────────────────────┘    └──────────────────────┘    │
│        │                     │                           │                  │
│        │                     │                           ▼                  │
│        │            ┌────────┴────────┐         ┌──────────────────────┐   │
│        │            │                 │         │inventory_operations  │   │
│        │            ▼                 │         └──────────────────────┘   │
│        │   ┌─────────────────────┐    │                                     │
│        └──▶│inventory_reservations│   │                                     │
│            └─────────────────────┘    │                                     │
│                      │                │                                     │
│                      ▼                ▼                                     │
│            ┌─────────────────────┐  ┌─────────────────────┐                │
│            │inventory_snapshots  │  │      orders         │                │
│            └─────────────────────┘  └─────────────────────┘                │
│                                              │                              │
│                                              ▼                              │
│                                     ┌─────────────────────┐                │
│                                     │    order_items      │                │
│                                     └─────────────────────┘                │
│                                              │                              │
│                                              ▼                              │
│                                     ┌─────────────────────┐                │
│                                     │     shipments       │                │
│                                     └─────────────────────┘                │
│                                              │                              │
│                                     ┌────────┴────────┐                    │
│                                     ▼                 ▼                    │
│                            ┌──────────────┐  ┌──────────────────┐         │
│                            │shipment_items│  │ shipment_events  │         │
│                            └──────────────┘  └──────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Enum Definitions

### 3.1 Inventory Operation

```typescript
// src/lib/db/schema/enums.ts

import { pgEnum } from "drizzle-orm/pg-core"

/**
 * Core inventory operations - defines HOW stock changes
 */
export const inventoryOperationEnum = pgEnum("inventory_operation", [
    "TOP_UP", // Increases stock
    "DEBIT", // Decreases stock
])

/**
 * Direction mapping for operations
 */
export const inventoryDirectionEnum = pgEnum("inventory_direction", [
    "INCREASE",
    "DECREASE",
])
```

### 3.2 Inventory Reason

```typescript
/**
 * Business reasons for inventory changes - defines WHY stock changes
 */
export const inventoryReasonEnum = pgEnum("inventory_reason", [
    "RECEIPT", // Goods received from supplier
    "RETURN", // Customer return
    "TRANSFER_IN", // Inter-warehouse transfer (receiving)
    "SHIPMENT", // Goods shipped to customer
    "DAMAGE", // Damaged or lost stock
    "TRANSFER_OUT", // Inter-warehouse transfer (sending)
    "ADJUSTMENT", // Manual audit correction
])
```

### 3.3 Reservation Status

```typescript
/**
 * Reservation lifecycle states
 */
export const reservationStatusEnum = pgEnum("reservation_status", [
    "ACTIVE", // Currently holding stock
    "CONSUMED", // Converted to shipment
    "RELEASED", // Cancelled/expired
])
```

### 3.4 Order Status

```typescript
/**
 * Order lifecycle states
 */
export const orderStatusEnum = pgEnum("order_status", [
    "DRAFT", // Order being created
    "PENDING", // Awaiting confirmation
    "CONFIRMED", // Payment confirmed, ready for fulfillment
    "PROCESSING", // Being picked/packed
    "SHIPPED", // All items shipped
    "DELIVERED", // All items delivered
    "CANCELLED", // Order cancelled
])
```

### 3.5 Shipment Status

```typescript
/**
 * Shipment lifecycle states (derived from events, stored for queries)
 */
export const shipmentStatusEnum = pgEnum("shipment_status", [
    "CREATED", // Shipment record created
    "PICKING", // Items being picked
    "PACKED", // Items packed, ready for dispatch
    "DISPATCHED", // Handed to carrier
    "IN_TRANSIT", // In carrier network
    "OUT_FOR_DELIVERY", // With delivery agent
    "DELIVERED", // Successfully delivered
    "FAILED", // Delivery failed
    "RETURNED", // Returned to warehouse
])
```

### 3.6 Shipment Event Type

```typescript
/**
 * Tracking event types
 */
export const shipmentEventTypeEnum = pgEnum("shipment_event_type", [
    "CREATED",
    "PICKING_STARTED",
    "PACKED",
    "DISPATCHED",
    "IN_TRANSIT",
    "AT_HUB",
    "OUT_FOR_DELIVERY",
    "DELIVERY_ATTEMPTED",
    "DELIVERED",
    "DELIVERY_FAILED",
    "RETURNING",
    "RETURNED",
])
```

---

## 4. Table Definitions

### 4.1 Categories

```typescript
// src/lib/db/schema/catalog.ts

import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    index,
} from "drizzle-orm/pg-core"

/**
 * Product categories with hierarchical support
 */
export const categories = pgTable(
    "categories",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Category identity
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull().unique(),
        description: varchar("description", { length: 1000 }),

        // Hierarchy
        parentId: uuid("parent_id").references(() => categories.id, {
            onDelete: "set null",
        }),

        // Metadata
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("categories_parent_id_idx").on(table.parentId),
        index("categories_slug_idx").on(table.slug),
    ]
)
```

### 4.2 Products

```typescript
/**
 * Product catalog - defines WHAT exists
 *
 * IMPORTANT: SKU is immutable once created
 */
export const products = pgTable(
    "products",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Product identity (immutable)
        sku: varchar("sku", { length: 100 }).notNull().unique(),

        // Product details
        name: varchar("name", { length: 255 }).notNull(),
        description: varchar("description", { length: 2000 }),
        unit: varchar("unit", { length: 50 }).notNull(), // pcs, kg, box, etc.

        // Optional attributes
        barcode: varchar("barcode", { length: 100 }),
        weight: numeric("weight", { precision: 10, scale: 3 }), // in kg
        dimensions: jsonb("dimensions"), // { length, width, height }

        // Metadata
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("products_sku_idx").on(table.sku),
        index("products_barcode_idx").on(table.barcode),
        index("products_is_active_idx").on(table.isActive),
    ]
)
```

### 4.3 Product Categories (Junction)

```typescript
/**
 * Many-to-many relationship between products and categories
 */
export const productCategories = pgTable(
    "product_categories",
    {
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        categoryId: uuid("category_id")
            .notNull()
            .references(() => categories.id, { onDelete: "cascade" }),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.productId, table.categoryId] }),
        index("product_categories_category_id_idx").on(table.categoryId),
    ]
)
```

### 4.4 Warehouses

```typescript
// src/lib/db/schema/warehousing.ts

/**
 * Physical warehouse locations
 */
export const warehouses = pgTable(
    "warehouses",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Warehouse identity
        code: varchar("code", { length: 50 }).notNull().unique(),
        name: varchar("name", { length: 255 }).notNull(),

        // Location
        address: varchar("address", { length: 500 }),
        city: varchar("city", { length: 100 }),
        state: varchar("state", { length: 100 }),
        country: varchar("country", { length: 100 }).default("India"),
        postalCode: varchar("postal_code", { length: 20 }),

        // Coordinates (for distance calculations)
        latitude: numeric("latitude", { precision: 10, scale: 7 }),
        longitude: numeric("longitude", { precision: 10, scale: 7 }),

        // Metadata
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("warehouses_code_idx").on(table.code),
        index("warehouses_is_active_idx").on(table.isActive),
    ]
)
```

### 4.5 Inventory Operations (Master)

```typescript
// src/lib/db/schema/inventory.ts

import { inventoryOperationEnum, inventoryDirectionEnum } from "./enums"

/**
 * Master table defining inventory operations
 *
 * This is a static lookup table - seeded once, rarely changed
 */
export const inventoryOperations = pgTable("inventory_operations", {
    code: varchar("code", { length: 50 }).primaryKey(), // TOP_UP, DEBIT
    direction: inventoryDirectionEnum("direction").notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
})

// Seed data:
// TOP_UP  | INCREASE | Adds stock to inventory
// DEBIT   | DECREASE | Removes stock from inventory
```

### 4.6 Inventory Reasons (Master)

```typescript
/**
 * Master table mapping business reasons to operations
 *
 * This ensures consistent mapping and prevents invalid combinations
 */
export const inventoryReasons = pgTable(
    "inventory_reasons",
    {
        code: varchar("code", { length: 50 }).primaryKey(),
        operationCode: varchar("operation_code", { length: 50 })
            .notNull()
            .references(() => inventoryOperations.code),
        description: varchar("description", { length: 255 }).notNull(),

        // Whether this reason can be used for manual adjustments
        allowManual: boolean("allow_manual").default(false).notNull(),

        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("inventory_reasons_operation_idx").on(table.operationCode),
    ]
)

// Seed data:
// RECEIPT      | TOP_UP | Goods received from supplier          | true
// RETURN       | TOP_UP | Customer return                       | false
// TRANSFER_IN  | TOP_UP | Inter-warehouse transfer (receiving)  | false
// SHIPMENT     | DEBIT  | Goods shipped to customer             | false
// DAMAGE       | DEBIT  | Damaged or lost stock                 | true
// TRANSFER_OUT | DEBIT  | Inter-warehouse transfer (sending)    | false
// ADJUSTMENT   | *      | Manual audit correction               | true
```

### 4.7 Inventory Transactions (Ledger)

```typescript
import { numeric } from "drizzle-orm/pg-core"

/**
 * THE HEART OF THE SYSTEM
 *
 * Append-only ledger of all inventory movements.
 * Stock is DERIVED from this table, never stored directly.
 *
 * RULES:
 * 1. NEVER update rows
 * 2. NEVER delete rows
 * 3. Always use transaction boundaries
 * 4. Idempotent via unique constraint
 */
export const inventoryTransactions = pgTable(
    "inventory_transactions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // What changed
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "restrict" }),
        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, { onDelete: "restrict" }),

        // How much (always positive)
        quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),

        // Why it changed
        reasonCode: varchar("reason_code", { length: 50 })
            .notNull()
            .references(() => inventoryReasons.code, { onDelete: "restrict" }),

        // Additional context
        notes: varchar("notes", { length: 500 }),

        // Reference to source document (for idempotency)
        referenceType: varchar("reference_type", { length: 50 }).notNull(),
        referenceId: uuid("reference_id").notNull(),

        // Audit
        createdBy: uuid("created_by"), // User ID
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        // Critical indexes
        index("inventory_tx_product_warehouse_idx").on(
            table.productId,
            table.warehouseId
        ),
        index("inventory_tx_reference_idx").on(
            table.referenceType,
            table.referenceId
        ),
        index("inventory_tx_created_at_idx").on(table.createdAt),
        index("inventory_tx_reason_idx").on(table.reasonCode),

        // Idempotency constraint - prevents duplicate transactions
        unique("inventory_tx_idempotency_key").on(
            table.referenceType,
            table.referenceId,
            table.productId
        ),

        // Quantity must be positive
        check("quantity_positive", sql`quantity > 0`),
    ]
)
```

### 4.8 Inventory Reservations

```typescript
import { reservationStatusEnum } from "./enums"

/**
 * Stock reservations for pending orders
 *
 * Reservations:
 * - Do NOT affect the ledger
 * - Reduce AVAILABLE stock
 * - Are consumed when shipment is created
 * - Can expire or be released
 */
export const inventoryReservations = pgTable(
    "inventory_reservations",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // What is reserved
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "restrict" }),
        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, { onDelete: "restrict" }),

        // How much
        quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),

        // For what
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "restrict" }),

        // Lifecycle
        status: reservationStatusEnum("status").default("ACTIVE").notNull(),
        expiresAt: timestamp("expires_at", { withTimezone: true }),

        // Audit
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        // Indexes
        index("reservations_product_warehouse_status_idx").on(
            table.productId,
            table.warehouseId,
            table.status
        ),
        index("reservations_order_idx").on(table.orderId),
        index("reservations_expires_at_idx").on(table.expiresAt),

        // One reservation per product per order
        unique("reservations_order_product_unique").on(
            table.orderId,
            table.productId
        ),

        // Quantity must be positive
        check("reservation_quantity_positive", sql`quantity > 0`),
    ]
)
```

### 4.9 Inventory Snapshots

```typescript
/**
 * Materialized view of current stock levels
 *
 * This table is:
 * - DERIVED from transactions and reservations
 * - DISPOSABLE - can be rebuilt at any time
 * - CACHED for performance
 * - NEVER the source of truth
 */
export const inventorySnapshots = pgTable(
    "inventory_snapshots",
    {
        // Composite primary key
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),
        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, { onDelete: "cascade" }),

        // Computed values
        onHandQty: numeric("on_hand_qty", { precision: 15, scale: 4 })
            .notNull()
            .default("0"),
        reservedQty: numeric("reserved_qty", { precision: 15, scale: 4 })
            .notNull()
            .default("0"),
        availableQty: numeric("available_qty", { precision: 15, scale: 4 })
            .notNull()
            .default("0"),

        // Metadata
        lastTransactionId: uuid("last_transaction_id"),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.productId, table.warehouseId] }),
        index("snapshots_available_idx").on(table.availableQty),
    ]
)
```

### 4.10 Orders

```typescript
// src/lib/db/schema/orders.ts

import { orderStatusEnum } from "./enums"

/**
 * Customer orders
 */
export const orders = pgTable(
    "orders",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Order identity
        orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),

        // Customer info (simplified - extend as needed)
        customerName: varchar("customer_name", { length: 255 }).notNull(),
        customerEmail: varchar("customer_email", { length: 255 }),
        customerPhone: varchar("customer_phone", { length: 50 }),

        // Shipping address
        shippingAddress: varchar("shipping_address", { length: 500 }).notNull(),
        shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
        shippingState: varchar("shipping_state", { length: 100 }).notNull(),
        shippingCountry: varchar("shipping_country", { length: 100 })
            .default("India")
            .notNull(),
        shippingPostalCode: varchar("shipping_postal_code", {
            length: 20,
        }).notNull(),

        // Lifecycle
        status: orderStatusEnum("status").default("PENDING").notNull(),

        // Timestamps
        confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
        shippedAt: timestamp("shipped_at", { withTimezone: true }),
        deliveredAt: timestamp("delivered_at", { withTimezone: true }),
        cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
        cancellationReason: varchar("cancellation_reason", { length: 500 }),

        // Notes
        internalNotes: varchar("internal_notes", { length: 1000 }),
        customerNotes: varchar("customer_notes", { length: 1000 }),

        // Audit
        createdBy: uuid("created_by"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("orders_order_number_idx").on(table.orderNumber),
        index("orders_status_idx").on(table.status),
        index("orders_customer_email_idx").on(table.customerEmail),
        index("orders_created_at_idx").on(table.createdAt),
    ]
)
```

### 4.11 Order Items

```typescript
/**
 * Line items within an order
 */
export const orderItems = pgTable(
    "order_items",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Parent order
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "cascade" }),

        // Product
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "restrict" }),

        // Quantity
        quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),

        // Fulfillment tracking
        shippedQty: numeric("shipped_qty", { precision: 15, scale: 4 })
            .default("0")
            .notNull(),

        // Audit
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("order_items_order_idx").on(table.orderId),
        index("order_items_product_idx").on(table.productId),

        // Quantity must be positive
        check("order_item_quantity_positive", sql`quantity > 0`),
    ]
)
```

### 4.12 Shipments

```typescript
// src/lib/db/schema/fulfillment.ts

import { shipmentStatusEnum } from "./enums"

/**
 * Physical shipments (packages)
 *
 * One order can have multiple shipments (partial fulfillment)
 */
export const shipments = pgTable(
    "shipments",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Identifiers
        trackingNumber: varchar("tracking_number", { length: 100 })
            .notNull()
            .unique(),

        // Relations
        orderId: uuid("order_id")
            .notNull()
            .references(() => orders.id, { onDelete: "restrict" }),
        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, { onDelete: "restrict" }),

        // Carrier info
        carrier: varchar("carrier", { length: 100 }), // BlueDart, Delhivery, etc.
        carrierTrackingNumber: varchar("carrier_tracking_number", {
            length: 100,
        }),

        // Status (derived from events, cached for queries)
        status: shipmentStatusEnum("status").default("CREATED").notNull(),

        // Shipping details
        shippingMethod: varchar("shipping_method", { length: 100 }),
        estimatedDeliveryDate: timestamp("estimated_delivery_date", {
            withTimezone: true,
        }),

        // Timestamps
        dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
        deliveredAt: timestamp("delivered_at", { withTimezone: true }),

        // Audit
        createdBy: uuid("created_by"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("shipments_tracking_number_idx").on(table.trackingNumber),
        index("shipments_order_idx").on(table.orderId),
        index("shipments_status_idx").on(table.status),
        index("shipments_carrier_tracking_idx").on(table.carrierTrackingNumber),
    ]
)
```

### 4.13 Shipment Items

```typescript
/**
 * Items included in a shipment
 */
export const shipmentItems = pgTable(
    "shipment_items",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Parent shipment
        shipmentId: uuid("shipment_id")
            .notNull()
            .references(() => shipments.id, { onDelete: "cascade" }),

        // Product
        productId: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "restrict" }),

        // Link to order item
        orderItemId: uuid("order_item_id")
            .notNull()
            .references(() => orderItems.id, { onDelete: "restrict" }),

        // Quantity in this shipment
        quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),

        // Audit
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("shipment_items_shipment_idx").on(table.shipmentId),
        index("shipment_items_product_idx").on(table.productId),

        // Quantity must be positive
        check("shipment_item_quantity_positive", sql`quantity > 0`),
    ]
)
```

### 4.14 Shipment Events

```typescript
import { shipmentEventTypeEnum } from "./enums"

/**
 * Tracking events for shipments
 *
 * APPEND-ONLY: Never update or delete
 * Status is derived from the latest event
 */
export const shipmentEvents = pgTable(
    "shipment_events",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        // Parent shipment
        shipmentId: uuid("shipment_id")
            .notNull()
            .references(() => shipments.id, { onDelete: "cascade" }),

        // Event details
        eventType: shipmentEventTypeEnum("event_type").notNull(),
        description: varchar("description", { length: 500 }),
        location: varchar("location", { length: 255 }),

        // When the event actually occurred (may differ from created_at)
        occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),

        // Source of the event
        source: varchar("source", { length: 50 }).default("INTERNAL").notNull(), // INTERNAL, CARRIER, WEBHOOK

        // For carrier webhook idempotency
        externalEventId: varchar("external_event_id", { length: 100 }),

        // Audit
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("shipment_events_shipment_idx").on(table.shipmentId),
        index("shipment_events_occurred_at_idx").on(table.occurredAt),
        index("shipment_events_type_idx").on(table.eventType),

        // Idempotency for external events
        unique("shipment_events_external_unique").on(
            table.shipmentId,
            table.externalEventId
        ),
    ]
)
```

---

## 5. Database Views

### 5.1 Current Stock View

```sql
-- Calculate current stock from ledger
CREATE VIEW v_current_stock AS
SELECT
  it.product_id,
  it.warehouse_id,
  SUM(
    CASE
      WHEN io.direction = 'INCREASE' THEN it.quantity
      ELSE -it.quantity
    END
  ) as on_hand_qty
FROM inventory_transactions it
JOIN inventory_reasons ir ON ir.code = it.reason_code
JOIN inventory_operations io ON io.code = ir.operation_code
GROUP BY it.product_id, it.warehouse_id;
```

### 5.2 Available Stock View

```sql
-- Calculate available stock (on_hand - reserved)
CREATE VIEW v_available_stock AS
SELECT
  cs.product_id,
  cs.warehouse_id,
  cs.on_hand_qty,
  COALESCE(r.reserved_qty, 0) as reserved_qty,
  cs.on_hand_qty - COALESCE(r.reserved_qty, 0) as available_qty
FROM v_current_stock cs
LEFT JOIN (
  SELECT
    product_id,
    warehouse_id,
    SUM(quantity) as reserved_qty
  FROM inventory_reservations
  WHERE status = 'ACTIVE'
  GROUP BY product_id, warehouse_id
) r ON r.product_id = cs.product_id AND r.warehouse_id = cs.warehouse_id;
```

---

## 6. Indexes Summary

### Critical Indexes for Performance

| Table                    | Index                                | Purpose            |
| ------------------------ | ------------------------------------ | ------------------ |
| `inventory_transactions` | `(product_id, warehouse_id)`         | Stock calculation  |
| `inventory_transactions` | `(reference_type, reference_id)`     | Idempotency lookup |
| `inventory_reservations` | `(product_id, warehouse_id, status)` | Available stock    |
| `shipments`              | `(tracking_number)`                  | Public tracking    |
| `shipment_events`        | `(shipment_id, occurred_at)`         | Event timeline     |
| `orders`                 | `(order_number)`                     | Order lookup       |

---

## 7. Constraints Summary

### Check Constraints

| Table                    | Constraint                        | Rule           |
| ------------------------ | --------------------------------- | -------------- |
| `inventory_transactions` | `quantity_positive`               | `quantity > 0` |
| `inventory_reservations` | `reservation_quantity_positive`   | `quantity > 0` |
| `order_items`            | `order_item_quantity_positive`    | `quantity > 0` |
| `shipment_items`         | `shipment_item_quantity_positive` | `quantity > 0` |

### Unique Constraints

| Table                    | Constraint                          | Columns                                      |
| ------------------------ | ----------------------------------- | -------------------------------------------- |
| `inventory_transactions` | `inventory_tx_idempotency_key`      | `(reference_type, reference_id, product_id)` |
| `inventory_reservations` | `reservations_order_product_unique` | `(order_id, product_id)`                     |
| `shipment_events`        | `shipment_events_external_unique`   | `(shipment_id, external_event_id)`           |

---

## 8. Seed Data

### 8.1 Inventory Operations

```sql
INSERT INTO inventory_operations (code, direction, description) VALUES
  ('TOP_UP', 'INCREASE', 'Adds stock to inventory'),
  ('DEBIT', 'DECREASE', 'Removes stock from inventory');
```

### 8.2 Inventory Reasons

```sql
INSERT INTO inventory_reasons (code, operation_code, description, allow_manual) VALUES
  ('RECEIPT', 'TOP_UP', 'Goods received from supplier', true),
  ('RETURN', 'TOP_UP', 'Customer return', false),
  ('TRANSFER_IN', 'TOP_UP', 'Inter-warehouse transfer (receiving)', false),
  ('SHIPMENT', 'DEBIT', 'Goods shipped to customer', false),
  ('DAMAGE', 'DEBIT', 'Damaged or lost stock', true),
  ('TRANSFER_OUT', 'DEBIT', 'Inter-warehouse transfer (sending)', false),
  ('ADJUSTMENT_CREDIT', 'TOP_UP', 'Manual audit correction (increase)', true),
  ('ADJUSTMENT_DEBIT', 'DEBIT', 'Manual audit correction (decrease)', true);
```

---

## 9. Migration Strategy

### Initial Migration Order

1. Create enums
2. Create `categories` table
3. Create `products` table
4. Create `product_categories` table
5. Create `warehouses` table
6. Create `inventory_operations` table
7. Create `inventory_reasons` table
8. Create `inventory_transactions` table
9. Create `inventory_reservations` table
10. Create `inventory_snapshots` table
11. Create `orders` table
12. Create `order_items` table
13. Create `shipments` table
14. Create `shipment_items` table
15. Create `shipment_events` table
16. Create views
17. Seed master data

---

## 10. Drizzle Configuration

```typescript
// src/lib/db/index.ts

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

export const db = drizzle(pool, { schema })

// Export schema for type inference
export { schema }
```

---

## Related Documents

- [01-system-overview.md](./01-system-overview.md) - System architecture
- [03-inventory-service.md](./03-inventory-service.md) - Inventory business logic
- [04-order-fulfillment-service.md](./04-order-fulfillment-service.md) - Order & fulfillment flows
- [05-tracking-service.md](./05-tracking-service.md) - Public tracking system
- [06-effort-estimation.md](./06-effort-estimation.md) - Delivery timeline
