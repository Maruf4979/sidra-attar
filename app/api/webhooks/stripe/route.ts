import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId && session.amount_total) {
      try {
        await prisma.order.create({
          data: {
            userId,
            stripeSessionId: session.id,
            totalAmount: session.amount_total / 100, // Convert from paise to rupees
            status: "PAID",
          },
        });
        console.log(`Order created for user ${userId}, session ${session.id}`);
      } catch (dbError) {
        console.error("Failed to create order in DB:", dbError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
