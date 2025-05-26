// Helper functions for Stripe API key diagnostics

export function verifyKeyFormat(apiKey: string): boolean {
  if (!apiKey) return false;

  const secretKeyPattern = /^sk_(test|live)_[a-zA-Z0-9]{24,}$/;
  const publishableKeyPattern = /^pk_(test|live)_[a-zA-Z0-9]{24,}$/;

  return secretKeyPattern.test(apiKey) || publishableKeyPattern.test(apiKey);
}

export function getKeyType(apiKey: string): string {
  if (!apiKey) return "unknown";

  if (apiKey.startsWith("sk_test_")) return "test secret key";
  if (apiKey.startsWith("sk_live_")) return "live secret key";
  if (apiKey.startsWith("pk_test_")) return "test publishable key";
  if (apiKey.startsWith("pk_live_")) return "live publishable key";

  return "unknown key format";
}

export function interpretStripeError(error: any): {
  errorType: string;
  suggestion: string;
  details: string;
} {
  const errorMessage =
    typeof error === "string" ? error : error?.message || JSON.stringify(error);

  // Authentication errors
  if (
    errorMessage.includes("Invalid API Key") ||
    errorMessage.includes("401")
  ) {
    return {
      errorType: "Authentication Error",
      suggestion:
        "Your API key is invalid. Check for typos or generate a new key in the Stripe dashboard.",
      details: errorMessage,
    };
  }

  // Permission errors
  if (errorMessage.includes("permission") || errorMessage.includes("403")) {
    return {
      errorType: "Permission Error",
      suggestion:
        "Your API key doesn't have the required permissions. Use a key with more permissions or update the key's restrictions.",
      details: errorMessage,
    };
  }

  // Rate limiting
  if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
    return {
      errorType: "Rate Limit Error",
      suggestion:
        "You've hit Stripe's rate limits. Reduce the frequency of your requests or contact Stripe to increase your limits.",
      details: errorMessage,
    };
  }

  // Connection errors
  if (
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("network")
  ) {
    return {
      errorType: "Connection Error",
      suggestion:
        "There's a network issue connecting to Stripe. Check your internet connection or if there's a Stripe outage.",
      details: errorMessage,
    };
  }

  // Expired key
  if (errorMessage.includes("expired")) {
    return {
      errorType: "Expired Key Error",
      suggestion:
        "Your API key has expired. Generate a new key in the Stripe dashboard.",
      details: errorMessage,
    };
  }

  // Default case
  return {
    errorType: "Unknown Error",
    suggestion:
      "Check the Stripe documentation or contact Stripe support for assistance with this error.",
    details: errorMessage,
  };
}
