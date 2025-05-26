"use client";

import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

export default function FineTuningAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fine-tune/trigger", {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger fine-tuning");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Fine-Tuning Administration</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trigger Fine-Tuning</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Base Model</Label>
                <Input id="model" defaultValue="gpt-3.5-turbo" disabled />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : "Start Fine-Tuning"}
              </Button>

              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-md mt-4">
                  {error}
                </div>
              )}

              {result && (
                <div className="p-3 bg-green-100 text-green-800 rounded-md mt-4">
                  <p>Fine-tuning job created successfully!</p>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fine-Tuning Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Check the status of your fine-tuning jobs and view completed
              models.
            </p>
            <Button variant="outline">View Fine-Tuning Jobs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
