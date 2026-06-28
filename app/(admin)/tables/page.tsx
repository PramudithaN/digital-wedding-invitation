'use client';

import React, { useState, useEffect } from 'react';
import { 
  Split, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Users, 
  Heart 
} from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';

export default function SideBySidePage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Expanded state for guest list details per group
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [guestsRes, catsRes] = await Promise.all([
          fetch('/api/guests'),
          fetch('/api/categories')
        ]);
        if (!guestsRes.ok || !catsRes.ok) throw new Error('Failed to load guest data');
        
        setGuests(await guestsRes.json());
        setCategories(await catsRes.json());
      } catch (err: any) {
        setError(err.message || 'Error loading representation data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleGroup = (side: 'bride' | 'groom', categoryId: string) => {
    const groupKey = `${side}-${categoryId}`;
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm">Balancing wedding representations...</p>
      </div>
    );
  }

  // Calculate totals
  const brideGuests = guests.filter(g => g.side === 'bride');
  const groomGuests = guests.filter(g => g.side === 'groom');

  const brideAttending = brideGuests.filter(g => g.rsvp?.status === 'attending');
  const groomAttending = groomGuests.filter(g => g.rsvp?.status === 'attending');

  const bridePlusOnes = brideAttending.filter(g => g.rsvp?.plus_one).length;
  const groomPlusOnes = groomAttending.filter(g => g.rsvp?.plus_one).length;

  const brideTotalSeats = brideAttending.length + bridePlusOnes;
  const groomTotalSeats = groomAttending.length + groomPlusOnes;

  // Render a column for one side of the wedding
  const renderSideColumn = (side: 'bride' | 'groom') => {
    const sideGuests = side === 'bride' ? brideGuests : groomGuests;
    const sideAttending = side === 'bride' ? brideAttending : groomAttending;
    const sidePlusOnes = side === 'bride' ? bridePlusOnes : groomPlusOnes;
    const sideTotalSeats = side === 'bride' ? brideTotalSeats : groomTotalSeats;
    const sideName = side === 'bride' ? "Bride's Side" : "Groom's Side";
    const sideThemeColor = side === 'bride' ? 'from-rose-500/10 to-rose-950/20 text-rose-400 border-rose-900/30' : 'from-indigo-500/10 to-indigo-950/20 text-indigo-400 border-indigo-900/30';
    const sideProgressColor = side === 'bride' ? 'bg-rose-500' : 'bg-indigo-500';

    return (
      <div className="space-y-6">
        {/* Side Header Block */}
        <div className={`bg-gradient-to-br border rounded-2xl p-6 shadow-md flex items-center justify-between ${sideThemeColor}`}>
          <div>
            <h2 className="text-2xl font-serif font-semibold">{sideName}</h2>
            <p className="text-xs text-slate-400 mt-1">{sideGuests.length} Guests Invited</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-slate-100">{sideTotalSeats}</span>
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">Confirmed Seats</span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const catGuests = sideGuests.filter(g => g.category_id === cat.id);
            const catAttending = catGuests.filter(g => g.rsvp?.status === 'attending');
            const catPlusOnes = catAttending.filter(g => g.rsvp?.plus_one).length;
            const catConfirmedSeats = catAttending.length + catPlusOnes;
            
            if (catGuests.length === 0) return null;

            const groupKey = `${side}-${cat.id}`;
            const isExpanded = expandedGroups[groupKey] || false;

            return (
              <div 
                key={cat.id} 
                className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-200"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleGroup(side, cat.id)}
                  className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-900/20 transition-all cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span style={{ backgroundColor: cat.colour }} className="w-2.5 h-2.5 rounded-full shrink-0" />
                      <span className="font-semibold text-slate-200 text-sm">{cat.name}</span>
                      <span className="text-xs text-slate-500 font-normal">
                        ({catAttending.length} of {catGuests.length} responded Yes)
                      </span>
                    </div>
                    {/* Tiny Progress bar */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        style={{ width: `${(catAttending.length / catGuests.length) * 100}%` }}
                        className={`h-full ${sideProgressColor}`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-100">{catConfirmedSeats}</span>
                      <span className="block text-[9px] text-slate-500 uppercase font-semibold">Seats</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-slate-850 bg-slate-950/40 px-5 py-4 space-y-3">
                    <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
                      Confirmed Attendees ({catAttending.length})
                    </h4>
                    {catAttending.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-1">No confirmed guests in this category yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-900">
                        {catAttending.map((guest) => (
                          <div key={guest.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="space-y-1">
                              <span className="font-medium text-slate-200">{guest.name}</span>
                              {guest.rsvp?.plus_one && (
                                <span className="block text-[10px] text-slate-500">
                                  +1: <span className="text-slate-400">{guest.rsvp.plus_one_name || 'Yes'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-right space-y-0.5">
                              {guest.rsvp?.meal_choice && (
                                <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 uppercase text-[9px] tracking-wide border border-slate-850">
                                  {guest.rsvp.meal_choice}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorised list */}
          {(() => {
            const catGuests = sideGuests.filter(g => !g.category_id);
            const catAttending = catGuests.filter(g => g.rsvp?.status === 'attending');
            const catPlusOnes = catAttending.filter(g => g.rsvp?.plus_one).length;
            const catConfirmedSeats = catAttending.length + catPlusOnes;
            
            if (catGuests.length === 0) return null;

            const groupKey = `${side}-none`;
            const isExpanded = expandedGroups[groupKey] || false;

            return (
              <div className="bg-slate-900/40 border border-slate-855 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleGroup(side, 'none')}
                  className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-900/20 transition-all cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-700 bg-transparent" />
                      <span className="font-medium text-slate-350 text-sm italic">Uncategorised Guests</span>
                      <span className="text-xs text-slate-500 font-normal">
                        ({catAttending.length} of {catGuests.length} responded Yes)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        style={{ width: `${(catAttending.length / catGuests.length) * 100}%` }}
                        className={`h-full ${sideProgressColor}`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-100">{catConfirmedSeats}</span>
                      <span className="block text-[9px] text-slate-500 uppercase font-semibold">Seats</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-850 bg-slate-950/40 px-5 py-4 space-y-3">
                    <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
                      Confirmed Attendees ({catAttending.length})
                    </h4>
                    {catAttending.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-1">No confirmed guests here yet.</p>
                    ) : (
                      <div className="divide-y divide-slate-900">
                        {catAttending.map((guest) => (
                          <div key={guest.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="space-y-1">
                              <span className="font-medium text-slate-200">{guest.name}</span>
                              {guest.rsvp?.plus_one && (
                                <span className="block text-[10px] text-slate-500">
                                  +1: <span className="text-slate-400">{guest.rsvp.plus_one_name || 'Yes'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              {guest.rsvp?.meal_choice && (
                                <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-955 text-slate-400 uppercase text-[9px] tracking-wide border border-slate-850">
                                  {guest.rsvp.meal_choice}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif tracking-wide font-semibold text-slate-100 flex items-center gap-3">
          <Split className="w-8 h-8 text-indigo-400" /> Side-by-Side Balance
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review details of Bride vs Groom side guests, see confirmed seating breakdowns, and plan seating arrangements.
        </p>
      </div>

      {error && (
        <div className="bg-rose-955/40 border border-rose-900/50 text-rose-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Stats Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-[0.03]">
          <Heart className="w-48 h-48 text-indigo-500 fill-indigo-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bride's Seats</span>
            <div className="text-3xl font-serif text-rose-400 font-bold">{brideTotalSeats}</div>
            <p className="text-[10px] text-slate-400">
              {brideAttending.length} guests + {bridePlusOnes} plus ones
            </p>
          </div>

          <div className="h-px w-24 bg-slate-800 md:h-12 md:w-px" />

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Confirmed Seats</span>
            <div className="text-5xl font-serif text-slate-100 font-bold">{brideTotalSeats + groomTotalSeats}</div>
            <p className="text-[10px] text-slate-400">Combining both sides</p>
          </div>

          <div className="h-px w-24 bg-slate-800 md:h-12 md:w-px" />

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Groom's Seats</span>
            <div className="text-3xl font-serif text-indigo-400 font-bold">{groomTotalSeats}</div>
            <p className="text-[10px] text-slate-400">
              {groomAttending.length} guests + {groomPlusOnes} plus ones
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderSideColumn('bride')}
        {renderSideColumn('groom')}
      </div>
    </div>
  );
}
