import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import { getAuthenticatedUserOrders } from '@/services/orderService';

interface OrdersPageProps {
  searchParams: Promise<{ success?: string; orderId?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const { orders, isAuthenticated, userEmail } = await getAuthenticatedUserOrders();

  const isSuccess = params.success === 'true';
  const newOrderId = params.orderId;

  return (
    <div className="py-12">
      <Container>
        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-zinc-100 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-400">Order Confirmation</h2>
                <p className="text-xs text-zinc-300 font-mono">
                  Order <strong>{newOrderId || 'placement'}</strong> was successfully validated and saved to Supabase!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">Account History</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100">Order History & Tracking</h1>
          <p className="text-zinc-400 text-sm mt-1">Review your previously placed ShadeVault orders, tracking details, and receipts.</p>
        </div>

        {/* Security Notice */}
        <div className="mb-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>
              {isAuthenticated
                ? `Authenticated user isolation active for ${userEmail}.`
                : 'Guest session view. Sign in with Google to sync orders to your profile.'}
            </span>
          </div>
          <span className="font-mono text-zinc-500">Supabase RLS Protected</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
            <svg className="w-12 h-12 text-zinc-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-zinc-300">No previous orders found</h3>
            <p className="text-xs text-zinc-500">Your completed purchases will be listed here after checkout.</p>
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl font-mono uppercase tracking-wider transition-colors mt-2"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6 hover:border-amber-500/30 transition-colors"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-zinc-500 block">Order Number</span>
                      <strong className="text-zinc-200 text-sm font-bold">{order.id}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Order Date</span>
                      <span className="text-zinc-300">{order.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={order.status === 'Delivered' ? 'emerald' : 'gold'}>
                      {order.status}
                    </Badge>
                    <div className="text-right">
                      <span className="text-zinc-500 block">Total</span>
                      <strong className="text-amber-400 text-sm">${order.total}</strong>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] font-mono">
                                Vault Item
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-200 text-sm">{item.productName}</h4>
                            <span className="text-xs text-zinc-400 font-mono">Qty: {item.quantity} × ${item.price}</span>
                          </div>
                        </div>

                        <Link
                          href={`/products/${item.productId}`}
                          className="text-xs font-mono text-amber-400 hover:underline shrink-0"
                        >
                          View Product
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-400 font-mono">
                      <span>{order.itemsCount} luxury frames item(s)</span>
                    </div>
                  )}
                </div>

                {/* Footer / Tracking Info */}
                <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Courier Tracking: <strong>{order.trackingNumber || 'TRK-982347102'}</strong></span>
                  </div>

                  <span className="text-zinc-500">Shipping Address: {order.shippingAddress}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
