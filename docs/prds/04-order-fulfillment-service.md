# Order & Fulfillment Service - Business Logic & APIs

## Document Information

| Field        | Value                            |
| ------------ | -------------------------------- |
| Version      | 1.0                              |
| Status       | Draft                            |
| Last Updated | January 2026                     |
| Services     | OrderService, FulfillmentService |

---

## 1. Overview

This document covers two closely related services:

1. **OrderService** - Manages order lifecycle (customer intent)
2. **FulfillmentService** - Manages shipment execution (physical delivery)

### Key Principle

```
Orders express INTENT
Shipments express REALITY
```

Orders don't move inventory. Shipments do.

---

## 2. Order Lifecycle

### 2.1 State Machine

```
                    ┌─────────────────────────────────────────────┐
                    │                                             │
                    ▼                                             │
┌─────────┐    ┌─────────┐    ┌───────────┐    ┌────────────┐    │
│  DRAFT  │───▶│ PENDING │───▶│ CONFIRMED │───▶│ PROCESSING │────┤
└─────────┘    └─────────┘    └───────────┘    └────────────┘    │
     │              │              │                 │            │
     │              │              │                 ▼            │
     │              │              │           ┌─────────┐        │
     │              │              │           │ SHIPPED │────────┤
     │              │              │           └─────────┘        │
     │              │              │                 │            │
     │              │              │                 ▼            │
     │              │              │          ┌───────────┐       │
     │              │              │          │ DELIVERED │       │
     │              │              │          └───────────┘       │
     │              │              │                              │
     │              │              │                              │
     ▼              ▼              ▼                              │
┌───────────────────────────────────────┐                        │
│              CANCELLED                │◀───────────────────────┘
└───────────────────────────────────────┘
     (can cancel from any state except DELIVERED)
```

### 2.2 State Transitions

| From                   | To         | Trigger            | Side Effects         |
| ---------------------- | ---------- | ------------------ | -------------------- |
| -                      | DRAFT      | Order created      | None                 |
| DRAFT                  | PENDING    | Items added        | None                 |
| PENDING                | CONFIRMED  | Payment confirmed  | Create reservations  |
| CONFIRMED              | PROCESSING | Picking started    | None                 |
| PROCESSING             | SHIPPED    | All items shipped  | Consume reservations |
| SHIPPED                | DELIVERED  | Delivery confirmed | Update timestamps    |
| Any (except DELIVERED) | CANCELLED  | Cancel request     | Release reservations |

### 2.3 State Invariants

```typescript
// Invariants that must always hold true

interface OrderInvariants {
    // DRAFT: No reservations exist
    DRAFT: "reservations.length === 0"

    // PENDING: No reservations exist
    PENDING: "reservations.length === 0"

    // CONFIRMED: All items have reservations
    CONFIRMED: "items.every(i => i.hasReservation)"

    // PROCESSING: All items have reservations
    PROCESSING: "items.every(i => i.hasReservation)"

    // SHIPPED: All reservations consumed, all items shipped
    SHIPPED: 'reservations.every(r => r.status === "CONSUMED") && items.every(i => i.shippedQty >= i.quantity)'

    // DELIVERED: Same as SHIPPED
    DELIVERED: "Same as SHIPPED"

    // CANCELLED: All reservations released
    CANCELLED: 'reservations.every(r => r.status === "RELEASED")'
}
```

---

## 3. Service Interfaces

### 3.1 OrderService

