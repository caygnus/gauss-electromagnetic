import { char, timestamp } from "drizzle-orm/pg-core"
import { ulid } from "ulid"

// Base mixin with common columns for all tables
export const baseModel = {
    id: char("id", { length: 26 })
        .primaryKey()
        .$defaultFn(() => ulid()),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    createdBy: char("created_by", { length: 26 }),
    updatedBy: char("updated_by", { length: 26 }),
}
