# Tracking Service - Public Tracking System

## Document Information

| Field        | Value           |
| ------------ | --------------- |
| Version      | 1.0             |
| Status       | Draft           |
| Last Updated | January 2026    |
| Service      | TrackingService |

---

## 1. Overview

The Tracking Service provides public package tracking, similar to Amazon/BlueDart/Delhivery.

### Key Characteristics

| Aspect         | Requirement                |
| -------------- | -------------------------- |
| Authentication | None required              |
| PII Exposure   | None (no customer data)    |
| Performance    | < 200ms response time      |
| Availability   | 99.9% uptime               |
| Caching        | Aggressive (30-60 seconds) |

### Core Principle

```
Tracking is a READ-ONLY, PUBLIC interface to shipment events.
```

---

## 2. Service Interface

```typescript
// src/lib/services/tracking/tracking.service.ts

interface TrackingService {
    // ─────────────────────────────────────────────────────────
    // Public API (no authentication required)
    // ─────────────────────────────────────────────────────────

    /**
     * Get public tracking information
     * Returns sanitized data (no PII)
     */
    getTrackingInfo(trackingNumber: string): Promise<PublicTrackingInfo | null>

    // ─────────────────────────────────────────────────────────
    // Internal Operations
    // ─────────────────────────────────────────────────────────

    /**
     * Generate unique tracking number
     */
    generateTrackingNumber(): string

    /**
     * Process carrier webhook update
     */
    processCarrierWebhook(payload: CarrierWebhookPayload): Promise<void>

    /**
     * Get tracking info (internal - includes all data)
     */
    getFullTrackingInfo(shipmentId: string): Promise<ShipmentWithEvents | null>
}
```

---

## 3. Data Types

### 3.1 Public Response Types

```typescript
// src/lib/services/tracking/types.ts

/**
 * Public tracking response - NO PII
 */
interface PublicTrackingInfo {
    trackingNumber: string
    status: TrackingStatus
    statusDescription: string

    // Origin/destination (city level only - no addresses)
    origin: {
        city: string
        state: string
    }
    destination: {
        city: string
        state: string
    }

    // Carrier info
    carrier?: string
    carrierTrackingNumber?: string
    carrierTrackingUrl?: string

    // Dates
    shippedAt?: string
    estimatedDelivery?: string
    deliveredAt?: string

    // Event timeline
    events: TrackingEvent[]

    // Last updated timestamp
    lastUpdated: string
}

/**
 * Public tracking event
 */
interface TrackingEvent {
    type: TrackingEventType
    title: string
    description?: string
    location?: string
    timestamp: string
}

/**
 * Simplified status for customers
 */
type TrackingStatus =
    | "PREPARING" // Created, picking, packing
    | "SHIPPED" // Dispatched
    | "IN_TRANSIT" // Moving through network
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "EXCEPTION" // Failed, returning, etc.

/**
 * Event types
 */
type TrackingEventType =
    | "ORDER_PLACED"
    | "PREPARING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "AT_FACILITY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "DELIVERY_ATTEMPTED"
    | "EXCEPTION"
```

### 3.2 Internal Types

```typescript
/**
 * Carrier webhook payload (varies by carrier)
 */
interface CarrierWebhookPayload {
    carrier: string
    trackingNumber: string
    event: {
        type: string
        description: string
        location?: string
        timestamp: string
        eventId: string
    }
    rawPayload: unknown
}

/**
 * Full shipment with events (internal use)
 */
interface ShipmentWithEvents {
    shipment: Shipment
    events: ShipmentEvent[]
    order: {
        orderNumber: string
        customerName: string
        shippingAddress: string
    }
}
```

---

## 4. Business Logic

### 4.1 Get Public Tracking Info