```typescript
// src/lib/services/orders/order.service.ts

interface OrderService {
    // ─────────────────────────────────────────────────────────
    // Lifecycle Operations
    // ─────────────────────────────────────────────────────────

    /**
     * Create a new order
     */
    createOrder(data: CreateOrderInput): Promise<Result<Order, OrderError>>

    /**
     * Add items to draft order
     */
    addItems(
        orderId: string,
        items: OrderItemInput[]
    ): Promise<Result<Order, OrderError>>

    /**
     * Confirm order (trigger reservation)
     */
    confirmOrder(orderId: string): Promise<Result<Order, OrderError>>

    /**
     * Cancel order (release reservations)
     */
    cancelOrder(
        orderId: string,
        reason: string
    ): Promise<Result<Order, OrderError>>

    /**
     * Mark order as delivered
     */
    markDelivered(orderId: string): Promise<Result<Order, OrderError>>

    // ─────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────

    /**
     * Get order by ID
     */
    getOrder(orderId: string): Promise<Order | null>

    /**
     * Get order by order number
     */
    getOrderByNumber(orderNumber: string): Promise<Order | null>

    /**
     * List orders with filters
     */
    listOrders(filters: OrderFilters): Promise<PaginatedResult<Order>>

    /**
     * Get orders for a customer
     */
    getCustomerOrders(customerEmail: string): Promise<Order[]>
}
```

### 3.2 FulfillmentService

```typescript
// src/lib/services/fulfillment/fulfillment.service.ts

interface FulfillmentService {
    // ─────────────────────────────────────────────────────────
    // Shipment Operations
    // ─────────────────────────────────────────────────────────

    /**
     * Create shipment for order items
     */
    createShipment(
        params: CreateShipmentParams
    ): Promise<Result<Shipment, FulfillmentError>>

    /**
     * Mark shipment as dispatched (hand to carrier)
     */
    dispatchShipment(
        shipmentId: string,
        carrierInfo?: CarrierInfo
    ): Promise<Result<Shipment, FulfillmentError>>

    /**
     * Record delivery
     */
    markDelivered(
        shipmentId: string
    ): Promise<Result<Shipment, FulfillmentError>>

    /**
     * Record failed delivery
     */
    markDeliveryFailed(
        shipmentId: string,
        reason: string
    ): Promise<Result<Shipment, FulfillmentError>>

    // ─────────────────────────────────────────────────────────
    // Tracking Events
    // ─────────────────────────────────────────────────────────

    /**
     * Add tracking event
     */
    addTrackingEvent(
        shipmentId: string,
        event: TrackingEventInput
    ): Promise<Result<ShipmentEvent, FulfillmentError>>

    // ─────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────

    /**
     * Get shipment by ID
     */
    getShipment(shipmentId: string): Promise<Shipment | null>

    /**
     * Get shipments for order
     */
    getOrderShipments(orderId: string): Promise<Shipment[]>

    /**
     * Get shipment by tracking number
     */
    getShipmentByTracking(trackingNumber: string): Promise<Shipment | null>
}
```

---

## 4. Data Types

### 4.1 Order Types

```typescript
// src/lib/services/orders/types.ts

interface CreateOrderInput {
    customerName: string
    customerEmail?: string
    customerPhone?: string
    shippingAddress: Address
    items: OrderItemInput[]
    customerNotes?: string
}

interface OrderItemInput {
    productId: string
    quantity: number
}

interface Address {
    address: string
    city: string
    state: string
    country: string
    postalCode: string
}

interface OrderFilters {
    status?: OrderStatus[]
    customerEmail?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
}

type OrderError =
    | { code: "ORDER_NOT_FOUND"; orderId: string }
    | { code: "INVALID_STATUS_TRANSITION"; from: OrderStatus; to: OrderStatus }
    | {
          code: "INSUFFICIENT_STOCK"
          productId: string
          available: number
          requested: number
      }
    | { code: "PRODUCT_NOT_FOUND"; productId: string }
    | { code: "ORDER_ALREADY_CANCELLED"; orderId: string }
    | { code: "ORDER_ALREADY_DELIVERED"; orderId: string }
    | { code: "ITEMS_REQUIRED"; message: string }
```

### 4.2 Fulfillment Types

