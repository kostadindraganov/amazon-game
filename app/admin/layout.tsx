import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-casino-gold">
              🎰 Admin Panel
            </h1>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Products
              </Link>
              <Link
                href="/admin/settings"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/admin/winners"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Winners
              </Link>
              <Link
                href="/"
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                View Game
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