```typescript
/**
 * Get public tracking information
 *
 * Flow:
 * 1. Look up shipment by tracking number
 * 2. Get all events
 * 3. Sanitize data (remove PII)
 * 4. Map to public format
 */
async function getTrackingInfo(
    trackingNumber: string
): Promise<PublicTrackingInfo | null> {
    // 1. Find shipment
    const shipment = await db.query.shipments.findFirst({
        where: eq(shipments.trackingNumber, trackingNumber),
        with: {
            order: true,
            warehouse: true,
            events: {
                orderBy: [desc(shipmentEvents.occurredAt)],
            },
        },
    })

    if (!shipment) {
        return null
    }

    // 2. Map status to customer-friendly version
    const status = mapToPublicStatus(shipment.status)

    // 3. Build public response (NO PII)
    return {
        trackingNumber: shipment.trackingNumber,
        status,
        statusDescription: getStatusDescription(status),

        origin: {
            city: shipment.warehouse.city,
            state: shipment.warehouse.state,
        },
        destination: {
            city: shipment.order.shippingCity,
            state: shipment.order.shippingState,
        },

        carrier: shipment.carrier,
        carrierTrackingNumber: shipment.carrierTrackingNumber,
        carrierTrackingUrl: buildCarrierTrackingUrl(
            shipment.carrier,
            shipment.carrierTrackingNumber
        ),

        shippedAt: shipment.dispatchedAt?.toISOString(),
        estimatedDelivery: shipment.estimatedDeliveryDate?.toISOString(),
        deliveredAt: shipment.deliveredAt?.toISOString(),

        events: shipment.events.map(mapToPublicEvent),

        lastUpdated: new Date().toISOString(),
    }
}

/**
 * Map internal status to public status
 */
function mapToPublicStatus(status: ShipmentStatus): TrackingStatus {
    const mapping: Record<ShipmentStatus, TrackingStatus> = {
        CREATED: "PREPARING",
        PICKING: "PREPARING",
        PACKED: "PREPARING",
        DISPATCHED: "SHIPPED",
        IN_TRANSIT: "IN_TRANSIT",
        AT_HUB: "IN_TRANSIT",
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
        DELIVERED: "DELIVERED",
        FAILED: "EXCEPTION",
        RETURNING: "EXCEPTION",
        RETURNED: "EXCEPTION",
    }
    return mapping[status] || "PREPARING"
}

/**
 * Map internal event to public event
 */
function mapToPublicEvent(event: ShipmentEvent): TrackingEvent {
    return {
        type: mapEventType(event.eventType),
        title: getEventTitle(event.eventType),
        description: event.description,
        location: event.location,
        timestamp: event.occurredAt.toISOString(),
    }
}

/**
 * Get customer-friendly event title
 */
function getEventTitle(eventType: ShipmentEventType): string {
    const titles: Record<ShipmentEventType, string> = {
        CREATED: "Order confirmed",
        PICKING_STARTED: "Preparing your order",
        PACKED: "Package ready",
        DISPATCHED: "Shipped",
        IN_TRANSIT: "In transit",
        AT_HUB: "At sorting facility",
        OUT_FOR_DELIVERY: "Out for delivery",
        DELIVERY_ATTEMPTED: "Delivery attempted",
        DELIVERED: "Delivered",
        DELIVERY_FAILED: "Delivery issue",
        RETURNING: "Returning to sender",
        RETURNED: "Returned",
    }
    return titles[eventType] || eventType
}

/**
 * Get status description
 */
function getStatusDescription(status: TrackingStatus): string {
    const descriptions: Record<TrackingStatus, string> = {
        PREPARING: "Your order is being prepared for shipment",
        SHIPPED: "Your package has been shipped",
        IN_TRANSIT: "Your package is on its way",
        OUT_FOR_DELIVERY: "Your package will be delivered today",
        DELIVERED: "Your package has been delivered",
        EXCEPTION: "There's an issue with your delivery",
    }
    return descriptions[status]
}
```

### 4.2 Carrier Webhook Processing

