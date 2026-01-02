/**
 * Environment Service
 *
 * Singleton class for type-safe access to environment variables.
 * Distinguishes between client-side (NEXT_PUBLIC_*) and server-side variables.
 */

/**
 * Enum for environment variable keys
 * Add your environment variable keys here for type-safe access
 */
export enum EnvKey {
 // Server-side environment variables
 RESEND_API_KEY = "RESEND_API_KEY",
 RESEND_FROM_ADDRESS = "RESEND_FROM_ADDRESS",

 // Client-side environment variables (NEXT_PUBLIC_*)
 // Add your NEXT_PUBLIC_* keys here
 // NEXT_PUBLIC_API_URL = 'NEXT_PUBLIC_API_URL',
 // NEXT_PUBLIC_APP_NAME = 'NEXT_PUBLIC_APP_NAME',
}

// Type definitions for environment variables
export interface ClientEnv {
 // Add your NEXT_PUBLIC_* environment variables here
 // Example:
 // NEXT_PUBLIC_API_URL?: string;
 // NEXT_PUBLIC_APP_NAME?: string;
 [key: `NEXT_PUBLIC_${string}`]: string | undefined
}

export interface ServerEnv {
 // Add your server-only environment variables here
 // Example:
 // DATABASE_URL?: string;
 // API_SECRET_KEY?: string;
 [key: string]: string | undefined
}

export interface EnvConfig {
 client: ClientEnv
 server: ServerEnv
}

/**
 * Environment Service Class
 *
 * Singleton pattern for accessing environment variables with type safety.
 * Use getInstance() to get the singleton instance.
 */
export class EnvService {
 private static instance: EnvService
 private clientEnv: ClientEnv
 private serverEnv: ServerEnv

 /**
  * Private constructor to enforce singleton pattern
  */
 private constructor() {
  // Initialize client environment variables (NEXT_PUBLIC_*)
  this.clientEnv = this.loadClientEnv()

  // Initialize server environment variables
  this.serverEnv = this.loadServerEnv()
 }

 /**
  * Get the singleton instance of EnvService
  */
 public static getInstance(): EnvService {
  if (!EnvService.instance) {
   EnvService.instance = new EnvService()
  }
  return EnvService.instance
 }

 /**
  * Load all client-side environment variables (NEXT_PUBLIC_*)
  */
 private loadClientEnv(): ClientEnv {
  const clientEnv: ClientEnv = {} as ClientEnv

  if (typeof window !== "undefined" || typeof process !== "undefined") {
   // In Next.js, NEXT_PUBLIC_* variables are available on both client and server
   Object.keys(process.env).forEach((key) => {
    if (key.startsWith("NEXT_PUBLIC_")) {
     clientEnv[key as keyof ClientEnv] = process.env[key]
    }
   })
  }

  return clientEnv
 }

 /**
  * Load all server-side environment variables
  */
 private loadServerEnv(): ServerEnv {
  const serverEnv: ServerEnv = {}

  if (typeof process !== "undefined" && process.env) {
   Object.keys(process.env).forEach((key) => {
    // Exclude NEXT_PUBLIC_* variables from server env (they're in client env)
    if (!key.startsWith("NEXT_PUBLIC_")) {
     serverEnv[key] = process.env[key]
    }
   })
  }

  return serverEnv
 }

 /**
  * Get a client-side environment variable
  * @param key - The environment variable key from EnvKey enum (must start with NEXT_PUBLIC_)
  * @returns The environment variable value or undefined
  */
 public getClientEnv(key: EnvKey): string | undefined {
  const envKey = key as string
  if (!envKey.startsWith("NEXT_PUBLIC_")) {
   throw new Error(`Client env key must start with NEXT_PUBLIC_: ${envKey}`)
  }
  return this.clientEnv[envKey as keyof ClientEnv]
 }

 /**
  * Get a server-side environment variable
  * @param key - The environment variable key from EnvKey enum
  * @returns The environment variable value or undefined
  */
 public getServerEnv(key: EnvKey): string | undefined {
  const envKey = key as string
  if (envKey.startsWith("NEXT_PUBLIC_")) {
   throw new Error(`Server env key cannot start with NEXT_PUBLIC_: ${envKey}`)
  }
  return this.serverEnv[envKey]
 }

 /**
  * Get an environment variable (automatically determines client or server)
  * @param key - The environment variable key from EnvKey enum
  * @returns The environment variable value or undefined
  */
 public get(key: EnvKey): string | undefined {
  const envKey = key as string
  if (envKey.startsWith("NEXT_PUBLIC_")) {
   return this.getClientEnv(key)
  }
  return this.getServerEnv(key)
 }

 /**
  * Get all client-side environment variables
  * @returns Object containing all client-side env variables
  */
 public getAllClientEnv(): ClientEnv {
  return { ...this.clientEnv }
 }

 /**
  * Get all server-side environment variables
  * @returns Object containing all server-side env variables
  */
 public getAllServerEnv(): ServerEnv {
  return { ...this.serverEnv }
 }

 /**
  * Check if running on client side
  * @returns true if running in browser, false otherwise
  */
 public isClient(): boolean {
  return typeof window !== "undefined"
 }

 /**
  * Check if running on server side
  * @returns true if running on server, false otherwise
  */
 public isServer(): boolean {
  return typeof window === "undefined"
 }

 // Direct getters for environment variables
 // Add getters here for each environment variable in EnvKey enum

 /**
  * Get RESEND_API_KEY environment variable
  * @returns The Resend API key or undefined
  */
 public getResendApiKey(): string | undefined {
  return this.serverEnv[EnvKey.RESEND_API_KEY]
 }

 /**
  * Get RESEND_FROM_ADDRESS environment variable
  * @returns The Resend from address or undefined
  */
 public getResendFromAddress(): string | undefined {
  return this.serverEnv[EnvKey.RESEND_FROM_ADDRESS]
 }

 // Add more direct getters here as you add more environment variables
 // Example:
 // public getDatabaseUrl(): string | undefined {
 //     return this.serverEnv[EnvKey.DATABASE_URL];
 // }
}

// Export singleton instance for convenience
export const env = EnvService.getInstance()