```typescript
// src/lib/services/fulfillment/types.ts

interface CreateShipmentParams {
    orderId: string
    warehouseId: string
    items: ShipmentItemInput[]
    shippingMethod?: string
    estimatedDeliveryDate?: Date
}

interface ShipmentItemInput {
    orderItemId: string
    productId: string
    quantity: number
}

interface CarrierInfo {
    carrier: string
    carrierTrackingNumber: string
}

interface TrackingEventInput {
    eventType: ShipmentEventType
    description?: string
    location?: string
    occurredAt: Date
    source?: "INTERNAL" | "CARRIER" | "WEBHOOK"
    externalEventId?: string
}

type FulfillmentError =
    | { code: "ORDER_NOT_FOUND"; orderId: string }
    | { code: "SHIPMENT_NOT_FOUND"; shipmentId: string }
    | { code: "ORDER_NOT_CONFIRMED"; orderId: string }
    | { code: "ITEM_ALREADY_SHIPPED"; orderItemId: string }
    | {
          code: "INVALID_QUANTITY"
          orderItemId: string
          available: number
          requested: number
      }
    | { code: "WAREHOUSE_NOT_FOUND"; warehouseId: string }
    | {
          code: "INVALID_STATUS_TRANSITION"
          from: ShipmentStatus
          to: ShipmentStatus
      }
```

---

## 5. Core Business Logic

### 5.1 Create Order

```typescript
/**
 * Create a new order
 *
 * Flow:
 * 1. Validate input
 * 2. Generate order number
 * 3. Verify all products exist
 * 4. Create order and items
 * 5. Return order (status = PENDING)
 *
 * NOTE: No inventory check at this stage
 */
async function createOrder(
    data: CreateOrderInput
): Promise<Result<Order, OrderError>> {
    // 1. Validate
    if (!data.items || data.items.length === 0) {
        return failure({
            code: "ITEMS_REQUIRED",
            message: "Order must have at least one item",
        })
    }

    // 2. Verify products
    const productIds = data.items.map((i) => i.productId)
    const products = await db.query.products.findMany({
        where: inArray(products.id, productIds),
    })

    const foundIds = new Set(products.map((p) => p.id))
    for (const item of data.items) {
        if (!foundIds.has(item.productId)) {
            return failure({
                code: "PRODUCT_NOT_FOUND",
                productId: item.productId,
            })
        }
    }

    // 3. Generate order number
    const orderNumber = generateOrderNumber() // e.g., "ORD-20260104-A7X2"

    // 4. Create order
    return await db.transaction(async (tx) => {
        const [order] = await tx
            .insert(orders)
            .values({
                orderNumber,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                shippingAddress: data.shippingAddress.address,
                shippingCity: data.shippingAddress.city,
                shippingState: data.shippingAddress.state,
                shippingCountry: data.shippingAddress.country,
                shippingPostalCode: data.shippingAddress.postalCode,
                customerNotes: data.customerNotes,
                status: "PENDING",
            })
            .returning()

        // 5. Create order items
        await tx.insert(orderItems).values(
            data.items.map((item) => ({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity.toString(),
                shippedQty: "0",
            }))
        )

        return success(order)
    })
}
```

### 5.2 Confirm Order (Create Reservations)

