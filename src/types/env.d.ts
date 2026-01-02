/**
 * Environment Variable Type Definitions
 *
 * Add your environment variable types here for better IntelliSense support.
 * These types augment the NodeJS.ProcessEnv interface.
 */

declare namespace NodeJS {
    interface ProcessEnv {
        // Client-side environment variables (accessible on both client and server)
        // Add your NEXT_PUBLIC_* variables here
        // Example:
        // NEXT_PUBLIC_API_URL?: string;
        // NEXT_PUBLIC_APP_NAME?: string;

        // Server-side environment variables (server-only)
        RESEND_API_KEY?: string
        RESEND_FROM_ADDRESS?: string
        ADMIN_EMAIL?: string

        // Add more server-only variables here
        // Example:
        // DATABASE_URL?: string;
        // API_SECRET_KEY?: string;
        // NODE_ENV: 'development' | 'production' | 'test';
    }
}
