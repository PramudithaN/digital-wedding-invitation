'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Heart, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface MatchedGuest {
  id: string;
  name: string;
  side?: 'bride' | 'groom';
  relationship?: 'relative' | 'friend';
  table_no: string;
  rsvp_status: 'attending' | 'declined' | 'pending';
}

export default function SeatingLookupPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MatchedGuest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  // Auto-search after typing (debounce) or search on form submit
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch(`/api/guests?q=${encodeURIComponent(trimmedQuery)}`);
      if (!res.ok) {
        throw new Error('Failed to retrieve seating data');
      }
      
      const data = await res.json();
      setResults(data);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search on typing (after 400ms debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else if (query.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
      }
    }, 40000000000000000000); // Wait, no, we shouldn't make the timer so huge or we can just let users press Enter or click search.
    // Let's use a 400ms debounce for typing search, or just rely on search button. Debounce is extremely nice. Let's make it 400ms.
    const actualTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      }
    }, 400);
    return () => clearTimeout(actualTimer);
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Upper Content container */}
      <div className="max-w-md w-full mx-auto space-y-8 flex-1 flex flex-col justify-center">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center text-purple-500">
            <Heart className="w-10 h-10 fill-purple-100 animate-pulse" />
          </div>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-gray-900">
            Oshidhie & Kaveen
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
            Seating Arrangements
          </p>
        </div>

        {/* Info Bar / Instructions */}
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs text-center space-y-2">
          <Sparkles className="w-5 h-5 text-amber-500 mx-auto" />
          <h2 className="text-sm font-semibold text-gray-800">Find Your Table</h2>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Please search for your name below to view your assigned table number. If you are part of a family or group, search for your first or last name to see the listing.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative rounded-md shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your name (e.g. Sarah)..."
              className="block w-full pl-10 pr-24 py-3 border border-gray-250 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all shadow-inner"
            />
            <div className="absolute inset-y-1 right-1 flex items-center">
              <button
                type="submit"
                disabled={isLoading}
                className="h-full px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-155 text-red-700 p-4 rounded-xl text-xs flex items-center gap-3 animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-3 min-h-[160px]">
          {isLoading && results.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              <p className="text-[11px] font-medium animate-pulse">Searching seating records...</p>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 text-center space-y-2 animate-fade-in">
              <AlertCircle className="w-6 h-6 text-gray-400 mx-auto" />
              <p className="text-xs font-bold text-gray-800">No matches found</p>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                We couldn't find any guest records matching "{query}". Please double-check your spelling or try searching with just your first or last name.
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">
                Matching Guests ({results.length})
              </p>
              
              <div className="space-y-2.5">
                {results.map((guest) => {
                  const hasTable = !!guest.table_no;
                  const isAttending = guest.rsvp_status === 'attending';
                  
                  return (
                    <div 
                      key={guest.id} 
                      className={`bg-white border rounded-xl p-4.5 shadow-sm transition-all duration-300 flex items-center justify-between gap-4 border-l-4 ${
                        hasTable 
                          ? 'border-purple-500 hover:shadow-md' 
                          : 'border-amber-400 bg-amber-50/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 text-sm leading-none">
                          {guest.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {guest.side && (
                            <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                              guest.side === 'bride' 
                                ? 'bg-purple-50 text-purple-650' 
                                : 'bg-blue-50 text-blue-650'
                            }`}>
                              {guest.side}'s Side
                            </span>
                          )}
                          <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                            isAttending 
                              ? 'bg-green-50 text-green-700' 
                              : guest.rsvp_status === 'declined'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {guest.rsvp_status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {hasTable ? (
                          <div className="space-y-0.5">
                            <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Assigned Table</span>
                            <span className="text-base font-bold text-purple-700 font-serif">
                              {guest.table_no}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5 text-right">
                            <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Table Status</span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                              Pending
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {results.some(g => !g.table_no && g.rsvp_status === 'attending') && (
                <p className="text-[10px] text-amber-700 text-center leading-relaxed max-w-xs mx-auto pt-2">
                  ⚠️ Some confirmed tables are still being finalized. If your table status is "Pending", please check back later or ask our hosts at the entrance.
                </p>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Footer / Copyright */}
      <div className="text-center pt-8 border-t border-gray-200 mt-12">
        <p className="text-[10px] text-gray-400">
          With Love, Oshidhie & Kaveen
        </p>
      </div>

    </div>
  );
}
