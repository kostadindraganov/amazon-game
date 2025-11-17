'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-casino-gold">
              🎰 Admin Panel
            </h1>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-2 lg:gap-4">
              <Link
                href="/admin"
                className="px-3 lg:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm lg:text-base"
              >
                Products
              </Link>
              <Link
                href="/admin/settings"
                className="px-3 lg:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm lg:text-base"
              >
                Settings
              </Link>
              <Link
                href="/admin/winners"
                className="px-3 lg:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm lg:text-base"
              >
                Winners
              </Link>
              <Link
                href="/admin/queues"
                className="px-3 lg:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm lg:text-base"
              >
                Queues
              </Link>
              <Link
                href="/admin/tiktok"
                className="px-3 lg:px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors text-sm lg:text-base"
              >
                TikTok Live
              </Link>
              <Link
                href="/"
                className="px-3 lg:px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors text-sm lg:text-base"
              >
                View Game
              </Link>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <Link
                href="/admin/winners"
                className="block px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Winners
              </Link>
              <Link
                href="/admin/queues"
                className="block px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Queues
              </Link>
              <Link
                href="/admin/tiktok"
                className="block px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                TikTok Live
              </Link>
              <Link
                href="/"
                className="block px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                View Game
              </Link>
            </div>
          )}
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
