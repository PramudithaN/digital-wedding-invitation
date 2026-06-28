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
  Heart, 
  MessageSquare,
  UtensilsCrossed,
  ArrowRight,
  TrendingUp
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
        
        const guestsData = await guestsRes.json();
        const catsData = await catsRes.json();

        setGuests(guestsData);
        setCategories(catsData);
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
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm">Assembling dashboard metrics...</p>
      </div>
    );
  }

  // Calculate metrics
  const totalInvited = guests.length;
  const attending = guests.filter(g => g.rsvp?.status === 'attending').length;
  const declined = guests.filter(g => g.rsvp?.status === 'declined').length;
  const pending = totalInvited - attending - declined;

  // Plus ones are only counted if the main guest is attending and has checked plus_one
  const plusOnes = guests.filter(g => g.rsvp?.status === 'attending' && g.rsvp?.plus_one).length;
  const totalSeats = attending + plusOnes;

  // Bride / Groom Side distribution
  const brideTotal = guests.filter(g => g.side === 'bride').length;
  const groomTotal = guests.filter(g => g.side === 'groom').length;
  
  const brideAttending = guests.filter(g => g.side === 'bride' && g.rsvp?.status === 'attending').length;
  const groomAttending = guests.filter(g => g.side === 'groom' && g.rsvp?.status === 'attending').length;

  const bridePlusOnes = guests.filter(g => g.side === 'bride' && g.rsvp?.status === 'attending' && g.rsvp?.plus_one).length;
  const groomPlusOnes = guests.filter(g => g.side === 'groom' && g.rsvp?.status === 'attending' && g.rsvp?.plus_one).length;

  const brideSeats = brideAttending + bridePlusOnes;
  const groomSeats = groomAttending + groomPlusOnes;

  // Recent responses with messages
  const recentMessages = guests
    .filter(g => g.rsvp?.message || g.rsvp?.dietary_notes)
    .sort((a, b) => {
      const dateA = a.rsvp?.responded_at ? new Date(a.rsvp.responded_at).getTime() : 0;
      const dateB = b.rsvp?.responded_at ? new Date(b.rsvp.responded_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl" />
        
        <div className="max-w-xl z-10 relative space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-350 border border-indigo-500/30">
            <Heart className="w-3.5 h-3.5 fill-indigo-400" /> Real-time headcounts active
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-wide text-slate-100">
            Your Wedding Invitation Dashboard
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
            Track RSVP statistics, manage guest lists, send personalised invitations, and view table distributions from a single responsive panel.
          </p>
        </div>
      </div>

      {/* Headcount Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Invited */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invited</span>
            <span className="p-2 bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-100">{totalInvited}</span>
            <p className="text-[10px] text-slate-500 mt-1">Guest accounts</p>
          </div>
        </div>

        {/* Attending */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attending</span>
            <span className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-100">{attending}</span>
            <p className="text-[10px] text-emerald-450 mt-1">
              {totalInvited > 0 ? Math.round((attending / totalInvited) * 100) : 0}% response rate
            </p>
          </div>
        </div>

        {/* Declined */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Declined</span>
            <span className="p-2 bg-rose-955/40 text-rose-405 border border-rose-900/30 rounded-xl">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-100">{declined}</span>
            <p className="text-[10px] text-rose-455 mt-1">
              {totalInvited > 0 ? Math.round((declined / totalInvited) * 100) : 0}% declined rate
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
            <span className="p-2 bg-amber-950/40 text-amber-400 border border-amber-900/30 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-100">{pending}</span>
            <p className="text-[10px] text-amber-450 mt-1">
              {totalInvited > 0 ? Math.round((pending / totalInvited) * 100) : 0}% to respond
            </p>
          </div>
        </div>

        {/* Plus Ones */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plus Ones</span>
            <span className="p-2 bg-violet-955/40 text-violet-400 border border-violet-900/30 rounded-xl">
              <UserPlus className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-100">{plusOnes}</span>
            <p className="text-[10px] text-slate-500 mt-1">Confirmed +1s</p>
          </div>
        </div>

        {/* Total Seats */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Seats</span>
            <span className="p-2 bg-sky-955/40 text-sky-400 border border-sky-900/30 rounded-xl">
              <Armchair className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-100">{totalSeats}</span>
            <p className="text-[10px] text-sky-450 mt-1">Guests + plus ones</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Representation & Category Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Side distribution */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-serif text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Wedding Representation
            </h2>
            
            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-rose-400">Bride's Guests: {brideTotal} ({brideSeats} seats)</span>
                  <span className="text-indigo-400">Groom's Guests: {groomTotal} ({groomSeats} seats)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-850 flex">
                  <div 
                    style={{ width: `${totalInvited > 0 ? (brideTotal / totalInvited) * 100 : 50}%` }} 
                    className="bg-rose-500 h-full transition-all duration-550" 
                  />
                  <div 
                    style={{ width: `${totalInvited > 0 ? (groomTotal / totalInvited) * 100 : 50}%` }} 
                    className="bg-indigo-500 h-full transition-all duration-550" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-rose-955/10 border border-rose-900/20 p-3 rounded-xl">
                  <span className="block text-slate-400 mb-1">Bride's side confirmed:</span>
                  <span className="text-lg font-bold text-rose-300">{brideAttending}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Plus {bridePlusOnes} plus ones</span>
                </div>
                
                <div className="bg-indigo-955/10 border border-indigo-900/20 p-3 rounded-xl">
                  <span className="block text-slate-400 mb-1">Groom's side confirmed:</span>
                  <span className="text-lg font-bold text-indigo-300">{groomAttending}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Plus {groomPlusOnes} plus ones</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif text-slate-200">Category Statistics</h2>
              <Link href="/categories" className="text-xs text-indigo-400 hover:text-indigo-305 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-450 uppercase tracking-wider font-semibold">
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Total Invited</th>
                    <th className="py-2.5">Attending</th>
                    <th className="py-2.5">Declined</th>
                    <th className="py-2.5">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {categories.map((cat) => {
                    const catGuests = guests.filter(g => g.category_id === cat.id);
                    const catTotal = catGuests.length;
                    const catAttending = catGuests.filter(g => g.rsvp?.status === 'attending').length;
                    const catDeclined = catGuests.filter(g => g.rsvp?.status === 'declined').length;
                    const catPending = catTotal - catAttending - catDeclined;
                    
                    return (
                      <tr key={cat.id} className="hover:bg-slate-900/10">
                        <td className="py-3 font-semibold flex items-center gap-2">
                          <span style={{ backgroundColor: cat.colour }} className="w-2.5 h-2.5 rounded-full shrink-0" />
                          <span className="text-slate-200">{cat.name}</span>
                        </td>
                        <td className="py-3 text-slate-300 font-mono">{catTotal}</td>
                        <td className="py-3 text-emerald-400 font-semibold font-mono">{catAttending}</td>
                        <td className="py-3 text-rose-400 font-mono">{catDeclined}</td>
                        <td className="py-3 text-slate-500 font-mono">{catPending}</td>
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
                      <tr className="hover:bg-slate-900/10">
                        <td className="py-3 font-medium text-slate-450 italic">Uncategorised</td>
                        <td className="py-3 text-slate-400 font-mono">{noCatTotal}</td>
                        <td className="py-3 text-emerald-500/80 font-mono">{noCatAttending}</td>
                        <td className="py-3 text-rose-500/80 font-mono">{noCatDeclined}</td>
                        <td className="py-3 text-slate-500 font-mono">{noCatPending}</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Responses / Activity Feed */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 h-fit">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" /> Recent Messages
            </h2>
            <Link href="/rsvp" className="text-xs text-indigo-400 hover:text-indigo-305 flex items-center gap-1">
              All RSVPs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-xl">
              No RSVP messages or dietary notes submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentMessages.map((guest) => (
                <div 
                  key={guest.id} 
                  className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2.5 hover:border-slate-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-200 text-xs">{guest.name}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wider ${
                      guest.rsvp?.status === 'attending' 
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' 
                        : 'bg-rose-955/50 text-rose-400 border border-rose-900/30'
                    }`}>
                      {guest.rsvp?.status}
                    </span>
                  </div>

                  {/* Meal Choice & Plus One */}
                  {guest.rsvp?.status === 'attending' && (
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                      {guest.rsvp.plus_one && (
                        <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <UserPlus className="w-3 h-3 text-indigo-400" /> +1: {guest.rsvp.plus_one_name || 'Yes'}
                        </span>
                      )}
                      {guest.rsvp.meal_choice && (
                        <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <UtensilsCrossed className="w-3 h-3 text-indigo-400" /> Meal: {guest.rsvp.meal_choice}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message */}
                  {guest.rsvp?.message && (
                    <p className="text-xs text-slate-300 italic pl-2 border-l-2 border-indigo-500">
                      "{guest.rsvp.message}"
                    </p>
                  )}

                  {/* Dietary Note */}
                  {guest.rsvp?.dietary_notes && (
                    <div className="text-[10px] text-rose-300 bg-rose-955/15 border border-rose-900/20 px-2 py-1 rounded">
                      <span className="font-semibold">Dietary:</span> {guest.rsvp.dietary_notes}
                    </div>
                  )}
                  
                  <div className="text-[9px] text-slate-600 text-right">
                    {guest.rsvp?.responded_at ? new Date(guest.rsvp.responded_at).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
