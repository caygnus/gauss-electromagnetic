/**
 * Template Service
 *
 * Service for rendering email templates using Mustache
 * Handles template loading, caching, and rendering
 */

import Mustache from "mustache"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Get the templates directory path
 */
function getTemplatesDir(): string {
    return join(process.cwd(), "src", "lib", "services", "email", "templates")
}

/**
 * Load a template from the filesystem
 * @param templateName - Name of the template file (without extension)
 * @param extension - File extension (default: 'html')
 * @returns Template content as string
 */
function loadTemplate(
    templateName: string,
    extension: string = "html"
): string {
    try {
        const templatePath = join(
            getTemplatesDir(),
            `${templateName}.${extension}`
        )
        return readFileSync(templatePath, "utf-8")
    } catch (error) {
        console.error(
            `Failed to load template ${templateName}.${extension}:`,
            error
        )
        throw new Error(
            `Template ${templateName}.${extension} not found or could not be loaded`
        )
    }
}

/**
 * Render a template with data using Mustache
 * @param templateName - Name of the template file (without extension)
 * @param data - Data object to fill in template placeholders
 * @param extension - File extension (default: 'html')
 * @returns Rendered template string
 */
export function renderTemplate(
    templateName: string,
    data: Record<string, any>,
    extension: string = "html"
): string {
    const template = loadTemplate(templateName, extension)

    try {
        // Mustache.render(template, view, partials?)
        return Mustache.render(template, data)
    } catch (error) {
        console.error(`Failed to render template ${templateName}:`, error)
        throw new Error(`Failed to render template ${templateName}`)
    }
}
