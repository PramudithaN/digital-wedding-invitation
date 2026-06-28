'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  User, 
  Calendar, 
  MessageSquare,
  UtensilsCrossed,
  UserPlus,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';

export default function EditGuestPage() {
  const router = useRouter();
  const routerParams = useParams();
  const id = routerParams.id as string;

  const [guest, setGuest] = useState<GuestWithDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [side, setSide] = useState<'bride' | 'groom'>('bride');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [guestRes, catsRes] = await Promise.all([
          fetch(`/api/guests/${id}`),
          fetch('/api/categories')
        ]);

        if (guestRes.status === 404) {
          throw new Error('Guest not found');
        }
        if (!guestRes.ok || !catsRes.ok) {
          throw new Error('Failed to load guest details');
        }

        const guestData: GuestWithDetails = await guestRes.json();
        const catsData = await catsRes.json();

        setGuest(guestData);
        setCategories(catsData);

        // Pre-fill form
        setName(guestData.name);
        setPhone(guestData.phone || '');
        setEmail(guestData.email || '');
        setSide(guestData.side || 'bride');
        setCategoryId(guestData.category_id || '');
        setNotes(guestData.notes || '');
      } catch (err: any) {
        setError(err.message || 'Error loading guest');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      const res = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
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
        throw new Error(errData.error || 'Failed to update guest');
      }

      showToast('Guest dossier updated successfully!', 'success');
      setTimeout(() => {
        router.push('/guests');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Could not update guest');
      showToast(err.message || 'Could not update guest', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this guest record?')) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete guest');
      showToast('Guest record deleted successfully!', 'success');
      setTimeout(() => {
        router.push('/guests');
        router.refresh();
      }, 1550);
    } catch (err: any) {
      setError(err.message || 'Could not delete guest');
      showToast(err.message || 'Could not delete guest', 'error');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm">Loading guest dossier...</p>
      </div>
    );
  }

  if (!guest && error) {
    return (
      <div className="space-y-6">
        <Link href="/guests" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to guest registry
        </Link>
        <div className="bg-red-50 border border-red-100 text-red-655 p-6 rounded-md flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <h2 className="text-sm font-semibold">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <Link href="/guests" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-950 font-semibold uppercase tracking-wider w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Guests
      </Link>

      {/* Title */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-sans tracking-tight font-semibold text-gray-900">Edit Guest Dossier</h1>
        <p className="text-xs text-gray-500 mt-1">Review guest card logs, personal messages, and modify details.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-655 text-xs px-4 py-3 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6 h-fit">
          <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
            <User className="w-4.5 h-4.5 text-gray-400" /> Guest Profile
          </h2>

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="edit-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Full Name *
              </label>
              <input
                id="edit-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="edit-phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Phone Number (WhatsApp)
              </label>
              <input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94771234567"
                className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="edit-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Email Address
              </label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Side */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Wedding Side *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSide('bride')}
                  className={`py-2 px-3 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
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
                  className={`py-2 px-3 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                    side === 'groom'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  Groom's Side
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="edit-cat" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Category Group
              </label>
              <select
                id="edit-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 text-xs rounded-md py-2.5 px-3 focus:outline-none focus:border-blue-500 cursor-pointer"
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
            <div className="md:col-span-2">
              <label htmlFor="edit-notes" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Private Notes
              </label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-md py-2 px-4 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4.5 h-4.5" />
                    Delete Guest
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-md py-2 px-5 text-xs font-semibold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4.5 h-4.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tracking & RSVP Summary Sidebar */}
        <div className="space-y-6">
          {/* Invitation Tracking */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
              <Calendar className="w-4.5 h-4.5 text-gray-400" /> Engagement Details
            </h2>

            <div className="space-y-4 text-xs pt-1">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                  Access Invite URL
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/invite/${guest?.invite_token}`}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-gray-50 border border-gray-250 rounded py-2 px-3 text-[10px] text-blue-605 font-mono focus:outline-none cursor-pointer"
                    title="Click to copy invite link"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inviteUrl = `${window.location.origin}/invite/${guest?.invite_token}`;
                      navigator.clipboard.writeText(inviteUrl);
                      showToast("Invitation URL copied to clipboard!", "success");
                    }}
                    className="bg-blue-50 border border-blue-200 text-blue-600 rounded px-3 py-2 text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center cursor-pointer"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Timestamps */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <span className="text-gray-500">Record Created:</span>
                  <span className="text-gray-900 font-medium font-mono">
                    {guest?.created_at ? new Date(guest.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <span className="text-gray-500">Sent via WhatsApp:</span>
                  {guest?.invite_link?.sent_at ? (
                    <span className="text-blue-600 font-medium">
                      {new Date(guest.invite_link.sent_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-450 italic">Never Sent</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-semibold">Opened Invitation:</span>
                  {guest?.invite_link?.opened_at ? (
                    <span className="text-green-600 font-semibold">
                      {new Date(guest.invite_link.opened_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-450 italic">Never Opened</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RSVP Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-950 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
              <CheckCircle2 className="w-4.5 h-4.5 text-gray-400" /> RSVP Data
            </h2>

            {guest?.rsvp ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status:</span>
                  {guest.rsvp.status === 'attending' ? (
                    <span className="badge badge-attending">Attending</span>
                  ) : (
                    <span className="badge badge-declined">Declined</span>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-3.5 text-xs text-gray-700">
                  {/* Plus One Details */}
                  {guest.rsvp.plus_one && (
                    <div className="flex gap-2 text-gray-600">
                      <UserPlus className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Plus One guest
                        </span>
                        <span className="font-semibold text-gray-900">
                          {guest.rsvp.plus_one_name || 'Yes'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Meal Selection */}
                  {guest.rsvp.meal_choice && (
                    <div className="flex gap-2 text-gray-600">
                      <UtensilsCrossed className="w-4.5 h-4.5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                          Meal Choice
                        </span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {guest.rsvp.meal_choice}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dietary Restrictions */}
                  {guest.rsvp.dietary_notes && (
                    <div className="bg-gray-50 border border-gray-250 p-3 rounded space-y-1">
                      <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        Dietary restrictions
                      </span>
                      <p className="text-gray-700 font-medium">{guest.rsvp.dietary_notes}</p>
                    </div>
                  )}

                  {/* Message from Guest */}
                  {guest.rsvp.message && (
                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded space-y-1">
                      <span className="block text-[10px] text-blue-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Guest Message
                      </span>
                      <p className="text-gray-700 font-medium italic">"{guest.rsvp.message}"</p>
                    </div>
                  )}

                  {/* Response date */}
                  <div className="text-[10px] text-gray-400 text-right pt-2 border-t border-gray-100">
                    Responded:{' '}
                    {guest.rsvp.responded_at
                      ? new Date(guest.rsvp.responded_at).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400 italic">
                No RSVP response recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

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
