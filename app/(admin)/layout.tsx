'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from './actions';
import { 
  LayoutGrid, 
  Users, 
  CheckCircle2, 
  Split, 
  Tags, 
  BarChart3, 
  Settings, 
  LogOut,
  Heart
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/rsvp', label: 'RSVPs', icon: CheckCircle2 },
  { href: '/tables', label: 'Tables', icon: Split },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-60 bg-white border-r border-gray-200 flex-col shrink-0">
        {/* Header */}
        <div className="h-14 px-6 border-b border-gray-200 flex items-center gap-2">
          <Heart className="w-4 h-4 text-blue-500 fill-blue-500/10" />
          <span className="font-semibold text-gray-900 tracking-tight text-sm">Oshidhie & Kaveen</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 h-10 px-3 rounded-md text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-gray-200">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 h-10 px-3 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-655 transition-all cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5 text-red-400" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Top Header for Mobile */}
      <header className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-6 py-3.5 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-blue-500 fill-blue-500/10" />
          <span className="font-semibold text-gray-900 text-sm">Oshidhie & Kaveen</span>
        </div>
        <form action={logoutAction}>
          <button 
            type="submit" 
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-0">
        <div className="p-6 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-1.5 px-2 z-40 backdrop-blur-lg bg-white/90">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded transition-all ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
