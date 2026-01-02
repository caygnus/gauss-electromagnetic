/**
 * Resend Client Singleton
 *
 * Singleton pattern for Resend email client
 * Ensures only one instance is created and reused
 */

import { Resend } from "resend"
import { env } from "../env.service"

export class ResendClient {
    private static instance: ResendClient
    private client: Resend | null = null
    private initialized: boolean = false

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        // Prevent direct instantiation
    }

    /**
     * Get the singleton instance of ResendClient
     */
    public static getInstance(): ResendClient {
        if (!ResendClient.instance) {
            ResendClient.instance = new ResendClient()
        }
        return ResendClient.instance
    }

    /**
     * Initialize the Resend client
     * @returns Resend instance or null if initialization fails
     */
    public getClient(): Resend | null {
        if (this.client) {
            return this.client
        }

        if (this.initialized) {
            // Already tried to initialize but failed
            return null
        }

        this.initialized = true

        const apiKey = env.getResendApiKey()
        if (!apiKey) {
            console.error("RESEND_API_KEY is not set")
            return null
        }

        try {
            this.client = new Resend(apiKey)
            return this.client
        } catch (error) {
            console.error("Failed to initialize Resend client:", error)
            return null
        }
    }

    /**
     * Check if the client is available
     * @returns true if client is initialized and ready
     */
    public isAvailable(): boolean {
        return this.client !== null
    }
}

// Export singleton instance
export const resendClient = ResendClient.getInstance()
