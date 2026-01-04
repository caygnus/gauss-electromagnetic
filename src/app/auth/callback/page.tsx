"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { assignDefaultRole } from "./actions"
import { AuthCallbackLoader } from "@/components/organisms/auth"

/**
 * Callback page after successful signup/signin
 * Assigns default role to user and redirects to home
 */
export default function AuthCallbackPage() {
    const { userId, isLoaded } = useAuth()
    const router = useRouter()
    const [status, setStatus] = useState<"loading" | "error">("loading")

    useEffect(() => {
        async function handleCallback() {
            // Wait for auth to load
            if (!isLoaded) {
                return
            }

            // If not authenticated, redirect to sign in
            if (!userId) {
                router.push("/sign-in")
                return
            }

            try {
                // Assign default role (idempotent - won't change if already set)
                const result = await assignDefaultRole()

                if (!result.success) {
                    console.error("Failed to assign role:", result.error)
                    setStatus("error")
                    // Still redirect to avoid infinite loop
                    // Role assignment will be retried on next visit
                    setTimeout(() => {
                        router.push("/")
                    }, 2000)
                } else {
                    // Redirect to home page after role assignment
                    router.push("/")
                }
            } catch (error) {
                console.error("Error during callback:", error)
                setStatus("error")
                // Redirect after brief error display
                setTimeout(() => {
                    router.push("/")
                }, 2000)
            }
        }

        handleCallback()
    }, [userId, isLoaded, router])

    // Show loading UI immediately
    return <AuthCallbackLoader status={status} />
}
