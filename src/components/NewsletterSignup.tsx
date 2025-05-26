"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setMessage("Thank you for subscribing to our newsletter!");
      setEmail("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        if (status === "success") {
          setStatus("idle");
          setMessage("");
        }
      }, 5000);
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-muted/30 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Subscribe to our newsletter for the latest updates, tips, and special
        offers.
      </p>

      {status === "success" && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={status === "loading" || status === "success"}
        />
        <Button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="gap-2"
        >
          {status === "loading" ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Subscribe</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
