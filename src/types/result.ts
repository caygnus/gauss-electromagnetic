/**
 * Generic Result Type
 *
 * Object-based result pattern: { data, error }
 * Better for flexibility, readability, and extensibility
 *
 * @template T - The success data type
 * @template E - The error type (defaults to string)
 *
 * @example
 * ```typescript
 * type UserResult = Result<User, string>
 * const { data, error } = await getUser()
 * if (error) {
 *   // handle error
 * }
 * // use data
 * ```
 */

export type Result<T, E = string> =
 | { data: T; error: null }
 | { data: null; error: E }

/**
 * Helper function to create a success result
 * @param data - The success data
 * @returns Result object with data and null error
 */
export function success<T, E = string>(data: T): Result<T, E> {
 return { data, error: null }
}

/**
 * Helper function to create an error result
 * @param error - The error value
 * @returns Result object with null data and error
 */
export function failure<T, E = string>(error: E): Result<T, E> {
 return { data: null, error }
}

/**
 * Type guard to check if result is successful
 * @param result - The result object
 * @returns true if result is successful (data is not null)
 */
export function isSuccess<T, E = string>(
 result: Result<T, E>
): result is { data: T; error: null } {
 return result.data !== null && result.error === null
}

/**
 * Type guard to check if result is an error
 * @param result - The result object
 * @returns true if result is an error (error is not null)
 */
export function isError<T, E = string>(
 result: Result<T, E>
): result is { data: null; error: E } {
 return result.data === null && result.error !== null
}
