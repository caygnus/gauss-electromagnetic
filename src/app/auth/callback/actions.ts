"use server"

import { UserRole } from "@/types/role"
import { auth, clerkClient } from "@clerk/nextjs/server"

export interface AssignRoleResult {
    success: boolean
    role?: UserRole
    error?: string
}

/**
 * Server action to assign default user role
 * - If no owner exists, current user becomes owner
 * - Otherwise, user gets 'user' role
 * - Idempotent: won't change role if already set
 */
export async function assignDefaultRole(): Promise<AssignRoleResult> {
    try {
        const { userId } = await auth()

        if (!userId) {
            return {
                success: false,
                error: "User not authenticated",
            }
        }

        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        // If role already exists, return it
        if (user.privateMetadata?.role) {
            const existingRole = user.privateMetadata.role as UserRole
            return {
                success: true,
                role: existingRole,
            }
        }

        // Check if any owner exists
        const allUsers = await client.users.getUserList({
            limit: 1,
            query: `privateMetadata.role:${UserRole.ADMIN}`,
        })

        let hasAdmin = false
        for (const existingUser of allUsers.data) {
            if (existingUser.privateMetadata?.role === UserRole.ADMIN) {
                hasAdmin = true
                break
            }
        }

        // First user becomes admin, rest become user
        const role: UserRole = hasAdmin ? UserRole.USER : UserRole.ADMIN

        // Set the role in privateMetadata
        await client.users.updateUserMetadata(userId, {
            privateMetadata: {
                role,
            },
        })

        return {
            success: true,
            role: role,
        }
    } catch (error) {
        console.error("Error assigning role:", error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to assign role",
        }
    }
}
