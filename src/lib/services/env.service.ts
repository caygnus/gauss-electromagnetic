/**
 * Environment Service
 *
 * Singleton class for type-safe access to environment variables.
 * Loads defaults from config.yaml and overrides with .env file values.
 *
 * Configuration Precedence:
 * 1. config.yaml - Default values (loaded first)
 * 2. .env file / process.env - Overrides config.yaml values (takes precedence)
 */

import { readFileSync } from "fs"
import { join } from "path"
import yaml from "js-yaml"
import type { AppConfig, ClientConfig, ServerConfig } from "@/types"

/**
 * Enum for environment variable keys
 * Add your environment variable keys here for type-safe access
 */
export enum EnvKey {
    // Server-side environment variables
    RESEND_API_KEY = "RESEND_API_KEY",
    RESEND_FROM_ADDRESS = "RESEND_FROM_ADDRESS",
    ADMIN_EMAIL = "ADMIN_EMAIL",

    // Database Configuration (Neon PostgreSQL)
    DB_USER = "DB_USER",
    DB_PASSWORD = "DB_PASSWORD",
    DB_HOST = "DB_HOST",
    DB_PORT = "DB_PORT",
    DB_NAME = "DB_NAME",
    DB_SSLMODE = "DB_SSLMODE",
    DB_CHANNEL_BINDING = "DB_CHANNEL_BINDING",

    // Client-side environment variables (NEXT_PUBLIC_*)
    // Add your NEXT_PUBLIC_* keys here
    // NEXT_PUBLIC_API_URL = 'NEXT_PUBLIC_API_URL',
    // NEXT_PUBLIC_APP_NAME = 'NEXT_PUBLIC_APP_NAME',
}

// Type definitions for environment variables
export interface ClientEnv {
    [key: `NEXT_PUBLIC_${string}`]: string | undefined
}

export interface ServerEnv {
    [key: string]: string | undefined
}

export interface EnvConfig {
    client: ClientEnv
    server: ServerEnv
}

/**
 * Load config.yaml file
 */
function loadConfigFromFile(): { client: ClientConfig; server: ServerConfig } {
    try {
        const configPath = join(process.cwd(), "config.yaml")
        const fileContents = readFileSync(configPath, "utf-8")
        const parsed = yaml.load(fileContents) as AppConfig

        if (!parsed?.env) {
            console.warn(
                "config.yaml is missing 'env' section, using empty config"
            )
            return { client: {}, server: {} }
        }

        return {
            client: parsed.env.client || {},
            server: parsed.env.server || {},
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            console.info(
                "config.yaml not found, using environment variables only"
            )
        } else {
            console.error("Error loading config.yaml:", error)
        }
        return { client: {}, server: {} }
    }
}

/**
 * Merge config defaults with environment variables
 * Environment variables take precedence
 */
function mergeEnvWithConfig(
    configDefaults: ClientConfig | ServerConfig,
    envPrefix?: string
): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {}
    const defaults = configDefaults as Record<string, string>

    // Step 1: Load defaults from config.yaml
    Object.keys(defaults).forEach((key) => {
        if (!envPrefix || key.startsWith(envPrefix)) {
            result[key] = defaults[key]
        }
    })

    // Step 2: Override with values from process.env (.env file takes precedence)
    if (typeof process !== "undefined" && process.env) {
        Object.keys(process.env).forEach((key) => {
            const shouldInclude = envPrefix
                ? key.startsWith(envPrefix)
                : !key.startsWith("NEXT_PUBLIC_")
            if (shouldInclude) {
                const envValue = process.env[key]
                if (envValue !== undefined) {
                    result[key] = envValue
                }
            }
        })
    }

    return result
}

/**
 * Environment Service Class
 *
 * Singleton pattern for accessing environment variables with type safety.
 */
export class EnvService {
    private static instance: EnvService
    private clientEnv: ClientEnv
    private serverEnv: ServerEnv

    private constructor() {
        const config = loadConfigFromFile()
        this.clientEnv = mergeEnvWithConfig(
            config.client,
            "NEXT_PUBLIC_"
        ) as ClientEnv
        this.serverEnv = mergeEnvWithConfig(config.server) as ServerEnv
    }

    public static getInstance(): EnvService {
        if (!EnvService.instance) {
            EnvService.instance = new EnvService()
        }
        return EnvService.instance
    }

    private getEnvValue(key: string, isClient: boolean): string | undefined {
        return isClient
            ? this.clientEnv[key as keyof ClientEnv]
            : this.serverEnv[key]
    }

    public getClientEnv(key: EnvKey): string | undefined {
        const envKey = key as string
        if (!envKey.startsWith("NEXT_PUBLIC_")) {
            throw new Error(
                `Client env key must start with NEXT_PUBLIC_: ${envKey}`
            )
        }
        return this.getEnvValue(envKey, true)
    }

    public getServerEnv(key: EnvKey): string | undefined {
        const envKey = key as string
        if (envKey.startsWith("NEXT_PUBLIC_")) {
            throw new Error(
                `Server env key cannot start with NEXT_PUBLIC_: ${envKey}`
            )
        }
        return this.getEnvValue(envKey, false)
    }

    public get(key: EnvKey): string | undefined {
        const envKey = key as string
        return envKey.startsWith("NEXT_PUBLIC_")
            ? this.getClientEnv(key)
            : this.getServerEnv(key)
    }

    public getAllClientEnv(): ClientEnv {
        return { ...this.clientEnv }
    }

    public getAllServerEnv(): ServerEnv {
        return { ...this.serverEnv }
    }

    public isClient(): boolean {
        return typeof window !== "undefined"
    }

    public isServer(): boolean {
        return typeof window === "undefined"
    }

    // Direct getters for convenience
    public getResendApiKey(): string | undefined {
        return this.getServerEnv(EnvKey.RESEND_API_KEY)
    }

    public getResendFromAddress(): string | undefined {
        return this.getServerEnv(EnvKey.RESEND_FROM_ADDRESS)
    }

    public getAdminEmail(): string | undefined {
        return this.getServerEnv(EnvKey.ADMIN_EMAIL)
    }

    // Database configuration getters
    public getDbUser(): string | undefined {
        return this.getServerEnv(EnvKey.DB_USER)
    }

    public getDbPassword(): string | undefined {
        return this.getServerEnv(EnvKey.DB_PASSWORD)
    }

    public getDbHost(): string | undefined {
        return this.getServerEnv(EnvKey.DB_HOST)
    }

    public getDbPort(): string | undefined {
        return this.getServerEnv(EnvKey.DB_PORT)
    }

    public getDbName(): string | undefined {
        return this.getServerEnv(EnvKey.DB_NAME)
    }

    public getDbSslMode(): string | undefined {
        return this.getServerEnv(EnvKey.DB_SSLMODE)
    }

    public getDbChannelBinding(): string | undefined {
        return this.getServerEnv(EnvKey.DB_CHANNEL_BINDING)
    }

    /**
     * Get the full database connection URL for Neon PostgreSQL
     */
    public getDatabaseUrl(): string | undefined {
        const user = this.getDbUser()
        const password = this.getDbPassword()
        const host = this.getDbHost()
        const port = this.getDbPort()
        const name = this.getDbName()
        const sslmode = this.getDbSslMode()

        if (!user || !password || !host || !port || !name) {
            return undefined
        }

        return `postgresql://${user}:${password}@${host}:${port}/${name}?sslmode=${sslmode || "require"}`
    }
}

// Export singleton instance
export const env = EnvService.getInstance()
