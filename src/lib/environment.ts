/**
 * Utility functions to handle environment-specific code
 */

/**
 * Checks if the code is running in a browser environment
 */
export const isBrowser = typeof window !== "undefined";

/**
 * Checks if the code is running in a Node.js environment
 */
export const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node;

/**
 * Checks if the code is running in an Edge runtime
 */
export const isEdgeRuntime =
  typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

/**
 * Safely executes a function only in browser environments
 * @param fn Function to execute in browser
 * @param fallback Optional fallback for non-browser environments
 */
export function runInBrowser<T>(fn: () => T, fallback?: T): T | undefined {
  if (isBrowser) {
    return fn();
  }
  return fallback;
}

/**
 * Safely executes a function only in Node.js environments
 * @param fn Function to execute in Node.js
 * @param fallback Optional fallback for non-Node environments
 */
export function runInNode<T>(fn: () => T, fallback?: T): T | undefined {
  if (isNode) {
    return fn();
  }
  return fallback;
}
