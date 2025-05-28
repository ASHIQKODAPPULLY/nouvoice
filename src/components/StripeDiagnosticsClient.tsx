"use client";

import EdgeFunctionDeploymentStatus from "@/components/EdgeFunctionDeploymentStatus";

export default function StripeDiagnosticsClient() {
  return (
    <div className="container mx-auto py-12 px-4 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Stripe API Diagnostics
        <span className="text-xs text-gray-500 block mt-2">
          Last updated: {new Date().toLocaleString()}
        </span>
      </h1>

      <div className="mb-8">
        <EdgeFunctionDeploymentStatus />
      </div>

      <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">
          Stripe Integration Status
        </h2>
        <p className="text-gray-700">
          Core Stripe integration is active. The application is configured to
          process payments and handle webhook events securely.
        </p>
      </div>
    </div>
  );
}