```typescript
/**
 * Process carrier webhook
 *
 * Flow:
 * 1. Validate webhook signature (carrier-specific)
 * 2. Find shipment by carrier tracking number
 * 3. Map carrier event to internal event
 * 4. Insert event (idempotent)
 * 5. Update shipment status if needed
 */
async function processCarrierWebhook(
    payload: CarrierWebhookPayload
): Promise<void> {
    // 1. Find shipment
    const shipment = await db.query.shipments.findFirst({
        where: eq(shipments.carrierTrackingNumber, payload.trackingNumber),
    })

    if (!shipment) {
        // Log but don't fail - might be for a different system
        logger.warn("carrier.webhook.shipmentNotFound", {
            carrier: payload.carrier,
            trackingNumber: payload.trackingNumber,
        })
        return
    }

    // 2. Map carrier event to internal event type
    const eventType = mapCarrierEventType(payload.carrier, payload.event.type)

    // 3. Insert event (idempotent via external_event_id)
    try {
        await db.insert(shipmentEvents).values({
            shipmentId: shipment.id,
            eventType,
            description: payload.event.description,
            location: payload.event.location,
            occurredAt: new Date(payload.event.timestamp),
            source: "CARRIER",
            externalEventId: payload.event.eventId,
        })
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            // Already processed - idempotent success
            logger.debug("carrier.webhook.duplicate", {
                shipmentId: shipment.id,
                eventId: payload.event.eventId,
            })
            return
        }
        throw error
    }

    // 4. Update shipment status
    const newStatus = mapEventToStatus(eventType)
    if (newStatus && shouldUpdateStatus(shipment.status, newStatus)) {
        await db
            .update(shipments)
            .set({
                status: newStatus,
                updatedAt: new Date(),
                ...(newStatus === "DELIVERED" && {
                    deliveredAt: new Date(payload.event.timestamp),
                }),
            })
            .where(eq(shipments.id, shipment.id))

        // If delivered, update order status
        if (newStatus === "DELIVERED") {
            await checkOrderDeliveryStatus(shipment.orderId)
        }
    }

    logger.info("carrier.webhook.processed", {
        shipmentId: shipment.id,
        carrier: payload.carrier,
        eventType,
        location: payload.event.location,
    })
}

/**
 * Map carrier-specific event type to internal event type
 */
function mapCarrierEventType(
    carrier: string,
    carrierEventType: string
): ShipmentEventType {
    // BlueDart example mapping
    if (carrier === "BLUEDART") {
        const mapping: Record<string, ShipmentEventType> = {
            PKP: "DISPATCHED",
            IT: "IN_TRANSIT",
            OFD: "OUT_FOR_DELIVERY",
            DL: "DELIVERED",
            NDR: "DELIVERY_FAILED",
        }
        return mapping[carrierEventType] || "IN_TRANSIT"
    }

    // Delhivery example mapping
    if (carrier === "DELHIVERY") {
        const mapping: Record<string, ShipmentEventType> = {
            Manifested: "DISPATCHED",
            "In Transit": "IN_TRANSIT",
            "Reached Destination Hub": "AT_HUB",
            "Out for Delivery": "OUT_FOR_DELIVERY",
            Delivered: "DELIVERED",
            Undelivered: "DELIVERY_FAILED",
        }
        return mapping[carrierEventType] || "IN_TRANSIT"
    }

    // Default mapping
    return "IN_TRANSIT"
}

/**
 * Check if status should be updated
 * Prevents status regression (e.g., DELIVERED → IN_TRANSIT)
 */
function shouldUpdateStatus(
    currentStatus: ShipmentStatus,
    newStatus: ShipmentStatus
): boolean {
    const statusOrder: ShipmentStatus[] = [
        "CREATED",
        "PICKING",
        "PACKED",
        "DISPATCHED",
        "IN_TRANSIT",
        "AT_HUB",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
    ]

    // Exception statuses can happen at any time
    const exceptionStatuses: ShipmentStatus[] = [
        "FAILED",
        "RETURNING",
        "RETURNED",
    ]
    if (exceptionStatuses.includes(newStatus)) {
        return currentStatus !== "DELIVERED" // Can't fail after delivered
    }

    const currentIndex = statusOrder.indexOf(currentStatus)
    const newIndex = statusOrder.indexOf(newStatus)

    return newIndex > currentIndex
}
```

