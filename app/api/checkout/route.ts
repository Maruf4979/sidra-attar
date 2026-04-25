import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to checkout" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Build Stripe line items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineItems: any[] = items.map(
      (item: { name: string; price: number; quantity: number }) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amount in paise
        },
        quantity: item.quantity,
      })
    );

    // Add shipping fee if subtotal < ₹999
    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    if (subtotal < 999) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Shipping" },
          unit_amount: 9900, // ₹99
        },
        quantity: 1,
      });
    }

    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: {
        userId: (session.user as { id: string }).id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
