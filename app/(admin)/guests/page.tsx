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
  AlertCircle, 
  X,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyLink = (guest: GuestWithDetails) => {
    const inviteUrl = `${window.location.origin}/invite/${guest.invite_token}`;
    navigator.clipboard.writeText(inviteUrl);
    showToast(`${guest.name}'s invite link copied!`, 'success');
  };

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

      await fetchData();
      showToast(`${name.trim()} added successfully!`, 'success');
      
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
      showToast(err.message || 'Could not add guest', 'error');
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
      showToast('Guest record deleted successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Could not delete guest');
      showToast(err.message || 'Could not delete guest', 'error');
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
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      await fetchData();
      showToast('WhatsApp link generated successfully!', 'success');
    } catch (err: any) {
      alert(err.message || 'Error generating link');
      showToast(err.message || 'Error generating link', 'error');
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
      return <span className="badge badge-attending">Attending</span>;
    }
    if (rsvpStatus === 'declined') {
      return <span className="badge badge-declined">Declined</span>;
    }
    if (openedAt) {
      return <span className="badge badge-pending">Opened</span>;
    }
    if (sentAt) {
      return <span className="badge badge-groom">Sent</span>;
    }
    return <span className="badge border-gray-200 text-gray-500 bg-gray-50">Pending</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900">Guests</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track invited guests, wedding side representation, RSVP states, and send invites.
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-md py-2.5 px-4 text-xs font-semibold tracking-wide shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4.5 h-4.5" /> Add Guest
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-md py-2 pl-9 pr-4 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap w-full md:w-auto gap-4 items-center justify-end">
          {/* Side filter */}
          <select
            value={sideFilter}
            onChange={(e: any) => setSideFilter(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-xs rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="all">All Sides</option>
            <option value="bride">Bride's Side</option>
            <option value="groom">Groom's Side</option>
          </select>

          {/* Category filter */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-xs rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
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
        <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm">Loading guest registry...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="py-20 text-center text-gray-450 text-xs border border-dashed border-gray-200 rounded bg-white">
          No guests found matching search criteria.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 h-10">
                  <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Guest Name</th>
                  <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Side</th>
                  <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Category</th>
                  <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Contact</th>
                  <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Invite Status</th>
                  <th className="px-6 text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors duration-150 group h-14">
                    <td className="px-6">
                      <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                      {guest.notes && (
                        <div className="text-[10px] text-gray-400 mt-0.5 max-w-[220px] truncate" title={guest.notes}>
                          {guest.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6">
                      <span className={`badge ${guest.side === 'bride' ? 'badge-bride' : 'badge-groom'}`}>
                        {guest.side}
                      </span>
                    </td>
                    <td className="px-6">
                      {guest.category ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span 
                            style={{ backgroundColor: guest.category.colour }} 
                            className="w-2 h-2 rounded-full shrink-0" 
                          />
                          {guest.category.name}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 space-y-0.5">
                      {guest.phone ? (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{guest.phone}</span>
                        </div>
                      ) : null}
                      {guest.email ? (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{guest.email}</span>
                        </div>
                      ) : null}
                      {!guest.phone && !guest.email ? (
                        <span className="text-gray-300 text-xs">—</span>
                      ) : null}
                    </td>
                    <td className="px-6">{renderStatusBadge(guest)}</td>
                    <td className="px-6 text-right">
                      {/* Show actions cleanly */}
                      <div className="flex items-center justify-end gap-1">
                        {guest.phone && (
                          <button
                            onClick={() => handleSendWhatsApp(guest)}
                            disabled={sendingId !== null}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                            title="Send Invite via WhatsApp"
                          >
                            {sendingId === guest.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyLink(guest)}
                          className="p-1.5 text-gray-550 hover:bg-gray-100 hover:text-gray-905 rounded-md transition-all cursor-pointer"
                          title="Copy Invitation Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/guests/${guest.id}`}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-all"
                          title="Edit Guest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          disabled={deletingId !== null}
                          className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-all cursor-pointer"
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
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {filteredGuests.map((guest) => (
              <div 
                key={guest.id} 
                className="bg-white border border-gray-200 rounded-md p-4 space-y-3 shadow-sm hover:border-gray-350 transition-colors"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{guest.name}</h3>
                    <div className="flex gap-2 mt-1.5">
                      <span className={`badge ${guest.side === 'bride' ? 'badge-bride' : 'badge-groom'}`}>
                        {guest.side}
                      </span>
                      {guest.category && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-550">
                          <span style={{ backgroundColor: guest.category.colour }} className="w-1.5 h-1.5 rounded-full" />
                          <span>{guest.category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>{renderStatusBadge(guest)}</div>
                </div>

                {/* Contacts & Notes */}
                {(guest.phone || guest.email || guest.notes) && (
                  <div className="space-y-1.5 border-t border-gray-100 pt-2 text-[11px] text-gray-550">
                    {guest.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{guest.phone}</span>
                      </div>
                    )}
                    {guest.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{guest.email}</span>
                      </div>
                    )}
                    {guest.notes && (
                      <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1 border border-gray-150">
                        {guest.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Mobile Actions */}
                <div className="flex justify-end gap-4 border-t border-gray-100 pt-2 text-xs font-semibold">
                  {guest.phone && (
                    <button
                      onClick={() => handleSendWhatsApp(guest)}
                      disabled={sendingId !== null}
                      className="text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                    >
                      {sendingId === guest.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="w-3.5 h-3.5" />
                          Send WhatsApp
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyLink(guest)}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    Copy
                  </button>
                  <Link
                    href={`/guests/${guest.id}`}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteGuest(guest.id)}
                    disabled={deletingId !== null}
                    className="text-gray-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    {deletingId === guest.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </>
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
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-gray-200 text-gray-900 flex flex-col h-full shadow-lg animate-slide-in">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Add New Guest</h2>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddGuest} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="guest-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Guest Name *
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Karunaratne"
                    className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="guest-phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Phone (with Country Code)
                  </label>
                  <input
                    id="guest-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +94771234567"
                    className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Needed for manual wa.me links or automated Twilio messages.</p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="guest-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="guest-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah@example.com"
                    className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Side */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Wedding Side *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSide('bride')}
                      className={`py-2.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                        side === 'bride'
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      Bride's Side
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('groom')}
                      className={`py-2.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                        side === 'groom'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-white border-gray-200 text-gray-500'
                      }`}
                    >
                      Groom's Side
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="guest-cat" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Category Group
                  </label>
                  <select
                    id="guest-cat"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 cursor-pointer"
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
                  <label htmlFor="guest-notes" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Private Notes
                  </label>
                  <textarea
                    id="guest-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Seating preferences, restrictions, relationships..."
                    rows={4}
                    className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="w-1/2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-550 rounded-md py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2.5 text-xs font-semibold tracking-wide shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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

      {toast && (
        <div className="fixed top-5 right-5 z-55 animate-fade-in select-none">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-755 border-red-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
