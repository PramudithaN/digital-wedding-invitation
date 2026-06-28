'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MailCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserPlus, 
  UtensilsCrossed, 
  Loader2, 
  AlertCircle,
  Edit2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { GuestWithDetails, RSVP } from '@/lib/types';

export default function RSVPTrackerPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'declined' | 'pending'>('all');
  const [mealFilter, setMealFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchGuests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/guests');
      if (!res.ok) throw new Error('Failed to fetch guests');
      const data = await res.json();
      setGuests(data);
    } catch (err: any) {
      setError(err.message || 'Error loading guest RSVP data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleStatusChange = async (guestId: string, newStatus: 'attending' | 'declined' | 'pending') => {
    try {
      setUpdatingId(guestId);
      const res = await fetch('/api/rsvp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guestId,
          status: newStatus
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update status');
      }

      // Update local state
      setGuests((prevGuests) =>
        prevGuests.map((g) => {
          if (g.id === guestId) {
            return {
              ...g,
              rsvp: g.rsvp 
                ? { ...g.rsvp, status: newStatus, responded_at: new Date().toISOString() } 
                : { id: 'new-rsvp', guest_id: guestId, status: newStatus, plus_one: false, responded_at: new Date().toISOString() }
            };
          }
          return g;
        })
      );
    } catch (err: any) {
      alert(err.message || 'Error updating RSVP');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredGuests = guests.filter((g) => {
    const rsvpStatus = g.rsvp?.status || 'pending';
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rsvpStatus === statusFilter;
    
    // Meal choice matches
    let matchesMeal = true;
    if (mealFilter !== 'all') {
      if (mealFilter === 'none') {
        matchesMeal = !g.rsvp?.meal_choice;
      } else {
        matchesMeal = g.rsvp?.meal_choice === mealFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesMeal;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif tracking-wide font-semibold text-slate-100">RSVP Registry</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor response counts, filter dietary requirements, meal requests, and manually override attendance statuses.
        </p>
      </div>

      {error && (
        <div className="bg-rose-955/40 border border-rose-900/50 text-rose-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search RSVPs by guest name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto gap-4 items-center justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl py-2 px-3 focus:outline-none cursor-pointer"
          >
            <option value="all">All RSVP Statuses</option>
            <option value="attending">Attending</option>
            <option value="declined">Declined</option>
            <option value="pending">Pending Response</option>
          </select>

          {/* Meal filter */}
          <select
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl py-2 px-3 focus:outline-none cursor-pointer"
          >
            <option value="all">All Meal Selections</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="none">No Preference / None</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-sm">Loading RSVP logs...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-sm border border-dashed border-slate-805 rounded-2xl">
          No RSVP logs match your current search parameters.
        </div>
      ) : (
        <div className="overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Guest</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Side</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">RSVP Status</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Meal Choice</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Plus One</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Responded</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredGuests.map((guest) => {
                const rsvpStatus = guest.rsvp?.status || 'pending';
                const hasPlusOne = guest.rsvp?.plus_one;
                const plusOneName = guest.rsvp?.plus_one_name;
                const meal = guest.rsvp?.meal_choice;
                const responded = guest.rsvp?.responded_at;

                return (
                  <tr key={guest.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-205">{guest.name}</div>
                      {guest.category && (
                        <span 
                          style={{ color: guest.category.colour }} 
                          className="text-[10px] font-medium tracking-wide uppercase mt-0.5 block"
                        >
                          {guest.category.name}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        guest.side === 'bride' 
                          ? 'bg-rose-955/40 text-rose-300' 
                          : 'bg-indigo-950/40 text-indigo-300'
                      }`}>
                        {guest.side}
                      </span>
                    </td>
                    <td className="p-4">
                      {updatingId === guest.id ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <select
                          value={rsvpStatus}
                          onChange={(e: any) => handleStatusChange(guest.id, e.target.value)}
                          className={`text-xs font-semibold rounded-xl py-1.5 px-2.5 border cursor-pointer focus:outline-none ${
                            rsvpStatus === 'attending'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50'
                              : rsvpStatus === 'declined'
                              ? 'bg-rose-955/60 text-rose-400 border-rose-900/50'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          <option value="pending">Pending ⏳</option>
                          <option value="attending">Attending ✅</option>
                          <option value="declined">Declined ❌</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4">
                      {rsvpStatus === 'attending' && meal ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-200 bg-slate-950 px-2 py-1 rounded border border-slate-850 capitalize">
                          <UtensilsCrossed className="w-3 h-3 text-indigo-400" /> {meal}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {rsvpStatus === 'attending' && hasPlusOne ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-205 font-medium">
                            <UserPlus className="w-3 h-3 text-indigo-400" /> Yes
                          </span>
                          {plusOneName && (
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{plusOneName}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-650 text-xs">No</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-400">
                      {responded ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(responded).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-650 italic">Pending</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/guests/${guest.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-305 hover:bg-indigo-950/20 px-3 py-1.5 rounded-lg transition-colors border border-indigo-900/30"
                      >
                        <Edit2 className="w-3 h-3" />
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
