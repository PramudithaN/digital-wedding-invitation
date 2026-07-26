'use client';

import React, { useState, useEffect } from 'react';
import Lightbox from '@/components/Lightbox';
import { 
  Settings, 
  Save, 
  Loader2, 
  AlertCircle, 
  Check, 
  Heart,
  MapPin,
  Calendar,
  Gift,
  X,
  Image as ImageIcon,
  Trash2,
  Upload,
  Menu
} from 'lucide-react';

function formatHumanDate(dateStr: string): string {
  if (!dateStr) return '';
  const dateObj = new Date(dateStr + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return dateObj.toLocaleDateString('en-US', options);
}

function formatHumanTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutesStr} ${ampm}`;
}

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
  
  // Picker specific state
  const [pickerDate, setPickerDate] = useState('');
  const [pickerTime, setPickerTime] = useState('');
  
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [registryUrl, setRegistryUrl] = useState('');

  // Gallery states
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string }[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Advanced user-friendly gallery states
  interface UploadingItem {
    id: string;
    previewUrl: string;
  }
  const [uploadQueue, setUploadQueue] = useState<UploadingItem[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsGalleryLoading(true);
        const res = await fetch('/api/gallery');
        if (!res.ok) throw new Error('Failed to load gallery images');
        const data = await res.json();
        setGalleryImages(data);
      } catch (err: any) {
        console.error('Error fetching gallery:', err);
      } finally {
        setIsGalleryLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleImageDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleImageDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedImages = [...galleryImages];
    const [draggedItem] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(targetIndex, 0, draggedItem);

    // Optimistic UI update
    setGalleryImages(updatedImages);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const orderedIds = updatedImages.map(img => img.id);
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) {
        throw new Error('Failed to update gallery image order');
      }
      showToast('Gallery order updated successfully', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update order', 'error');
      
      // Revert on error
      const fetchRes = await fetch('/api/gallery');
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setGalleryImages(data);
      }
    }
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const uploadFilesList = async (filesArray: File[]) => {
    try {
      setIsUploading(true);
      setError('');

      // Create preview items
      const newUploads: UploadingItem[] = [];
      for (const file of filesArray) {
        const id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const previewUrl = URL.createObjectURL(file);
        newUploads.push({ id, previewUrl });
      }

      setUploadQueue((prev) => [...prev, ...newUploads]);

      // Upload files sequentially
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const tempItem = newUploads[i];
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/gallery', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to upload image');
          }

          const newImage = await res.json();
          setGalleryImages((prev) => [...prev, newImage]);
        } catch (uploadErr: any) {
          console.error(uploadErr);
          showToast(`Failed to upload ${file.name}: ${uploadErr.message}`, 'error');
        } finally {
          // Remove from upload queue and revoke object URL
          URL.revokeObjectURL(tempItem.previewUrl);
          setUploadQueue((prev) => prev.filter((item) => item.id !== tempItem.id));
        }
      }

      showToast('Images processed!', 'success');
    } catch (err: any) {
      setError(err.message || 'Could not upload image.');
      showToast(err.message || 'Could not upload image.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFilesList(Array.from(files));
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        showToast('Please drop image files only.', 'error');
        return;
      }
      await uploadFilesList(imageFiles);
    }
  };

  const handleDeleteImage = async (id: string, url: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(id)}&url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete image');
      }

      setGalleryImages((prev) => prev.filter((img) => img.id !== id));
      showToast('Image removed successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not delete image.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (pickerDate) {
      setDate(formatHumanDate(pickerDate));
    }
    if (pickerTime) {
      setTime(formatHumanTime(pickerTime));
    }
    if (pickerDate && pickerTime) {
      setIsoDate(`${pickerDate}T${pickerTime}:00`);
    }
  }, [pickerDate, pickerTime]);

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

        // Pre-fill date and time pickers from iso_date
        if (data.iso_date) {
          const parts = data.iso_date.split('T');
          if (parts.length === 2) {
            setPickerDate(parts[0]);
            setPickerTime(parts[1].substring(0, 5));
          }
        }
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
    <>
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


      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
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
                  Wedding Date
                </label>
                <input
                  id="set-date"
                  type="date"
                  required
                  value={pickerDate}
                  onChange={(e) => setPickerDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="set-time" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Ceremony Time
                </label>
                <input
                  id="set-time"
                  type="time"
                  required
                  value={pickerTime}
                  onChange={(e) => setPickerTime(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="set-iso" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  ISO Timestamp (For Countdown)
                </label>
                <input
                  id="set-iso"
                  type="text"
                  readOnly
                  value={isoDate}
                  className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-xs font-mono text-gray-500 focus:outline-none cursor-default select-none"
                />
                <p className="text-[9px] text-gray-400 mt-1">Automatically computed from the date and time selected above.</p>
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
              <div className="relative">
                <input
                  id="set-maps"
                  type="text"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-white border border-gray-250 rounded-md py-2 pl-3 pr-8 text-xs font-mono text-blue-600 focus:outline-none focus:border-blue-500"
                />
                {googleMapsUrl && (
                  <button
                    type="button"
                    onClick={() => setGoogleMapsUrl('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Clear field"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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
              <div className="relative">
                <input
                  id="set-registry"
                  type="text"
                  value={registryUrl}
                  onChange={(e) => setRegistryUrl(e.target.value)}
                  placeholder="https://weddingregistry.com/..."
                  className="w-full bg-white border border-gray-250 rounded-md py-2 pl-3 pr-8 text-xs font-mono text-blue-600 focus:outline-none focus:border-blue-500"
                />
                {registryUrl && (
                  <button
                    type="button"
                    onClick={() => setRegistryUrl('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Clear field"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* Moments Gallery Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6 font-sans">
        <div>
          <h2 className="text-sm font-semibold text-gray-955 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4.5 h-4.5 text-gray-400" /> Moments Gallery
          </h2>
          <p className="text-[10px] text-gray-400 mt-1">
            Upload and manage pre-wedding photos shown on the guest invitation page.
          </p>
        </div>

        {/* Dropzone / Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
          }`}
        >
          <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} transition-colors`}>
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-800">
              Drag & drop your moments here, or{' '}
              <label className="text-blue-500 hover:text-blue-600 cursor-pointer font-bold underline">
                browse files
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isUploading || isGalleryLoading}
                  onChange={handleUpload}
                />
              </label>
            </p>
            <p className="text-[10px] text-gray-500">
              Supports JPG, PNG, WEBP. You can upload multiple files at once.
            </p>
          </div>
          {isUploading && (
            <div className="text-[10px] text-blue-500 font-semibold flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Uploading photos...
            </div>
          )}
        </div>

        {/* Gallery Content */}
        {isGalleryLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-1.5">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-[11px]">Loading gallery images...</p>
          </div>
        ) : galleryImages.length === 0 && uploadQueue.length === 0 ? (
          <div className="border border-dashed border-gray-200 bg-gray-50/30 rounded-lg p-8 text-center space-y-4">
            <div className="text-gray-350 flex justify-center">
              <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-800">No custom moments uploaded yet</p>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto">
                The invitation page is currently displaying the default 3 wedding photos.
              </p>
            </div>
            {/* Default Images Preview */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto pt-1">
              {['/ok1.webp', '/ok2.webp', '/ok3.webp'].map((url, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setLightboxIndex(idx)}
                  className="relative aspect-[3/4] rounded-md overflow-hidden border border-gray-200 bg-white cursor-pointer opacity-70 hover:opacity-100 hover:scale-[1.03] transition-all duration-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Default ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-gray-950/60 text-[7px] text-white px-1 py-0.5 rounded">Default</span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[7px] uppercase tracking-wider text-white bg-black/40 px-1 py-0.5 rounded font-semibold">View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-450">
                  Uploaded Photos ({galleryImages.length})
                </span>
                <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full select-none border border-blue-100">
                  💡 Click & hold or drag handles to reorder images
                </span>
              </div>
              {uploadQueue.length > 0 && (
                <span className="text-[10px] text-blue-600 font-semibold animate-pulse">
                  Uploading {uploadQueue.length} file(s)...
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {/* Actual Uploaded Images */}
              {galleryImages.map((img, idx) => {
                const isConfirming = confirmDeleteId === img.id;
                return (
                  <div 
                    key={img.id} 
                    draggable={!isConfirming && !isUploading}
                    onDragStart={(e) => handleImageDragStart(e, idx)}
                    onDragOver={(e) => handleImageDragOver(e, idx)}
                    onDragLeave={handleImageDragLeave}
                    onDrop={(e) => handleImageDrop(e, idx)}
                    onDragEnd={handleImageDragEnd}
                    className={`relative aspect-[3/4] rounded-lg overflow-hidden border bg-gray-50 shadow-xs group transition-all duration-200 ${
                      draggedIndex === idx 
                        ? 'opacity-40 border-dashed border-blue-400 scale-95' 
                        : dragOverIndex === idx 
                          ? 'border-solid border-blue-500 scale-[1.03] shadow-md z-30' 
                          : 'border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {/* Clickable Image Area */}
                    <div 
                      onClick={() => setLightboxIndex(idx)}
                      className="w-full h-full cursor-zoom-in relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt="Wedding Moment"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* View overlay */}
                      <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="text-[9px] uppercase tracking-wider text-white bg-black/55 px-2 py-1 rounded-md backdrop-blur-xs font-semibold">View</span>
                      </div>
                    </div>

                    {/* Top-Left Drag Grip Handle */}
                    {!isConfirming && (
                      <div className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing">
                        <div 
                          className="p-1.5 bg-white/95 text-gray-450 hover:text-gray-700 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 border border-gray-150 flex items-center justify-center"
                          title="Drag to reorder"
                        >
                          <Menu className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                    
                    {/* Top-Right Delete Trigger Button (Always visible / easy touch target) */}
                    {!isConfirming && (
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(img.id)}
                          className="p-1.5 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 cursor-pointer border border-gray-150"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Inline Delete Confirmation Overlay */}
                    {isConfirming && (
                      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center text-white z-20 animate-fade-in">
                        <p className="text-[10px] font-semibold tracking-wide uppercase text-red-200">Delete?</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            disabled={deletingId === img.id}
                            onClick={() => {
                              handleDeleteImage(img.id, img.url);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold tracking-wider uppercase active:scale-95 transition-all cursor-pointer shadow-xs"
                          >
                            {deletingId === img.id ? '...' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === img.id}
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 bg-white/20 hover:bg-white/35 text-white rounded text-[10px] font-bold tracking-wider uppercase active:scale-95 transition-all cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Uploading Skeleton Items (Immediate visual feedback) */}
              {uploadQueue.map((item) => (
                <div key={item.id} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-blue-200 bg-gray-50 shadow-xs animate-pulse">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt="Uploading..."
                    className="w-full h-full object-cover opacity-60 blur-xs"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/20 text-white gap-2 z-10">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span className="text-[9px] font-bold tracking-wider uppercase bg-blue-500/80 px-1.5 py-0.5 rounded shadow-xs">
                      Uploading
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          form="settings-form"
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
              Save
            </>
          )}
        </button>
      </div>
    </div>
    {toast && (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[90%] sm:w-auto max-w-sm animate-fade-in select-none">
        <div className={`flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-755 border-red-200'
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

    {/* Photo Lightbox */}
    <Lightbox
      images={galleryImages.length > 0 ? galleryImages.map(img => img.url) : ['/ok1.webp', '/ok2.webp', '/ok3.webp']}
      initialIndex={lightboxIndex !== null ? lightboxIndex : 0}
      isOpen={lightboxIndex !== null}
      onClose={() => setLightboxIndex(null)}
    />
    </>
  );
}
