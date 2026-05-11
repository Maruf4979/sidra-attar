import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { insforge } from "@/app/lib/insforge";


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to place an order" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) throw new Error("User not found");

    // Calculate total
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const totalAmount = subtotal + shipping;

    const method = paymentMethod === "UPI" ? "UPI" : "COD";
    const status = method === "UPI" ? "PENDING_UPI" : "PENDING_COD";

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: totalAmount,
        paymentMethod: method,
        status: status,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Synchronize with InsForge
    try {
      // 1. Ensure InsForge customer exists (Search by email)
      const { data: customer } = await insforge.database
        .from('customers')
        .select('id')
        .eq('email', session.user.email)
        .maybeSingle();

      if (customer) {
        // 2. Create InsForge order
        const { data: insOrder, error: insOrderError } = await insforge.database
          .from('orders')
          .insert({
            customer_id: customer.id,
            total_amount: totalAmount,
            status: status.toLowerCase().includes('pending') ? 'pending' : status,
            shipping_address: 'See session data', // Optional: could fetch from user profile
            prisma_order_id: order.id,
          })
          .select()
          .single();

        if (!insOrderError && insOrder) {
          // 3. Create InsForge order items
          const insItems = [];
          for (const item of items) {
             // Find InsForge product by SKU (slug)
             const { data: product } = await insforge.database
               .from('products')
               .select('id')
               .eq('sku', item.slug) // Assumes item.slug is passed in the request
               .maybeSingle();

             if (product) {
               insItems.push({
                 order_id: insOrder.id,
                 product_id: product.id,
                 quantity: item.quantity,
                 unit_price: item.price
               });
             }
          }

          if (insItems.length > 0) {
            await insforge.database.from('order_items').insert(insItems);
          }
          console.log("InsForge order synchronized successfully");
        } else {
          console.error("InsForge order creation error:", insOrderError);
        }
      }
    } catch (syncErr) {
      console.error("InsForge sync error:", syncErr);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: "Order placed successfully" 
    });
  } catch (error: any) {
    console.error("COD checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to place order" },
      { status: 500 }
    );
  }
}
