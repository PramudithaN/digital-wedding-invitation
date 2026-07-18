'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  UtensilsCrossed, 
  UserPlus, 
  MessageSquare,
  Loader2,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Wine
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
  const [alcoholChoice, setAlcoholChoice] = useState(guest.rsvp?.alcohol_choice || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(!!(guest.rsvp && guest.rsvp.status && guest.rsvp.status !== 'pending'));
  const [error, setError] = useState('');
  const [envelopeState, setEnvelopeState] = useState<'closed' | 'opening' | 'exiting' | 'open'>('closed');

  // Disable scroll when envelope is closed/opening
  useEffect(() => {
    if (envelopeState !== 'open') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [envelopeState]);

  const handleOpenEnvelope = () => {
    if (envelopeState !== 'closed') return;
    setEnvelopeState('opening');
    
    setTimeout(() => {
      setEnvelopeState('exiting');
    }, 1600);

    setTimeout(() => {
      setEnvelopeState('open');
    }, 2400);
  };

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
          message: message.trim(),
          alcohol_choice: attending === 'attending' ? alcoholChoice : '',
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit RSVP');
      }

      setIsSuccess(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'There was a problem submitting your RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar event helpers
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Wedding of ${weddingDetails.bride_name} & ${weddingDetails.groom_name}`);
    const dates = '20260923T123000Z/20260923T180000Z'; // UTC time equivalent (6:00 PM to 11:30 PM SLT)
    const details = encodeURIComponent(
      guest.name === 'general'
        ? `We look forward to celebrating this beautiful day with you.`
        : `Dear ${guest.name}, we look forward to celebrating this beautiful day with you.`
    );
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
      'DTSTART:20260923T123000Z',
      'DTEND:20260923T180000Z',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
  };

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

  const invitationTypography = {
    mainNames: '"Miracle World Personal use regular", "Miracle World Personal Use Regular", "Miracle World", "Playfair Display", serif',
    ampersand: '"Boheme Floral", "Great Vibes", cursive',
    body: '"Playfair Display", serif',
    nameColor: '#2D312E',
    ampColor: '#D38A99',
    bodyColor: '#2D312E',
  };

  // The Order of the Day individual transparent high-resolution PNG icon sources
  const itineraryItems = [
    { time: '6:00 PM', title: 'Poruwa Ceremony', iconSrc: '/Rings.png' },
    { time: '6:45 PM', title: 'Cutting the Cake', iconSrc: '/cake.png' },
    { time: '7:00 PM', title: 'Toast and Speeches', iconSrc: '/toast.png' },
    { time: '7:15 PM', title: 'Photoshoot', iconSrc: '/photo.png' },
    { time: '8:00 PM', title: 'First Dance', iconSrc: '/first%20dance.png' },
    { time: '9:00 PM', title: 'Dinner', iconSrc: '/Dinner.png' },
    { time: '9:30 PM', title: 'Photoshoot', iconSrc: '/photo.png' },
    { time: '10:30 PM', title: 'Dance Floor', iconSrc: '/dance.png' },
    { time: '11:30 PM', title: 'Sweet Dreams', iconSrc: '/sweet%20dreams.png' }
  ];

  const ItineraryIcon = ({ src, className }: { src: string; className?: string }) => (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      {/* Decorative timeline icons intentionally rendered as raw img for simple static assets. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Timeline Icon"
        className="w-full h-full object-contain scale-[1.8] transform"
      />
    </div>
  );


  return (
    <div className="min-h-screen bg-[#F2F1EB] text-[#1A1A1A] flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-100 selection:text-gray-900 px-4 py-4 sm:py-8">
      
      {/* 3D Envelope Overlay */}
      {envelopeState !== 'open' && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#060810]/96 backdrop-blur-md transition-all duration-1000 ${
            envelopeState === 'exiting' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Envelope Wrapper */}
          <div className="relative flex flex-col items-center justify-center p-4 w-full max-w-lg">
            {/* Invitation Header Label */}
            <div 
              className={`mb-6 text-center transition-all duration-1000 ${
                envelopeState !== 'closed' ? 'opacity-0 -translate-y-4' : 'opacity-100'
              }`}
            >
              <span className="text-[#C8A882] text-[10px] uppercase tracking-[0.25em] font-semibold block mb-2" style={{ fontFamily: invitationTypography.body }}>You are Invited</span>
              <h2 className="text-white text-2xl font-light tracking-wide" style={{ fontFamily: invitationTypography.mainNames }}>
                {weddingDetails.bride_name} <span style={{ fontFamily: invitationTypography.ampersand, color: invitationTypography.ampColor }}>&</span> {weddingDetails.groom_name}
              </h2>
              <div className="h-[1px] w-12 bg-[#C8A882]/40 mx-auto mt-3" />
            </div>

            {/* Envelope Container (uses perspective) */}
            <div 
              className={`relative w-[310px] h-[220px] sm:w-[420px] sm:h-[290px] md:w-[480px] md:h-[330px] perspective-1200 transition-transform duration-1000 ${
                envelopeState === 'opening' ? 'scale-105' : ''
              }`}
            >
              {/* Soft Drop Shadow under the envelope */}
              <div className="absolute inset-4 bg-black/60 rounded-lg blur-2xl transform translate-y-6" />

              {/* Envelope Body (no overflow-hidden to allow card slide-out) */}
              <div className="relative w-full h-full rounded-lg border border-white/10 shadow-2xl bg-[#0d1424] preserve-3d">
                
                {/* 1. Envelope Inside Gold Liner (revealed as top flap rotates open) */}
                <div className="absolute inset-0 bg-[#C8A882] z-5 overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E9D7C2] via-[#C8A882] to-[#9c7d57]" />
                  {/* Liner details */}
                  <div className="absolute inset-3 border border-white/15 rounded-md" />
                  <div className="absolute inset-0 opacity-[0.08] bg-repeat" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                </div>

                {/* 2. Invitation Card (slides out of envelope) */}
                <div 
                  className={`absolute left-4 right-4 h-[86%] bg-[#FAFAF8] rounded-md shadow-2xl border border-[#C8A882]/30 p-6 flex flex-col justify-between items-center text-center origin-bottom z-10 envelope-card`}
                  style={{
                    bottom: '6%',
                    transform: envelopeState !== 'closed' ? 'translate3d(0, -50%, 0) scale(1.02)' : 'translate3d(0, 8px, 0) scale(0.96)',
                    opacity: envelopeState !== 'closed' ? 1 : 0,
                    boxShadow: envelopeState !== 'closed' ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' : 'none'
                  }}
                >
                  <div className="my-auto space-y-2">
                    <div className="w-10 h-10 text-[#C8A882] opacity-80 mx-auto mb-1">
                      {renderMotifSVG('nelum')}
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-[#C8A882] font-semibold block" style={{ fontFamily: invitationTypography.body }}>The Wedding of</span>
                    <h3 className="text-xl sm:text-2xl leading-tight font-light" style={{ fontFamily: invitationTypography.mainNames, color: invitationTypography.nameColor }}>
                      {weddingDetails.bride_name}
                      <span className="block text-xl py-0.5" style={{ fontFamily: invitationTypography.ampersand, color: invitationTypography.ampColor }}>&</span>
                      {weddingDetails.groom_name}
                    </h3>
                    <div className="w-8 h-[1px] bg-[#C8A882]/40 mx-auto my-1.5" />
                    <div className="space-y-1">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider" style={{ fontFamily: invitationTypography.body }}>Honorary Guest</p>
                      <p className="italic text-sm font-semibold" style={{ fontFamily: invitationTypography.body, color: invitationTypography.bodyColor }}>
                        {guest.name === 'general' ? 'Warmly Invited' : guest.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Front Left Flap with lighting gradient and realistic drop-shadow */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-[#162035] to-[#0e1422] border-l border-white/5" 
                  style={{ 
                    clipPath: 'polygon(0% 0%, 53% 50%, 0% 100%)', 
                    zIndex: 22,
                    filter: 'drop-shadow(5px 2px 6px rgba(0,0,0,0.35))'
                  }}
                />
                
                {/* 4. Front Right Flap with lighting gradient and realistic drop-shadow */}
                <div 
                  className="absolute inset-0 bg-gradient-to-bl from-[#162035] to-[#0e1422] border-r border-white/5" 
                  style={{ 
                    clipPath: 'polygon(100% 0%, 47% 50%, 100% 100%)', 
                    zIndex: 22,
                    filter: 'drop-shadow(-5px 2px 6px rgba(0,0,0,0.35))'
                  }}
                />

                {/* 5. Front Bottom Flap with lighting gradient and realistic drop-shadow */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] to-[#121a2c] border-b border-white/5" 
                  style={{ 
                    clipPath: 'polygon(0% 100%, 100% 100%, 50% 46%)', 
                    zIndex: 20,
                    filter: 'drop-shadow(0px -4px 10px rgba(0,0,0,0.4))'
                  }}
                />

                {/* Calligraphy Guest Badge on the Front Flaps (visible only when closed) */}
                <div 
                  className={`absolute bottom-8 left-0 right-0 text-center transition-opacity duration-700 z-25 flex flex-col items-center ${
                    envelopeState !== 'closed' ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <div className="px-5 py-2 rounded-md border border-[#C8A882]/20 bg-[#070b14]/90 backdrop-blur-xs shadow-lg max-w-[80%]">
                    <span className="text-[7px] text-[#C8A882]/60 uppercase tracking-[0.2em] block mb-0.5">{guest.name === 'general' ? "": 'Invited Guest'}</span>
                    <p className="font-script text-[#C8A882] text-lg sm:text-xl leading-none px-2">
                      {guest.name === 'general' ? 'Warmly Invited' : guest.name}
                    </p>
                  </div>
                </div>

                {/* 6. Front Top Flap (double-sided 3D folding flap) */}
                <div 
                  className="absolute inset-0 envelope-top-flap"
                  style={{ 
                    transform: envelopeState !== 'closed' ? 'rotateX(180deg)' : 'rotateX(0deg)',
                    zIndex: envelopeState !== 'closed' ? 8 : 24,
                    filter: envelopeState === 'closed' ? 'drop-shadow(0px 8px 16px rgba(0,0,0,0.45))' : 'drop-shadow(0px 0px 0px rgba(0,0,0,0))'
                  }}
                >
                  {/* Outer side (Navy Blue with Gold border) */}
                  <div 
                    className="absolute inset-0 bg-[#C8A882] backface-hidden"
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 54%)' }}
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-b from-[#1c2a47] to-[#121c33]"
                      style={{ clipPath: 'polygon(2px 2px, calc(100% - 2px) 2px, 50% 50%)' }}
                    />
                  </div>

                  {/* Inner side (Liner Gold texture) */}
                  <div 
                    className="absolute inset-0 bg-[#C8A882] backface-hidden"
                    style={{ 
                      clipPath: 'polygon(0% 0%, 100% 0%, 50% 54%)',
                      transform: 'rotateX(180deg)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-b from-[#E7D6BE] via-[#C8A882] to-[#B2926C]"
                      style={{ clipPath: 'polygon(2px 2px, calc(100% - 2px) 2px, 50% 50%)' }}
                    />
                  </div>
                </div>

                {/* Wax Seal (button placed on top flap tip, centered) */}
                <button 
                  onClick={handleOpenEnvelope}
                  disabled={envelopeState !== 'closed'}
                  className={`absolute top-1/2 left-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-radial from-[#aa2025] via-[#851014] to-[#500508] border-2 border-[#C8A882]/50 shadow-[0_6px_18px_rgba(0,0,0,0.55)] cursor-pointer flex items-center justify-center group z-30 envelope-seal ${
                    envelopeState !== 'closed' ? 'opacity-0' : 'animate-pulse-slow'
                  }`}
                  style={{
                    transform: envelopeState !== 'closed' ? 'translate3d(-50%, -50%, 0) scale(0) rotate(-45deg)' : 'translate3d(-50%, -50%, 0) scale(1) rotate(0deg)'
                  }}
                >
                  {/* Decorative dashed gold circle */}
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#C8A882]/30 group-hover:border-[#C8A882]/60 transition-colors" />
                  
                  {/* Hearts monogram or text */}
                  <Heart className="w-5 h-5 text-[#C8A882] fill-current group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Hint label */}
            <button
              onClick={handleOpenEnvelope}
              disabled={envelopeState !== 'closed'}
              className={`mt-6 text-[9px] text-[#C8A882]/60 uppercase tracking-[0.25em] font-semibold hover:text-[#C8A882] cursor-pointer transition-all duration-700 ${
                envelopeState !== 'closed' ? 'opacity-0 translate-y-4' : 'opacity-100 animate-pulse-soft'
              }`}
            >
              Click Seal to Open
            </button>
          </div>
        </div>
      )}

      {/* Animated Floating Flowers & Petals around the page (starts falling once envelope is opened) */}
      {envelopeState !== 'closed' && (
        <>

          {/* Corner Blooming Flowers */}
          {/* Top Left Corner */}
          <div 
            className="fixed top-0 left-0 z-30 pointer-events-none overflow-hidden w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 origin-top-left transition-all duration-1000 animate-bloom" 
            style={{ '--flower-rotate': '0deg', '--flower-opacity': '0.7' } as React.CSSProperties}
          >
            <div className="w-full h-full relative animate-sway-gentle">
              <div className="absolute inset-0 text-[#C8A882] opacity-[0.35]">
                {renderMotifSVG('vine')}
              </div>
              <div className="absolute top-2 left-2 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#C8A882] opacity-[0.55] rotate-12">
                {renderMotifSVG('nelum')}
              </div>
            </div>
          </div>

          {/* Top Right Corner */}
          <div 
            className="fixed top-0 right-0 z-30 pointer-events-none overflow-hidden w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 origin-top-right transition-all duration-1000 animate-bloom" 
            style={{ '--flower-rotate': '90deg', '--flower-opacity': '0.7' } as React.CSSProperties}
          >
            <div className="w-full h-full relative animate-sway-gentle">
              <div className="absolute inset-0 text-[#C8A882] opacity-[0.35] rotate-90 scale-x-[-1]">
                {renderMotifSVG('vine')}
              </div>
              <div className="absolute top-2 right-2 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#C8A882] opacity-[0.55] rotate-45">
                {renderMotifSVG('nelum')}
              </div>
            </div>
          </div>

          {/* Bottom Left Corner */}
          <div 
            className="fixed bottom-0 left-0 z-30 pointer-events-none overflow-hidden w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 origin-bottom-left transition-all duration-1000 animate-bloom" 
            style={{ '--flower-rotate': '-90deg', '--flower-opacity': '0.7' } as React.CSSProperties}
          >
            <div className="w-full h-full relative animate-sway-gentle">
              <div className="absolute inset-0 text-[#C8A882] opacity-[0.35] -rotate-90">
                {renderMotifSVG('vine')}
              </div>
              <div className="absolute bottom-2 left-2 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#C8A882] opacity-[0.55] -rotate-45">
                {renderMotifSVG('nelum')}
              </div>
            </div>
          </div>

          {/* Bottom Right Corner */}
          <div 
            className="fixed bottom-0 right-0 z-30 pointer-events-none overflow-hidden w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 origin-bottom-right transition-all duration-1000 animate-bloom" 
            style={{ '--flower-rotate': '180deg', '--flower-opacity': '0.7' } as React.CSSProperties}
          >
            <div className="w-full h-full relative animate-sway-gentle">
              <div className="absolute inset-0 text-[#C8A882] opacity-[0.35] rotate-180">
                {renderMotifSVG('vine')}
              </div>
              <div className="absolute bottom-2 right-2 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-[#C8A882] opacity-[0.55] rotate-[135deg]">
                {renderMotifSVG('nelum')}
              </div>
            </div>
          </div>
        </>
      )}

      
      {/* Background Rotating Mandala Art */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {renderBackgroundMandala()}
      </div>

      {/* The Invitation Card Container */}
      <div className="relative z-10 w-full max-w-[650px] mx-auto bg-[#F7F1E8] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-[#E3DEC9] rounded-2xl overflow-hidden my-4 sm:my-6 md:my-8 flex flex-col">
        {/* Background Mandala inside Card (Aligned statically to the card container) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none rounded-2xl animate-fade-in"
          style={{
            backgroundImage: 'url("/Invitation-background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            opacity: 1
          }}
        />

        {/* Soft paper overlay to keep text readable over the floral artwork */}
        <div className="absolute inset-0 z-0 rounded-2xl bg-[#F7F1E8]/40 pointer-events-none" />

        {/* Top Floral Decoration — flowers hang down from the top edge, matching the Photoshop artboard */}
        <div
          className="absolute top-0 left-0 right-0 z-[1] w-full pointer-events-none"
          style={{
            backgroundImage: 'url("/top%20flowers.webp")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'top center',
            aspectRatio: '2299/1121',
          }}
        />

        {/* Content Wrapper to raise content above z-0 backgrounds */}
        <div className="relative z-10 w-full flex flex-col">


        {/* --- SECTION 1 - HERO SCREEN (FULLSCREEN) --- */}
        <section className="flex flex-col items-center text-center p-6 md:p-10 relative pt-32 sm:pt-44 md:pt-48 pb-6">
          <div className="pt-6 sm:pt-8">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#6B6B6B]" style={{ fontFamily: invitationTypography.body }}>
              Together with their families
            </p>
          </div>

          {/* Couples Names & Monogram */}
          <div className="my-auto space-y-4 pt-4 pb-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-wide leading-none" style={{ fontFamily: invitationTypography.mainNames, color: invitationTypography.nameColor }}>
              {weddingDetails.bride_name}
            </h1>
            <div className="text-4xl sm:text-5xl font-script py-1" style={{ fontFamily: invitationTypography.ampersand, color: invitationTypography.ampColor }}>
              and
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-wide leading-none" style={{ fontFamily: invitationTypography.mainNames, color: invitationTypography.nameColor }}>
              {weddingDetails.groom_name}
            </h1>

            <p className="text-xs sm:text-sm tracking-wide leading-relaxed max-w-sm mx-auto text-[#6B6B6B] pt-4" style={{ fontFamily: invitationTypography.body }}>
              {guest.name === 'general' ? 'request the pleasure of the company' : 'request the pleasure of the company of'}
            </p>

            {guest.name !== 'general' && (
              <div className="py-2">
                <p className="text-sm sm:text-base italic text-[#4A4A4A]" style={{ fontFamily: invitationTypography.body }}>
                  {guest.name},
                </p>
              </div>
            )}
            
            <p className="text-xs sm:text-sm tracking-wide leading-relaxed max-w-sm mx-auto text-[#6B6B6B]" style={{ fontFamily: invitationTypography.body }}>
              on their wedding day
            </p>
          </div>

          {/* Schedule & Scroll cue */}
          <div className="pb-4 space-y-6 flex flex-col items-center">
            {/* Date & Time block (Pink, Serif, Uppercase) */}
            <div className="space-y-2 py-2">
              <p className="text-lg sm:text-xl md:text-2xl uppercase tracking-[0.15em] font-medium" style={{ fontFamily: invitationTypography.body, color: invitationTypography.ampColor }}>
                {weddingDetails.date.toUpperCase()}
              </p>
              <p className="text-md sm:text-lg md:text-xl uppercase tracking-[0.15em] font-medium" style={{ fontFamily: invitationTypography.body, color: invitationTypography.ampColor }}>
                AT {weddingDetails.time.toUpperCase()}
              </p>
            </div>

            {/* Arrive & Venue */}
            <div className="space-y-1 text-xs sm:text-sm tracking-wide text-[#6B6B6B]" style={{ fontFamily: invitationTypography.body }}>
              <p>Please arrive no later than 5:30 pm</p>
              <p className="font-semibold text-gray-900">At {weddingDetails.venue}</p>
            </div>

            {/* Reception flourish */}
            <div className="text-2xl sm:text-3xl font-script pt-2 pb-4" style={{ fontFamily: invitationTypography.ampersand, color: invitationTypography.ampColor }}>
              Reception to follow
            </div>

            <button 
              onClick={scrollToNext}
              className="flex flex-col items-center gap-1 text-[11px] sm:text-xs uppercase tracking-widest text-[#C8A882] font-semibold hover:text-[#B69670] cursor-pointer transition-colors animate-pulse-soft"
            >
              <span>Explore Invitation</span>
              <ChevronDown className="w-4 h-4 mt-1" />
            </button>
          </div>
        </section>

      {/* Bottom Floral Decoration before countdown — flowers grow up from the bottom edge,
          sitting directly above the countdown section like on the Photoshop artboard */}
      <div
        className="w-full pointer-events-none relative z-[1] -mt-16 sm:-mt-24 md:-mt-32 -mb-20 sm:-mb-28 md:-mb-36"
        style={{
          backgroundImage: 'url("/digital%20invitation%20bottomfowers.webp")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom center',
          aspectRatio: '2299/1638', // Exact aspect ratio of the image file (no clipping)
          maskImage: 'linear-gradient(to top, transparent, black 15%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent, black 15%)',
        }}
      />


      {/* --- SECTION 2 - COUNTDOWN TIMER --- */}
      <section ref={timelineRef} className="max-w-3xl mx-auto px-6 pt-2 pb-12 w-full text-center relative z-10">
        <div className="bg-white/70 backdrop-blur-xs border border-[#E8E4DE] rounded-xl p-8 shadow-sm max-w-lg mx-auto space-y-6 relative z-10">
          <div>
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B6B6B] font-semibold block">Counting down the moments</span>
            <p className="text-base sm:text-lg font-serif text-[#D38A99] font-medium tracking-wide mt-1">Wednesday, September 23, 2026</p>
          </div>
          
          {isExpired ? (
            <p className="font-serif italic text-[#C8A882] text-xl">Today is the day! 🎉</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-[#E8E4DE]">
              <div className="px-1">
                <span className="block text-4xl sm:text-5xl font-light text-gray-900 font-serif">{timeLeft.days}</span>
                <span className="block text-[10px] sm:text-xs uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Days</span>
              </div>
              <div className="px-1">
                <span className="block text-4xl sm:text-5xl font-light text-gray-900 font-serif">{timeLeft.hours}</span>
                <span className="block text-[10px] sm:text-xs uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Hrs</span>
              </div>
              <div className="px-1">
                <span className="block text-4xl sm:text-5xl font-light text-gray-900 font-serif">{timeLeft.minutes}</span>
                <span className="block text-[10px] sm:text-xs uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Min</span>
              </div>
              <div className="px-1">
                <span className="block text-4xl sm:text-5xl font-light text-gray-900 font-serif">{timeLeft.seconds}</span>
                <span className="block text-[10px] sm:text-xs uppercase tracking-widest text-[#6B6B6B] font-semibold mt-1">Sec</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 3 - EVENT TIMELINE --- */}
      <section className="w-full py-16 relative overflow-hidden animate-fade-in z-10">
        {/* Flowers on the sides background overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/sides.png")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            opacity: 0.95,
          }}
        />

        <div className="max-w-xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-serif tracking-tight text-gray-950 font-light" style={{ fontFamily: invitationTypography.body, color: invitationTypography.nameColor }}>Order of the Day</h2>
            <div className="h-[1px] w-12 bg-[#D38A99] mx-auto mt-2" />
          </div>

          <div className="relative py-4 flex flex-col items-center">
            {/* Timeline vertical line */}
            <div className="absolute left-1/2 top-10 bottom-10 w-[1.5px] bg-[#D38A99]/20 -translate-x-1/2 z-0" />

            <div className="w-full space-y-8 sm:space-y-10">
              {itineraryItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6 w-full relative z-10">
                  {/* Left side: Time */}
                  <div className="text-right">
                    <p className="font-serif text-sm sm:text-base font-semibold tracking-wider text-[#D38A99] uppercase">{item.time}</p>
                  </div>
                  
                  {/* Centered Large Icon circle */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FCFAF5] border border-[#E8DCC7] flex items-center justify-center overflow-hidden shadow-md hover:scale-110 transition-transform duration-300 relative z-10">
                    <ItineraryIcon src={item.iconSrc} />
                  </div>
                  
                  {/* Right side: Title */}
                  <div className="text-left">
                    <h4 className="font-serif text-sm sm:text-base text-[#2D312E] font-medium leading-snug max-w-[160px] sm:max-w-[200px]">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4 - RSVP FORM --- */}
      {guest.name !== 'general' && (
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
                  We&apos;re sorry you can&apos;t make it, but we appreciate your response.
                </div>
              )}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-semibold text-[#D38A99] hover:text-[#c78c97] border border-[#FAF0F2] bg-[#FAF0F2] hover:bg-[#f5e1e5] rounded px-4 py-2 cursor-pointer transition-colors"
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
                          ? 'bg-[#FAF0F2] text-[#D38A99] border-[#D38A99] shadow-xs'
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
                          className="w-4 h-4 rounded border-gray-300 text-[#D38A99] focus:ring-0 bg-white cursor-pointer"
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
                            className="w-full bg-white border border-gray-200 rounded py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-[#D38A99]"
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
                                ? 'bg-[#FAF0F2] text-[#D38A99] border-[#D38A99]'
                                : 'bg-white border-gray-200 text-gray-500'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alcohol Preference */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6B6B6B] flex items-center gap-1.5">
                        <Wine className="w-3.5 h-3.5 text-[#C8A882]" /> Alcohol Selection
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'hard liquor', label: 'Hard Liquor' },
                          { value: 'wine', label: 'Wine' },
                          { value: 'none', label: 'No Alcohol' }
                        ].map((alc) => (
                          <button
                            key={alc.value}
                            type="button"
                            onClick={() => setAlcoholChoice(alc.value)}
                            className={`py-2 px-3 border rounded text-xs font-semibold capitalize transition-all cursor-pointer ${
                              alcoholChoice === alc.value
                                ? 'bg-[#FAF0F2] text-[#D38A99] border-[#D38A99]'
                                : 'bg-white border-gray-200 text-gray-500'
                            }`}
                          >
                            {alc.label}
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
                        className="w-full bg-white border border-gray-200 rounded py-2.5 px-3.5 text-xs text-gray-900 focus:outline-none focus:border-[#D38A99]"
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
                    className="w-full bg-white border border-gray-200 rounded py-3 px-4 text-xs text-gray-900 focus:outline-none focus:border-[#D38A99] resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D38A99] hover:bg-[#c78c97] text-white rounded py-2.5 text-xs font-semibold tracking-wider shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
      )}

      {/* --- SECTION 4.5 - CONTACT DETAILS --- */}
      <section className="max-w-lg mx-auto px-6 pb-12 w-full relative z-10">
        <div className="bg-white/70 backdrop-blur-xs border border-[#E8E4DE] rounded-xl p-8 shadow-sm space-y-6 text-center">
          <h3 className="text-2xl font-serif text-gray-950 font-light tracking-wide" style={{ fontFamily: invitationTypography.body, color: invitationTypography.nameColor }}>Contact Details</h3>
          <div className="h-[1px] w-12 bg-[#D38A99] mx-auto" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-left max-w-sm mx-auto">
            {/* Bride's Family */}
            <div className="space-y-3">
              <h4 className="font-serif font-semibold text-sm sm:text-base text-[#D38A99] uppercase tracking-wider pb-1 border-b border-[#D38A99]/10">Bride&apos;s Family</h4>
              <div className="text-sm sm:text-base text-gray-800 space-y-2 font-serif">
                <div className="flex justify-between items-center gap-4">
                  <span className="font-medium text-gray-955">Oshidhie:</span>
                  <span className="whitespace-nowrap">077 141 4181</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="font-medium text-gray-955">Jeevani:</span>
                  <span className="whitespace-nowrap">077 789 6891</span>
                </div>
              </div>
            </div>

            {/* Groom's Family */}
            <div className="space-y-3">
              <h4 className="font-serif font-semibold text-sm sm:text-base text-[#D38A99] uppercase tracking-wider pb-1 border-b border-[#D38A99]/10">Groom&apos;s Family</h4>
              <div className="text-sm sm:text-base text-gray-800 space-y-2 font-serif">
                <div className="flex justify-between items-center gap-4">
                  <span className="font-medium text-gray-955">Kaveen:</span>
                  <span className="whitespace-nowrap">077 340 9762</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="font-medium text-gray-955">Geethanie:</span>
                  <span className="whitespace-nowrap">071 808 3732</span>
                </div>
              </div>
            </div>
          </div>
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
        <div className="h-[1px] w-12 bg-[#D38A99] mx-auto" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="overflow-hidden rounded-xl border border-[#E8E4DE] shadow-xs group bg-[#FAFAF8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/ok1.webp" 
              alt="Oshidhie & Kaveen Moment 1" 
              className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E8E4DE] shadow-xs group bg-[#FAFAF8] sm:translate-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/ok2.webp" 
              alt="Oshidhie & Kaveen Moment 2" 
              className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E8E4DE] shadow-xs group bg-[#FAFAF8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/ok3.webp" 
              alt="Oshidhie & Kaveen Moment 3" 
              className="w-full h-full object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 italic pt-6">&quot;Our journey together&quot;</p>
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
            </div>
          </div>

          {weddingDetails.google_maps_url && (
            <a
              href={weddingDetails.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 border border-[#D38A99] hover:bg-[#FAF0F2] text-[#D38A99] rounded py-2.5 px-4 text-center text-xs font-semibold transition-all inline-block"
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
        {/* <p className="text-[8px] text-gray-650">Digital Invite created by Pramuditha Nadun.</p> */}
      </footer>
      </div> 
      </div>
    </div>
  );
}
