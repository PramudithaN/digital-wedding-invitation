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
  const [isSuccess, setIsSuccess] = useState(!!(guest.rsvp && guest.rsvp.status && guest.rsvp.status !== 'pending'));
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 16,
        y: (e.clientY / window.innerHeight - 0.5) * 16,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
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

  const scrollToNext = () => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Calendar event helpers
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Wedding of ${weddingDetails.bride_name} & ${weddingDetails.groom_name}`);
    const dates = '20260919T103000Z/20260919T173000Z'; // UTC time equivalent (4:00 PM to 11:00 PM SLT)
    const details = encodeURIComponent(`Dear ${guest.name}, we look forward to celebrating this beautiful day with you.`);
    const location = encodeURIComponent(`${weddingDetails.venue}, ${weddingDetails.address}, ${weddingDetails.city}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const getICSContentUrl = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'SUMMARY:Wedding of ' + weddingDetails.bride_name + ' & ' + weddingDetails.groom_name,
      'DESCRIPTION:We look forward to celebrating this beautiful day with you.',
      'LOCATION:' + weddingDetails.venue + ', ' + weddingDetails.address + ', ' + weddingDetails.city,
      'DTSTART:20260919T103000Z',
      'DTEND:20260919T173000Z',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
  };

  const bgMotifs = [
    { type: 'nelum', top: '3%', left: '4%', size: 140, rotate: 10, anim: 'animate-float-1', parallax: 0.3 },
    { type: 'vine', top: '10%', right: '5%', size: 180, rotate: 0, anim: 'animate-float-2', parallax: -0.4 },
    { type: 'bud', top: '18%', left: '12%', size: 110, rotate: -15, anim: 'animate-float-3', parallax: 0.5 },
    { type: 'nelum', top: '26%', right: '10%', size: 130, rotate: 45, anim: 'animate-float-1', parallax: -0.3 },
    { type: 'vine_rev', top: '34%', left: '3%', size: 160, rotate: 90, anim: 'animate-float-2', parallax: 0.6 },
    { type: 'bud', top: '42%', right: '14%', size: 100, rotate: 30, anim: 'animate-float-3', parallax: -0.5 },
    { type: 'nelum', top: '50%', left: '8%', size: 140, rotate: -20, anim: 'animate-float-1', parallax: 0.4 },
    { type: 'vine', top: '58%', right: '6%', size: 190, rotate: 180, anim: 'animate-float-2', parallax: -0.6 },
    { type: 'bud', top: '67%', left: '10%', size: 110, rotate: 15, anim: 'animate-float-3', parallax: 0.7 },
    { type: 'nelum', top: '75%', right: '12%', size: 150, rotate: -45, anim: 'animate-float-1', parallax: -0.4 },
    { type: 'vine_rev', top: '83%', left: '4%', size: 170, rotate: -90, anim: 'animate-float-2', parallax: 0.5 },
    { type: 'bud', top: '90%', right: '8%', size: 120, rotate: 60, anim: 'animate-float-3', parallax: -0.3 },
    { type: 'nelum', top: '96%', left: '6%', size: 130, rotate: 120, anim: 'animate-float-1', parallax: 0.4 }
  ];

  const renderMotifSVG = (type: string) => {
    switch (type) {
      case 'nelum':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="text-[#C8A882] opacity-[0.16] fill-current">
            <path d="M50,15 C58,35 58,55 50,65 C42,55 42,35 50,15 Z" />
            <path d="M50,30 C30,25 35,50 50,65 C38,55 32,45 50,30 Z" />
            <path d="M50,30 C70,25 65,50 50,65 C62,55 68,45 50,30 Z" />
            <path d="M50,40 C15,45 25,65 50,65 C28,65 25,55 50,40 Z" />
            <path d="M50,40 C85,45 75,65 50,65 C72,65 75,55 50,40 Z" />
          </svg>
        );
      case 'vine':
        return (
          <svg width="100%" height="100%" viewBox="0 0 120 120" className="text-[#C8A882] opacity-[0.18] fill-none stroke-current stroke-[1.5]">
            <path d="M10,110 C30,90 40,60 30,30 C20,10 50,5 60,25 C70,45 40,60 60,80 C80,100 110,90 110,60 C110,30 90,20 80,40 C70,60 90,80 110,110" />
            <path d="M30,30 C15,25 10,40 30,50 C40,40 35,35 30,30 Z" className="fill-current opacity-10" />
            <path d="M60,25 C75,10 90,20 75,35 C65,30 65,25 60,25 Z" className="fill-current opacity-10" />
            <path d="M80,40 C95,25 105,40 90,55 C80,45 85,45 80,40 Z" className="fill-current opacity-10" />
          </svg>
        );
      case 'vine_rev':
        return (
          <svg width="100%" height="100%" viewBox="0 0 120 120" className="text-[#C8A882] opacity-[0.16] fill-none stroke-current stroke-[1.5] rotate-180">
            <path d="M10,110 C30,90 40,60 30,30 C20,10 50,5 60,25 C70,45 40,60 60,80 C80,100 110,90 110,60 C110,30 90,20 80,40 C70,60 90,80 110,110" />
            <path d="M30,30 C15,25 10,40 30,50 C40,40 35,35 30,30 Z" className="fill-current opacity-10" />
            <path d="M60,25 C75,10 90,20 75,35 C65,30 65,25 60,25 Z" className="fill-current opacity-10" />
          </svg>
        );
      case 'bud':
      default:
        return (
          <svg width="100%" height="100%" viewBox="0 0 80 80" className="text-[#C8A882] opacity-[0.16] fill-current">
            <path d="M40,10 C55,30 55,50 40,70 C25,50 25,30 40,10 Z" />
            <path d="M40,25 C48,35 48,45 40,55 C32,45 32,35 40,25 Z" className="opacity-40" />
            <circle cx="40" cy="40" r="3" className="fill-white" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-100 selection:text-gray-900">
      
      {/* Fixed Background Texture - Mandala Pattern with extremely low opacity */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img 
          src="/islamic-style-mandala-pattern-wedding-invitation-backdrop-design-vector_1017-46608.avif" 
          alt="Mandala Background"
          className="w-full h-full object-cover opacity-[0.05]" 
        />
      </div>

      {/* Dynamic Background Motifs spanning the entire page */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {bgMotifs.map((motif, idx) => {
          const style: React.CSSProperties = {
            top: motif.top,
            left: motif.left || undefined,
            right: motif.right || undefined,
            width: `${motif.size}px`,
            height: `${motif.size}px`,
            transform: `translate3d(${mousePos.x * motif.parallax}px, ${mousePos.y * motif.parallax}px, 0) rotate(${motif.rotate}deg)`,
          };
          return (
            <div
              key={idx}
              style={style}
              className="absolute select-none pointer-events-none transition-transform duration-300 ease-out"
            >
              {renderMotifSVG(motif.type)}
            </div>
          );
        })}
      </div>

      {/* Decorative Elegant Gold Corner Flourishes */}
      <div className="absolute top-4 left-4 text-[#C8A882]/20 pointer-events-none md:top-8 md:left-8">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,10 L30,10 A20,20 0 0,1 50,30 L50,50" />
          <path d="M10,10 L10,30 A20,20 0 0,0 30,50 L50,50" />
        </svg>
      </div>
      <div className="absolute top-4 right-4 text-[#C8A882]/20 pointer-events-none md:top-8 md:right-8 rotate-90">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10,10 L30,10 A20,20 0 0,1 50,30 L50,50" />
          <path d="M10,10 L10,30 A20,20 0 0,0 30,50 L50,50" />
        </svg>
      </div>

      {/* --- SECTION 1 - HERO SCREEN (FULLSCREEN) --- */}
      <section className="min-h-screen flex flex-col justify-between items-center text-center p-6 md:p-12 relative">
        <div className="pt-12">
          {/* Accent flourish line */}
          <div className="flex items-center justify-center gap-2 mb-4 text-[#C8A882]">
            <div className="h-[1px] w-8 bg-[#C8A882]" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">The Wedding Invitation</span>
            <div className="h-[1px] w-8 bg-[#C8A882]" />
          </div>
        </div>

        {/* Couples Names & Monogram */}
        <div className="my-auto space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tight text-gray-900 font-light">
            {weddingDetails.bride_name}
          </h1>
          <div className="font-script text-4xl sm:text-5xl text-[#C8A882] py-2">
            &
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tight text-gray-900 font-light">
            {weddingDetails.groom_name}
          </h1>

          <div className="pt-10 max-w-sm mx-auto space-y-3">
            <p className="text-sm font-serif italic text-[#6B6B6B]">
              Dear {guest.name},
            </p>
            <p className="text-xs text-[#6B6B6B] leading-relaxed max-w-xs mx-auto">
              You are cordially invited to join us in celebrating our wedding ceremony and reception.
            </p>
          </div>
        </div>

        {/* Schedule & Scroll cue */}
        <div className="pb-8 space-y-8 flex flex-col items-center">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-[#6B6B6B] font-semibold">{weddingDetails.date}</p>
            <p className="text-xs text-[#6B6B6B]">{weddingDetails.time} • {weddingDetails.venue}</p>
          </div>

          <button 
            onClick={scrollToNext}
            className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-[#C8A882] font-semibold hover:text-[#B69670] cursor-pointer transition-colors animate-pulse-soft"
          >
            <span>Explore Invitation</span>
            <ChevronDown className="w-4 h-4 mt-1" />
          </button>
        </div>
      </section>

      {/* --- SECTION 2 - COUNTDOWN TIMER --- */}
      <section ref={timelineRef} className="max-w-3xl mx-auto px-6 py-12 w-full text-center">
        <div className="bg-white/70 backdrop-blur-xs border border-[#E8E4DE] rounded-xl p-8 shadow-sm max-w-lg mx-auto space-y-6">
          <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-semibold">Counting down the moments</span>
          
          {isExpired ? (
            <p className="font-serif italic text-[#C8A882] text-lg">Today is the day! 🎉</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-[#E8E4DE]">
              <div className="px-1">
                <span className="block text-3xl font-light text-gray-900 font-serif">{timeLeft.days}</span>
                <span className="block text-[8px] uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Days</span>
              </div>
              <div className="px-1">
                <span className="block text-3xl font-light text-gray-900 font-serif">{timeLeft.hours}</span>
                <span className="block text-[8px] uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Hrs</span>
              </div>
              <div className="px-1">
                <span className="block text-3xl font-light text-gray-900 font-serif">{timeLeft.minutes}</span>
                <span className="block text-[8px] uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Min</span>
              </div>
              <div className="px-1">
                <span className="block text-3xl font-light text-gray-900 font-serif">{timeLeft.seconds}</span>
                <span className="block text-[8px] uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Sec</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 3 - EVENT TIMELINE --- */}
      <section className="max-w-xl mx-auto px-6 py-16 w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif tracking-tight text-gray-950 font-light">The Wedding Itinerary</h2>
          <div className="h-[1px] w-12 bg-[#C8A882] mx-auto mt-2" />
        </div>

        <div className="relative pl-6 md:pl-0 border-l border-[#E8E4DE] md:border-none md:grid md:grid-cols-7 gap-4 items-center">
          {/* Event 1 */}
          <div className="md:col-span-3 md:text-right font-serif text-lg text-gray-900 py-2">3:00 PM</div>
          <div className="hidden md:flex md:col-span-1 justify-center relative">
            <span className="w-3.5 h-3.5 rounded-full bg-[#C8A882] border-2 border-white z-10" />
            <div className="absolute top-3 w-[1px] h-20 bg-[#E8E4DE]" />
          </div>
          <div className="md:col-span-3 bg-white/75 backdrop-blur-xs border border-[#E8E4DE] p-4 rounded-lg shadow-xs mb-6 md:mb-0">
            <h4 className="font-semibold text-xs text-gray-900">Guest Arrival</h4>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">Grand Monarch Foyer</p>
          </div>

          {/* Event 2 */}
          <div className="md:col-span-3 md:text-right font-serif text-lg text-gray-900 py-2">3:30 PM</div>
          <div className="hidden md:flex md:col-span-1 justify-center relative">
            <span className="w-3.5 h-3.5 rounded-full bg-[#C8A882] border-2 border-white z-10" />
            <div className="absolute top-3 w-[1px] h-20 bg-[#E8E4DE]" />
          </div>
          <div className="md:col-span-3 bg-white/75 backdrop-blur-xs border border-[#E8E4DE] p-4 rounded-lg shadow-xs mb-6 md:mb-0">
            <h4 className="font-semibold text-xs text-gray-900">Wedding Ceremony</h4>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">Main Ceremonial Hall</p>
          </div>

          {/* Event 3 */}
          <div className="md:col-span-3 md:text-right font-serif text-lg text-gray-900 py-2">4:30 PM</div>
          <div className="hidden md:flex md:col-span-1 justify-center relative">
            <span className="w-3.5 h-3.5 rounded-full bg-[#C8A882] border-2 border-white z-10" />
            <div className="absolute top-3 w-[1px] h-20 bg-[#E8E4DE]" />
          </div>
          <div className="md:col-span-3 bg-white/75 backdrop-blur-xs border border-[#E8E4DE] p-4 rounded-lg shadow-xs mb-6 md:mb-0">
            <h4 className="font-semibold text-xs text-gray-900">Cocktails & Couple Photos</h4>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">Garden Terrace</p>
          </div>

          {/* Event 4 */}
          <div className="md:col-span-3 md:text-right font-serif text-lg text-gray-900 py-2">6:00 PM</div>
          <div className="hidden md:flex md:col-span-1 justify-center relative">
            <span className="w-3.5 h-3.5 rounded-full bg-[#C8A882] border-2 border-white z-10" />
            <div className="absolute top-3 w-[1px] h-20 bg-[#E8E4DE]" />
          </div>
          <div className="md:col-span-3 bg-white/75 backdrop-blur-xs border border-[#E8E4DE] p-4 rounded-lg shadow-xs mb-6 md:mb-0">
            <h4 className="font-semibold text-xs text-gray-900">Reception Dinner</h4>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">Main Banquet Hall</p>
          </div>

          {/* Event 5 */}
          <div className="md:col-span-3 md:text-right font-serif text-lg text-gray-900 py-2">9:00 PM</div>
          <div className="hidden md:flex md:col-span-1 justify-center relative">
            <span className="w-3.5 h-3.5 rounded-full bg-[#C8A882] border-2 border-white z-10" />
          </div>
          <div className="md:col-span-3 bg-white/75 backdrop-blur-xs border border-[#E8E4DE] p-4 rounded-lg shadow-xs">
            <h4 className="font-semibold text-xs text-gray-900">Dancing & Farewell</h4>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5">Dance Floor / Hall</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 4 - RSVP FORM --- */}
      <section id="rsvp-section" ref={rsvpRef} className="max-w-lg mx-auto px-6 py-12 w-full relative z-10">
        <div className="bg-white/70 backdrop-blur-xs border border-[#E8E4DE] rounded-xl p-8 shadow-sm space-y-6">
          {isSuccess ? (
            /* Success screen */
            <div className="text-center py-8 space-y-5 animate-scale-up">
              <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-serif text-gray-900">RSVP Confirmed</h2>
                <p className="text-xs text-[#6B6B6B] max-w-xs mx-auto">
                  Thank you, {guest.name}. Your response has been logged successfully.
                </p>
              </div>
              {attending === 'attending' ? (
                <div className="bg-green-50/50 border border-green-100 p-4 rounded text-xs text-green-700 max-w-xs mx-auto">
                  We look forward to celebrating this beautiful day with you!
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded text-xs text-gray-500 max-w-xs mx-auto italic border border-gray-200">
                  We're sorry you can't make it, but we appreciate your response.
                </div>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-600 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 rounded px-4 py-2 cursor-pointer transition-colors"
                >
                  Edit Response
                </button>
              </div>
            </div>
          ) : (
            /* RSVP Form Content */
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-2xl font-serif text-gray-950 font-light">
                  {guest.rsvp ? 'Edit your response' : 'Will you join us?'}
                </h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Please reply by September 01, 2026</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-3 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRSVPSubmit} className="space-y-5">
                {/* Attending Selection */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] text-center">
                    Attendance
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('attending');
                        setError('');
                      }}
                      className={`py-3 rounded border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        attending === 'attending'
                          ? 'bg-blue-50 text-blue-600 border-blue-500 shadow-xs'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      Accepts with Joy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('declined');
                        setError('');
                      }}
                      className={`py-3 rounded border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        attending === 'declined'
                          ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      Declines with Regret
                    </button>
                  </div>
                </div>

                {/* Conditional Fields if Attending */}
                {attending === 'attending' && (
                  <div className="space-y-5 pt-4 border-t border-[#E8E4DE] animate-fade-in">
                    {/* Plus One Toggle */}
                    <div className="bg-[#FAFAF8] p-4 rounded border border-[#E8E4DE] space-y-4">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={plusOne}
                          onChange={(e) => setPlusOne(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-0 bg-white cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold">
                          <UserPlus className="w-4 h-4 text-[#C8A882]" />
                          <span>I will be bringing a +1</span>
                        </div>
                      </label>

                      {plusOne && (
                        <div className="animate-slide-down">
                          <label htmlFor="plusone-name" className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Plus One Guest Name
                          </label>
                          <input
                            id="plusone-name"
                            type="text"
                            value={plusOneName}
                            onChange={(e) => setPlusOneName(e.target.value)}
                            placeholder="Full name of your guest"
                            required={plusOne}
                            className="w-full bg-white border border-gray-200 rounded py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Meal Preference */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[#C8A882]" /> Meal Selection
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
                            className={`py-2 px-3 border rounded text-xs font-semibold capitalize transition-all cursor-pointer ${
                              mealChoice === m.value
                                ? 'bg-blue-50 text-blue-600 border-blue-500'
                                : 'bg-white border-gray-200 text-gray-500'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div>
                      <label htmlFor="diet-notes" className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">
                        Dietary restrictions / Allergies
                      </label>
                      <input
                        id="diet-notes"
                        type="text"
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                        placeholder="e.g. Nut allergies, Gluten free"
                        className="w-full bg-white border border-gray-200 rounded py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Personal Message */}
                <div>
                  <label htmlFor="rsvp-msg" className="block text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C8A882]" /> Warm Wishes
                  </label>
                  <textarea
                    id="rsvp-msg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a message to the couple (optional)"
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded py-3 px-4 text-xs text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded py-2.5 text-xs font-semibold tracking-wider shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin animate-infinite" />
                      Sending...
                    </>
                  ) : (
                    guest.rsvp ? 'Update RSVP' : 'Confirm RSVP'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 5 - ADD TO CALENDAR --- */}
      <section className="max-w-md mx-auto px-6 py-6 w-full text-center">
        <div className="bg-white/70 backdrop-blur-xs border border-[#E8E4DE] rounded-xl p-8 shadow-xs space-y-5">
          <h3 className="text-lg font-serif text-gray-900 font-light">Save the Date</h3>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-250 text-gray-700 border border-gray-200 rounded py-2 px-4 text-xs font-medium transition-colors"
            >
              Google Calendar
            </a>
            <a
              href={getICSContentUrl()}
              download="wedding_invite.ics"
              className="bg-gray-100 hover:bg-gray-250 text-gray-700 border border-gray-200 rounded py-2 px-4 text-xs font-medium transition-colors"
            >
              Apple Calendar
            </a>
          </div>
        </div>
      </section>

      {/* --- SECTION 6 - MOMENTS (IMAGE GALLERY PLACEHOLDER) --- */}
      <section className="max-w-3xl mx-auto px-6 py-12 w-full text-center space-y-6">
        <h2 className="text-xl font-serif text-gray-900 font-light">Moments Gallery</h2>
        <div className="h-[1px] w-12 bg-[#C8A882] mx-auto" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="overflow-hidden rounded-xl border border-[#E8E4DE] shadow-xs group bg-[#FAFAF8]">
            <img 
              src="/ok1.webp" 
              alt="Oshidhie & Kaveen Moment 1" 
              className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E8E4DE] shadow-xs group bg-[#FAFAF8] sm:translate-y-4">
            <img 
              src="/ok2.webp" 
              alt="Oshidhie & Kaveen Moment 2" 
              className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E8E4DE] shadow-xs group bg-[#FAFAF8]">
            <img 
              src="/ok3.webp" 
              alt="Oshidhie & Kaveen Moment 3" 
              className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 italic pt-6">"Our journey together"</p>
      </section>

      {/* --- SECTION 7 - VENUE DETAILS & MAP --- */}
      <section className="max-w-3xl mx-auto px-6 py-16 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Venue Information */}
        <div className="bg-white/70 backdrop-blur-xs border border-[#E8E4DE] rounded-xl p-8 space-y-6 shadow-xs h-full flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-gray-950 font-light">{weddingDetails.venue}</h3>
            <p className="text-xs text-[#6B6B6B]">{weddingDetails.city}</p>
            <div className="h-[1px] w-full bg-[#E8E4DE]" />
            <div className="text-xs text-[#6B6B6B] leading-relaxed space-y-1 pt-1">
              <p>{weddingDetails.address}</p>
              <p>Colombo, Sri Lanka</p>
            </div>
            <div className="h-[1px] w-full bg-[#E8E4DE]" />
            <div className="text-[10px] text-gray-400 space-y-1">
              <p>• Parking available on-site</p>
              <p>• Valet service from 2:30 PM</p>
            </div>
          </div>

          {weddingDetails.google_maps_url && (
            <a
              href={weddingDetails.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 border border-blue-500 hover:bg-blue-50 text-blue-600 rounded py-2.5 px-4 text-center text-xs font-semibold transition-all inline-block"
            >
              Get Directions
            </a>
          )}
        </div>

        {/* Right Iframe Map Embed */}
        <div className="bg-white/70 backdrop-blur-xs border border-[#E8E4DE] rounded-xl overflow-hidden shadow-xs h-80 relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.2678685121404!2d79.91978257500913!3d6.858485293140026!2m3!1f0!2f0!3f0!2m2!1i1024!2i768!4f13.1!3m3!1m2!1m1!2sGrand+Monarch!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale opacity-80"
          ></iframe>
        </div>
      </section>

      {/* --- SECTION 8 - FOOTER --- */}
      <footer className="mt-auto py-12 text-center text-xs text-white bg-neutral-900 px-6 space-y-4">
        <h2 className="text-2xl font-serif tracking-tight font-light italic">
          {weddingDetails.bride_name} & {weddingDetails.groom_name}
        </h2>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{weddingDetails.date}</p>
        <div className="flex justify-center text-[#C8A882] py-2">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <p className="text-[9px] text-gray-500">Made with love for our special day.</p>
        <p className="text-[8px] text-gray-650">Digital Invite created by Pramuditha Nadun.</p>
      </footer>
    </div>
  );
}
