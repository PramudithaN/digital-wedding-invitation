'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Loader2, 
  AlertCircle, 
  Check, 
  Heart,
  MapPin,
  Calendar,
  Gift
} from 'lucide-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [brideName, setBrideName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isoDate, setIsoDate] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [registryUrl, setRegistryUrl] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to load settings');
        const data = await res.json();
        
        setBrideName(data.bride_name);
        setGroomName(data.groom_name);
        setDate(data.date);
        setTime(data.time);
        setIsoDate(data.iso_date);
        setVenue(data.venue);
        setCity(data.city);
        setAddress(data.address);
        setGoogleMapsUrl(data.google_maps_url || '');
        setRegistryUrl(data.registry_url || '');
      } catch (err: any) {
        setError(err.message || 'Error loading configurations.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess(false);

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride_name: brideName.trim(),
          groom_name: groomName.trim(),
          date: date.trim(),
          time: time.trim(),
          iso_date: isoDate.trim(),
          venue: venue.trim(),
          city: city.trim(),
          address: address.trim(),
          google_maps_url: googleMapsUrl.trim(),
          registry_url: registryUrl.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Could not save configurations.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm">Retrieving wedding parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif tracking-wide font-semibold text-slate-100 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-400" /> Wedding Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure names, dates, maps location, and other public invitation details displayed to guests.
        </p>
      </div>

      {error && (
        <div className="bg-rose-955/40 border border-rose-900/50 text-rose-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-350 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0 text-emerald-450 animate-bounce" />
          <span>Wedding settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Group 1: Couple Names */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-serif text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Heart className="w-5 h-5 text-rose-455 fill-rose-500/10" /> Couple Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="set-bride" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Bride's First Name
                </label>
                <input
                  id="set-bride"
                  type="text"
                  required
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="e.g. Aria"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="set-groom" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Groom's First Name
                </label>
                <input
                  id="set-groom"
                  type="text"
                  required
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="e.g. Ethan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Card Group 2: Date & Time */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-serif text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-indigo-400" /> Event Schedule
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="set-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Wedding Date (Human Readable)
                </label>
                <input
                  id="set-date"
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Saturday, September 19, 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="set-time" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Ceremony Time
                </label>
                <input
                  id="set-time"
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 4:00 PM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="set-iso" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  ISO Date (For Live Countdown)
                </label>
                <input
                  id="set-iso"
                  type="text"
                  required
                  value={isoDate}
                  onChange={(e) => setIsoDate(e.target.value)}
                  placeholder="2026-09-19T16:00:00"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs font-mono text-indigo-400 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Must follow `YYYY-MM-DDTHH:MM:SS` standard syntax.</p>
              </div>
            </div>
          </div>

          {/* Card Group 3: Location & Registry */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-serif text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <MapPin className="w-5 h-5 text-indigo-400" /> Location & Registry
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="set-venue" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Venue Name
                </label>
                <input
                  id="set-venue"
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. The Grand Pavilion"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="set-city" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  City, Country
                </label>
                <input
                  id="set-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Colombo, Sri Lanka"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="set-address" className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                  Street Address
                </label>
                <input
                  id="set-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Galle Road, Colombo 03"
                  className="w-full bg-slate-950 border border-slate-805 rounded-xl py-3 px-4 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom panel: External Integrations */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-md font-serif text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" /> Navigation URL
            </h3>
            <div>
              <label htmlFor="set-maps" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Google Maps Embed / Navigation URL
              </label>
              <input
                id="set-maps"
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs font-mono text-indigo-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-serif text-slate-200 flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose-400" /> Registry URL
            </h3>
            <div>
              <label htmlFor="set-registry" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Wedding Registry Link
              </label>
              <input
                id="set-registry"
                type="url"
                value={registryUrl}
                onChange={(e) => setRegistryUrl(e.target.value)}
                placeholder="https://weddingregistry.com/..."
                className="w-full bg-slate-950 border border-slate-855 rounded-xl py-3 px-4 text-xs font-mono text-indigo-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Form Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 text-white rounded-xl py-3.5 px-8 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Wedding Configurations
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
