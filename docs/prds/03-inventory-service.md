# Inventory Service - Business Logic & APIs

## Document Information

| Field        | Value            |
| ------------ | ---------------- |
| Version      | 1.0              |
| Status       | Draft            |
| Last Updated | January 2026     |
| Service      | InventoryService |

---

## 1. Overview

The Inventory Service is responsible for:

- Stock accounting (ledger management)
- Stock reservations for orders
- Stock level queries
- Snapshot maintenance

### Core Principles

1. **Ledger is source of truth** - Stock is derived, never stored
2. **Two operations only** - TOP_UP and DEBIT
3. **Idempotent writes** - Safe for retries
4. **Never go negative** - Enforced at transaction boundary
5. **Reservations are separate** - Don't affect ledger

---

## 2. Service Interface

```typescript
// src/lib/services/inventory/inventory.service.ts

interface InventoryService {
    // ─────────────────────────────────────────────────────────
    // Core Operations
    // ─────────────────────────────────────────────────────────

    /**
     * Add stock to inventory (TOP_UP operation)
     * Used for: receipts, returns, transfers in, positive adjustments
     */
    topUp(
        params: TopUpParams
    ): Promise<Result<InventoryTransaction, InventoryError>>

    /**
     * Remove stock from inventory (DEBIT operation)
     * Used for: shipments, damages, transfers out, negative adjustments
     */
    debit(
        params: DebitParams
    ): Promise<Result<InventoryTransaction, InventoryError>>

    // ─────────────────────────────────────────────────────────
    // Reservations
    // ─────────────────────────────────────────────────────────

    /**
     * Reserve stock for an order
     * Reduces available stock, does NOT affect ledger
     */
    reserve(
        params: ReserveParams
    ): Promise<Result<InventoryReservation, InventoryError>>

    /**
     * Release a reservation (order cancelled)
     * Makes stock available again
     */
    releaseReservation(
        reservationId: string
    ): Promise<Result<void, InventoryError>>

    /**
     * Consume a reservation (shipment created)
     * Marks reservation as CONSUMED, triggers DEBIT
     */
    consumeReservation(
        params: ConsumeReservationParams
    ): Promise<Result<InventoryTransaction, InventoryError>>

    // ─────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────

    /**
     * Get available stock for a product at a warehouse
     */
    getAvailableStock(productId: string, warehouseId: string): Promise<number>

    /**
     * Get stock levels across all warehouses
     */
    getStockLevels(productId: string): Promise<StockLevel[]>

    /**
     * Get transaction history for a product
     */
    getTransactionHistory(
        params: TransactionHistoryParams
    ): Promise<PaginatedResult<InventoryTransaction>>

    // ─────────────────────────────────────────────────────────
    // Maintenance
    // ─────────────────────────────────────────────────────────

    /**
     * Rebuild snapshots from ledger (scheduled job)
     */
    rebuildSnapshots(): Promise<void>

    /**
     * Expire old reservations
     */
    expireReservations(): Promise<number>
}
```

---

## 3. Data Types

### 3.1 Input Types

```typescript
// src/lib/services/inventory/types.ts

/**
 * Parameters for TOP_UP operation
 */
interface TopUpParams {
    productId: string
    warehouseId: string
    quantity: number
    reason: TopUpReason
    referenceType: string
    referenceId: string
    notes?: string
    createdBy?: string
}

type TopUpReason = "RECEIPT" | "RETURN" | "TRANSFER_IN" | "ADJUSTMENT_CREDIT"

/**
 * Parameters for DEBIT operation
 */
interface DebitParams {
    productId: string
    warehouseId: string
    quantity: number
    reason: DebitReason
    referenceType: string
    referenceId: string
    notes?: string
    createdBy?: string
}

type DebitReason = "SHIPMENT" | "DAMAGE" | "TRANSFER_OUT" | "ADJUSTMENT_DEBIT"

/**
 * Parameters for reservation
 */
interface ReserveParams {
    productId: string
    warehouseId: string
    quantity: number
    orderId: string
    expiresAt?: Date
}

/**
 * Parameters for consuming reservation
 */
interface ConsumeReservationParams {
    reservationId: string
    shipmentId: string
}
```

