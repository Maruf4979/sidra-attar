import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { insforge } from "@/app/lib/insforge";
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
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });
        console.log(`Order ${orderId} marked as PAID in Prisma`);

        // Update in InsForge
        try {
          const { error: insError } = await insforge.database
            .from('orders')
            .update({ status: 'paid' })
            .eq('prisma_order_id', orderId);
          
          if (insError) {
            console.error("Failed to update InsForge order status:", insError);
          } else {
            console.log(`Order ${orderId} marked as paid in InsForge`);
          }
        } catch (syncErr) {
          console.error("InsForge webhook sync error:", syncErr);
        }
      } catch (dbError) {
        console.error("Failed to update order status:", dbError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
