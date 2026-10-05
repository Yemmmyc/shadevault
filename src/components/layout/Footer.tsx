import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-zinc-900 border border-amber-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-zinc-100 tracking-wider">
                SHADE<span className="text-amber-400">VAULT</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Crafting high-precision luxury eyewear for discerning vision. Designed with titanium, Italian bio-acetate, and polarized optics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 tracking-wider uppercase mb-4 font-mono">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">Sunglasses Collection</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-amber-400 transition-colors">Secure Checkout</Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-amber-400 transition-colors">Order History</Link>
              </li>
            </ul>
          </div>

          {/* Support & Guarantees */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 tracking-wider uppercase mb-4 font-mono">Vault Guarantee</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>100% Polarized UV400 Protection</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Insured Express Shipping</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>30-Day Risk-Free Returns</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>2-Year Frame Warranty</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Educational Notice */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 tracking-wider uppercase mb-4 font-mono">Privé Access</h3>
            <p className="text-xs text-zinc-400 mb-3">
              Join the vault list for exclusive limited releases and seasonal drops.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 w-full"
                readOnly
              />
              <button
                type="button"
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                Join
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              Demonstration store interface. Prices and data are for educational purposes.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-400 gap-4">
          <p>© 2026 ShadeVault Eyewear Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