### 3.2 Output Types

```typescript
/**
 * Stock level at a warehouse
 */
interface StockLevel {
    warehouseId: string
    warehouseCode: string
    warehouseName: string
    onHandQty: number
    reservedQty: number
    availableQty: number
    updatedAt: Date
}

/**
 * Inventory operation errors
 */
type InventoryError =
    | { code: "INSUFFICIENT_STOCK"; available: number; requested: number }
    | { code: "PRODUCT_NOT_FOUND"; productId: string }
    | { code: "WAREHOUSE_NOT_FOUND"; warehouseId: string }
    | { code: "RESERVATION_NOT_FOUND"; reservationId: string }
    | { code: "RESERVATION_ALREADY_CONSUMED"; reservationId: string }
    | {
          code: "DUPLICATE_TRANSACTION"
          referenceType: string
          referenceId: string
      }
    | { code: "INVALID_QUANTITY"; message: string }
```

---

## 4. Core Business Logic

### 4.1 TOP_UP Operation

```typescript
/**
 * Add stock to inventory
 *
 * Flow:
 * 1. Validate inputs
 * 2. Verify product and warehouse exist
 * 3. Insert ledger entry
 * 4. Update snapshot
 */
async function topUp(
    params: TopUpParams
): Promise<Result<InventoryTransaction, InventoryError>> {
    // 1. Validate quantity
    if (params.quantity <= 0) {
        return failure({
            code: "INVALID_QUANTITY",
            message: "Quantity must be positive",
        })
    }

    // 2. Verify product exists
    const product = await db.query.products.findFirst({
        where: eq(products.id, params.productId),
    })
    if (!product) {
        return failure({
            code: "PRODUCT_NOT_FOUND",
            productId: params.productId,
        })
    }

    // 3. Verify warehouse exists
    const warehouse = await db.query.warehouses.findFirst({
        where: eq(warehouses.id, params.warehouseId),
    })
    if (!warehouse) {
        return failure({
            code: "WAREHOUSE_NOT_FOUND",
            warehouseId: params.warehouseId,
        })
    }

    // 4. Insert transaction (with idempotency)
    try {
        const [transaction] = await db
            .insert(inventoryTransactions)
            .values({
                productId: params.productId,
                warehouseId: params.warehouseId,
                quantity: params.quantity.toString(),
                reasonCode: params.reason,
                referenceType: params.referenceType,
                referenceId: params.referenceId,
                notes: params.notes,
                createdBy: params.createdBy,
            })
            .returning()

        // 5. Update snapshot (async is acceptable)
        await updateSnapshot(params.productId, params.warehouseId)

        return success(transaction)
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            return failure({
                code: "DUPLICATE_TRANSACTION",
                referenceType: params.referenceType,
                referenceId: params.referenceId,
            })
        }
        throw error
    }
}
```

### 4.2 DEBIT Operation

