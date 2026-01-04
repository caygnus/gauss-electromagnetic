import { UserRole } from "@/types/role"
import { auth, clerkClient } from "@clerk/nextjs/server"

/**
 * Get the current user's role from Clerk privateMetadata
 * @returns The user's role, or null if not authenticated or role not set
 */
export async function getUserRole(): Promise<UserRole | undefined> {
    const { userId } = await auth()

    if (!userId) {
        return undefined
    }

    try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        const role = user.privateMetadata?.role as UserRole | undefined

        // Validate role
        if (role === UserRole.ADMIN || role === UserRole.USER) {
            return role
        }

        // Default to user if role is not set (shouldn't happen with callback)
        return UserRole.USER
    } catch (error) {
        console.error("Error getting user role:", error)
        return undefined
    }
}

/**
 * Check if the current user has a specific role
 * @param requiredRole - The role to check for
 * @returns true if user has the required role, false otherwise
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
    const role = await getUserRole()
    return role === requiredRole
}

/**
 * Check if the current user is an owner
 * @returns true if user is owner, false otherwise
 */
export async function isOwner(): Promise<boolean> {
    return hasRole(UserRole.ADMIN)
}

/**
 * Require a specific role, throws error if user doesn't have it
 * Use this in API routes or server components for RBAC
 * @param requiredRole - The role required
 * @throws Error if user doesn't have the required role
 */
export async function requireRole(requiredRole: UserRole): Promise<void> {
    const role = await getUserRole()

    if (role !== requiredRole) {
        throw new Error(
            `Access denied. Required role: ${requiredRole.toString()}`
        )
    }
}
