'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  ExternalLink,
  Download,
  Search,
  Check,
  X
} from 'lucide-react';
import { GuestWithDetails } from '@/lib/types';

function SideBadge({ side }: { side?: string }) {
  if (side === 'bride') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
        Bride
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
      Groom
    </span>
  );
}

function RSVPBadge({ guest }: { guest: GuestWithDetails }) {
  const status = guest.rsvp?.status;
  if (status === 'attending') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wide">
        Attending
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase tracking-wide">
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-150 uppercase tracking-wide">
      Pending
    </span>
  );
}

export default function SeatingUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<{
    updatedCount: number;
    totalRowsProcessed: number;
    totalErrors: number;
    errors: string[] | null;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Seating grid states
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sideFilter, setSideFilter] = useState('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchGuests = async (silent = false) => {
    try {
      if (!silent) setIsGridLoading(true);
      const res = await fetch('/api/guests');
      if (res.ok) {
        const data = await res.json();
        setGuests(data);
      }
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      if (!silent) setIsGridLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleTableNoChange = async (guestId: string, value: string) => {
    try {
      setSavingId(guestId);
      const res = await fetch(`/api/guests/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_no: value })
      });
      if (!res.ok) {
        throw new Error('Failed to update table number');
      }
      
      // Update local state
      setGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_no: value } : g));
      
      // Show toast confirmation
      setToast('Table assignment updated');
      setTimeout(() => setToast(null), 2500);
    } catch (err: any) {
      console.error(err);
      alert('Error saving table number: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        setSuccessResult(null);
      } else {
        setError('Please upload a .csv file only.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        setSuccessResult(null);
      } else {
        setError('Please select a .csv file only.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');
      setSuccessResult(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/guests/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload and parse seating CSV.');
      }

      setSuccessResult(data);
      setFile(null); // Reset file input
      fetchGuests(true); // Reload the guest list to show new seating assignments
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Filter logic
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSide = sideFilter === 'all' || guest.side === sideFilter;
    const rsvpStatus = guest.rsvp?.status || 'pending';
    const matchesStatus = statusFilter === 'all' || rsvpStatus === statusFilter;
    
    return matchesSearch && matchesSide && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-fade-in select-none">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg shadow-lg text-xs font-semibold border border-gray-800">
            <Check className="w-4 h-4 text-green-400" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" /> Seating Assignment Center
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload guest seating spreadsheets or edit assignments directly in the table below.
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/rsvp" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:border-gray-400 bg-white text-xs font-semibold text-gray-700 rounded-md transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download RSVPs
          </Link>
          <Link 
            href="/find-table" 
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white rounded-md transition-colors shadow-xs"
          >
            Seating Lookup View
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Area: Dropzone, Results */}
        <div className="lg:col-span-2 space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-150 text-red-705 text-xs px-4 py-3.5 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs p-5 rounded-lg space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="font-bold text-sm">Seating updated successfully!</span>
              </div>
              <div className="grid grid-cols-3 gap-4 py-2 border-y border-emerald-150/50 text-center font-medium">
                <div>
                  <span className="block text-xl font-bold text-emerald-700">{successResult.updatedCount}</span>
                  <span className="text-[10px] text-emerald-605 uppercase tracking-wide">Guests Updated</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-emerald-700">{successResult.totalRowsProcessed}</span>
                  <span className="text-[10px] text-emerald-605 uppercase tracking-wide">Processed Rows</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-emerald-700">{successResult.totalErrors}</span>
                  <span className="text-[10px] text-emerald-605 uppercase tracking-wide">Unmatched Rows</span>
                </div>
              </div>
              
              {successResult.totalErrors > 0 && successResult.errors && (
                <div className="pt-2 space-y-1.5 text-amber-800">
                  <p className="font-semibold text-[11px] uppercase tracking-wider">Unmatched Row Warnings (Top 10 shown):</p>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] bg-white/40 p-2.5 rounded-md">
                    {successResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  <p className="text-[9px] italic text-amber-750">
                    💡 Unmatched guests might have spelling discrepancies. Make sure the 'Guest ID' column is preserved.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CSV Dropzone */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'
              }`}
            >
              <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} transition-colors`}>
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-800">
                  Drag & drop your edited CSV here, or{' '}
                  <label className="text-blue-500 hover:text-blue-600 cursor-pointer font-bold underline">
                    browse files
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleFileChange}
                    />
                  </label>
                </p>
                <p className="text-[10px] text-gray-500 max-w-sm mx-auto">
                  Only `.csv` spreadsheets are supported. Ensure a column named `Table No` exists.
                </p>
              </div>

              {file && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-700 font-medium font-mono max-w-xs truncate">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-150 pt-4">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-450 disabled:cursor-not-allowed text-white rounded-md py-2 px-5 text-xs font-semibold tracking-wide shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Seating Assignments
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Instructions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-150 pb-3">
            <HelpCircle className="w-4 h-4 text-gray-400" /> Seating Notes
          </h2>
          
          <div className="space-y-3.5 text-xs leading-relaxed text-gray-600">
            <p>
              Assignments made in the table below are **saved instantly** to the database and will reflect immediately on the public search view.
            </p>
            <p>
              If you upload a new CSV, the system will update table numbers for matching guests. **Existing seating assignments for other guests will not be removed** unless you explicitly clear them or upload an empty value.
            </p>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-[10px] text-blue-800 leading-normal">
              💡 **Quick Edit Tip**: You can type in the table numbers below, press **Enter** or click away (Blur) to save. Leave the input blank to clear/unassign a table number.
            </div>
          </div>
        </div>

      </div>

      {/* Guest Seating Grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Filters */}
        <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Guest Seating Grid ({filteredGuests.length} guests)
          </h3>
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search guest name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-44 bg-white border border-gray-205 rounded-md text-xs focus:outline-none focus:border-blue-500 text-gray-800 font-medium"
              />
            </div>

            {/* Side filter */}
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="py-1.5 px-2 bg-white border border-gray-205 rounded-md text-xs focus:outline-none text-gray-800 font-medium cursor-pointer"
            >
              <option value="all">All Sides</option>
              <option value="bride">Bride Side</option>
              <option value="groom">Groom Side</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2 bg-white border border-gray-205 rounded-md text-xs focus:outline-none text-gray-800 font-medium cursor-pointer"
            >
              <option value="all">All RSVPs</option>
              <option value="attending">Attending</option>
              <option value="declined">Declined</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Seating Table */}
        <div className="overflow-x-auto">
          {isGridLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-xs">Fetching seating database...</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="py-16 text-center text-gray-450 text-xs">
              No guests found matching the selected filters.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50/30 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">Guest Name</th>
                  <th scope="col" className="px-6 py-3">Side</th>
                  <th scope="col" className="px-6 py-3">RSVP Status</th>
                  <th scope="col" className="px-6 py-3">Assigned Table No</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-150 text-xs text-gray-700">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-gray-900">{guest.name}</td>
                    <td className="px-6 py-3.5"><SideBadge side={guest.side} /></td>
                    <td className="px-6 py-3.5"><RSVPBadge guest={guest} /></td>
                    <td className="px-6 py-3.5 max-w-[180px]">
                      <div className="relative flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={guest.table_no || ''}
                          placeholder="e.g. Table 3 (tap to edit)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (val !== (guest.table_no || '')) {
                              handleTableNoChange(guest.id, val);
                            }
                          }}
                          disabled={savingId === guest.id}
                          className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 rounded-md py-1.5 px-2.5 text-xs text-gray-800 focus:outline-none transition-colors"
                        />
                        {savingId === guest.id && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
