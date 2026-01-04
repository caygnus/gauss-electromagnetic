// Role types for the application
export enum UserRole {
    SYSTEM = "system",
    ADMIN = "admin",
    USER = "user",
    CUSTOMER = "customer",
}

// Permission types
export enum Permission {
    // Users
    USERS_READ = "users:read",
    USERS_WRITE = "users:write",
    USERS_DELETE = "users:delete",
    // Orders
    ORDERS_READ = "orders:read",
    ORDERS_WRITE = "orders:write",
    ORDERS_DELETE = "orders:delete",
    // Inventory
    INVENTORY_READ = "inventory:read",
    INVENTORY_WRITE = "inventory:write",
    // Settings
    SETTINGS_READ = "settings:read",
    SETTINGS_WRITE = "settings:write",
}

// Authority levels (higher = more authority)
export const RoleAuthority: Record<UserRole, number> = {
    [UserRole.SYSTEM]: 100,
    [UserRole.ADMIN]: 80,
    [UserRole.USER]: 50,
    [UserRole.CUSTOMER]: 10,
}

// Permissions per role
export const RolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.SYSTEM]: [
        Permission.USERS_READ,
        Permission.USERS_WRITE,
        Permission.USERS_DELETE,
        Permission.ORDERS_READ,
        Permission.ORDERS_WRITE,
        Permission.ORDERS_DELETE,
        Permission.INVENTORY_READ,
        Permission.INVENTORY_WRITE,
        Permission.SETTINGS_READ,
        Permission.SETTINGS_WRITE,
    ],

    [UserRole.ADMIN]: [
        Permission.USERS_READ,
        Permission.USERS_WRITE,
        Permission.ORDERS_READ,
        Permission.ORDERS_WRITE,
        Permission.ORDERS_DELETE,
        Permission.INVENTORY_READ,
        Permission.INVENTORY_WRITE,
        Permission.SETTINGS_READ,
    ],

    [UserRole.USER]: [
        Permission.ORDERS_READ,
        Permission.ORDERS_WRITE,
        Permission.INVENTORY_READ,
    ],

    [UserRole.CUSTOMER]: [Permission.ORDERS_READ],
}

// Helper functions
export const hasPermission = (
    role: UserRole,
    permission: Permission
): boolean => {
    return RolePermissions[role].includes(permission)
}

export const hasAuthority = (
    role: UserRole,
    requiredRole: UserRole
): boolean => {
    return RoleAuthority[role] >= RoleAuthority[requiredRole]
}

export const canManageRole = (
    actorRole: UserRole,
    targetRole: UserRole
): boolean => {
    // Can only manage roles with lower authority
    return RoleAuthority[actorRole] > RoleAuthority[targetRole]
}