### 4.3 Tracking Number Generation

```typescript
/**
 * Generate unique tracking number
 * Format: GEM-XXXX-XXXX
 *
 * Properties:
 * - Human readable
 * - Easy to communicate verbally
 * - Case insensitive
 * - Collision resistant
 */
function generateTrackingNumber(): string {
    // Use nanoid with custom alphabet (no confusing chars)
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // No I, O, 0, 1
    const part1 = customAlphabet(alphabet, 4)()
    const part2 = customAlphabet(alphabet, 4)()

    return `GEM-${part1}-${part2}`
}

// Examples:
// GEM-A7X2-K9M4
// GEM-3BNP-H2T6
// GEM-W5QR-J8Y3
```

---

## 5. API Endpoints

### 5.1 Public Tracking Endpoint

```typescript
// GET /api/track/:trackingNumber
// Public endpoint - NO authentication required

// Route handler
// src/app/api/track/[trackingNumber]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { trackingService } from "@/lib/services/tracking"

export async function GET(
    request: NextRequest,
    { params }: { params: { trackingNumber: string } }
) {
    const { trackingNumber } = params

    // Validate format
    if (!isValidTrackingNumber(trackingNumber)) {
        return NextResponse.json(
            { error: "Invalid tracking number format" },
            { status: 400 }
        )
    }

    // Get tracking info
    const info = await trackingService.getTrackingInfo(
        trackingNumber.toUpperCase()
    )

    if (!info) {
        return NextResponse.json(
            { error: "Tracking number not found" },
            { status: 404 }
        )
    }

    // Return with cache headers
    return NextResponse.json(info, {
        headers: {
            "Cache-Control": "public, max-age=60, s-maxage=60",
            "CDN-Cache-Control": "public, max-age=60",
        },
    })
}

function isValidTrackingNumber(tracking: string): boolean {
    // GEM-XXXX-XXXX format
    return /^GEM-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(tracking)
}
```

### 5.2 Response Example

```json
{
    "trackingNumber": "GEM-A7X2-K9M4",
    "status": "IN_TRANSIT",
    "statusDescription": "Your package is on its way",
    "origin": {
        "city": "Mumbai",
        "state": "Maharashtra"
    },
    "destination": {
        "city": "Bangalore",
        "state": "Karnataka"
    },
    "carrier": "BlueDart",
    "carrierTrackingNumber": "12345678901",
    "carrierTrackingUrl": "https://www.bluedart.com/tracking?number=12345678901",
    "shippedAt": "2026-01-02T10:30:00Z",
    "estimatedDelivery": "2026-01-05T18:00:00Z",
    "events": [
        {
            "type": "IN_TRANSIT",
            "title": "In transit",
            "description": "Package arrived at sorting facility",
            "location": "Pune Hub",
            "timestamp": "2026-01-03T14:22:00Z"
        },
        {
            "type": "SHIPPED",
            "title": "Shipped",
            "description": "Package picked up by carrier",
            "location": "Mumbai Warehouse",
            "timestamp": "2026-01-02T10:30:00Z"
        },
        {
            "type": "PREPARING",
            "title": "Preparing your order",
            "description": "Order is being prepared",
            "timestamp": "2026-01-01T15:00:00Z"
        }
    ],
    "lastUpdated": "2026-01-03T14:30:00Z"
}
```

### 5.3 Carrier Webhook Endpoints

```typescript
// POST /api/webhooks/carrier/bluedart
// POST /api/webhooks/carrier/delhivery
// etc.

// Route handler example
// src/app/api/webhooks/carrier/[carrier]/route.ts

export async function POST(
    request: NextRequest,
    { params }: { params: { carrier: string } }
) {
    const { carrier } = params

    // Validate webhook signature
    const signature = request.headers.get("x-webhook-signature")
    const body = await request.text()

    if (!verifyWebhookSignature(carrier, body, signature)) {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        )
    }

    // Parse and process
    const payload = parseCarrierPayload(carrier, JSON.parse(body))

    // Process async (respond quickly to webhook)
    // In production, queue this for async processing
    await trackingService.processCarrierWebhook(payload)

    return NextResponse.json({ success: true })
}
```