```typescript
/**
 * Remove stock from inventory
 *
 * Flow:
 * 1. Validate inputs
 * 2. Verify product and warehouse exist
 * 3. Check available stock >= requested
 * 4. Insert ledger entry
 * 5. Update snapshot
 *
 * CRITICAL: Must check available stock to prevent negative inventory
 */
async function debit(
    params: DebitParams
): Promise<Result<InventoryTransaction, InventoryError>> {
    // 1. Validate quantity
    if (params.quantity <= 0) {
        return failure({
            code: "INVALID_QUANTITY",
            message: "Quantity must be positive",
        })
    }

    // 2-5: Use transaction to prevent race conditions
    return await db.transaction(async (tx) => {
        // Lock the snapshot row to prevent concurrent debits
        const [snapshot] = await tx
            .select()
            .from(inventorySnapshots)
            .where(
                and(
                    eq(inventorySnapshots.productId, params.productId),
                    eq(inventorySnapshots.warehouseId, params.warehouseId)
                )
            )
            .for("update") // SELECT FOR UPDATE

        // Calculate available from snapshot (or compute if not exists)
        const available = snapshot
            ? parseFloat(snapshot.availableQty)
            : await computeAvailableStock(
                  tx,
                  params.productId,
                  params.warehouseId
              )

        // 3. Check sufficient stock
        if (available < params.quantity) {
            return failure({
                code: "INSUFFICIENT_STOCK",
                available,
                requested: params.quantity,
            })
        }

        // 4. Insert transaction
        try {
            const [transaction] = await tx
                .insert(inventoryTransactions)
                .values({
                    productId: params.productId,
                    warehouseId: params.warehouseId,
                    quantity: params.quantity.toString(),
                    reasonCode: params.reason,
                    referenceType: params.referenceType,
                    referenceId: params.referenceId,
                    notes: params.notes,
                    createdBy: params.createdBy,
                })
                .returning()

            // 5. Update snapshot within same transaction
            await updateSnapshotInTx(tx, params.productId, params.warehouseId)

            return success(transaction)
        } catch (error) {
            if (isDuplicateKeyError(error)) {
                return failure({
                    code: "DUPLICATE_TRANSACTION",
                    referenceType: params.referenceType,
                    referenceId: params.referenceId,
                })
            }
            throw error
        }
    })
}
```

### 4.3 Stock Calculation

```typescript
/**
 * Compute current stock from ledger
 *
 * This is the canonical way to calculate stock.
 * Snapshots are just a cache of this calculation.
 */
async function computeOnHandStock(
    tx: Transaction,
    productId: string,
    warehouseId: string
): Promise<number> {
    const result = await tx.execute(sql`
    SELECT COALESCE(SUM(
      CASE 
        WHEN io.direction = 'INCREASE' THEN it.quantity
        ELSE -it.quantity
      END
    ), 0) as on_hand
    FROM inventory_transactions it
    JOIN inventory_reasons ir ON ir.code = it.reason_code
    JOIN inventory_operations io ON io.code = ir.operation_code
    WHERE it.product_id = ${productId}
      AND it.warehouse_id = ${warehouseId}
  `)

    return parseFloat(result.rows[0]?.on_hand || "0")
}

/**
 * Compute reserved stock from active reservations
 */
async function computeReservedStock(
    tx: Transaction,
    productId: string,
    warehouseId: string
): Promise<number> {
    const result = await tx.execute(sql`
    SELECT COALESCE(SUM(quantity), 0) as reserved
    FROM inventory_reservations
    WHERE product_id = ${productId}
      AND warehouse_id = ${warehouseId}
      AND status = 'ACTIVE'
  `)

    return parseFloat(result.rows[0]?.reserved || "0")
}

/**
 * Compute available stock (on_hand - reserved)
 */
async function computeAvailableStock(
    tx: Transaction,
    productId: string,
    warehouseId: string
): Promise<number> {
    const onHand = await computeOnHandStock(tx, productId, warehouseId)
    const reserved = await computeReservedStock(tx, productId, warehouseId)
    return onHand - reserved
}
```

---

## 5. Reservation Management

### 5.1 Create Reservation