```typescript
/**
 * Confirm order and reserve inventory
 *
 * Flow:
 * 1. Validate order exists and is PENDING
 * 2. Select best warehouse for each item
 * 3. Reserve inventory for all items
 * 4. Update order status to CONFIRMED
 *
 * This is a critical transaction - all reservations succeed or none
 */
async function confirmOrder(
    orderId: string
): Promise<Result<Order, OrderError>> {
    return await db.transaction(async (tx) => {
        // 1. Lock and fetch order
        const [order] = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .for("update")

        if (!order) {
            return failure({ code: "ORDER_NOT_FOUND", orderId })
        }

        if (order.status !== "PENDING") {
            return failure({
                code: "INVALID_STATUS_TRANSITION",
                from: order.status,
                to: "CONFIRMED",
            })
        }

        // 2. Get order items
        const items = await tx
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, orderId))

        // 3. Reserve inventory for each item
        for (const item of items) {
            // Select warehouse (simplified - uses first available)
            const warehouse = await selectWarehouse(
                tx,
                item.productId,
                parseFloat(item.quantity)
            )

            if (!warehouse) {
                return failure({
                    code: "INSUFFICIENT_STOCK",
                    productId: item.productId,
                    available: 0,
                    requested: parseFloat(item.quantity),
                })
            }

            // Create reservation
            const reserveResult = await inventoryService.reserve({
                productId: item.productId,
                warehouseId: warehouse.id,
                quantity: parseFloat(item.quantity),
                orderId: orderId,
                expiresAt: addHours(new Date(), 48), // 48 hour expiry
            })

            if (!reserveResult.success) {
                return failure({
                    code: "INSUFFICIENT_STOCK",
                    productId: item.productId,
                    available: reserveResult.error.available,
                    requested: parseFloat(item.quantity),
                })
            }
        }

        // 4. Update order status
        const [updatedOrder] = await tx
            .update(orders)
            .set({
                status: "CONFIRMED",
                confirmedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
            .returning()

        return success(updatedOrder)
    })
}

/**
 * Select warehouse with available stock
 *
 * Strategy: Simple - first warehouse with stock
 * Future: Distance-based, cost optimization, etc.
 */
async function selectWarehouse(
    tx: Transaction,
    productId: string,
    quantity: number
): Promise<Warehouse | null> {
    const snapshots = await tx
        .select()
        .from(inventorySnapshots)
        .innerJoin(
            warehouses,
            eq(warehouses.id, inventorySnapshots.warehouseId)
        )
        .where(
            and(
                eq(inventorySnapshots.productId, productId),
                gte(inventorySnapshots.availableQty, quantity.toString()),
                eq(warehouses.isActive, true)
            )
        )
        .orderBy(desc(inventorySnapshots.availableQty))
        .limit(1)

    return snapshots[0]?.warehouses ?? null
}
```

### 5.3 Cancel Order

```typescript
/**
 * Cancel order and release reservations
 *
 * Flow:
 * 1. Validate order can be cancelled
 * 2. Release all active reservations
 * 3. Update order status
 */
async function cancelOrder(
    orderId: string,
    reason: string
): Promise<Result<Order, OrderError>> {
    return await db.transaction(async (tx) => {
        // 1. Lock and fetch order
        const [order] = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .for("update")

        if (!order) {
            return failure({ code: "ORDER_NOT_FOUND", orderId })
        }

        if (order.status === "DELIVERED") {
            return failure({ code: "ORDER_ALREADY_DELIVERED", orderId })
        }

        if (order.status === "CANCELLED") {
            return failure({ code: "ORDER_ALREADY_CANCELLED", orderId })
        }

        // 2. Release all reservations
        const reservations = await tx
            .select()
            .from(inventoryReservations)
            .where(
                and(
                    eq(inventoryReservations.orderId, orderId),
                    eq(inventoryReservations.status, "ACTIVE")
                )
            )

        for (const reservation of reservations) {
            await inventoryService.releaseReservation(reservation.id)
        }

        // 3. Update order
        const [updatedOrder] = await tx
            .update(orders)
            .set({
                status: "CANCELLED",
                cancelledAt: new Date(),
                cancellationReason: reason,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
            .returning()

        return success(updatedOrder)
    })
}
```

---

## 6. Fulfillment Logic

### 6.1 Create Shipment

