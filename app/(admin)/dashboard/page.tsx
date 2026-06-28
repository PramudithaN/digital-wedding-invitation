'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserPlus, 
  Armchair, 
  Loader2, 
  ArrowRight,
  TrendingUp,
  Heart,
  AlertCircle
} from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';

export default function DashboardPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [guestsRes, catsRes] = await Promise.all([
          fetch('/api/guests'),
          fetch('/api/categories')
        ]);
        if (!guestsRes.ok || !catsRes.ok) throw new Error('Failed to load dashboard metrics');
        
        setGuests(await guestsRes.json());
        setCategories(await catsRes.json());
      } catch (err: any) {
        setError(err.message || 'Error loading dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Assembling dashboard metrics...</p>
      </div>
    );
  }

  // Calculate metrics
  const totalInvited = guests.length;
  const attending = guests.filter(g => g.rsvp?.status === 'attending').length;
  const declined = guests.filter(g => g.rsvp?.status === 'declined').length;
  const pending = totalInvited - attending - declined;

  const plusOnes = guests.filter(g => g.rsvp?.status === 'attending' && g.rsvp?.plus_one).length;
  const totalSeats = attending + plusOnes;

  // Representation calculations
  const brideTotal = guests.filter(g => g.side === 'bride').length;
  const groomTotal = guests.filter(g => g.side === 'groom').length;
  
  const brideAttending = guests.filter(g => g.side === 'bride' && g.rsvp?.status === 'attending').length;
  const groomAttending = guests.filter(g => g.side === 'groom' && g.rsvp?.status === 'attending').length;

  const bridePlusOnes = guests.filter(g => g.side === 'bride' && g.rsvp?.status === 'attending' && g.rsvp?.plus_one).length;
  const groomPlusOnes = guests.filter(g => g.side === 'groom' && g.rsvp?.status === 'attending' && g.rsvp?.plus_one).length;

  const brideSeats = brideAttending + bridePlusOnes;
  const groomSeats = groomAttending + groomPlusOnes;

  // Segment percentages for the unified RSVP progress bar
  const attendingPct = totalInvited > 0 ? (attending / totalInvited) * 100 : 0;
  const declinedPct = totalInvited > 0 ? (declined / totalInvited) * 100 : 0;
  const pendingPct = totalInvited > 0 ? (pending / totalInvited) * 100 : 0;

  // Recent RSVP actions
  const recentActivities = guests
    .filter(g => g.rsvp?.responded_at)
    .sort((a, b) => {
      const dateA = a.rsvp?.responded_at ? new Date(a.rsvp.responded_at).getTime() : 0;
      const dateB = b.rsvp?.responded_at ? new Date(b.rsvp.responded_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 8);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time attendance summaries, seat counts, and guest configurations.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Headcount Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Invited */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium tracking-wide">Total Invited</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900">{totalInvited}</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Invited guests</p>
          </div>
        </div>

        {/* Attending (Green left accent border) */}
        <div className="bg-white border border-gray-200 border-l-[3px] border-l-green-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium tracking-wide">Attending</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900">{attending}</span>
            <p className="text-[10px] text-green-600 font-semibold mt-0.5">
              {totalInvited > 0 ? Math.round((attending / totalInvited) * 100) : 0}% response rate
            </p>
          </div>
        </div>

        {/* Declined */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <XCircle className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium tracking-wide">Declined</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900">{declined}</span>
            <p className="text-[10px] text-red-500 font-semibold mt-0.5">
              {totalInvited > 0 ? Math.round((declined / totalInvited) * 100) : 0}% declined
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium tracking-wide">Pending</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900">{pending}</span>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
              {totalInvited > 0 ? Math.round((pending / totalInvited) * 100) : 0}% pending
            </p>
          </div>
        </div>

        {/* Total Seats */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Armchair className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium tracking-wide">Total Seats</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900">{totalSeats}</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Attending + plus ones</p>
          </div>
        </div>

        {/* Plus Ones */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <UserPlus className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium tracking-wide">Plus Ones</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-900">{plusOnes}</span>
            <p className="text-[10px] text-gray-405 mt-0.5">Confirmed +1s</p>
          </div>
        </div>
      </div>

      {/* RSVP Segmented Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
          <span>RSVP Response Ratios</span>
          <span className="font-semibold text-gray-900">
            {attending} attending · {declined} declined · {pending} pending
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden flex">
          <div style={{ width: `${attendingPct}%` }} className="bg-green-500 h-full transition-all duration-300" title={`Attending: ${Math.round(attendingPct)}%`} />
          <div style={{ width: `${declinedPct}%` }} className="bg-red-400 h-full transition-all duration-300" title={`Declined: ${Math.round(declinedPct)}%`} />
          <div style={{ width: `${pendingPct}%` }} className="bg-amber-400 h-full transition-all duration-300" title={`Pending: ${Math.round(pendingPct)}%`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Representation & Group Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Representation Balance */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" /> Representation
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
                  <span className="text-purple-600">Bride's Guests: {brideTotal} ({brideSeats} seats)</span>
                  <span className="text-blue-600">Groom's Guests: {groomTotal} ({groomSeats} seats)</span>
                </div>
                <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden flex border border-gray-200">
                  <div 
                    style={{ width: `${totalInvited > 0 ? (brideTotal / totalInvited) * 100 : 50}%` }} 
                    className="bg-purple-500 h-full transition-all duration-550" 
                  />
                  <div 
                    style={{ width: `${totalInvited > 0 ? (groomTotal / totalInvited) * 100 : 50}%` }} 
                    className="bg-blue-500 h-full transition-all duration-550" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div className="bg-purple-50/50 border border-purple-100 p-3.5 rounded">
                  <span className="block text-gray-500 mb-1">Bride's side confirmed:</span>
                  <span className="text-lg font-bold text-purple-600">{brideAttending}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Plus {bridePlusOnes} plus ones</span>
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded">
                  <span className="block text-gray-500 mb-1">Groom's side confirmed:</span>
                  <span className="text-lg font-bold text-blue-600">{groomAttending}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Plus {groomPlusOnes} plus ones</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider">Categories Breakdown</h2>
              <Link href="/categories" className="text-xs font-medium text-blue-500 hover:text-blue-600 flex items-center gap-0.5">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 font-semibold">Category</th>
                    <th className="py-2.5 font-semibold">Invited</th>
                    <th className="py-2.5 font-semibold">Attending</th>
                    <th className="py-2.5 font-semibold">Declined</th>
                    <th className="py-2.5 font-semibold">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {categories.map((cat) => {
                    const catGuests = guests.filter(g => g.category_id === cat.id);
                    const catTotal = catGuests.length;
                    const catAttending = catGuests.filter(g => g.rsvp?.status === 'attending').length;
                    const catDeclined = catGuests.filter(g => g.rsvp?.status === 'declined').length;
                    const catPending = catTotal - catAttending - catDeclined;
                    
                    return (
                      <tr key={cat.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-medium flex items-center gap-2">
                          <span style={{ backgroundColor: cat.colour }} className="w-2 h-2 rounded-full shrink-0" />
                          <span className="text-gray-900">{cat.name}</span>
                        </td>
                        <td className="py-3 text-gray-600">{catTotal}</td>
                        <td className="py-3 text-green-600 font-semibold">{catAttending}</td>
                        <td className="py-3 text-red-500">{catDeclined}</td>
                        <td className="py-3 text-gray-400">{catPending}</td>
                      </tr>
                    );
                  })}
                  {/* Guests with no category */}
                  {(() => {
                    const noCatGuests = guests.filter(g => !g.category_id);
                    const noCatTotal = noCatGuests.length;
                    if (noCatTotal === 0) return null;
                    const noCatAttending = noCatGuests.filter(g => g.rsvp?.status === 'attending').length;
                    const noCatDeclined = noCatGuests.filter(g => g.rsvp?.status === 'declined').length;
                    const noCatPending = noCatTotal - noCatAttending - noCatDeclined;
                    
                    return (
                      <tr className="hover:bg-gray-50/50">
                        <td className="py-3 text-gray-500 italic">Uncategorised</td>
                        <td className="py-3 text-gray-500">{noCatTotal}</td>
                        <td className="py-3 text-green-550/80">{noCatAttending}</td>
                        <td className="py-3 text-red-550/80">{noCatDeclined}</td>
                        <td className="py-3 text-gray-400">{noCatPending}</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Responses / Activity Feed */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6 h-fit">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider">Recent Activity</h2>
            <Link href="/rsvp" className="text-xs font-medium text-blue-500 hover:text-blue-600 flex items-center gap-0.5">
              All RSVPs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded">
              No RSVP activities logged yet.
            </div>
          ) : (
            <div className="relative pl-4 border-l border-dashed border-gray-200 space-y-5">
              {recentActivities.map((guest) => {
                const status = guest.rsvp?.status;
                const dotColor = status === 'attending' 
                  ? 'bg-green-500' 
                  : status === 'declined' 
                  ? 'bg-red-400' 
                  : 'bg-amber-400';
                  
                const timeString = guest.rsvp?.responded_at 
                  ? new Date(guest.rsvp.responded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) 
                  : '';

                return (
                  <div key={guest.id} className="relative text-xs">
                    {/* Circle Dot Connector */}
                    <span className={`absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full border border-white ${dotColor}`} />
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-gray-900">
                          {guest.name}{' '}
                          <span className="font-normal text-gray-500">
                            {status === 'attending' ? 'confirmed attendance' : 'declined invitation'}
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-400">{timeString}</p>
                      </div>
                      
                      <span className={`badge ${
                        guest.side === 'bride' ? 'badge-bride' : 'badge-groom'
                      }`}>
                        {guest.side}
                      </span>
                    </div>

                    {guest.rsvp?.message && (
                      <p className="text-gray-500 italic mt-1.5 bg-gray-50 p-2 rounded border border-gray-150">
                        "{guest.rsvp.message}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
