'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
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
  Calendar
} from 'lucide-react';
import { GuestWithDetails } from '@/lib/types';

export default function RSVPTrackerPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
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
    const guestObj = guests.find(g => g.id === guestId);
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
      showToast(`RSVP status for ${guestObj?.name || 'guest'} updated to "${newStatus}"!`, 'success');
    } catch (err: any) {
      setError(err.message || 'Error updating RSVP');
      showToast(err.message || 'Error updating RSVP', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredGuests = guests.filter((g) => {
    const rsvpStatus = g.rsvp?.status || 'pending';
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rsvpStatus === statusFilter;
    
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900">RSVP Registry</h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor response counts, filter dietary requirements, meal requests, and manually override attendance statuses.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search RSVPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-md py-2 pl-9 pr-4 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto gap-4 items-center justify-end">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-xs rounded-md py-2 px-3 focus:outline-none cursor-pointer"
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
            className="bg-white border border-gray-200 text-gray-700 text-xs rounded-md py-2 px-3 focus:outline-none cursor-pointer"
          >
            <option value="all">All Meal Selections</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="none">No Preference</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm">Loading RSVP logs...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="py-20 text-center text-gray-450 text-xs border border-dashed border-gray-200 rounded bg-white">
          No RSVP logs match current filter criteria.
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 h-10">
                <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Guest</th>
                <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Side</th>
                <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">RSVP Status</th>
                <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Meal Choice</th>
                <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Plus One</th>
                <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Responded</th>
                <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {filteredGuests.map((guest) => {
                const rsvpStatus = guest.rsvp?.status || 'pending';
                const hasPlusOne = guest.rsvp?.plus_one;
                const plusOneName = guest.rsvp?.plus_one_name;
                const meal = guest.rsvp?.meal_choice;
                const responded = guest.rsvp?.responded_at;

                return (
                  <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors h-14">
                    <td className="px-6">
                      <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                      {guest.category && (
                        <span 
                          style={{ color: guest.category.colour }} 
                          className="text-[9px] font-bold tracking-wider uppercase mt-0.5 block"
                        >
                          {guest.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6">
                      <span className={`badge ${guest.side === 'bride' ? 'badge-bride' : 'badge-groom'}`}>
                        {guest.side}
                      </span>
                    </td>
                    <td className="px-6">
                      {updatingId === guest.id ? (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <select
                          value={rsvpStatus}
                          onChange={(e: any) => handleStatusChange(guest.id, e.target.value)}
                          className={`text-xs font-semibold rounded-md py-1 px-2 border cursor-pointer focus:outline-none ${
                            rsvpStatus === 'attending'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : rsvpStatus === 'declined'
                              ? 'bg-red-50 text-red-750 border-red-200'
                              : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="attending">Attending</option>
                          <option value="declined">Declined</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6">
                      {rsvpStatus === 'attending' && meal ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-150 capitalize">
                          <UtensilsCrossed className="w-3 h-3 text-gray-400" /> {meal}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6">
                      {rsvpStatus === 'attending' && hasPlusOne ? (
                        <div className="flex flex-col text-xs">
                          <span className="inline-flex items-center gap-1 text-gray-800 font-medium">
                            <UserPlus className="w-3 h-3 text-gray-400" /> Yes
                          </span>
                          {plusOneName && (
                            <span className="text-[10px] text-gray-400 mt-0.5">{plusOneName}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 text-xs text-gray-500">
                      {responded ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(responded).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 italic">Pending</span>
                      )}
                    </td>
                    <td className="px-6 text-right">
                      <Link
                        href={`/guests/${guest.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-650 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors border border-blue-200"
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
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 md:bottom-auto md:top-5 md:left-auto md:right-5 md:translate-x-0 z-55 w-[90%] sm:w-auto max-w-sm md:max-w-none animate-fade-in select-none">
          <div className={`flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-755 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