```typescript
/**
 * Reserve stock for an order
 *
 * Flow:
 * 1. Validate inputs
 * 2. Check available stock
 * 3. Create reservation
 * 4. Update snapshot
 *
 * NOTE: Reservation does NOT create ledger entry
 */
async function reserve(
    params: ReserveParams
): Promise<Result<InventoryReservation, InventoryError>> {
    if (params.quantity <= 0) {
        return failure({
            code: "INVALID_QUANTITY",
            message: "Quantity must be positive",
        })
    }

    return await db.transaction(async (tx) => {
        // Lock snapshot for consistency
        const available = await computeAvailableStock(
            tx,
            params.productId,
            params.warehouseId
        )

        if (available < params.quantity) {
            return failure({
                code: "INSUFFICIENT_STOCK",
                available,
                requested: params.quantity,
            })
        }

        // Create reservation
        const [reservation] = await tx
            .insert(inventoryReservations)
            .values({
                productId: params.productId,
                warehouseId: params.warehouseId,
                quantity: params.quantity.toString(),
                orderId: params.orderId,
                status: "ACTIVE",
                expiresAt: params.expiresAt,
            })
            .returning()

        // Update snapshot
        await updateSnapshotInTx(tx, params.productId, params.warehouseId)

        return success(reservation)
    })
}
```

### 5.2 Release Reservation

```typescript
/**
 * Release a reservation (order cancelled)
 *
 * Flow:
 * 1. Find reservation
 * 2. Verify it's ACTIVE
 * 3. Mark as RELEASED
 * 4. Update snapshot
 */
async function releaseReservation(
    reservationId: string
): Promise<Result<void, InventoryError>> {
    return await db.transaction(async (tx) => {
        const [reservation] = await tx
            .select()
            .from(inventoryReservations)
            .where(eq(inventoryReservations.id, reservationId))
            .for("update")

        if (!reservation) {
            return failure({ code: "RESERVATION_NOT_FOUND", reservationId })
        }

        if (reservation.status !== "ACTIVE") {
            // Already released or consumed - idempotent
            return success(undefined)
        }

        await tx
            .update(inventoryReservations)
            .set({ status: "RELEASED", updatedAt: new Date() })
            .where(eq(inventoryReservations.id, reservationId))

        await updateSnapshotInTx(
            tx,
            reservation.productId,
            reservation.warehouseId
        )

        return success(undefined)
    })
}
```

### 5.3 Consume Reservation

```typescript
/**
 * Consume reservation and debit inventory (shipment created)
 *
 * Flow:
 * 1. Find reservation
 * 2. Verify it's ACTIVE
 * 3. Mark as CONSUMED
 * 4. Create DEBIT ledger entry
 * 5. Update snapshot
 *
 * This is an atomic operation - either both happen or neither
 */
async function consumeReservation(
    params: ConsumeReservationParams
): Promise<Result<InventoryTransaction, InventoryError>> {
    return await db.transaction(async (tx) => {
        // 1. Lock and fetch reservation
        const [reservation] = await tx
            .select()
            .from(inventoryReservations)
            .where(eq(inventoryReservations.id, params.reservationId))
            .for("update")

        if (!reservation) {
            return failure({
                code: "RESERVATION_NOT_FOUND",
                reservationId: params.reservationId,
            })
        }

        // 2. Check status
        if (reservation.status === "CONSUMED") {
            return failure({
                code: "RESERVATION_ALREADY_CONSUMED",
                reservationId: params.reservationId,
            })
        }

        if (reservation.status === "RELEASED") {
            // Edge case: reservation was released but shipment still trying to consume
            return failure({
                code: "RESERVATION_NOT_FOUND",
                reservationId: params.reservationId,
            })
        }

        // 3. Mark as consumed
        await tx
            .update(inventoryReservations)
            .set({ status: "CONSUMED", updatedAt: new Date() })
            .where(eq(inventoryReservations.id, params.reservationId))

        // 4. Create debit entry
        const [transaction] = await tx
            .insert(inventoryTransactions)
            .values({
                productId: reservation.productId,
                warehouseId: reservation.warehouseId,
                quantity: reservation.quantity,
                reasonCode: "SHIPMENT",
                referenceType: "SHIPMENT",
                referenceId: params.shipmentId,
                notes: `Consumed reservation ${reservation.id}`,
            })
            .returning()

        // 5. Update snapshot
        await updateSnapshotInTx(
            tx,
            reservation.productId,
            reservation.warehouseId
        )

        return success(transaction)
    })
}
```

