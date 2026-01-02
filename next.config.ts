import type { NextConfig } from "next"

const nextConfig: NextConfig = {
 /* config options here */
 reactCompiler: true,

 // Environment variable configuration
 // Note: Environment variables are loaded from .env files automatically
 // Use NEXT_PUBLIC_ prefix for client-side accessible variables
 env: {
  // Add any environment variable defaults or transformations here if needed
  // Example:
  // CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-value',
 },
}

export default nextConfig
