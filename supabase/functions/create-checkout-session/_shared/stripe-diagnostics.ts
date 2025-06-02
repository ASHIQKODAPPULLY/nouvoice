/**
 * Utility functions for Stripe API diagnostics
 */

/**
 * Verifies if a Stripe key has the correct format
 */
export function verifyKeyFormat(key: string | null | undefined): boolean {
  if (!key) return false;
  return (
    key.startsWith("sk_test_") ||
    key.startsWith("sk_live_") ||
    key.startsWith("pk_test_") ||
    key.startsWith("pk_live_")
  );
}

/**
 * Returns the type of Stripe key (test or live)
 */
export function getKeyType(key: string | null | undefined): string {
  if (!key) return "unknown";
  if (key.startsWith("sk_test_") || key.startsWith("pk_test_")) return "test";
  if (key.startsWith("sk_live_") || key.startsWith("pk_live_")) return "live";
  return "unknown";
}

/**
 * Interprets common Stripe API errors and provides more helpful messages
 */
export function interpretStripeError(errorData: any): {
  errorType: string;
  suggestion: string;
  details: string;
} {
  // Default error interpretation
  let errorType = "Unknown Error";
  let suggestion = "Check your request parameters and try again";
  let details = "No additional details available";

  if (!errorData) {
    return { errorType, suggestion, details };
  }

  // Extract error information from various possible formats
  const error =
    errorData.error ||
    errorData.details ||
    errorData.message ||
    errorData.toString();

  // Handle specific error types
  if (typeof error === "string") {
    // API key errors
    if (error.includes("api_key_expired")) {
      errorType = "Expired API Key";
      suggestion = "Generate a new API key in the Stripe dashboard";
      details = "Your Stripe API key has expired and needs to be replaced";
    } else if (
      error.includes("invalid_request_error") &&
      error.includes("api_key")
    ) {
      errorType = "Invalid API Key";
      suggestion = "Check your Stripe API key or generate a new one";
      details = "The provided API key is invalid or has been revoked";
    } else if (error.includes("authentication_required")) {
      errorType = "Authentication Error";
      suggestion = "Verify your API key has the correct permissions";
      details =
        "Your request could not be authenticated with the provided credentials";
    }
    // Connection errors
    else if (error.includes("ENOTFOUND") || error.includes("ETIMEDOUT")) {
      errorType = "Connection Error";
      suggestion = "Check your network connection and try again";
      details = "Could not connect to the Stripe API servers";
    }
    // Rate limiting
    else if (error.includes("rate_limit")) {
      errorType = "Rate Limit Exceeded";
      suggestion = "Implement exponential backoff and retry the request later";
      details = "You've exceeded Stripe's rate limits for API requests";
    }
  } else if (typeof error === "object") {
    // Handle structured error objects
    if (error.type === "api_error") {
      errorType = "Stripe API Error";
      suggestion = "This is likely a temporary issue with Stripe's API";
      details = error.message || "An error occurred with the Stripe API";
    } else if (error.type === "card_error") {
      errorType = "Card Error";
      suggestion = "The user should try another payment method";
      details = error.message || "The card was declined";
    } else if (error.type === "invalid_request_error") {
      errorType = "Invalid Request";
      suggestion = "Check the parameters being sent to the Stripe API";
      details = error.message || "The request contains invalid parameters";
    }
  }

  return { errorType, suggestion, details };
}
