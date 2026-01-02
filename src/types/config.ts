/**
 * Configuration Types
 *
 * Type definitions for config.yaml structure
 */

/**
 * Client-side environment variables (NEXT_PUBLIC_*)
 */
export interface ClientConfig {
 [key: `NEXT_PUBLIC_${string}`]: string
}

/**
 * Server-side environment variables
 */
export interface ServerConfig {
 [key: string]: string
}

/**
 * Environment configuration section
 */
export interface EnvConfig {
 client: ClientConfig
 server: ServerConfig
}

/**
 * Root configuration structure
 */
export interface AppConfig {
 env: EnvConfig
}