```typescript
/**
 * Create shipment for order items
 *
 * Flow:
 * 1. Validate order is CONFIRMED or PROCESSING
 * 2. Validate items can be shipped
 * 3. Generate tracking number
 * 4. Create shipment and items
 * 5. Update order status to PROCESSING
 * 6. Add CREATED tracking event
 *
 * NOTE: Does NOT debit inventory yet - that happens on dispatch
 */
async function createShipment(
    params: CreateShipmentParams
): Promise<Result<Shipment, FulfillmentError>> {
    return await db.transaction(async (tx) => {
        // 1. Validate order
        const [order] = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, params.orderId))
            .for("update")

        if (!order) {
            return failure({ code: "ORDER_NOT_FOUND", orderId: params.orderId })
        }

        if (!["CONFIRMED", "PROCESSING"].includes(order.status)) {
            return failure({
                code: "ORDER_NOT_CONFIRMED",
                orderId: params.orderId,
            })
        }

        // 2. Validate warehouse
        const warehouse = await tx.query.warehouses.findFirst({
            where: eq(warehouses.id, params.warehouseId),
        })

        if (!warehouse) {
            return failure({
                code: "WAREHOUSE_NOT_FOUND",
                warehouseId: params.warehouseId,
            })
        }

        // 3. Validate items
        for (const item of params.items) {
            const orderItem = await tx.query.orderItems.findFirst({
                where: eq(orderItems.id, item.orderItemId),
            })

            if (!orderItem) {
                return failure({
                    code: "ITEM_NOT_FOUND",
                    orderItemId: item.orderItemId,
                })
            }

            const remainingQty =
                parseFloat(orderItem.quantity) -
                parseFloat(orderItem.shippedQty)
            if (item.quantity > remainingQty) {
                return failure({
                    code: "INVALID_QUANTITY",
                    orderItemId: item.orderItemId,
                    available: remainingQty,
                    requested: item.quantity,
                })
            }
        }

        // 4. Generate tracking number
        const trackingNumber = generateTrackingNumber() // e.g., "GEM-A7X2-9K4M"

        // 5. Create shipment
        const [shipment] = await tx
            .insert(shipments)
            .values({
                trackingNumber,
                orderId: params.orderId,
                warehouseId: params.warehouseId,
                status: "CREATED",
                shippingMethod: params.shippingMethod,
                estimatedDeliveryDate: params.estimatedDeliveryDate,
            })
            .returning()

        // 6. Create shipment items
        await tx.insert(shipmentItems).values(
            params.items.map((item) => ({
                shipmentId: shipment.id,
                productId: item.productId,
                orderItemId: item.orderItemId,
                quantity: item.quantity.toString(),
            }))
        )

        // 7. Update order item shipped quantities
        for (const item of params.items) {
            await tx
                .update(orderItems)
                .set({
                    shippedQty: sql`${orderItems.shippedQty} + ${item.quantity}`,
                    updatedAt: new Date(),
                })
                .where(eq(orderItems.id, item.orderItemId))
        }

        // 8. Update order status
        await tx
            .update(orders)
            .set({ status: "PROCESSING", updatedAt: new Date() })
            .where(eq(orders.id, params.orderId))

        // 9. Add tracking event
        await tx.insert(shipmentEvents).values({
            shipmentId: shipment.id,
            eventType: "CREATED",
            description: "Shipment created",
            occurredAt: new Date(),
            source: "INTERNAL",
        })

        return success(shipment)
    })
}
```

### 6.2 Dispatch Shipment