---

## 6. Public Tracking UI

### 6.1 Page Structure

```typescript
// src/app/track/[trackingNumber]/page.tsx

interface TrackingPageProps {
  params: { trackingNumber: string }
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { trackingNumber } = params

  // Fetch tracking info (server component)
  const tracking = await trackingService.getTrackingInfo(trackingNumber)

  if (!tracking) {
    return <TrackingNotFound trackingNumber={trackingNumber} />
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <TrackingHeader tracking={tracking} />
      <TrackingStatus tracking={tracking} />
      <TrackingTimeline events={tracking.events} />
      <TrackingDetails tracking={tracking} />
    </div>
  )
}
```

### 6.2 UI Components

```typescript
// Tracking status card
function TrackingStatus({ tracking }: { tracking: PublicTrackingInfo }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center gap-4">
        <StatusIcon status={tracking.status} />
        <div>
          <h2 className="text-xl font-semibold">{tracking.statusDescription}</h2>
          <p className="text-gray-500">
            {tracking.status === 'DELIVERED'
              ? `Delivered on ${formatDate(tracking.deliveredAt)}`
              : tracking.estimatedDelivery
                ? `Estimated delivery: ${formatDate(tracking.estimatedDelivery)}`
                : null
            }
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <TrackingProgress status={tracking.status} />
    </div>
  )
}

// Timeline component
function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Tracking History</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <TimelineItem
            key={index}
            event={event}
            isLatest={index === 0}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 7. Caching Strategy

### 7.1 Cache Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      CACHE LAYERS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Browser Cache                                      │
│  ├─ Duration: 60 seconds                                     │
│  └─ Cache-Control: public, max-age=60                        │
│                                                              │
│  Layer 2: CDN/Edge Cache (Vercel, Cloudflare)               │
│  ├─ Duration: 60 seconds                                     │
│  └─ s-maxage=60, stale-while-revalidate                     │
│                                                              │
│  Layer 3: Application Cache (Redis - optional)              │
│  ├─ Duration: 30 seconds                                     │
│  └─ Key: tracking:{trackingNumber}                          │
│                                                              │
│  Layer 4: Database Query                                     │
│  └─ Optimized with indexes                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Cache Invalidation

```typescript
// Invalidate cache when shipment status changes
async function invalidateTrackingCache(trackingNumber: string): Promise<void> {
    // If using Redis
    await redis.del(`tracking:${trackingNumber}`)

    // If using Vercel/CDN
    await fetch(`/api/revalidate?tag=tracking-${trackingNumber}`, {
        method: "POST",
    })
}

// Called after:
// - Shipment status update
// - New tracking event added
// - Carrier webhook processed
```

### 7.3 Implementation with Redis

```typescript
async function getTrackingInfo(
    trackingNumber: string
): Promise<PublicTrackingInfo | null> {
    // Try cache first
    const cacheKey = `tracking:${trackingNumber}`
    const cached = await redis.get(cacheKey)

    if (cached) {
        return JSON.parse(cached)
    }

    // Fetch from database
    const info = await fetchTrackingFromDb(trackingNumber)

    if (info) {
        // Cache for 30 seconds
        await redis.setex(cacheKey, 30, JSON.stringify(info))
    }

    return info
}
```

---

## 8. Security Considerations

### 8.1 No PII Exposure

```typescript
// NEVER include in public response:
interface NeverExpose {
    customerName: never
    customerEmail: never
    customerPhone: never
    fullAddress: never // City/state only
    orderTotal: never
    paymentInfo: never
    internalNotes: never
}

