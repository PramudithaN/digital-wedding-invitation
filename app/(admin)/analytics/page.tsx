'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Loader2, 
  AlertCircle, 
  UtensilsCrossed,
  Printer,
  Wine,
  Users,
  GlassWater,
  Sparkles
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
  
  const responded = guests.filter(g => g.rsvp?.status && g.rsvp.status !== 'pending').length;
  const responseRate = totalGuests > 0 ? Math.round((responded / totalGuests) * 100) : 0;

  // Plus Ones (Extra Guests) per side
  const sidePlusOnes = {
    bride: 0,
    groom: 0,
    groom_mother: 0,
    groom_father: 0,
    unassigned: 0
  };

  guests.forEach(g => {
    if (g.rsvp?.status === 'attending') {
      const count = g.rsvp.attending_count && g.rsvp.attending_count > 0 ? g.rsvp.attending_count : (g.rsvp.plus_one || 1);
      const extraGuests = Math.max(0, count - 1);
      
      if (g.side === 'bride') sidePlusOnes.bride += extraGuests;
      else if (g.side === 'groom') sidePlusOnes.groom += extraGuests;
      else if (g.side === 'groom_mother') sidePlusOnes.groom_mother += extraGuests;
      else if (g.side === 'groom_father') sidePlusOnes.groom_father += extraGuests;
      else sidePlusOnes.unassigned += extraGuests;
    }
  });

  // Meal & Alcohol Choice Stats (calculated per attending seat)
  const attendingGuests = guests.filter(g => g.rsvp?.status === 'attending');

  let vegCount = 0;
  let nonVegCount = 0;
  let veganCount = 0;
  let noPrefCount = 0;

  let hardLiquorCount = 0;
  let wineCount = 0;
  let noAlcCount = 0;

  attendingGuests.forEach(g => {
    const count = g.rsvp?.attending_count && g.rsvp.attending_count > 0 
      ? g.rsvp.attending_count 
      : (typeof g.rsvp?.plus_one === 'number' && g.rsvp.plus_one > 0 ? g.rsvp.plus_one : 1);

    const rawMeal = g.rsvp?.meal_choice || '';
    const mealChoices = rawMeal ? rawMeal.split(',').map(s => s.trim().toLowerCase()) : [];

    const rawAlc = g.rsvp?.alcohol_choice || '';
    const alcChoices = rawAlc ? rawAlc.split(',').map(s => s.trim().toLowerCase()) : [];

    for (let i = 0; i < count; i++) {
      const meal = mealChoices[i] || (mealChoices.length === 1 ? mealChoices[0] : '') || '';
      if (meal === 'veg' || meal === 'vegetarian') vegCount++;
      else if (meal === 'non-veg' || meal === 'non-vegetarian' || meal === 'non veg') nonVegCount++;
      else if (meal === 'vegan') veganCount++;
      else noPrefCount++;

      const alc = alcChoices[i] || (alcChoices.length === 1 ? alcChoices[0] : '') || 'none';
      if (alc === 'hard liquor' || alc === 'liquor' || alc === 'hard-liquor') hardLiquorCount++;
      else if (alc === 'wine') wineCount++;
      else noAlcCount++;
    }
  });

  const mealTotal = vegCount + nonVegCount + veganCount + noPrefCount;
  const alcTotal = hardLiquorCount + wineCount + noAlcCount;
  const totalAttendingSeats = attendingGuests.reduce((sum, g) => {
    const count = g.rsvp?.attending_count && g.rsvp.attending_count > 0 
      ? g.rsvp.attending_count 
      : (typeof g.rsvp?.plus_one === 'number' && g.rsvp.plus_one > 0 ? g.rsvp.plus_one : 1);
    return sum + count;
  }, 0);

  // Safe helpers for CSV generation
  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const formatDateSafe = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Export CSV Helper
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
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
    const headers = [
      'Guest ID',
      'Guest Name',
      'Phone',
      'Email',
      'Wedding Side',
      'Category',
      'RSVP Status',
      'Attending Count',
      'Table No',
      'Meal Preference',
      'Alcohol Preference',
      'Dietary Notes',
      'Plus One Name',
      'Message',
      'Invite Sent Date',
      'Invite Opened Date',
      'Responded Date'
    ];
    
    const rows = guests.map((g) => {
      const status = g.rsvp?.status || 'pending';
      const allocatedSeats = typeof g.rsvp?.plus_one === 'number' && g.rsvp.plus_one > 0 ? g.rsvp.plus_one : 1;
      const attendingCount = status === 'attending'
        ? (typeof g.rsvp?.attending_count === 'number' && g.rsvp.attending_count > 0 ? g.rsvp.attending_count : allocatedSeats)
        : 0;

      return [
        escapeCSV(g.id),
        escapeCSV(g.name),
        escapeCSV(g.phone || ''),
        escapeCSV(g.email || ''),
        escapeCSV(g.side || 'bride'),
        escapeCSV(g.category?.name || 'Uncategorised'),
        escapeCSV(status),
        attendingCount,
        escapeCSV(g.table_no || ''),
        escapeCSV(g.rsvp?.meal_choice || '-'),
        escapeCSV(g.rsvp?.alcohol_choice || 'none'),
        escapeCSV(g.rsvp?.dietary_notes || ''),
        escapeCSV(g.rsvp?.plus_one_name || ''),
        escapeCSV(g.rsvp?.message || ''),
        escapeCSV(formatDateSafe(g.invite_link?.sent_at)),
        escapeCSV(formatDateSafe(g.invite_link?.opened_at)),
        escapeCSV(formatDateSafe(g.rsvp?.responded_at))
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    downloadCSV(csvContent, 'wedding_guests_full_export.csv');
  };

  // 2. Seating Chart helper
  const exportSeatingHelper = () => {
    const headers = [
      'Guest ID',
      'Guest Name',
      'Wedding Side',
      'Category',
      'Table No',
      'RSVP Status',
      'Attending Count',
      'Meal Preference',
      'Alcohol Preference',
      'Dietary Notes',
      'Plus One Name'
    ];
    
    const rows = guests
      .filter(g => g.rsvp?.status === 'attending')
      .map((g) => {
        const allocatedSeats = typeof g.rsvp?.plus_one === 'number' && g.rsvp.plus_one > 0 ? g.rsvp.plus_one : 1;
        const attendingCount = typeof g.rsvp?.attending_count === 'number' && g.rsvp.attending_count > 0 
          ? g.rsvp.attending_count 
          : allocatedSeats;

        return [
          escapeCSV(g.id),
          escapeCSV(g.name),
          escapeCSV(g.side || 'bride'),
          escapeCSV(g.category?.name || 'Uncategorised'),
          escapeCSV(g.table_no || ''),
          escapeCSV('Attending'),
          attendingCount,
          escapeCSV(g.rsvp?.meal_choice || 'No preference'),
          escapeCSV(g.rsvp?.alcohol_choice || 'none'),
          escapeCSV(g.rsvp?.dietary_notes || ''),
          escapeCSV(g.rsvp?.plus_one_name || '')
        ].join(',');
      });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    downloadCSV(csvContent, 'wedding_seating_chart_helper.csv');
  };

  // 3. Catering & Beverage Breakdown Export
  const exportCateringHelper = () => {
    const headers = [
      'Guest ID',
      'Guest Name',
      'Table No',
      'Attending Count',
      'Meal Preference',
      'Alcohol Preference',
      'Dietary Notes'
    ];

    const rows = guests
      .filter(g => g.rsvp?.status === 'attending')
      .map((g) => {
        const allocatedSeats = typeof g.rsvp?.plus_one === 'number' && g.rsvp.plus_one > 0 ? g.rsvp.plus_one : 1;
        const attendingCount = typeof g.rsvp?.attending_count === 'number' && g.rsvp.attending_count > 0 
          ? g.rsvp.attending_count 
          : allocatedSeats;

        return [
          escapeCSV(g.id),
          escapeCSV(g.name),
          escapeCSV(g.table_no || ''),
          attendingCount,
          escapeCSV(g.rsvp?.meal_choice || 'No preference'),
          escapeCSV(g.rsvp?.alcohol_choice || 'none'),
          escapeCSV(g.rsvp?.dietary_notes || '')
        ].join(',');
      });

    const summaryRow = [
      escapeCSV('TOTALS'),
      escapeCSV(`Total Confirmed Seats: ${totalAttendingSeats}`),
      escapeCSV(''),
      totalAttendingSeats,
      escapeCSV(`Non-Veg: ${nonVegCount}, Veg: ${vegCount}, Vegan: ${veganCount}, No Pref: ${noPrefCount}`),
      escapeCSV(`Hard Liquor: ${hardLiquorCount}, Wine: ${wineCount}, Non-Alc: ${noAlcCount}`),
      escapeCSV('')
    ].join(',');

    const csvContent = [headers.join(','), ...rows, '', summaryRow].join('\r\n');
    downloadCSV(csvContent, 'wedding_catering_and_beverages.csv');
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
          <p className="text-xs text-gray-500 mt-1">Review invitation engagement, dietary & beverage distributions, and compile guest lists.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Overview Cards (hidden in print) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Response Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-550">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">RSVP Rate</span>
            <BarChart3 className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{responseRate}%</span>
              <span className="text-xs text-gray-400">({responded} of {totalGuests})</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div style={{ width: `${responseRate}%` }} className="bg-indigo-500 h-full" />
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-gray-100">
            <span>Attending Seats</span>
            <span className="font-semibold text-emerald-600">{totalAttendingSeats} confirmed</span>
          </div>
        </div>

        {/* Meal Preferences Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-550">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Meal Counts (Attending)</span>
            <UtensilsCrossed className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50/70 border border-blue-100 rounded-md p-2">
              <span className="block text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Non-Veg</span>
              <span className="text-xl font-bold text-blue-900">{nonVegCount}</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-md p-2">
              <span className="block text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Veg</span>
              <span className="text-xl font-bold text-emerald-900">{vegCount}</span>
            </div>
            <div className="bg-teal-50/70 border border-teal-100 rounded-md p-2">
              <span className="block text-[10px] font-semibold text-teal-700 uppercase tracking-wider">Vegan</span>
              <span className="text-base font-bold text-teal-900">{veganCount}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
              <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">No Pref</span>
              <span className="text-base font-bold text-gray-800">{noPrefCount}</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-gray-100">
            <span>Total Meal Choices</span>
            <span className="font-semibold text-gray-800">{mealTotal}</span>
          </div>
        </div>

        {/* Beverage Preferences Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-550">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Beverage Counts (Attending)</span>
            <Wine className="w-4.5 h-4.5 text-[#D38A99]" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div className="bg-purple-50/70 border border-purple-100 rounded-md p-2 text-center">
              <span className="block text-[9px] font-semibold text-purple-700 uppercase tracking-wider">Hard Liquor</span>
              <span className="text-xl font-bold text-purple-900">{hardLiquorCount}</span>
            </div>
            <div className="bg-rose-50/70 border border-rose-100 rounded-md p-2 text-center">
              <span className="block text-[9px] font-semibold text-rose-700 uppercase tracking-wider">Wine</span>
              <span className="text-xl font-bold text-rose-900">{wineCount}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2 text-center">
              <span className="block text-[9px] font-semibold text-slate-600 uppercase tracking-wider">Non-Alc</span>
              <span className="text-xl font-bold text-slate-800">{noAlcCount}</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-gray-100">
            <span>Total Drinks Recorded</span>
            <span className="font-semibold text-gray-800">{alcTotal}</span>
          </div>
        </div>

        {/* Plus Ones by Side */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-550">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Plus Ones (Attending)</span>
            <Users className="w-4.5 h-4.5 text-pink-500" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-semibold">Bride Side</span>
              <span className="text-base font-bold text-gray-800">{sidePlusOnes.bride}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200">
              <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-semibold">Groom Side</span>
              <span className="text-base font-bold text-gray-800">{sidePlusOnes.groom}</span>
            </div>
            {(sidePlusOnes.groom_mother > 0 || sidePlusOnes.groom_father > 0) && (
              <>
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-semibold">Groom Mother</span>
                  <span className="text-base font-bold text-gray-800">{sidePlusOnes.groom_mother}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                  <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-semibold">Groom Father</span>
                  <span className="text-base font-bold text-gray-800">{sidePlusOnes.groom_father}</span>
                </div>
              </>
            )}
            {sidePlusOnes.unassigned > 0 && (
              <div className="bg-gray-50 p-2 rounded border border-gray-200 col-span-2">
                <span className="block text-gray-400 uppercase tracking-wider text-[8px] font-semibold">Unassigned</span>
                <span className="text-base font-bold text-gray-800">{sidePlusOnes.unassigned}</span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-gray-100">
            <span>Extra Guests</span>
            <span className="font-semibold text-gray-800">{sidePlusOnes.bride + sidePlusOnes.groom + sidePlusOnes.groom_mother + sidePlusOnes.groom_father + sidePlusOnes.unassigned}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Custom CSS charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Meal Preference Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-150 pb-3">
              <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2">
                <UtensilsCrossed className="w-4.5 h-4.5 text-blue-500" /> Meal Preferences (Attending Guests)
              </h2>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">Non-Veg: {nonVegCount}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">Veg: {vegCount}</span>
                {veganCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold border border-teal-100">Vegan: {veganCount}</span>
                )}
                {noPrefCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold border border-gray-200">No Pref: {noPrefCount}</span>
                )}
              </div>
            </div>

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-150 pb-3">
              <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2">
                <Wine className="w-4.5 h-4.5 text-[#D38A99]" /> Alcohol & Beverage Preferences (Attending Guests)
              </h2>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-100">Hard Liquor: {hardLiquorCount}</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-100">Wine: {wineCount}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">Non-Alcoholic: {noAlcCount}</span>
              </div>
            </div>

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
                    <div style={{ width: `${alcTotal > 0 ? (wineCount / alcTotal) * 100 : 0}%` }} className="bg-rose-500 h-full" />
                  </div>
                </div>

                {/* No Alcohol */}
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-gray-700">Non-Alcoholic ({noAlcCount})</span>
                    <span className="text-gray-500">{alcTotal > 0 ? Math.round((noAlcCount / alcTotal) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${alcTotal > 0 ? (noAlcCount / alcTotal) * 100 : 0}%` }} className="bg-slate-400 h-full" />
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
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-blue-500" />
              Export Full Guest CSV
            </button>

            <button
              onClick={exportSeatingHelper}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-purple-500" />
              Export Seating CSV
            </button>

            <button
              onClick={exportCateringHelper}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              Export Catering & Bar CSV
            </button>

            <button
              onClick={triggerPrint}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
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
          <div>Bride's Side Confirmed: {guests.filter(g => g.side === 'bride' && g.rsvp?.status === 'attending').reduce((sum, g) => {
            const count = g.rsvp?.attending_count && g.rsvp.attending_count > 0 ? g.rsvp.attending_count : (g.rsvp?.plus_one || 1);
            return sum + count;
          }, 0)} Seats</div>
          <div>Groom's Side Confirmed: {guests.filter(g => g.side === 'groom' && g.rsvp?.status === 'attending').reduce((sum, g) => {
            const count = g.rsvp?.attending_count && g.rsvp.attending_count > 0 ? g.rsvp.attending_count : (g.rsvp?.plus_one || 1);
            return sum + count;
          }, 0)} Seats</div>
        </div>

        {/* Catering & Bar Summary in Print View */}
        <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-gray-200">
          <div>
            <span className="font-bold block mb-1">Catering Breakdown:</span>
            <span>Non-Veg: {nonVegCount} | Veg: {vegCount} | Vegan: {veganCount} {noPrefCount > 0 ? `| No Pref: ${noPrefCount}` : ''}</span>
          </div>
          <div>
            <span className="font-bold block mb-1">Bar / Beverage Breakdown:</span>
            <span>Hard Liquor: {hardLiquorCount} | Wine: {wineCount} | Non-Alcoholic: {noAlcCount}</span>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black text-black font-bold">
                <th className="py-2">Guest Name</th>
                <th className="py-2">Side</th>
                <th className="py-2">Category</th>
                <th className="py-2">Seats</th>
                <th className="py-2">Plus One</th>
                <th className="py-2">Meal Selection</th>
                <th className="py-2">Dietary Restrictions</th>
                <th className="py-2">Alcohol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guests
                .filter(g => g.rsvp?.status === 'attending')
                .map((g) => {
                  const attendingCount = g.rsvp?.attending_count && g.rsvp.attending_count > 0 
                    ? g.rsvp.attending_count 
                    : (typeof g.rsvp?.plus_one === 'number' && g.rsvp.plus_one > 0 ? g.rsvp.plus_one : 1);
                  return (
                    <tr key={g.id}>
                      <td className="py-2 font-semibold text-gray-900">{g.name}</td>
                      <td className="py-2 uppercase text-[10px] text-gray-650">{g.side}</td>
                      <td className="py-2 text-[10px] text-gray-600">{g.category?.name || 'Uncategorised'}</td>
                      <td className="py-2 text-[10px] font-semibold text-gray-900">{attendingCount}</td>
                      <td className="py-2 text-[10px] text-gray-600">{(g.rsvp?.plus_one && g.rsvp.plus_one > 1) ? `Yes (${g.rsvp.plus_one_name || 'Unnamed'})` : 'No'}</td>
                      <td className="py-2 text-[10px] capitalize text-gray-600">{g.rsvp?.meal_choice || 'No preference'}</td>
                      <td className="py-2 text-[10px] italic text-gray-500">{g.rsvp?.dietary_notes || 'None'}</td>
                      <td className="py-2 text-[10px] capitalize text-gray-600">{g.rsvp?.alcohol_choice || 'none'}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
