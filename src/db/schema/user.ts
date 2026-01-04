import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core"
import { baseModel } from "./base"
import { TABLE_NAMES } from "./tables"
import { Role } from "@/types/role"

// Define pg enum from TypeScript enum for user roles
export const userRoleEnum = pgEnum(
    "user_role",
    Object.values(Role) as [string, ...string[]]
)

export const users = pgTable(TABLE_NAMES.USERS, {
    ...baseModel,
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: userRoleEnum("role").$type<Role>().notNull(),
})

export type UserSchema = typeof users.$inferSelect
export type InsertUserSchema = typeof users.$inferInsert