// ALWAYS sanitize before returning
function sanitizeForPublic(shipment: ShipmentWithOrder): PublicTrackingInfo {
    return {
        trackingNumber: shipment.trackingNumber,
        // City/state ONLY - no full address
        destination: {
            city: shipment.order.shippingCity,
            state: shipment.order.shippingState,
        },
        // ... other public fields
    }
}
```

### 8.2 Rate Limiting

```typescript
// Rate limit configuration
const RATE_LIMITS = {
    perIp: {
        requests: 30,
        window: 60, // seconds
    },
    perTrackingNumber: {
        requests: 10,
        window: 60,
    },
}

// Middleware example
async function rateLimitMiddleware(request: NextRequest) {
    const ip = request.ip || "unknown"
    const trackingNumber = request.nextUrl.pathname.split("/").pop()

    // Check IP limit
    const ipCount = await redis.incr(`ratelimit:ip:${ip}`)
    if (ipCount === 1) {
        await redis.expire(`ratelimit:ip:${ip}`, RATE_LIMITS.perIp.window)
    }
    if (ipCount > RATE_LIMITS.perIp.requests) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        )
    }

    // Check tracking number limit
    const trackingCount = await redis.incr(
        `ratelimit:tracking:${trackingNumber}`
    )
    if (trackingCount === 1) {
        await redis.expire(
            `ratelimit:tracking:${trackingNumber}`,
            RATE_LIMITS.perTrackingNumber.window
        )
    }
    if (trackingCount > RATE_LIMITS.perTrackingNumber.requests) {
        return NextResponse.json(
            { error: "Too many requests for this tracking number" },
            { status: 429 }
        )
    }

    return null // Continue to handler
}
```

### 8.3 Tracking Number Security

```typescript
// Tracking numbers should be:
// 1. Unguessable (not sequential)
// 2. Sufficient entropy (collision resistant)
// 3. Human readable (for customer support)

// GEM-XXXX-XXXX = 32^8 = 1.1 trillion combinations
// Sufficient for most use cases

// Additional security: Don't reveal if tracking number exists
// Return same 404 for invalid format AND not found
```

---

## 9. Carrier Integration

### 9.1 Supported Carriers

| Carrier   | Webhook Support | Polling Support | Tracking URL          |
| --------- | --------------- | --------------- | --------------------- |
| BlueDart  | Yes             | Yes             | bluedart.com/tracking |
| Delhivery | Yes             | Yes             | delhivery.com/track   |
| DTDC      | No              | Yes             | dtdc.in/tracking      |
| FedEx     | Yes             | Yes             | fedex.com/track       |

### 9.2 Carrier Webhook Registration

```typescript
// Register webhooks with carriers during setup
// Example for BlueDart

interface CarrierWebhookConfig {
    carrier: string
    webhookUrl: string
    events: string[]
    secret: string
}

const bluedartConfig: CarrierWebhookConfig = {
    carrier: "BLUEDART",
    webhookUrl: "https://gauss.com/api/webhooks/carrier/bluedart",
    events: ["PKP", "IT", "OFD", "DL", "NDR"],
    secret: process.env.BLUEDART_WEBHOOK_SECRET!,
}
```

### 9.3 Fallback: Polling

```typescript
// For carriers without webhook support
// Scheduled job to poll tracking updates

async function pollCarrierUpdates(): Promise<void> {
    // Get shipments that need polling
    const shipments = await db.query.shipments.findMany({
        where: and(
            notInArray(shipments.status, ["DELIVERED", "RETURNED"]),
            isNotNull(shipments.carrierTrackingNumber),
            // Only poll carriers without webhook support
            inArray(shipments.carrier, ["DTDC"])
        ),
    })

    for (const shipment of shipments) {
        try {
            const updates = await fetchCarrierUpdates(
                shipment.carrier,
                shipment.carrierTrackingNumber
            )

            for (const update of updates) {
                await processCarrierWebhook({
                    carrier: shipment.carrier,
                    trackingNumber: shipment.carrierTrackingNumber,
                    event: update,
                    rawPayload: update,
                })
            }
        } catch (error) {
            logger.error("carrier.poll.error", {
                shipmentId: shipment.id,
                carrier: shipment.carrier,
                error,
            })
        }
    }
}

