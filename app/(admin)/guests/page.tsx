'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Edit2, 
  Trash2, 
  MessageCircle, 
  Loader2, 
  Check, 
  AlertCircle, 
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | 'bride' | 'groom'>('all');
  const [catFilter, setCatFilter] = useState('all');

  // Add Guest Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [side, setSide] = useState<'bride' | 'groom'>('bride');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Actions loading state
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [guestsRes, catsRes] = await Promise.all([
        fetch('/api/guests'),
        fetch('/api/categories')
      ]);

      if (!guestsRes.ok || !catsRes.ok) {
        throw new Error('Failed to load data');
      }

      const guestsData = await guestsRes.json();
      const catsData = await catsRes.json();

      setGuests(guestsData);
      setCategories(catsData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading guests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          side,
          category_id: categoryId || null,
          notes: notes.trim()
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add guest');
      }

      // Refresh list
      await fetchData();
      
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setSide('bride');
      setCategoryId('');
      setNotes('');
      setIsAddOpen(false);
    } catch (err: any) {
      setError(err.message || 'Could not add guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete guest');
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      setError(err.message || 'Could not delete guest');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendWhatsApp = async (guest: GuestWithDetails) => {
    try {
      setSendingId(guest.id);
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: guest.id,
          method: 'manual'
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate link');
      }

      const data = await res.json();
      
      // Open the WhatsApp deep link in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      // Refresh to update invitation sent status in UI
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error generating link');
    } finally {
      setSendingId(null);
    }
  };

  // Filter and search logic
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(search.toLowerCase()) || 
                          (guest.notes && guest.notes.toLowerCase().includes(search.toLowerCase())) ||
                          (guest.phone && guest.phone.includes(search)) ||
                          (guest.email && guest.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesSide = sideFilter === 'all' || guest.side === sideFilter;
    const matchesCat = catFilter === 'all' || guest.category_id === catFilter;

    return matchesSearch && matchesSide && matchesCat;
  });

  // Helper to render invitation status
  const renderStatusBadge = (guest: GuestWithDetails) => {
    const rsvpStatus = guest.rsvp?.status;
    const openedAt = guest.invite_link?.opened_at;
    const sentAt = guest.invite_link?.sent_at;

    if (rsvpStatus === 'attending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-900/50">
          <CheckCircle2 className="w-3.5 h-3.5" /> Attending
        </span>
      );
    }
    if (rsvpStatus === 'declined') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-400 border border-rose-900/50">
          <XCircle className="w-3.5 h-3.5" /> Declined
        </span>
      );
    }
    if (openedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950/60 text-sky-400 border border-sky-900/50">
          <Eye className="w-3.5 h-3.5" /> Opened
        </span>
      );
    }
    if (sentAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
          <Check className="w-3.5 h-3.5" /> Sent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800">
        <HelpCircle className="w-3.5 h-3.5" /> Pending
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in relative min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-wide font-semibold text-slate-100">Guests Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track invited guests, wedding side representation, RSVP states, and send invites.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-5 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Guest
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/50 text-rose-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, notes, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto gap-4 items-center justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          {/* Side filter */}
          <select
            value={sideFilter}
            onChange={(e: any) => setSideFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Sides</option>
            <option value="bride">Bride's Side</option>
            <option value="groom">Groom's Side</option>
          </select>

          {/* Category filter */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Table (Desktop) / Cards (Mobile) */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-2">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-sm">Loading guest registry...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No guests found matching the selected filters.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Guest Name</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Side</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Contact</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Invite Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{guest.name}</div>
                      {guest.notes && (
                        <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={guest.notes}>
                          {guest.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                        guest.side === 'bride' 
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-900/30' 
                          : 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/30'
                      }`}>
                        {guest.side}
                      </span>
                    </td>
                    <td className="p-4">
                      {guest.category ? (
                        <span 
                          style={{ borderColor: guest.category.colour + '30', color: guest.category.colour }}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border"
                        >
                          <span 
                            style={{ backgroundColor: guest.category.colour }} 
                            className="w-1.5 h-1.5 rounded-full" 
                          />
                          {guest.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-650 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 space-y-1">
                      {guest.phone ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-350">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{guest.phone}</span>
                        </div>
                      ) : null}
                      {guest.email ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-355">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{guest.email}</span>
                        </div>
                      ) : null}
                      {!guest.phone && !guest.email ? (
                        <span className="text-slate-650 text-xs">—</span>
                      ) : null}
                    </td>
                    <td className="p-4">{renderStatusBadge(guest)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {guest.phone && (
                          <button
                            onClick={() => handleSendWhatsApp(guest)}
                            disabled={sendingId !== null}
                            className="p-2 text-indigo-400 hover:bg-indigo-950/30 hover:text-indigo-350 rounded-lg transition-all cursor-pointer"
                            title="Send Invite via WhatsApp"
                          >
                            {sendingId === guest.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <Link
                          href={`/guests/${guest.id}`}
                          className="p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-all"
                          title="Edit Guest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          disabled={deletingId !== null}
                          className="p-2 text-slate-500 hover:bg-rose-950/20 hover:text-rose-455 rounded-lg transition-all cursor-pointer"
                          title="Delete Guest"
                        >
                          {deletingId === guest.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredGuests.map((guest) => (
              <div 
                key={guest.id} 
                className="bg-slate-900/60 border border-slate-850 rounded-xl p-5 space-y-4 shadow-lg hover:border-slate-800 transition-colors"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-200">{guest.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        guest.side === 'bride' 
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-900/30' 
                          : 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/30'
                      }`}>
                        {guest.side}
                      </span>
                      {guest.category && (
                        <span 
                          style={{ borderColor: guest.category.colour + '30', color: guest.category.colour }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border"
                        >
                          {guest.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>{renderStatusBadge(guest)}</div>
                </div>

                {/* Contacts & Notes */}
                {(guest.phone || guest.email || guest.notes) && (
                  <div className="space-y-2 border-t border-slate-850 pt-3">
                    {guest.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                    {guest.email && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{guest.email}</span>
                      </div>
                    )}
                    {guest.notes && (
                      <p className="text-xs text-slate-500 bg-slate-950/50 p-2.5 rounded-lg border border-slate-850">
                        {guest.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Mobile Actions */}
                <div className="flex justify-end gap-2 border-t border-slate-850 pt-3">
                  {guest.phone && (
                    <button
                      onClick={() => handleSendWhatsApp(guest)}
                      disabled={sendingId !== null}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-indigo-600/90 rounded-lg hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {sendingId === guest.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          Send Invite
                        </>
                      )}
                    </button>
                  )}
                  <Link
                    href={`/guests/${guest.id}`}
                    className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center border border-slate-800"
                    title="Edit Guest"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    disabled={deletingId !== null}
                    className="p-2 text-slate-500 hover:bg-rose-955/20 hover:text-rose-400 rounded-lg transition-colors flex items-center justify-center border border-slate-800 cursor-pointer"
                    title="Delete Guest"
                  >
                    {deletingId === guest.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Guest Slide-over Drawer / Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-slide-in">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h2 className="text-xl font-serif text-slate-100 font-medium">Add New Guest</h2>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddGuest} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="guest-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Guest Name *
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Karunaratne"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="guest-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    id="guest-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +94771234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Needed for automated or manual WhatsApp sending.</p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="guest-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Email Address
                  </label>
                  <input
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Side representation */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Wedding Side *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSide('bride')}
                      className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        side === 'bride'
                          ? 'bg-rose-950/20 text-rose-300 border-rose-500/70 shadow-lg shadow-rose-900/5'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Bride's Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('groom')}
                      className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        side === 'groom'
                          ? 'bg-indigo-950/20 text-indigo-300 border-indigo-500/70 shadow-lg shadow-indigo-900/5'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Groom's Side
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="guest-cat" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Category Group
                  </label>
                  <select
                    id="guest-cat"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="guest-notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Private Notes
                  </label>
                  <textarea
                    id="guest-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Vegetarian, needs wheelchair accessibility, seating preference..."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-800 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="w-1/2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded-xl py-3 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="w-1/2 bg-gradient-to-r from-indigo-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 text-white rounded-xl py-3 text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Save Guest'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