```typescript
/**
 * Dispatch shipment (hand to carrier)
 *
 * Flow:
 * 1. Validate shipment status
 * 2. Consume reservations for each item
 * 3. Update shipment status
 * 4. Add DISPATCHED tracking event
 * 5. Check if all order items shipped → update order status
 *
 * THIS IS THE POINT WHERE INVENTORY IS DEBITED
 */
async function dispatchShipment(
    shipmentId: string,
    carrierInfo?: CarrierInfo
): Promise<Result<Shipment, FulfillmentError>> {
    return await db.transaction(async (tx) => {
        // 1. Lock and fetch shipment
        const [shipment] = await tx
            .select()
            .from(shipments)
            .where(eq(shipments.id, shipmentId))
            .for("update")

        if (!shipment) {
            return failure({ code: "SHIPMENT_NOT_FOUND", shipmentId })
        }

        if (!["CREATED", "PICKING", "PACKED"].includes(shipment.status)) {
            return failure({
                code: "INVALID_STATUS_TRANSITION",
                from: shipment.status,
                to: "DISPATCHED",
            })
        }

        // 2. Get shipment items
        const items = await tx
            .select()
            .from(shipmentItems)
            .where(eq(shipmentItems.shipmentId, shipmentId))

        // 3. Consume reservations and debit inventory
        for (const item of items) {
            // Find the reservation for this order+product
            const [reservation] = await tx
                .select()
                .from(inventoryReservations)
                .where(
                    and(
                        eq(inventoryReservations.orderId, shipment.orderId),
                        eq(inventoryReservations.productId, item.productId),
                        eq(inventoryReservations.status, "ACTIVE")
                    )
                )

            if (reservation) {
                // Consume reservation (this creates the DEBIT transaction)
                await inventoryService.consumeReservation({
                    reservationId: reservation.id,
                    shipmentId: shipment.id,
                })
            } else {
                // No reservation - direct debit (edge case)
                await inventoryService.debit({
                    productId: item.productId,
                    warehouseId: shipment.warehouseId,
                    quantity: parseFloat(item.quantity),
                    reason: "SHIPMENT",
                    referenceType: "SHIPMENT",
                    referenceId: shipment.id,
                })
            }
        }

        // 4. Update shipment
        const [updatedShipment] = await tx
            .update(shipments)
            .set({
                status: "DISPATCHED",
                carrier: carrierInfo?.carrier,
                carrierTrackingNumber: carrierInfo?.carrierTrackingNumber,
                dispatchedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(shipments.id, shipmentId))
            .returning()

        // 5. Add tracking event
        await tx.insert(shipmentEvents).values({
            shipmentId: shipment.id,
            eventType: "DISPATCHED",
            description: carrierInfo
                ? `Dispatched via ${carrierInfo.carrier}`
                : "Dispatched",
            occurredAt: new Date(),
            source: "INTERNAL",
        })

        // 6. Check if order is fully shipped
        await updateOrderShipmentStatus(tx, shipment.orderId)

        return success(updatedShipment)
    })
}

/**
 * Update order status based on shipment status
 */
async function updateOrderShipmentStatus(
    tx: Transaction,
    orderId: string
): Promise<void> {
    const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId))

    const allShipped = items.every(
        (item) => parseFloat(item.shippedQty) >= parseFloat(item.quantity)
    )

    if (allShipped) {
        await tx
            .update(orders)
            .set({
                status: "SHIPPED",
                shippedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
    }
}
```

### 6.3 Mark Delivered

```typescript
/**
 * Mark shipment as delivered
 *
 * Flow:
 * 1. Validate shipment status
 * 2. Update shipment
 * 3. Add DELIVERED tracking event
 * 4. Check if order fully delivered
 */
async function markDelivered(
    shipmentId: string
): Promise<Result<Shipment, FulfillmentError>> {
    return await db.transaction(async (tx) => {
        const [shipment] = await tx
            .select()
            .from(shipments)
            .where(eq(shipments.id, shipmentId))
            .for("update")

        if (!shipment) {
            return failure({ code: "SHIPMENT_NOT_FOUND", shipmentId })
        }

        // Update shipment
        const [updatedShipment] = await tx
            .update(shipments)
            .set({
                status: "DELIVERED",
                deliveredAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(shipments.id, shipmentId))
            .returning()

        // Add tracking event
        await tx.insert(shipmentEvents).values({
            shipmentId: shipment.id,
            eventType: "DELIVERED",
            description: "Package delivered",
            occurredAt: new Date(),
            source: "INTERNAL",
        })

        // Check if order fully delivered
        await checkOrderDeliveryStatus(tx, shipment.orderId)

        return success(updatedShipment)
    })
}

async function checkOrderDeliveryStatus(
    tx: Transaction,
    orderId: string
): Promise<void> {
    const orderShipments = await tx
        .select()
        .from(shipments)
        .where(eq(shipments.orderId, orderId))

    const allDelivered = orderShipments.every((s) => s.status === "DELIVERED")

    if (allDelivered && orderShipments.length > 0) {
        await tx
            .update(orders)
            .set({
                status: "DELIVERED",
                deliveredAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
    }
}
```

---

## 7. Partial Fulfillment

### 7.1 Scenario: Multi-Shipment Order

```
Order: 10 units of Product A, 5 units of Product B

Shipment 1:
  - 5 units Product A (from Warehouse 1)
  - 5 units Product B (from Warehouse 1)

Shipment 2:
  - 5 units Product A (from Warehouse 2)

Timeline:
  Order CONFIRMED → PROCESSING → SHIPPED
                    (after Shipment 1)  (after Shipment 2)
```