// Run every 30 minutes
// cron: '*/30 * * * *'
```

---

## 10. Error Handling

### 10.1 Error Responses

```typescript
// Standard error responses for tracking API

interface TrackingError {
  error: string
  code: string
  trackingNumber?: string
}

// 400 - Invalid format
{
  "error": "Invalid tracking number format",
  "code": "INVALID_FORMAT"
}

// 404 - Not found
{
  "error": "Tracking information not available",
  "code": "NOT_FOUND",
  "trackingNumber": "GEM-XXXX-XXXX"
}

// 429 - Rate limited
{
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMITED"
}

// 500 - Server error (generic, no details)
{
  "error": "Unable to retrieve tracking information",
  "code": "SERVER_ERROR"
}
```

### 10.2 Graceful Degradation

```typescript
// If database is slow, return cached data even if stale
async function getTrackingInfoWithFallback(
    trackingNumber: string
): Promise<PublicTrackingInfo | null> {
    try {
        // Try fresh data with timeout
        return await Promise.race([
            getTrackingInfo(trackingNumber),
            timeout(2000), // 2 second timeout
        ])
    } catch (error) {
        // Fall back to stale cache
        const stale = await redis.get(`tracking:${trackingNumber}:stale`)
        if (stale) {
            logger.warn("tracking.usingStaleCache", { trackingNumber })
            return JSON.parse(stale)
        }
        throw error
    }
}
```

---

## 11. Testing Strategy

### Unit Tests

```typescript
describe("TrackingService", () => {
    describe("getTrackingInfo", () => {
        it("should return tracking info for valid tracking number")
        it("should return null for non-existent tracking number")
        it("should sanitize PII from response")
        it("should order events by timestamp descending")
    })

    describe("processCarrierWebhook", () => {
        it("should create event from webhook")
        it("should be idempotent on duplicate events")
        it("should update shipment status")
        it("should not regress status")
    })

    describe("mapToPublicStatus", () => {
        it("should map all internal statuses correctly")
        it("should map unknown status to PREPARING")
    })
})
```

### Integration Tests

```typescript
describe("Public Tracking API", () => {
    it("should return tracking info without authentication")
    it("should respect rate limits")
    it("should cache responses")
    it("should handle invalid tracking number format")
})
```

---

## 12. Monitoring & Logging

### Key Metrics

| Metric                      | Description             | Alert   |
| --------------------------- | ----------------------- | ------- |
| `tracking.requests`         | Requests per minute     | Trend   |
| `tracking.latency.p99`      | 99th percentile latency | > 500ms |
| `tracking.cache.hit_rate`   | Cache hit percentage    | < 80%   |
| `tracking.notFound`         | Not found rate          | > 5%    |
| `carrier.webhook.processed` | Webhooks per hour       | Trend   |
| `carrier.webhook.failed`    | Failed webhooks         | > 0     |

### Logging

```typescript
// Request logging (sanitized)
logger.info("tracking.request", {
    trackingNumber: maskTrackingNumber(trackingNumber),
    status: result?.status,
    cached: wasCached,
    latencyMs,
})

// Webhook logging
logger.info("carrier.webhook.received", {
    carrier,
    eventType,
    shipmentId,
})

// Error logging (no sensitive data)
logger.error("tracking.error", {
    trackingNumber: maskTrackingNumber(trackingNumber),
    errorCode,
})
```

---

## Related Documents

- [01-system-overview.md](./01-system-overview.md) - System architecture
- [02-database-schema.md](./02-database-schema.md) - Database schema
- [03-inventory-service.md](./03-inventory-service.md) - Inventory business logic
- [04-order-fulfillment-service.md](./04-order-fulfillment-service.md) - Order & fulfillment flows
- [06-effort-estimation.md](./06-effort-estimation.md) - Delivery timeline
