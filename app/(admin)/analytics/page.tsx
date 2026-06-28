'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Loader2, 
  AlertCircle, 
  PieChart, 
  Users, 
  HelpCircle, 
  Eye, 
  UtensilsCrossed,
  Printer
} from 'lucide-react';
import { GuestWithDetails } from '@/lib/types';

export default function AnalyticsPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/guests');
        if (!res.ok) throw new Error('Failed to load guest list');
        setGuests(await res.json());
      } catch (err: any) {
        setError(err.message || 'Error loading analytics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuests();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm">Calculating guest analytics...</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalGuests = guests.length;
  
  const openedLinks = guests.filter(g => g.invite_link?.opened_at).length;
  const openRate = totalGuests > 0 ? Math.round((openedLinks / totalGuests) * 100) : 0;

  const responded = guests.filter(g => g.rsvp?.status && g.rsvp.status !== 'pending').length;
  const responseRate = totalGuests > 0 ? Math.round((responded / totalGuests) * 100) : 0;

  // Pending segment breakdown
  const openedNotResponded = guests.filter(g => g.invite_link?.opened_at && (!g.rsvp || g.rsvp.status === 'pending')).length;
  const neverOpened = totalGuests - openedLinks;

  // Meal Choice Stats
  const attendingGuests = guests.filter(g => g.rsvp?.status === 'attending');
  const vegCount = attendingGuests.filter(g => g.rsvp?.meal_choice === 'veg').length;
  const nonVegCount = attendingGuests.filter(g => g.rsvp?.meal_choice === 'non-veg').length;
  const veganCount = attendingGuests.filter(g => g.rsvp?.meal_choice === 'vegan').length;
  const noPrefCount = attendingGuests.filter(g => !g.rsvp?.meal_choice || g.rsvp.meal_choice === '').length;
  
  const mealTotal = vegCount + nonVegCount + veganCount + noPrefCount;

  // Export CSV Helper
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Full Guest List Export
  const exportFullGuestList = () => {
    let csv = 'Name,Phone,Email,Wedding Side,Category,Invite Sent At,Invite Opened At,RSVP Status,Plus One,Plus One Name,Meal Choice,Dietary Notes,Message,Responded At\r\n';
    
    guests.forEach((g) => {
      const row = [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${(g.phone || '').replace(/"/g, '""')}"`,
        `"${(g.email || '').replace(/"/g, '""')}"`,
        `"${(g.side || '').replace(/"/g, '""')}"`,
        `"${(g.category?.name || '').replace(/"/g, '""')}"`,
        g.invite_link?.sent_at ? `"${new Date(g.invite_link.sent_at).toISOString()}"` : '""',
        g.invite_link?.opened_at ? `"${new Date(g.invite_link.opened_at).toISOString()}"` : '""',
        `"${g.rsvp?.status || 'pending'}"`,
        g.rsvp?.plus_one ? '"Yes"' : '"No"',
        `"${(g.rsvp?.plus_one_name || '').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.meal_choice || '').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.dietary_notes || '').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.message || '').replace(/"/g, '""')}"`,
        g.rsvp?.responded_at ? `"${new Date(g.rsvp.responded_at).toISOString()}"` : '""'
      ];
      csv += row.join(',') + '\r\n';
    });

    downloadCSV(csv, 'wedding_guests_full_export.csv');
  };

  // 2. Seating Chart helper
  const exportSeatingHelper = () => {
    let csv = 'Guest Name,Wedding Side,Category,RSVP,Plus One Confirmed,Plus One Name,Meal Preference,Dietary Details\r\n';
    
    // Only export confirmed attending guests
    guests.filter(g => g.rsvp?.status === 'attending').forEach((g) => {
      const row = [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${(g.side || '').replace(/"/g, '""')}"`,
        `"${(g.category?.name || '').replace(/"/g, '""')}"`,
        '"Attending"',
        g.rsvp?.plus_one ? '"Yes"' : '"No"',
        `"${(g.rsvp?.plus_one_name || '').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.meal_choice || 'No preference').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.dietary_notes || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\r\n';
    });

    downloadCSV(csv, 'wedding_seating_chart_helper.csv');
  };

  // 3. Print Attendees view
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in print:bg-white print:text-black">
      {/* Header (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif tracking-wide font-semibold text-slate-100">Analytics & Exports</h1>
          <p className="text-sm text-slate-400 mt-1">Review invitation engagement, response distributions, and compile guest lists.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-955/40 border border-rose-900/50 text-rose-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Overview Cards (hidden in print) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {/* Open Rate */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Invite Open Rate</span>
            <Eye className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-100">{openRate}%</span>
            <span className="text-xs text-slate-500">({openedLinks} of {totalGuests} links)</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
            <div style={{ width: `${openRate}%` }} className="bg-sky-450 h-full" />
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">RSVP Response Rate</span>
            <BarChart3 className="w-5 h-5 text-indigo-455" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-100">{responseRate}%</span>
            <span className="text-xs text-slate-500">({responded} of {totalGuests} responses)</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
            <div style={{ width: `${responseRate}%` }} className="bg-indigo-500 h-full" />
          </div>
        </div>

        {/* Pending responses */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Breakdown</span>
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
              <span className="block text-slate-500 uppercase tracking-wider text-[9px] font-semibold">Opened, No RSVP</span>
              <span className="text-lg font-bold text-slate-300">{openedNotResponded}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
              <span className="block text-slate-500 uppercase tracking-wider text-[9px] font-semibold">Never Opened</span>
              <span className="text-lg font-bold text-slate-350">{neverOpened}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        {/* Custom CSS charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Meal Preference Chart */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-serif text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <UtensilsCrossed className="w-5 h-5 text-indigo-400" /> Meal Preferences (Attending Guests)
            </h2>

            {mealTotal === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No meal preferences recorded yet.</p>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Non veg */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">Non-Vegetarian ({nonVegCount})</span>
                    <span className="text-slate-400">{Math.round((nonVegCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div style={{ width: `${(nonVegCount / mealTotal) * 100}%` }} className="bg-indigo-550 h-full" />
                  </div>
                </div>

                {/* Veg */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">Vegetarian ({vegCount})</span>
                    <span className="text-slate-400">{Math.round((vegCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div style={{ width: `${(vegCount / mealTotal) * 100}%` }} className="bg-emerald-500 h-full" />
                  </div>
                </div>

                {/* Vegan */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">Vegan ({veganCount})</span>
                    <span className="text-slate-400">{Math.round((veganCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div style={{ width: `${(veganCount / mealTotal) * 100}%` }} className="bg-teal-400 h-full" />
                  </div>
                </div>

                {/* No preference */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-300">No Preference ({noPrefCount})</span>
                    <span className="text-slate-400">{Math.round((noPrefCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div style={{ width: `${(noPrefCount / mealTotal) * 100}%` }} className="bg-slate-700 h-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exports panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 h-fit">
          <h2 className="text-lg font-serif text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Download className="w-5 h-5 text-indigo-400" /> Export Utilities
          </h2>

          <div className="space-y-4">
            <button
              onClick={exportFullGuestList}
              className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:text-slate-100 text-slate-300 rounded-xl py-3 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Export Full Guest CSV
            </button>

            <button
              onClick={exportSeatingHelper}
              className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:text-slate-100 text-slate-300 rounded-xl py-3 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-rose-400" />
              Export Seating CSV
            </button>

            <button
              onClick={triggerPrint}
              className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:text-slate-100 text-slate-305 rounded-xl py-3 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              Print Attendees PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable block (Visible only in print mode or when requested) */}
      <div className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-serif font-bold">Confirmed Attendees Dossier</h1>
          <p className="text-xs uppercase tracking-widest text-gray-505 font-semibold">Real-time Wedding Coordinator List</p>
          <p className="text-[10px] text-gray-500">Printed: {new Date().toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono py-2 border-b border-gray-300">
          <div>Bride's Side Confirmed: {guests.filter(g => g.side === 'bride' && g.rsvp?.status === 'attending').length + guests.filter(g => g.side === 'bride' && g.rsvp?.status === 'attending' && g.rsvp.plus_one).length} Seats</div>
          <div>Groom's Side Confirmed: {guests.filter(g => g.side === 'groom' && g.rsvp?.status === 'attending').length + guests.filter(g => g.side === 'groom' && g.rsvp?.status === 'attending' && g.rsvp.plus_one).length} Seats</div>
        </div>

        <div className="space-y-6 pt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black text-black font-bold">
                <th className="py-2">Guest Name</th>
                <th className="py-2">Side</th>
                <th className="py-2">Category</th>
                <th className="py-2">Plus One</th>
                <th className="py-2">Meal Selection</th>
                <th className="py-2">Dietary Restrictions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guests
                .filter(g => g.rsvp?.status === 'attending')
                .map((g) => (
                  <tr key={g.id}>
                    <td className="py-2.5 font-semibold">{g.name}</td>
                    <td className="py-2.5 uppercase text-[10px]">{g.side}</td>
                    <td className="py-2.5 text-[10px]">{g.category?.name || 'Uncategorised'}</td>
                    <td className="py-2.5 text-[10px]">{g.rsvp?.plus_one ? `Yes (${g.rsvp.plus_one_name || 'Unnamed'})` : 'No'}</td>
                    <td className="py-2.5 text-[10px] capitalize">{g.rsvp?.meal_choice || 'No preference'}</td>
                    <td className="py-2.5 text-[10px] italic">{g.rsvp?.dietary_notes || 'None'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