### 7.2 Tracking Shipped Quantities

```typescript
// Order items track how much has been shipped
orderItems.shippedQty // Accumulated across shipments

// Check remaining quantity for an item
const remainingQty =
    parseFloat(orderItem.quantity) - parseFloat(orderItem.shippedQty)
```

---

## 8. API Endpoints

### 8.1 Order Endpoints

```typescript
// POST /api/orders
// Create new order
interface CreateOrderRequest {
    customerName: string
    customerEmail?: string
    customerPhone?: string
    shippingAddress: Address
    items: Array<{ productId: string; quantity: number }>
    customerNotes?: string
}

// GET /api/orders/:orderId
// Get order details with items and shipments

// POST /api/orders/:orderId/confirm
// Confirm order (creates reservations)

// POST /api/orders/:orderId/cancel
// Cancel order (releases reservations)
interface CancelOrderRequest {
    reason: string
}

// GET /api/orders
// List orders with filters
interface ListOrdersRequest {
    status?: string[]
    customerEmail?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}
```

### 8.2 Fulfillment Endpoints

```typescript
// POST /api/shipments
// Create shipment
interface CreateShipmentRequest {
    orderId: string
    warehouseId: string
    items: Array<{
        orderItemId: string
        productId: string
        quantity: number
    }>
    shippingMethod?: string
    estimatedDeliveryDate?: string
}

// POST /api/shipments/:shipmentId/dispatch
// Dispatch shipment
interface DispatchShipmentRequest {
    carrier?: string
    carrierTrackingNumber?: string
}

// POST /api/shipments/:shipmentId/delivered
// Mark as delivered

// POST /api/shipments/:shipmentId/events
// Add tracking event
interface AddTrackingEventRequest {
    eventType: string
    description?: string
    location?: string
    occurredAt: string
}

// GET /api/shipments/:shipmentId
// Get shipment with events

// GET /api/orders/:orderId/shipments
// Get shipments for order
```

---

## 9. Edge Cases & Error Handling

### 9.1 Reservation Expiration During Fulfillment

**Scenario**: Reservation expires after order confirmed but before shipment.

**Handling**:

```typescript
// Option 1: Extend reservation on fulfillment attempt
// Option 2: Re-reserve if stock available
// Option 3: Fail shipment creation

// Recommended: Option 2 with fallback to Option 3
if (!reservation || reservation.status !== 'ACTIVE') {
  // Try to create new reservation
  const reserveResult = await inventoryService.reserve({...})
  if (!reserveResult.success) {
    return failure({
      code: 'INSUFFICIENT_STOCK',
      message: 'Reservation expired and stock no longer available',
    })
  }
}
```

### 9.2 Concurrent Order Confirmations

**Scenario**: Multiple orders try to confirm with overlapping stock.

**Handling**:

- `SELECT FOR UPDATE` on inventory snapshot
- First transaction wins
- Second gets `INSUFFICIENT_STOCK`

### 9.3 Partial Shipment Cancellation

**Scenario**: Cancel order after some items shipped.

**Handling**:

```typescript
// 1. Can only cancel remaining (unshipped) items
// 2. Released items only - not shipped ones
// 3. Order status → CANCELLED (with note about partial shipment)

if (order.status === "PROCESSING" || order.status === "SHIPPED") {
    // Only release reservations for items not yet shipped
    const unshippedReservations = await getUnshippedReservations(orderId)
    // ... release only these
}
```

### 9.4 Double Dispatch Prevention

**Scenario**: Dispatch button clicked twice.

**Handling**:

- Status check: only `CREATED`, `PICKING`, `PACKED` can be dispatched
- Idempotent reservation consumption (unique constraint)

### 9.5 Out-of-Sequence Events

**Scenario**: Carrier webhook delivers `DELIVERED` before `IN_TRANSIT`.

**Handling**:

- Events stored with `occurredAt` (actual time) vs `createdAt` (insert time)
- Status derived from latest event by `occurredAt`
- All events preserved for audit