---

## 6. Snapshot Management

### 6.1 Update Snapshot

```typescript
/**
 * Update or create snapshot for a product/warehouse
 *
 * This can be called:
 * - After every transaction (real-time)
 * - On a schedule (batch)
 * - On-demand (rebuild)
 */
async function updateSnapshotInTx(
    tx: Transaction,
    productId: string,
    warehouseId: string
): Promise<void> {
    const onHand = await computeOnHandStock(tx, productId, warehouseId)
    const reserved = await computeReservedStock(tx, productId, warehouseId)
    const available = onHand - reserved

    // Get the latest transaction ID for auditing
    const [latestTx] = await tx
        .select({ id: inventoryTransactions.id })
        .from(inventoryTransactions)
        .where(
            and(
                eq(inventoryTransactions.productId, productId),
                eq(inventoryTransactions.warehouseId, warehouseId)
            )
        )
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(1)

    await tx
        .insert(inventorySnapshots)
        .values({
            productId,
            warehouseId,
            onHandQty: onHand.toString(),
            reservedQty: reserved.toString(),
            availableQty: available.toString(),
            lastTransactionId: latestTx?.id,
            updatedAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [
                inventorySnapshots.productId,
                inventorySnapshots.warehouseId,
            ],
            set: {
                onHandQty: onHand.toString(),
                reservedQty: reserved.toString(),
                availableQty: available.toString(),
                lastTransactionId: latestTx?.id,
                updatedAt: new Date(),
            },
        })
}
```

### 6.2 Rebuild All Snapshots

```typescript
/**
 * Rebuild all snapshots from ledger
 *
 * Use cases:
 * - Data recovery
 * - Scheduled reconciliation
 * - After bulk imports
 */
async function rebuildSnapshots(): Promise<void> {
    // Get all unique product/warehouse combinations
    const combinations = await db.execute(sql`
    SELECT DISTINCT product_id, warehouse_id
    FROM inventory_transactions
    UNION
    SELECT DISTINCT product_id, warehouse_id
    FROM inventory_reservations
    WHERE status = 'ACTIVE'
  `)

    // Rebuild each in batches
    for (const row of combinations.rows) {
        await db.transaction(async (tx) => {
            await updateSnapshotInTx(tx, row.product_id, row.warehouse_id)
        })
    }
}
```

---

## 7. API Endpoints

### 7.1 Stock Endpoints

```typescript
// GET /api/inventory/stock/:productId
// Get stock levels for a product across all warehouses

interface GetStockResponse {
    productId: string
    sku: string
    productName: string
    stockLevels: StockLevel[]
    totalOnHand: number
    totalReserved: number
    totalAvailable: number
}
```

```typescript
// GET /api/inventory/stock/:productId/:warehouseId
// Get stock at specific warehouse

interface GetStockAtWarehouseResponse {
    productId: string
    warehouseId: string
    onHandQty: number
    reservedQty: number
    availableQty: number
    lastUpdated: string
}
```

### 7.2 Transaction Endpoints

```typescript
// POST /api/inventory/transactions/receipt
// Record goods receipt

interface CreateReceiptRequest {
    productId: string
    warehouseId: string
    quantity: number
    purchaseOrderId?: string
    notes?: string
}

interface CreateReceiptResponse {
    transactionId: string
    newOnHandQty: number
    newAvailableQty: number
}
```

```typescript
// POST /api/inventory/transactions/adjustment
// Record manual adjustment

interface CreateAdjustmentRequest {
    productId: string
    warehouseId: string
    quantity: number
    type: "INCREASE" | "DECREASE"
    reason: string
    notes?: string
}
```

```typescript
// GET /api/inventory/transactions
// List transactions with filters

interface ListTransactionsRequest {
    productId?: string
    warehouseId?: string
    reasonCode?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}
```

