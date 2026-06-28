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
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

      showToast('Settings updated successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Could not save configurations.');
      showToast(err.message || 'Could not save configurations.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Retrieving wedding parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-405" /> Wedding Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure names, dates, maps location, and other public invitation details displayed to guests.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {toast && (
        <div className="fixed top-5 right-5 z-55 animate-fade-in select-none">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-750 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Group 1: Couple Names */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
              <Heart className="w-4.5 h-4.5 text-gray-400" /> Couple Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="set-bride" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Bride's First Name
                </label>
                <input
                  id="set-bride"
                  type="text"
                  required
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="e.g. Aria"
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="set-groom" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Groom's First Name
                </label>
                <input
                  id="set-groom"
                  type="text"
                  required
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="e.g. Ethan"
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card Group 2: Date & Time */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
              <Calendar className="w-4.5 h-4.5 text-gray-400" /> Event Schedule
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="set-date" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Wedding Date (Human Readable)
                </label>
                <input
                  id="set-date"
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Saturday, September 19, 2026"
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="set-time" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Ceremony Time
                </label>
                <input
                  id="set-time"
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 4:00 PM"
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="set-iso" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  ISO Timestamp (For Countdown)
                </label>
                <input
                  id="set-iso"
                  type="text"
                  required
                  value={isoDate}
                  onChange={(e) => setIsoDate(e.target.value)}
                  placeholder="2026-09-19T16:00:00"
                  className="w-full bg-white border border-gray-250 rounded-md py-2 px-3 text-xs font-mono text-blue-600 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[9px] text-gray-400 mt-1">Must follow `YYYY-MM-DDTHH:MM:SS` standard format.</p>
              </div>
            </div>
          </div>

          {/* Card Group 3: Location */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
              <MapPin className="w-4.5 h-4.5 text-gray-400" /> Location Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="set-venue" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Venue Name
                </label>
                <input
                  id="set-venue"
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. The Grand Pavilion"
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="set-city" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  City, Country
                </label>
                <input
                  id="set-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Colombo, Sri Lanka"
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="set-address" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Street Address
                </label>
                <input
                  id="set-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Galle Road, Colombo 03"
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom panel: External Integrations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" /> Navigation Link
            </h3>
            <div>
              <label htmlFor="set-maps" className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Google Maps Navigation URL
              </label>
              <input
                id="set-maps"
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full bg-white border border-gray-250 rounded-md py-2 px-3 text-xs font-mono text-blue-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-gray-400" /> Gift Registry
            </h3>
            <div>
              <label htmlFor="set-registry" className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Registry Link URL
              </label>
              <input
                id="set-registry"
                type="url"
                value={registryUrl}
                onChange={(e) => setRegistryUrl(e.target.value)}
                placeholder="https://weddingregistry.com/..."
                className="w-full bg-white border border-gray-250 rounded-md py-2 px-3 text-xs font-mono text-blue-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Form Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2.5 px-6 text-xs font-semibold tracking-wide shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Configurations
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