---

## 10. Order Number Generation

```typescript
/**
 * Generate human-readable order number
 * Format: ORD-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
    const date = format(new Date(), "yyyyMMdd")
    const random = nanoid(4).toUpperCase()
    return `ORD-${date}-${random}`
}

/**
 * Generate tracking number
 * Format: GEM-XXXX-XXXX (GEM = Gauss Electromagnetics)
 */
function generateTrackingNumber(): string {
    const part1 = nanoid(4).toUpperCase()
    const part2 = nanoid(4).toUpperCase()
    return `GEM-${part1}-${part2}`
}
```

---

## 11. Validation Schemas

```typescript
// src/lib/validators/orders.ts

import { z } from "zod"

export const addressSchema = z.object({
    address: z.string().min(1).max(500),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    country: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
})

export const orderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
})

export const createOrderSchema = z.object({
    customerName: z.string().min(1).max(255),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().max(50).optional(),
    shippingAddress: addressSchema,
    items: z.array(orderItemSchema).min(1),
    customerNotes: z.string().max(1000).optional(),
})

export const createShipmentSchema = z.object({
    orderId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    items: z
        .array(
            z.object({
                orderItemId: z.string().uuid(),
                productId: z.string().uuid(),
                quantity: z.number().positive(),
            })
        )
        .min(1),
    shippingMethod: z.string().max(100).optional(),
    estimatedDeliveryDate: z.coerce.date().optional(),
})
```

---

## 12. Testing Strategy

### Unit Tests

```typescript
describe("OrderService", () => {
    describe("createOrder", () => {
        it("should create order with items")
        it("should reject empty items")
        it("should reject non-existent products")
    })

    describe("confirmOrder", () => {
        it("should create reservations for all items")
        it("should reject if insufficient stock")
        it("should reject if already confirmed")
        it("should be atomic - all or nothing")
    })

    describe("cancelOrder", () => {
        it("should release all reservations")
        it("should reject if already delivered")
        it("should handle partial shipments")
    })
})

describe("FulfillmentService", () => {
    describe("createShipment", () => {
        it("should create shipment with items")
        it("should update order item shipped quantities")
        it("should reject if order not confirmed")
        it("should reject over-shipping")
    })

    describe("dispatchShipment", () => {
        it("should consume reservations")
        it("should debit inventory")
        it("should add tracking event")
        it("should update order status when fully shipped")
    })
})
```

### Integration Tests

```typescript
describe("Order-to-Delivery Flow", () => {
    it("should handle complete order lifecycle")
    it("should handle partial fulfillment")
    it("should handle order cancellation")
    it("should handle concurrent confirmations")
})
```

---

## 13. Monitoring & Logging

### Key Metrics

| Metric                 | Description        | Alert |
| ---------------------- | ------------------ | ----- |
| `orders.created`       | Orders per hour    | Trend |
| `orders.confirmed`     | Confirmation rate  | < 80% |
| `orders.cancelled`     | Cancellation rate  | > 10% |
| `shipments.dispatched` | Shipments per hour | Trend |
| `fulfillment.time`     | Confirm to ship    | > 48h |

### Logging

```typescript
logger.info("order.created", { orderId, orderNumber, itemCount, customerId })
logger.info("order.confirmed", { orderId, reservationCount, warehouseIds })
logger.info("order.cancelled", { orderId, reason, releasedReservations })
logger.info("shipment.created", {
    shipmentId,
    orderId,
    trackingNumber,
    itemCount,
})
logger.info("shipment.dispatched", { shipmentId, carrier, carrierTracking })
logger.info("shipment.delivered", { shipmentId, deliveryTime })
```

---

## Related Documents

- [01-system-overview.md](./01-system-overview.md) - System architecture
- [02-database-schema.md](./02-database-schema.md) - Database schema
- [03-inventory-service.md](./03-inventory-service.md) - Inventory business logic
- [05-tracking-service.md](./05-tracking-service.md) - Public tracking system
- [06-effort-estimation.md](./06-effort-estimation.md) - Delivery timeline
