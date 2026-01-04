// Centralized table names for type safety and reusability
export const TABLE_NAMES = {
    USERS: "users",
} as const

export type TableName = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES]
