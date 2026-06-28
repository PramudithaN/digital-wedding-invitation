'use client';

import React, { useState, useEffect } from 'react';
import { 
  Split, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  UserPlus, 
  UtensilsCrossed, 
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
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
    
    // Light minimalist theme headers
    const sideHeaderStyle = side === 'bride' 
      ? 'bg-purple-50/50 border-purple-100 text-purple-700 border' 
      : 'bg-blue-50/50 border-blue-100 text-blue-700 border';
      
    const sideProgressColor = side === 'bride' ? 'bg-purple-500' : 'bg-blue-500';
    const sideCountColor = side === 'bride' ? 'text-purple-600' : 'text-blue-600';

    return (
      <div className="space-y-4">
        {/* Side Header Block */}
        <div className={`rounded-xl p-5 shadow-sm flex items-center justify-between bg-white border border-gray-200 border-t-4 ${side === 'bride' ? 'border-t-purple-500' : 'border-t-blue-500'}`}>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{sideName}</h2>
            <p className="text-xs text-gray-450 mt-0.5">{sideGuests.length} guests invited</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${sideCountColor}`}>{sideTotalSeats}</span>
            <span className="block text-[9px] text-gray-400 uppercase font-bold tracking-wider">Confirmed</span>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="space-y-3">
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
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleGroup(side, cat.id)}
                  className="w-full text-left p-4.5 flex items-center justify-between hover:bg-gray-50/50 transition-all cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span style={{ backgroundColor: cat.colour }} className="w-2 h-2 rounded-full shrink-0" />
                      <span className="font-semibold text-gray-800 text-xs">{cat.name}</span>
                      <span className="text-[10px] text-gray-450 font-normal">
                        ({catAttending.length} of {catGuests.length} attending)
                      </span>
                    </div>
                    {/* Progress bar track */}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(catAttending.length / catGuests.length) * 100}%` }}
                        className={`h-full ${sideProgressColor}`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900">{catConfirmedSeats}</span>
                      <span className="block text-[8px] text-gray-400 uppercase font-bold">Seats</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-gray-150 bg-gray-50/30 px-5 py-4 space-y-2">
                    <h4 className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-2">
                      Attendees ({catAttending.length})
                    </h4>
                    {catAttending.length === 0 ? (
                      <p className="text-xs text-gray-450 italic py-0.5">No confirmed guests here yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {catAttending.map((guest) => (
                          <div key={guest.id} className="py-2 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-medium text-gray-900">{guest.name}</span>
                              {guest.rsvp?.plus_one && (
                                <span className="block text-[9px] text-gray-450">
                                  +1: <span className="text-gray-500 font-semibold">{guest.rsvp.plus_one_name || 'Yes'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              {guest.rsvp?.meal_choice && (
                                <span className="inline-flex px-1.5 py-0.5 rounded bg-white text-gray-500 uppercase text-[9px] tracking-wide border border-gray-200">
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
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleGroup(side, 'none')}
                  className="w-full text-left p-4.5 flex items-center justify-between hover:bg-gray-50/50 transition-all cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 border border-gray-300 bg-transparent" />
                      <span className="font-medium text-gray-400 text-xs italic">Uncategorised</span>
                      <span className="text-xs text-gray-450 font-normal">
                        ({catAttending.length} of {catGuests.length} attending)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${(catAttending.length / catGuests.length) * 100}%` }}
                        className={`h-full ${sideProgressColor}`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900">{catConfirmedSeats}</span>
                      <span className="block text-[8px] text-gray-400 uppercase font-bold">Seats</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-150 bg-gray-50/30 px-5 py-4 space-y-2">
                    <h4 className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-2">
                      Attendees ({catAttending.length})
                    </h4>
                    {catAttending.length === 0 ? (
                      <p className="text-xs text-gray-450 italic py-0.5">No confirmed guests here.</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {catAttending.map((guest) => (
                          <div key={guest.id} className="py-2 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-medium text-gray-900">{guest.name}</span>
                              {guest.rsvp?.plus_one && (
                                <span className="block text-[9px] text-gray-450">
                                  +1: <span className="text-gray-500 font-semibold">{guest.rsvp.plus_one_name || 'Yes'}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              {guest.rsvp?.meal_choice && (
                                <span className="inline-flex px-1.5 py-0.5 rounded bg-white text-gray-500 uppercase text-[9px] tracking-wide border border-gray-200">
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900">Side-by-Side Balance</h1>
        <p className="text-xs text-gray-500 mt-1">
          Review details of Bride vs Groom side guests, see confirmed seating breakdowns, and plan seating arrangements.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Stats Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-[0.015]">
          <Heart className="w-40 h-40 text-blue-500 fill-blue-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-around gap-6 text-center">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bride's Seats</span>
            <div className="text-2xl font-sans text-purple-600 font-bold">{brideTotalSeats}</div>
            <p className="text-[9px] text-gray-450">
              {brideAttending.length} guests + {bridePlusOnes} plus ones
            </p>
          </div>

          <div className="h-px w-24 bg-gray-150 md:h-12 md:w-px" />

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Confirmed</span>
            <div className="text-4xl font-sans text-gray-900 font-bold">{brideTotalSeats + groomTotalSeats}</div>
            <p className="text-[9px] text-gray-455 font-medium">Combining both sides</p>
          </div>

          <div className="h-px w-24 bg-gray-150 md:h-12 md:w-px" />

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Groom's Seats</span>
            <div className="text-2xl font-sans text-blue-600 font-bold">{groomTotalSeats}</div>
            <p className="text-[9px] text-gray-450">
              {groomAttending.length} guests + {groomPlusOnes} plus ones
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSideColumn('bride')}
        {renderSideColumn('groom')}
      </div>
    </div>
  );
}
