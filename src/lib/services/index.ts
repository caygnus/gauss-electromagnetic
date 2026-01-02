/**
 * Services Index
 *
 * Central export point for all services
 */

export {
    env,
    EnvService,
    EnvKey,
    type ClientEnv,
    type ServerEnv,
    type EnvConfig,
} from "./env.service"

// Email services
export {
    sendContactEnquiry,
    resendClient,
    ResendClient,
    renderTemplate,
    type EmailResult,
} from "./email"
