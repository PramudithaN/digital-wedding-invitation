'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Heart, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface MatchedGuest {
  id: string;
  name: string;
  side?: 'bride' | 'groom';
  relationship?: 'relative' | 'friend';
  table_no: string;
  rsvp_status: 'attending' | 'declined' | 'pending';
  seats_count: number;
}

export default function SeatingLookupPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MatchedGuest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else if (query.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const renderBackgroundMandala = () => {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[750px] sm:h-[750px] md:w-[950px] md:h-[950px] text-[#C8A882]/8 opacity-[0.06] select-none pointer-events-none z-0">
        {/* Outer Ring: rotates clockwise */}
        <svg viewBox="0 0 200 200" className="w-full h-full absolute top-0 left-0 animate-spin-slow">
          <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3, 3" />
          <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="0.5" />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            return (
              <path
                key={`outer-${i}`}
                d="M100,12 C96,16 94,22 100,26 C106,22 104,16 100,12"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i * 360) / 48;
            return (
              <circle
                key={`dot-${i}`}
                cx="100"
                cy="16"
                r="0.8"
                fill="currentColor"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
        </svg>

        {/* Inner Ring: rotates counter-clockwise */}
        <svg viewBox="0 0 200 200" className="w-full h-full absolute top-0 left-0 scale-[0.75] animate-spin-reverse-slow">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4, 2" />
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <path
                key={`inner-${i}`}
                d="M100,25 C92,35 90,45 100,55 C110,45 108,35 100,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i * 360) / 32;
            return (
              <path
                key={`spoke-${i}`}
                d="M100,10 L100,30"
                stroke="currentColor"
                strokeWidth="0.3"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
        </svg>
        
        {/* Center Core: slow breathe */}
        <svg viewBox="0 0 200 200" className="w-full h-full absolute top-0 left-0 scale-[0.4] text-[#C8A882]/12 animate-pulse-soft">
          <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="0.8" />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <path
                key={`core-${i}`}
                d="M100,55 C85,75 85,85 100,100 C115,85 115,75 100,55"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
          <circle cx="100" cy="100" r="8" className="fill-current" />
        </svg>
      </div>
    );
  };

  const renderCornerMotif = (side: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    const isLeft = side.includes('left');
    const isTop = side.includes('top');
    const rotation = isTop ? (isLeft ? 'rotate-0' : 'rotate-90') : (isLeft ? '-rotate-90' : 'rotate-180');
    
    return (
      <div 
        className={`fixed pointer-events-none overflow-hidden w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 z-30 animate-bloom ${
          isTop ? 'top-0' : 'bottom-0'
        } ${isLeft ? 'left-0' : 'right-0'} ${rotation}`}
      >
        <div className="w-full h-full relative animate-sway-gentle">
          <div className="absolute inset-0 text-[#C8A882] opacity-[0.35]">
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="fill-none stroke-current stroke-[1.5]">
              <path d="M10,110 C30,90 40,60 30,30 C20,10 50,5 60,25 C70,45 40,60 60,80 C80,100 110,90 110,60 C110,30 90,20 80,40 C70,60 90,80 110,110" />
              <path d="M30,30 C15,25 10,40 30,50 C40,40 35,35 30,30 Z" className="fill-current opacity-10" />
              <path d="M60,25 C75,10 90,20 75,35 C65,30 65,25 60,25 Z" className="fill-current opacity-10" />
              <path d="M80,40 C95,25 105,40 90,55 C80,45 85,45 80,40 Z" className="fill-current opacity-10" />
            </svg>
          </div>
          <div className="absolute top-2 left-2 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#C8A882] opacity-[0.55] rotate-12">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="fill-current">
              <path d="M50,15 C58,35 58,55 50,65 C42,55 42,35 50,15 Z" />
              <path d="M50,30 C30,25 35,50 50,65 C38,55 32,45 50,30 Z" />
              <path d="M50,30 C70,25 65,50 50,65 C62,55 68,45 50,30 Z" />
              <path d="M50,40 C15,45 25,65 50,65 C28,65 25,55 50,40 Z" />
              <path d="M50,40 C85,45 75,65 50,65 C72,65 75,55 50,40 Z" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-serif relative overflow-hidden select-none">
      
      {/* Corner blooming motifs */}
      {renderCornerMotif('top-left')}
      {renderCornerMotif('top-right')}
      {renderCornerMotif('bottom-left')}
      {renderCornerMotif('bottom-right')}

      {/* Rotating Background Mandala Art */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {renderBackgroundMandala()}
      </div>

      {/* Seating Card Frame Container */}
      <div className="relative z-10 w-full max-w-[650px] mx-auto bg-[#F7F1E8] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E3DEC9] rounded-2xl overflow-hidden my-auto flex flex-col min-h-[80vh]">
        
        {/* Background Photoshop Artboard Image */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none rounded-2xl opacity-100"
          style={{
            backgroundImage: 'url("/Invitation-background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        />

        {/* Soft paper overlay to keep text readable */}
        <div className="absolute inset-0 z-0 rounded-2xl bg-[#F7F1E8]/35 pointer-events-none" />

        {/* Top Flowers Hanging Banner */}
        <div
          className="absolute top-0 left-0 right-0 z-10 w-full pointer-events-none"
          style={{
            backgroundImage: 'url("/top%20flowers.webp")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'top center',
            aspectRatio: '2299/1121',
          }}
        />

        {/* Content Wrapper */}
        <div className="relative z-20 w-full flex flex-col flex-1 px-6 sm:px-10 pb-10 pt-28 sm:pt-36 md:pt-40 justify-between">
          
          <div className="space-y-6">
            {/* Wedding Branding */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl sm:text-5xl font-light tracking-wide leading-none text-[#2D312E]" style={{ fontFamily: 'var(--font-miracle-world), serif' }}>
                Oshidhie
              </h1>
              <div className="text-3xl font-script" style={{ fontFamily: 'var(--font-boheme-floral), Great Vibes, cursive', color: '#D38A99' }}>
                and
              </div>
              <h1 className="text-4xl sm:text-5xl font-light tracking-wide leading-none text-[#2D312E]" style={{ fontFamily: 'var(--font-miracle-world), serif' }}>
                Kaveen
              </h1>
              
              <div className="pt-2 flex flex-col items-center">
                <span className="h-px w-10 bg-[#C8A882]/40 mb-1.5" />
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#6B6B6B] font-bold">
                  Seating Arrangements
                </p>
                <span className="h-px w-10 bg-[#C8A882]/40 mt-1.5" />
              </div>
            </div>

            {/* Info Bar Description */}
            <div className="bg-[#FDFBF7]/85 border border-[#E3DEC9] rounded-xl p-4.5 text-center space-y-1.5 shadow-2xs backdrop-blur-xs max-w-sm mx-auto">
              <Sparkles className="w-4 h-4 text-[#C8A882] mx-auto animate-pulse" />
              <h2 className="text-xs font-semibold text-gray-800 tracking-wide uppercase">Find Your Table</h2>
              <p className="text-[10px] text-gray-500 leading-relaxed font-sans">
                Please enter your name below to view your table assignment. Only guests who have confirmed **Attending** will be listed in the seating records.
              </p>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4 text-[#C8A882]" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your name (e.g. Sarah)..."
                  className="block w-full pl-10 pr-24 py-3 border border-[#E3DEC9] bg-[#FDFBF7]/90 rounded-xl text-xs font-sans placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#C8A882] focus:border-[#C8A882] text-gray-800 transition-all shadow-inner"
                />
                <div className="absolute inset-y-1 right-1 flex items-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-full px-4 bg-[#C8A882] hover:bg-[#b2926c] text-white rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Error Notification */}
            {error && (
              <div className="bg-red-50/90 border border-red-150 text-red-700 p-4 rounded-xl text-xs flex items-center gap-3 animate-fade-in shadow-xs max-w-md mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Search Results Display Area */}
            <div className="space-y-3 min-h-[120px] max-w-md mx-auto">
              {isLoading && results.length === 0 && (
                <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#C8A882]" />
                  <p className="text-[10px] uppercase tracking-wider font-semibold animate-pulse">Searching assignments...</p>
                </div>
              )}

              {!isLoading && hasSearched && results.length === 0 && (
                <div className="bg-[#FDFBF7]/95 border border-[#E3DEC9] rounded-xl p-6 text-center space-y-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-gray-400 mx-auto" />
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">No Record Found</p>
                  <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                    We couldn't find an **attending** guest matching "{query}". If you haven't RSVP'd yet, or if you RSVP'd as "declined", you won't be listed. Please try searching with a different part of your name.
                  </p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="space-y-2.5 animate-fade-in">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-[#8A8A8A] px-1">
                    Matching Guests ({results.length})
                  </p>
                  
                  <div className="space-y-2">
                    {results.map((guest) => {
                      const hasTable = !!guest.table_no;
                      
                      return (
                        <div 
                          key={guest.id} 
                          className="bg-[#FDFBF7]/95 border border-[#E3DEC9] rounded-xl p-4.5 shadow-sm transition-all duration-300 flex items-center justify-between gap-4 hover:shadow-md animate-fade-in"
                        >
                          <div className="space-y-1">
                            <h3 className="font-semibold text-gray-800 text-sm leading-none flex items-center gap-1.5 flex-wrap">
                              <span>{guest.name}</span>
                              <span className="text-[10px] text-gray-400 font-sans font-medium bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                                {guest.seats_count} {guest.seats_count === 1 ? 'seat' : 'seats'}
                              </span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {guest.side && (
                                <span className={`text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                                  guest.side === 'bride' 
                                    ? 'bg-purple-50 text-purple-650' 
                                    : 'bg-blue-50 text-blue-650'
                                }`}>
                                  {guest.side}'s Side
                                </span>
                              )}
                              <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-green-50 text-green-700">
                                Attending
                              </span>
                            </div>
                          </div>
                          
                          <div className="shrink-0 flex items-center justify-center">
                            {hasTable ? (
                              <div className="flex flex-col items-center justify-center bg-[#FDFBF7] border-2 border-[#C8A882] rounded-xl px-4.5 py-3.5 shadow-sm min-w-[100px] border-solid">
                                <span className="text-[8px] text-[#C8A882] uppercase font-bold tracking-widest font-sans leading-none">Table</span>
                                <span className="text-xl sm:text-2xl font-black text-[#2D312E] font-serif mt-1 leading-none">
                                  {guest.table_no}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center bg-amber-50/50 border border-dashed border-amber-300 rounded-xl px-4.5 py-3.5 min-w-[100px]">
                                <span className="text-[8px] text-amber-700 uppercase font-bold tracking-widest font-sans leading-none">Status</span>
                                <span className="text-[10px] font-bold text-amber-700 mt-1.5 animate-pulse font-sans leading-none">
                                  Pending
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center pt-6 border-t border-[#E3DEC9]/50 mt-6 shrink-0">
            <p className="text-[10px] tracking-wide text-[#6B6B6B]">
              With Love, Oshidhie & Kaveen
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
