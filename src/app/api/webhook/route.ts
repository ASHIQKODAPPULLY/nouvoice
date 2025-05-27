import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Initialize Stripe with a fallback for build time
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2023-08-16",
  },
);

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature header" },
      { status: 400 },
    );
  }

  // Read raw body as Uint8Array for signature verification
  const bodyBuffer = await request.arrayBuffer();
  const body = Buffer.from(bodyBuffer);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 },
    );
  }

  // Handle relevant event types
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // TODO: Handle successful payment here (e.g., update order status)
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        // TODO: Handle failed payment here (e.g., notify customer)
        break;

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        // TODO: Handle subscription lifecycle events here
        break;

      default:
        // Unexpected event type - optionally log or ignore
        break;
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook handler error: ${err.message}` },
      { status: 500 },
    );
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
