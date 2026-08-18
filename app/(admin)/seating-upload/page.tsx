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
  X,
  ArrowUp
} from 'lucide-react';
import { GuestWithDetails } from '@/lib/types';

// MUI Imports to match Guest List style exactly
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';

function StatusChip({ guest }: { guest: GuestWithDetails }) {
  const status = guest.rsvp?.status;
  if (status === 'attending') return <Chip label="Attending" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }} />;
  if (status === 'declined')  return <Chip label="Declined"  size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.7rem' }} />;
  if (guest.invite_link?.opened_at) return <Chip label="Opened" size="small" sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700, fontSize: '0.7rem' }} />;
  if (guest.invite_link?.sent_at)   return <Chip label="Sent"   size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.7rem' }} />;
  return <Chip label="Pending" size="small" sx={{ bgcolor: '#F9FAFB', color: '#6B7280', fontWeight: 700, fontSize: '0.7rem' }} />;
}

function SideChip({ side }: { side: string }) {
  return (
    <Chip
      label={side}
      size="small"
      sx={{
        bgcolor: side === 'bride' ? '#FAF5FF' : '#EFF6FF',
        color:   side === 'bride' ? '#9333EA'  : '#2563EB',
        fontWeight: 700, fontSize: '0.7rem',
      }}
    />
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

  // Collapsible state for uploader
  const [showUploader, setShowUploader] = useState(false);

  // Seating grid states
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [isGridLoading, setIsGridLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sideFilter, setSideFilter] = useState('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Additional feature states
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  // Listen to window scroll position to toggle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (globalThis.window?.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    globalThis.window?.addEventListener('scroll', handleScroll);
    return () => globalThis.window?.removeEventListener('scroll', handleScroll);
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
      setToast({ message: 'Table assignment updated successfully!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Error saving table number: ' + err.message, type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const handleResetSeating = async () => {
    try {
      setIsResetting(true);
      const res = await fetch('/api/guests/upload-csv', {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to reset seating assignments');
      }
      
      const data = await res.json();
      setGuests(prev => prev.map(g => ({ ...g, table_no: '' })));
      setToast({ message: `Successfully cleared all ${data.resetCount} table assignments!`, type: 'success' });
      setIsResetDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Error resetting seating: ' + err.message, type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDownloadSeating = () => {
    const headers = ['Guest ID', 'Guest Name', 'Side', 'RSVP Status', 'Table No'];
    const rows = guests
      .filter(g => g.rsvp?.status === 'attending') // only confirmed attendees
      .map(g => [
        g.id,
        g.name,
        g.side || 'bride',
        g.rsvp?.status || 'pending',
        g.table_no || ''
      ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'wedding_seating_assignments.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      
      {/* Toast Notification */}
      <Snackbar 
        open={toast !== null} 
        autoHideDuration={2500} 
        onClose={() => setToast(null)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
        sx={{ zIndex: 9999 }}
      >
        <Alert severity={toast?.type || 'success'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-start', pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Seating Assignment Center</Typography>
          <Typography variant="caption" color="text.secondary">
            Upload guest seating spreadsheets or edit assignments directly in the table below.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowUploader(!showUploader)}
            startIcon={<Upload size={16} />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {showUploader ? 'Hide Uploader' : 'Upload CSV'}
          </Button>
          <Button 
            variant="contained" 
            component={Link} 
            href="/find-table" 
            target="_blank"
            startIcon={<ExternalLink size={16} />}
            sx={{ whiteSpace: 'nowrap', color: '#FFFFFF' }}
          >
            Seating Lookup View
          </Button>
        </Box>
      </Box>

      {/* Collapsible Uploader Area */}
      {showUploader && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left Column Area: Dropzone, Results */}
          <div className="lg:col-span-2 space-y-6">
            
            {error && (
              <Alert severity="error" icon={<AlertCircle size={16} />}>{error}</Alert>
            )}

            {successResult && (
              <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs p-5 rounded-lg space-y-3 relative">
                <button 
                  onClick={() => setSuccessResult(null)}
                  className="absolute top-3 right-3 text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
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
                    <p className="text-[9px] italic text-amber-700">
                      💡 Unmatched guests might have spelling discrepancies. Make sure the 'Guest ID' column is preserved.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CSV Dropzone */}
            <Paper elevation={1} sx={{ p: 3, spaceY: 3 }}>
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
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Drag & drop your edited CSV here, or{' '}
                    <label className="text-blue-500 hover:text-blue-650 cursor-pointer font-bold underline">
                      browse files
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        disabled={isUploading}
                        onChange={handleFileChange}
                      />
                    </label>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="block max-w-sm mx-auto">
                    Only `.csv` spreadsheets are supported. Ensure a column named `Table No` exists.
                  </Typography>
                </div>

                {file && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-xs text-gray-700 font-medium font-mono max-w-xs truncate">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                )}
              </div>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : <Upload size={16} />}
                  sx={{ 
                    color: '#FFFFFF', 
                    '&.Mui-disabled': { 
                      color: 'rgba(0, 0, 0, 0.38) !important', 
                      backgroundColor: '#E2E8F0 !important',
                      pointerEvents: 'auto !important',
                      cursor: 'not-allowed !important'
                    } 
                  }}
                >
                  {isUploading ? 'Uploading...' : 'Upload Seating Assignments'}
                </Button>
              </Box>
            </Paper>

          </div>

          {/* Right Column: Information Card */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              h: 'fit-content', 
              bgcolor: '#EFF6FF', 
              border: '1px solid', 
              borderColor: '#BFDBFE', 
              borderRadius: 2,
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1E40AF' }}>
              <HelpCircle size={20} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                How to manage table assignments
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#1E3A8A', lineHeight: 1.5 }}>
              To assign tables, you can type assignments directly into the guest rows below. Your changes will be saved in real-time as soon as you press Enter or click outside the text box. Alternatively, you can upload a CSV spreadsheet using the uploader card. Uploading a CSV will only update table numbers for the guests listed in the file, leaving other guest records unchanged.
            </Typography>
          </Paper>

        </div>
      )}

      {/* Guest Seating Grid */}
      <Paper elevation={1}>
        
        {/* Table Header & Controls */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Guest Seating Grid ({filteredGuests.length} guests)
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDownloadSeating}
              startIcon={<Download size={14} />}
              sx={{ py: 0.5, fontSize: '0.7rem', height: 26 }}
            >
              Export Seating
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setIsResetDialogOpen(true)}
              startIcon={<X size={14} />}
              sx={{ py: 0.5, fontSize: '0.7rem', height: 26 }}
            >
              Reset Seating
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} className="text-gray-400" />
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ width: 180, '& .MuiOutlinedInput-root': { fontSize: '0.75rem' } }}
            />

            {/* Side filter */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="side-filter-label">Side</InputLabel>
              <Select
                labelId="side-filter-label"
                value={sideFilter}
                label="Side"
                onChange={(e) => setSideFilter(e.target.value)}
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="all">All Sides</MenuItem>
                <MenuItem value="bride">Bride Side</MenuItem>
                <MenuItem value="groom">Groom Side</MenuItem>
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel id="status-filter-label">RSVP Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="RSVP Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="all">All RSVPs</MenuItem>
                <MenuItem value="attending">Attending</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Seating Table */}
        <TableContainer>
          {isGridLoading ? (
            <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={30} />
              <Typography variant="body2" color="text.secondary">Fetching seating database...</Typography>
            </Box>
          ) : filteredGuests.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No guests found matching the selected filters.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Guest Name</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell>RSVP Status</TableCell>
                  <TableCell>Assigned Table No</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{guest.name}</Typography>
                    </TableCell>
                    <TableCell><SideChip side={guest.side || 'bride'} /></TableCell>
                    <TableCell><StatusChip guest={guest} /></TableCell>
                    <TableCell sx={{ minWidth: 180, maxWidth: 220 }}>
                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="e.g. Table 3 (tap to edit)"
                          defaultValue={guest.table_no || ''}
                          disabled={savingId === guest.id}
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
                          slotProps={{
                            input: {
                              endAdornment: savingId === guest.id ? (
                                <InputAdornment position="end">
                                  <CircularProgress size={14} />
                                </InputAdornment>
                              ) : null
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.8rem',
                              bgcolor: 'background.paper',
                            }
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

      </Paper>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onClose={() => !isResetting && setIsResetDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertCircle color="#DC2626" size={24} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Reset Seating?</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to clear table numbers for all guests? This action is permanent and will remove all table numbers from the public seating lookup page.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isResetting}
              sx={{ textTransform: 'none', color: '#6B7280', borderColor: '#E5E7EB', '&:hover': { borderColor: '#D1D5DB' } }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleResetSeating}
              disabled={isResetting}
              sx={{ textTransform: 'none', fontWeight: 700 }}
              startIcon={isResetting ? <CircularProgress size={16} color="inherit" /> : <X size={16} />}
            >
              {isResetting ? 'Clearing...' : 'Clear Seating'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <IconButton
          onClick={() => globalThis.window?.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: 3,
            zIndex: 1000,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            width: 44,
            height: 44,
          }}
        >
          <ArrowUp size={20} />
        </IconButton>
      )}

    </Box>
  );
}