### 7.3 Reservation Endpoints

```typescript
// GET /api/inventory/reservations
// List active reservations

interface ListReservationsRequest {
    productId?: string
    warehouseId?: string
    orderId?: string
    status?: "ACTIVE" | "CONSUMED" | "RELEASED"
    page?: number
    limit?: number
}
```

---

## 8. Edge Cases & Error Handling

### 8.1 Concurrent Reservation Attempts

**Scenario**: Two orders try to reserve the last 5 units simultaneously.

**Solution**:

- Use `SELECT FOR UPDATE` on snapshot row
- First transaction wins, second gets `INSUFFICIENT_STOCK`

```typescript
// Transaction 1: Locks snapshot, reserves 5 units ✓
// Transaction 2: Waits for lock, then sees 0 available ✗
```

### 8.2 Duplicate Transaction Prevention

**Scenario**: Retry creates duplicate ledger entry.

**Solution**:

- Unique constraint on `(reference_type, reference_id, product_id)`
- Return existing transaction on duplicate attempt

```typescript
try {
  await db.insert(inventoryTransactions).values(...)
} catch (error) {
  if (isDuplicateKeyError(error)) {
    // Return success - idempotent
    const existing = await findByReference(referenceType, referenceId, productId)
    return success(existing)
  }
}
```

### 8.3 Reservation Expiration

**Scenario**: Customer abandons cart, reservation expires.

**Solution**:

- Scheduled job runs every 5 minutes
- Releases expired reservations
- Updates snapshots

```typescript
async function expireReservations(): Promise<number> {
    const expired = await db
        .update(inventoryReservations)
        .set({ status: "RELEASED", updatedAt: new Date() })
        .where(
            and(
                eq(inventoryReservations.status, "ACTIVE"),
                lt(inventoryReservations.expiresAt, new Date())
            )
        )
        .returning()

    // Update snapshots for affected products
    for (const reservation of expired) {
        await updateSnapshot(reservation.productId, reservation.warehouseId)
    }

    return expired.length
}
```

### 8.4 Stock Reconciliation

**Scenario**: Snapshot diverges from ledger due to bug.

**Solution**:

- Scheduled reconciliation job
- Compares snapshot to ledger calculation
- Logs discrepancies, auto-fixes if configured

```typescript
async function reconcileSnapshots(): Promise<ReconciliationReport> {
    const discrepancies: Discrepancy[] = []

    const snapshots = await db.select().from(inventorySnapshots)

    for (const snapshot of snapshots) {
        const computed = await computeOnHandStock(
            db,
            snapshot.productId,
            snapshot.warehouseId
        )
        const stored = parseFloat(snapshot.onHandQty)

        if (Math.abs(computed - stored) > 0.0001) {
            discrepancies.push({
                productId: snapshot.productId,
                warehouseId: snapshot.warehouseId,
                computed,
                stored,
                difference: computed - stored,
            })
        }
    }

    return { discrepancies, checked: snapshots.length }
}
```

### 8.5 Preventing Negative Stock

**Multiple layers of protection**:

1. **Application check**: Verify available >= requested before DEBIT
2. **Transaction isolation**: `SELECT FOR UPDATE` prevents race conditions
3. **Database check constraint** (optional): Add trigger to prevent negative

```sql
-- Optional: Database-level protection
CREATE OR REPLACE FUNCTION check_non_negative_stock()
RETURNS TRIGGER AS $$
DECLARE
  current_stock NUMERIC;
BEGIN
  -- Calculate stock after this transaction
  SELECT COALESCE(SUM(
    CASE WHEN io.direction = 'INCREASE' THEN it.quantity ELSE -it.quantity END
  ), 0)
  INTO current_stock
  FROM inventory_transactions it
  JOIN inventory_reasons ir ON ir.code = it.reason_code
  JOIN inventory_operations io ON io.code = ir.operation_code
  WHERE it.product_id = NEW.product_id AND it.warehouse_id = NEW.warehouse_id;

  IF current_stock < 0 THEN
    RAISE EXCEPTION 'Stock cannot go negative';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 9. Validation Schemas

```typescript
// src/lib/validators/inventory.ts

