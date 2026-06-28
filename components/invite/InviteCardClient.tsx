'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  UtensilsCrossed, 
  UserPlus, 
  MessageSquare,
  Gift,
  Loader2,
  CheckCircle2,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { GuestWithDetails } from '@/lib/types';

interface InviteCardClientProps {
  guest: GuestWithDetails;
  weddingDetails: {
    bride_name: string;
    groom_name: string;
    date: string;
    time: string;
    iso_date: string;
    venue: string;
    city: string;
    address: string;
    google_maps_url: string;
    registry_url: string;
  };
}

export default function InviteCardClient({ guest, weddingDetails }: InviteCardClientProps) {
  // RSVP Form States
  const [attending, setAttending] = useState<'attending' | 'declined' | null>(
    (guest.rsvp?.status === 'attending' || guest.rsvp?.status === 'declined') 
      ? guest.rsvp.status 
      : null
  );
  const [plusOne, setPlusOne] = useState(guest.rsvp?.plus_one || false);
  const [plusOneName, setPlusOneName] = useState(guest.rsvp?.plus_one_name || '');
  const [mealChoice, setMealChoice] = useState(guest.rsvp?.meal_choice || '');
  const [dietaryNotes, setDietaryNotes] = useState(guest.rsvp?.dietary_notes || '');
  const [message, setMessage] = useState(guest.rsvp?.message || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  const rsvpRef = useRef<HTMLDivElement>(null);

  // Initialize countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(weddingDetails.iso_date) - +new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [weddingDetails.iso_date]);

  const scrollToRSVP = () => {
    rsvpRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null) {
      setError('Please select if you will be attending');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guest.id,
          status: attending,
          plus_one: attending === 'attending' ? plusOne : false,
          plus_one_name: attending === 'attending' ? plusOneName.trim() : '',
          meal_choice: attending === 'attending' ? mealChoice : '',
          dietary_notes: attending === 'attending' ? dietaryNotes.trim() : '',
          message: message.trim()
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit RSVP');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'There was a problem submitting your RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
      
      {/* Decorative Elegant Floral Background SVG Accents (Champagne Gold) */}
      <div className="absolute top-0 left-0 w-32 h-32 text-amber-500/10 pointer-events-none md:w-64 md:h-64">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M0,0 C20,10 30,30 30,50 C30,70 10,90 0,100 L0,0 Z M0,0 C10,20 30,30 50,30 C70,30 90,10 100,0 L0,0 Z" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 text-amber-500/10 pointer-events-none md:w-64 md:h-64 rotate-90">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M0,0 C20,10 30,30 30,50 C30,70 10,90 0,100 L0,0 Z M0,0 C10,20 30,30 50,30 C70,30 90,10 100,0 L0,0 Z" />
        </svg>
      </div>

      {/* --- HERO SCREEN (FULLSCREEN) --- */}
      <section className="min-h-screen flex flex-col justify-between items-center text-center p-6 md:p-12 relative border-4 border-amber-500/20 m-3 rounded-2xl bg-gradient-to-b from-[#0B251A] via-[#05100B] to-slate-950 shadow-2xl">
        <div className="pt-8">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">The Wedding Celebration of</span>
        </div>

        {/* Serif Display Couples Names */}
        <div className="space-y-4 my-auto py-8">
          <h1 className="text-5xl md:text-7xl font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-300 to-amber-100 font-semibold italic">
            {weddingDetails.bride_name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-amber-400/40">
            <div className="h-px w-16 bg-amber-500/30" />
            <Heart className="w-5 h-5 fill-amber-500/20 animate-pulse text-amber-400" />
            <div className="h-px w-16 bg-amber-500/30" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-300 to-amber-100 font-semibold italic">
            {weddingDetails.groom_name}
          </h1>

          <div className="pt-8 max-w-sm mx-auto">
            <p className="text-sm md:text-md text-amber-100/70 italic font-serif">
              Dear {guest.name},
            </p>
            <p className="text-xs md:text-sm text-slate-350 mt-2 leading-relaxed">
              We warmly invite you to share in our joy and celebrate this special day with us.
            </p>
          </div>
        </div>

        {/* Date and Venue brief */}
        <div className="space-y-6 pb-6 flex flex-col items-center">
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-wider text-amber-400 uppercase">{weddingDetails.date}</p>
            <p className="text-xs text-slate-400">{weddingDetails.time} • {weddingDetails.venue}</p>
          </div>

          <button 
            onClick={scrollToRSVP}
            className="flex flex-col items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 cursor-pointer transition-colors group animate-bounce"
          >
            RSVP Details
            <ChevronDown className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </section>

      {/* --- INVITATION DETAILS & COUNTDOWN --- */}
      <section className="max-w-3xl mx-auto px-6 py-20 w-full space-y-16 text-center">
        {/* Countdown Timer */}
        <div className="space-y-6 bg-emerald-950/20 border border-emerald-900/30 p-8 rounded-3xl backdrop-blur-md">
          <h3 className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Counting Down the Days</h3>
          
          {isExpired ? (
            <p className="font-serif italic text-amber-300">The Celebration Has Begun!</p>
          ) : (
            <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
              <div className="bg-slate-950/80 border border-slate-900/80 rounded-xl p-3 shadow-inner">
                <span className="block text-2xl md:text-3xl font-bold text-amber-300 font-mono">{timeLeft.days}</span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Days</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900/80 rounded-xl p-3 shadow-inner">
                <span className="block text-2xl md:text-3xl font-bold text-amber-300 font-mono">{timeLeft.hours}</span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Hrs</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900/80 rounded-xl p-3 shadow-inner">
                <span className="block text-2xl md:text-3xl font-bold text-amber-300 font-mono">{timeLeft.minutes}</span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Mins</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900/80 rounded-xl p-3 shadow-inner">
                <span className="block text-2xl md:text-3xl font-bold text-amber-300 font-mono">{timeLeft.seconds}</span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Secs</span>
              </div>
            </div>
          )}
        </div>

        {/* Location & Time block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Card 1: Schedule */}
          <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <span className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl w-fit block">
                <Calendar className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-serif font-semibold text-slate-205">Schedule</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="font-semibold text-slate-300">{weddingDetails.date}</p>
                <p>Arrival of guests at {weddingDetails.time}</p>
                <p>Reception & dinner to follow</p>
              </div>
            </div>
          </div>

          {/* Card 2: Venue */}
          <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <span className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl w-fit block">
                <MapPin className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-serif font-semibold text-slate-205">Venue Location</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="font-semibold text-slate-300">{weddingDetails.venue}</p>
                <p>{weddingDetails.address}</p>
                <p>{weddingDetails.city}</p>
              </div>
            </div>
            {weddingDetails.google_maps_url && (
              <a
                href={weddingDetails.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 mt-4 transition-colors"
              >
                Navigate with Google Maps →
              </a>
            )}
          </div>
        </div>

        {/* Gift registry details if any */}
        {weddingDetails.registry_url && (
          <div className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
                <Gift className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Gift Registry</h4>
                <p className="text-xs text-slate-500">Should you wish to honour us with a gift, details can be found here.</p>
              </div>
            </div>
            <a
              href={weddingDetails.registry_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl px-4 py-2 text-xs font-semibold transition-all w-full sm:w-auto text-center"
            >
              View Registry
            </a>
          </div>
        )}
      </section>

      {/* --- RSVP SUBMISSION FORM SECTION --- */}
      <section 
        id="rsvp-section" 
        ref={rsvpRef} 
        className="max-w-xl mx-auto px-6 py-20 w-full relative z-10"
      >
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl" />

          {isSuccess ? (
            /* Animated success view */
            <div className="text-center py-12 space-y-6 animate-scale-up">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/25 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-slate-100">RSVP Submitted</h2>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Thank you, {guest.name}. Your response has been recorded successfully.
                </p>
              </div>
              
              {attending === 'attending' ? (
                <div className="bg-emerald-955/20 border border-emerald-900/35 p-4 rounded-2xl text-xs text-emerald-300 max-w-xs mx-auto">
                  🎉 We are excited to celebrate this beautiful milestone with you!
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-2xl text-xs text-slate-500 max-w-xs mx-auto italic">
                  We are sorry you can't make it, but thank you for letting us know.
                </div>
              )}
            </div>
          ) : (
            /* Actual Form */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-3xl font-serif font-semibold text-slate-100">Kindly Reply</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Please respond by September 01, 2026</p>
              </div>

              {error && (
                <div className="bg-rose-955/40 border border-rose-900/50 text-rose-200 text-xs px-4 py-3 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-455 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRSVPSubmit} className="space-y-6">
                {/* Attending Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
                    Will you attend?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('attending');
                        setError('');
                      }}
                      className={`py-3.5 rounded-xl border text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                        attending === 'attending'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/70 shadow-lg shadow-amber-500/5 scale-[1.02]'
                          : 'bg-slate-950 border-slate-805 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Joyfully Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('declined');
                        setError('');
                      }}
                      className={`py-3.5 rounded-xl border text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                        attending === 'declined'
                          ? 'bg-rose-955/20 text-rose-300 border-rose-500/60 shadow-lg shadow-rose-900/5 scale-[1.02]'
                          : 'bg-slate-950 border-slate-805 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Regretfully Decline
                    </button>
                  </div>
                </div>

                {/* Conditional Fields if Attending */}
                {attending === 'attending' && (
                  <div className="space-y-6 pt-4 border-t border-slate-850 animate-fade-in">
                    {/* Plus One Toggle */}
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={plusOne}
                          onChange={(e) => setPlusOne(e.target.checked)}
                          className="w-4.5 h-4.5 rounded border-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 text-sm text-slate-200 font-medium">
                          <UserPlus className="w-4 h-4 text-amber-400" />
                          <span>I am bringing a +1 guest</span>
                        </div>
                      </label>

                      {plusOne && (
                        <div className="animate-slide-down">
                          <label htmlFor="plusone-name" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                            Plus One Full Name
                          </label>
                          <input
                            id="plusone-name"
                            type="text"
                            value={plusOneName}
                            onChange={(e) => setPlusOneName(e.target.value)}
                            placeholder="Full name of your guest"
                            required={plusOne}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Meal Preference */}
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" /> Meal Preference
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'non-veg', label: 'Non-Veg' },
                          { value: 'veg', label: 'Veg' },
                          { value: 'vegan', label: 'Vegan' }
                        ].map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setMealChoice(m.value)}
                            className={`py-2 px-3 border rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                              mealChoice === m.value
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/50'
                                : 'bg-slate-950 border-slate-850 text-slate-450 hover:text-slate-300'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div>
                      <label htmlFor="diet-notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Dietary restrictions / Allergies
                      </label>
                      <input
                        id="diet-notes"
                        type="text"
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                        placeholder="e.g. Gluten free, Peanut allergy, None..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Personal Message */}
                <div>
                  <label htmlFor="rsvp-msg" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Personal Message to the Couple
                  </label>
                  <textarea
                    id="rsvp-msg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a warm note or message (optional)"
                    rows={4}
                    className="w-full bg-slate-955 border border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-650 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-550 to-yellow-500 hover:from-amber-500 hover:to-yellow-405 text-slate-950 rounded-xl py-3.5 text-sm font-bold tracking-wider shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting response...
                    </>
                  ) : (
                    'Send RSVP Response'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-600 border-t border-slate-900 bg-slate-950">
        <p>© {new Date().getFullYear()} {weddingDetails.bride_name} & {weddingDetails.groom_name}'s Wedding Celebration.</p>
        <p className="mt-1 text-[10px] text-slate-700">Digital Invite created with ❤️ by Pramuditha Nadun.</p>
      </footer>
    </div>
  );
}
