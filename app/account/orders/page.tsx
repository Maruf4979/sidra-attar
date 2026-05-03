import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track and manage your fragrance collection history.</p>
      </div>

      <div className="account-layout">
        <nav className="account-sidebar">
          <Link href="/account">Dashboard</Link>
          <Link href="/account/orders" className="active">Orders</Link>
          <Link href="/collections">Shop More</Link>
        </nav>

        <div className="account-content">
          <div className="account-card">
            <h3>Order History</h3>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ color: "var(--outline)", marginBottom: "1.5rem" }}>
                  You haven&apos;t placed any orders yet.
                </p>
                <Link href="/collections" className="btn-primary">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    style={{ 
                      border: "1px solid var(--outline-variant)", 
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{ 
                      padding: "1rem", 
                      background: "var(--surface-container-low)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid var(--outline-variant)"
                    }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--outline)", display: "block" }}>ORDER PLACED</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--outline)", display: "block" }}>TOTAL</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--outline)", display: "block" }}>STATUS</span>
                        <span className={`order-status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--outline)", display: "block" }}>ORDER #</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{order.id.slice(0, 10).toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div style={{ padding: "1rem" }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ 
                          display: "flex", 
                          gap: "1rem", 
                          padding: "0.5rem 0",
                          borderBottom: order.items.indexOf(item) === order.items.length - 1 ? "none" : "1px solid var(--surface-container-lowest)"
                        }}>
                          <div style={{ 
                            width: "60px", 
                            height: "60px", 
                            background: item.product?.gradient || "var(--surface-container)",
                            borderRadius: "var(--radius-sm)",
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>{item.product?.name || "Product"}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--outline)" }}>Qty: {item.quantity}</p>
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            ₹{item.price.toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
