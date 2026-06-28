'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from './actions';
import { 
  LayoutDashboard, 
  Users, 
  MailCheck, 
  Split, 
  Tags, 
  BarChart3, 
  Settings, 
  LogOut,
  Heart
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/rsvp', label: 'RSVPs', icon: MailCheck },
  { href: '/tables', label: 'Bride/Groom', icon: Split },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800 flex-col shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Heart className="w-5 h-5 text-white fill-white/10" />
          </div>
          <div>
            <h1 className="font-serif tracking-wider font-semibold text-slate-100">Wedding Hub</h1>
            <p className="text-[10px] text-slate-400 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600/90 to-rose-500/10 text-white border-l-4 border-indigo-500 shadow-md shadow-indigo-500/5' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Top Header for Mobile */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-indigo-400 fill-indigo-400/10" />
          <h1 className="font-serif tracking-wider font-semibold text-slate-100">Wedding Hub</h1>
        </div>
        <form action={logoutAction}>
          <button 
            type="submit" 
            className="p-2 text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-2 px-2 z-40 backdrop-blur-lg bg-slate-900/90">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                isActive 
                  ? 'text-indigo-400' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">
                {item.label === 'Bride/Groom' ? 'Sides' : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