import { z } from "zod"

export const topUpSchema = z.object({
    productId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    quantity: z.number().positive("Quantity must be positive"),
    reason: z.enum(["RECEIPT", "RETURN", "TRANSFER_IN", "ADJUSTMENT_CREDIT"]),
    referenceType: z.string().min(1),
    referenceId: z.string().uuid(),
    notes: z.string().max(500).optional(),
})

export const debitSchema = z.object({
    productId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    quantity: z.number().positive("Quantity must be positive"),
    reason: z.enum(["SHIPMENT", "DAMAGE", "TRANSFER_OUT", "ADJUSTMENT_DEBIT"]),
    referenceType: z.string().min(1),
    referenceId: z.string().uuid(),
    notes: z.string().max(500).optional(),
})

export const reserveSchema = z.object({
    productId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    quantity: z.number().positive("Quantity must be positive"),
    orderId: z.string().uuid(),
    expiresAt: z.coerce.date().optional(),
})
```

---

## 10. Testing Strategy

### Unit Tests

```typescript
describe("InventoryService", () => {
    describe("topUp", () => {
        it("should create transaction and update snapshot")
        it("should reject negative quantity")
        it("should reject non-existent product")
        it("should be idempotent on duplicate")
    })

    describe("debit", () => {
        it("should debit when sufficient stock")
        it("should reject when insufficient stock")
        it("should handle concurrent debits correctly")
        it("should be idempotent on duplicate")
    })

    describe("reserve", () => {
        it("should create reservation when stock available")
        it("should reduce available stock")
        it("should reject when insufficient available")
        it("should prevent double-reservation for same order+product")
    })

    describe("consumeReservation", () => {
        it("should mark reservation as consumed")
        it("should create debit transaction")
        it("should reject already-consumed reservation")
    })
})
```

### Integration Tests

```typescript
describe("Inventory Flow", () => {
    it("should handle receipt → reserve → ship flow")
    it("should handle reserve → cancel flow")
    it("should handle concurrent reservation attempts")
    it("should rebuild snapshots correctly")
})
```

---

## 11. Monitoring & Alerts

### Key Metrics

| Metric                          | Description             | Alert Threshold |
| ------------------------------- | ----------------------- | --------------- |
| `inventory.transaction.count`   | Transactions per minute | > 1000/min      |
| `inventory.reservation.active`  | Active reservations     | > 10000         |
| `inventory.reservation.expired` | Expired per hour        | > 100/hour      |
| `inventory.snapshot.drift`      | Snapshot vs ledger diff | > 0             |
| `inventory.negative.attempts`   | Blocked negative stock  | > 0             |

### Logging

```typescript
// Log all inventory mutations
logger.info("inventory.topUp", {
    transactionId,
    productId,
    warehouseId,
    quantity,
    reason,
    referenceType,
    referenceId,
    newOnHand,
    newAvailable,
    userId,
})

logger.info("inventory.debit", {
    transactionId,
    productId,
    warehouseId,
    quantity,
    reason,
    previousAvailable,
    newAvailable,
    userId,
})

logger.warn("inventory.insufficientStock", {
    productId,
    warehouseId,
    requested,
    available,
    orderId,
})
```

---

## Related Documents

- [01-system-overview.md](./01-system-overview.md) - System architecture
- [02-database-schema.md](./02-database-schema.md) - Database schema
- [04-order-fulfillment-service.md](./04-order-fulfillment-service.md) - Order & fulfillment flows
- [05-tracking-service.md](./05-tracking-service.md) - Public tracking system
- [06-effort-estimation.md](./06-effort-estimation.md) - Delivery timeline
