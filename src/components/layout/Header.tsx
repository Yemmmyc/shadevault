'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useCart } from '@/context/CartContext';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Fetch active session user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Sunglasses' },
    { href: '/orders', label: 'Orders' },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email || 'Account';

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:border-amber-400 transition-colors">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-wider text-zinc-100 group-hover:text-amber-400 transition-colors">
                SHADE<span className="text-amber-400">VAULT</span>
              </span>
              <span className="text-[10px] text-zinc-400 tracking-widest uppercase font-mono">Precision Eyewear</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname ? pathname.startsWith(link.href) : false;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-amber-400 font-semibold'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-4">
            {/* Account / Login / User profile indicator */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-xs font-mono text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="max-w-[150px] truncate text-amber-400 font-semibold">{displayName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs font-mono text-zinc-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-rose-500/30 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-zinc-300 hover:text-amber-400 transition-colors hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-amber-500/30"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Icon & Badge */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 transition-all"
              aria-label="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href
                  ? 'bg-zinc-900 text-amber-400'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="pt-2 border-t border-zinc-900 space-y-2">
              <div className="px-3 text-xs font-mono text-amber-400 truncate">
                Signed in as: {user.email}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-zinc-900"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-400 hover:bg-zinc-900"
            >
              Sign In / Google OAuth
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
