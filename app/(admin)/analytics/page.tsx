'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Loader2, 
  AlertCircle, 
  Eye, 
  UtensilsCrossed,
  Printer,
  HelpCircle,
  Wine
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
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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

  // Alcohol Stats
  const hardLiquorCount = attendingGuests.filter(g => g.rsvp?.alcohol_choice === 'hard liquor').length;
  const wineCount = attendingGuests.filter(g => g.rsvp?.alcohol_choice === 'wine').length;
  const noAlcCount = attendingGuests.filter(g => !g.rsvp?.alcohol_choice || g.rsvp.alcohol_choice === 'none' || g.rsvp.alcohol_choice === '').length;
  
  const alcTotal = hardLiquorCount + wineCount + noAlcCount;

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
    let csv = 'Name,Phone,Email,Wedding Side,Category,Invite Sent At,Invite Opened At,RSVP Status,Plus One,Plus One Name,Meal Choice,Dietary Notes,Alcohol Preference,Message,Responded At\r\n';
    
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
        `"${(g.rsvp?.alcohol_choice || 'none').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.message || '').replace(/"/g, '""')}"`,
        g.rsvp?.responded_at ? `"${new Date(g.rsvp.responded_at).toISOString()}"` : '""'
      ];
      csv += row.join(',') + '\r\n';
    });

    downloadCSV(csv, 'wedding_guests_full_export.csv');
  };

  // 2. Seating Chart helper
  const exportSeatingHelper = () => {
    let csv = 'Guest Name,Wedding Side,Category,RSVP,Plus One Confirmed,Plus One Name,Meal Preference,Dietary Details,Alcohol Preference\r\n';
    
    guests.filter(g => g.rsvp?.status === 'attending').forEach((g) => {
      const row = [
        `"${g.name.replace(/"/g, '""')}"`,
        `"${(g.side || '').replace(/"/g, '""')}"`,
        `"${(g.category?.name || '').replace(/"/g, '""')}"`,
        '"Attending"',
        g.rsvp?.plus_one ? '"Yes"' : '"No"',
        `"${(g.rsvp?.plus_one_name || '').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.meal_choice || 'No preference').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.dietary_notes || '').replace(/"/g, '""')}"`,
        `"${(g.rsvp?.alcohol_choice || 'none').replace(/"/g, '""')}"`
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
    <div className="space-y-6 animate-fade-in print:bg-white print:text-black">
      {/* Header (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900">Analytics & Exports</h1>
          <p className="text-xs text-gray-500 mt-1">Review invitation engagement, response distributions, and compile guest lists.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Overview Cards (hidden in print) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        {/* Open Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between text-gray-550">
            <span className="text-xs font-semibold uppercase tracking-wider">Invite Open Rate</span>
            <Eye className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{openRate}%</span>
            <span className="text-xs text-gray-400">({openedLinks} of {totalGuests})</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div style={{ width: `${openRate}%` }} className="bg-blue-500 h-full" />
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between text-gray-550">
            <span className="text-xs font-semibold uppercase tracking-wider">RSVP Rate</span>
            <BarChart3 className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{responseRate}%</span>
            <span className="text-xs text-gray-400">({responded} of {totalGuests})</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div style={{ width: `${responseRate}%` }} className="bg-indigo-500 h-full" />
          </div>
        </div>

        {/* Pending responses */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-gray-550">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Breakdown</span>
            <HelpCircle className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-semibold">Opened, no RSVP</span>
              <span className="text-base font-bold text-gray-800">{openedNotResponded}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-semibold">Never Opened</span>
              <span className="text-base font-bold text-gray-800">{neverOpened}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Custom CSS charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meal Preference Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
              <UtensilsCrossed className="w-4.5 h-4.5 text-blue-500" /> Meal Preferences (Attending Guests)
            </h2>

            {mealTotal === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">No meal preferences recorded yet.</p>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Non veg */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">Non-Vegetarian ({nonVegCount})</span>
                    <span className="text-gray-500">{Math.round((nonVegCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(nonVegCount / mealTotal) * 100}%` }} className="bg-blue-500 h-full" />
                  </div>
                </div>

                {/* Veg */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">Vegetarian ({vegCount})</span>
                    <span className="text-gray-500">{Math.round((vegCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(vegCount / mealTotal) * 100}%` }} className="bg-green-500 h-full" />
                  </div>
                </div>

                {/* Vegan */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">Vegan ({veganCount})</span>
                    <span className="text-gray-500">{Math.round((veganCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(veganCount / mealTotal) * 100}%` }} className="bg-teal-400 h-full" />
                  </div>
                </div>

                {/* No preference */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">No Preference ({noPrefCount})</span>
                    <span className="text-gray-500">{Math.round((noPrefCount / mealTotal) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(noPrefCount / mealTotal) * 100}%` }} className="bg-gray-400 h-full" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Alcohol Preference Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
              <Wine className="w-4.5 h-4.5 text-[#D38A99]" /> Alcohol Preferences (Attending Guests)
            </h2>

            {alcTotal === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">No alcohol preferences recorded yet.</p>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Hard Liquor */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">Hard Liquor ({hardLiquorCount})</span>
                    <span className="text-gray-500">{alcTotal > 0 ? Math.round((hardLiquorCount / alcTotal) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${alcTotal > 0 ? (hardLiquorCount / alcTotal) * 100 : 0}%` }} className="bg-purple-500 h-full" />
                  </div>
                </div>

                {/* Wine */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">Wine ({wineCount})</span>
                    <span className="text-gray-500">{alcTotal > 0 ? Math.round((wineCount / alcTotal) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${alcTotal > 0 ? (wineCount / alcTotal) * 100 : 0}%` }} className="bg-red-500 h-full" />
                  </div>
                </div>

                {/* No Alcohol */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">No Alcohol ({noAlcCount})</span>
                    <span className="text-gray-500">{alcTotal > 0 ? Math.round((noAlcCount / alcTotal) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${alcTotal > 0 ? (noAlcCount / alcTotal) * 100 : 0}%` }} className="bg-gray-400 h-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exports panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
            <Download className="w-4.5 h-4.5 text-blue-500" /> Export Utilities
          </h2>

          <div className="space-y-3">
            <button
              onClick={exportFullGuestList}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-500" />
              Export Full Guest CSV
            </button>

            <button
              onClick={exportSeatingHelper}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-500" />
              Export Seating CSV
            </button>

            <button
              onClick={triggerPrint}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              Print Attendees PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable block (Visible only in print mode or when requested) */}
      <div className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-serif font-bold">Confirmed Attendees List</h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Wedding Coordination Dossier</p>
          <p className="text-[10px] text-gray-400">Printed: {new Date().toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono py-2 border-b border-gray-200">
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
                <th className="py-2">Alcohol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guests
                .filter(g => g.rsvp?.status === 'attending')
                .map((g) => (
                  <tr key={g.id}>
                    <td className="py-2 font-semibold text-gray-900">{g.name}</td>
                    <td className="py-2 uppercase text-[10px] text-gray-650">{g.side}</td>
                    <td className="py-2 text-[10px] text-gray-600">{g.category?.name || 'Uncategorised'}</td>
                    <td className="py-2 text-[10px] text-gray-600">{g.rsvp?.plus_one ? `Yes (${g.rsvp.plus_one_name || 'Unnamed'})` : 'No'}</td>
                    <td className="py-2 text-[10px] capitalize text-gray-600">{g.rsvp?.meal_choice || 'No preference'}</td>
                    <td className="py-2 text-[10px] italic text-gray-500">{g.rsvp?.dietary_notes || 'None'}</td>
                    <td className="py-2 text-[10px] capitalize text-gray-600">{g.rsvp?.alcohol_choice || 'none'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
