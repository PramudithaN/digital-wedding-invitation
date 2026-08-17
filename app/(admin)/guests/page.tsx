'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Phone, Edit2, Trash2, MessageCircle, Loader2, AlertCircle, X, CheckCircle2, Copy, ExternalLink, Upload, Download } from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';
import { normalizePhoneNumber } from '@/lib/whatsapp';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Drawer from '@mui/material/Drawer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

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

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  
  const parsedRows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values: string[] = [];
    let currentVal = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    parsedRows.push(row);
  }
  return parsedRows;
}

const WhatsappIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <img
    src="/newwhatsapp-svgrepo-com.svg"
    alt="WhatsApp"
    width={size}
    height={size}
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  />
);

const WhatsappWhiteIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <img
    src="/whatsapp-svgrepo-com.svg"
    alt="WhatsApp"
    width={size}
    height={size}
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  />
);

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

  const getInviteUrl = (guest: GuestWithDetails) => `${process.env.NEXT_PUBLIC_HOSTED_URL || globalThis.location?.origin || ''}/invite/${guest.invite_token}`;
  const openInviteLink = (g: GuestWithDetails) => globalThis.open(getInviteUrl(g), '_blank', 'noopener,noreferrer');
  const handleCopyLink = (g: GuestWithDetails) => {
    navigator.clipboard.writeText(getInviteUrl(g));
    showToast(`${g.name}'s invite link copied!`, 'success');
  };

  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [side, setSide] = useState<'bride' | 'groom'>('bride');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestWithDetails | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bulk sending states
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFilter, setBulkFilter] = useState<'pending' | 'all'>('pending');
  const [bulkMethod, setBulkMethod] = useState<'manual' | 'twilio' | 'automated'>('automated');
  const [isBulkWizardOpen, setIsBulkWizardOpen] = useState(false);
  const [bulkList, setBulkList] = useState<GuestWithDetails[]>([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [isBulkSendingTwilio, setIsBulkSendingTwilio] = useState(false);

  // Automated WhatsApp states
  const [isAutomatedWizardOpen, setIsAutomatedWizardOpen] = useState(false);
  const [autoStatus, setAutoStatus] = useState<any>({ state: 'idle' });

  // Poll automated status
  useEffect(() => {
    let intervalId: any = null;
    if (isAutomatedWizardOpen) {
      const fetchStatus = async () => {
        try {
          const res = await fetch('/api/whatsapp/status');
          const data = await res.json();
          setAutoStatus(data);
          
          if (data.state === 'completed') {
            await fetchData(true);
          }
        } catch (err) {
          console.error('Error fetching automated status:', err);
        }
      };
      
      fetchStatus();
      intervalId = setInterval(fetchStatus, 1500);
    } else {
      setAutoStatus({ state: 'idle' });
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutomatedWizardOpen]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [gR, cR] = await Promise.all([fetch('/api/guests'), fetch('/api/categories')]);
      setGuests(await gR.json());
      setCategories(await cR.json());
    } catch (err: any) { setError(err.message || 'An error occurred.'); }
    finally { if (!silent) setIsLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000); // Polling every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: normalizePhoneNumber(phone.trim()), email: email.trim(), side, category_id: categoryId || null, notes: notes.trim(), plus_one: guestCount }),
      });
      await fetchData(true);
      setName(''); setPhone(''); setEmail(''); setSide('bride'); setCategoryId(''); setNotes(''); setGuestCount(1); setIsAddOpen(false);
      showToast('Guest added successfully!', 'success');
    } catch (err: any) { showToast(err.message || 'Could not add', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDownloadTemplate = () => {
    const headers = ['Name', 'Phone', 'Email', 'Side', 'Count', 'Notes'];
    const sampleRows = [
      ['Sarah Karunaratne', '+94771234567', 'sarah@example.com', 'bride', '2', "Bride's sister"],
      ['James Wijesinghe', '+94777654321', 'james@example.com', 'groom', '1', "Groom's roommate"]
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'wedding_guests_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const rows = parseCSV(text);
        if (rows.length === 0) throw new Error('No data found in file');
        
        const guestsToUpload = rows.map(row => {
          const getVal = (keys: string[]) => {
            const matchedKey = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
            return matchedKey ? row[matchedKey] : '';
          };
          
          const rawName = getVal(['name', 'guest name', 'guest']);
          const rawPhone = getVal(['phone', 'phone number', 'mobile', 'contact']);
          const rawEmail = getVal(['email', 'email address']);
          const rawSide = getVal(['side', 'wedding side', 'bride/groom']).toLowerCase();
          const rawCategory = getVal(['category', 'group']);
          const rawNotes = getVal(['notes', 'note', 'private notes']);
          const rawCount = getVal(['count', 'guest count', 'size', 'plus_one', 'plus one']);
          
          let side = 'bride';
          if (rawSide.includes('groom') || rawSide === 'g') side = 'groom';
          
          let matchedCategoryId: string | null = null;
          if (rawCategory) {
            const matchedCat = categories.find(c => c.name.toLowerCase().trim() === rawCategory.toLowerCase().trim());
            if (matchedCat) matchedCategoryId = matchedCat.id;
          }

          let parsedCount = parseInt(rawCount.replace(/[^\d]/g, ''), 10);
          if (isNaN(parsedCount)) {
            parsedCount = (rawCount.toLowerCase() === 'true' || rawCount.toLowerCase() === 'yes') ? 2 : 1;
          }
          
          return {
            name: rawName.trim(),
            phone: rawPhone ? normalizePhoneNumber(rawPhone.trim()) : '',
            email: rawEmail.trim(),
            side,
            category_id: matchedCategoryId,
            notes: rawNotes.trim(),
            plus_one: parsedCount
          };
        }).filter(g => g.name);
        
        if (guestsToUpload.length === 0) {
          throw new Error('Could not find any guest rows with valid names. Make sure your CSV has a "Name" header.');
        }
        
        setIsSubmitting(true);
        const res = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guestsToUpload)
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to upload guests');
        }
        
        await fetchData(true);
        showToast(`Successfully uploaded ${guestsToUpload.length} guests!`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Error parsing CSV file', 'error');
      } finally {
        setIsSubmitting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      setGuests(p => p.filter(g => g.id !== id));
      showToast('Guest deleted.', 'success');
    } catch (err: any) { showToast(err.message || 'Could not delete', 'error'); }
    finally { setDeletingId(null); }
  };

  const handleSendWhatsApp = async (guest: GuestWithDetails) => {
    try {
      setSendingId(guest.id);
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guest.id, method: 'manual' }),
      });
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
      await fetchData();
      showToast('WhatsApp link generated!', 'success');
    } catch (err: any) { showToast(err.message || 'Error', 'error'); }
    finally { setSendingId(null); }
  };

  const handleStartBulk = async () => {
    const targets = guests.filter(g => {
      if (!g.phone) return false;
      if (bulkFilter === 'pending') {
        return !g.rsvp?.status || g.rsvp.status === 'pending';
      }
      return true;
    });

    if (targets.length === 0) {
      showToast('No eligible guests found with phone numbers.', 'error');
      return;
    }

    setBulkList(targets);
    setBulkIndex(0);
    setIsBulkOpen(false);

    if (bulkMethod === 'twilio') {
      setIsBulkSendingTwilio(true);
      try {
        const res = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestIds: targets.map(t => t.id), method: 'twilio' }),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Successfully sent ${targets.length} invites via Twilio!`, 'success');
          await fetchData(true);
        } else {
          showToast(data.error || 'Failed to send bulk invites', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Error sending bulk invites', 'error');
      } finally {
        setIsBulkSendingTwilio(false);
      }
    } else if (bulkMethod === 'automated') {
      setIsAutomatedWizardOpen(true);
      try {
        await fetch('/api/whatsapp/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        showToast(err.message || 'Failed to start WhatsApp connection.', 'error');
      }
    } else {
      setIsBulkWizardOpen(true);
    }
  };

  const handleStartAutoSending = async () => {
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: bulkFilter }),
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to start automated sending.', 'error');
    }
  };

  const handleDisconnectAuto = async () => {
    try {
      await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });
      setIsAutomatedWizardOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect.', 'error');
    }
  };

  const handleManualSendNext = async (skip = false) => {
    const currentGuest = bulkList[bulkIndex];
    if (!currentGuest) return;

    if (!skip) {
      try {
        const res = await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId: currentGuest.id, method: 'manual' }),
        });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, '_blank');
        }
      } catch (err) {
        console.error('Error sending manual invite link:', err);
      }
    }

    if (bulkIndex < bulkList.length - 1) {
      setBulkIndex(prev => prev + 1);
    } else {
      setIsBulkWizardOpen(false);
      showToast('Bulk manual sending completed!', 'success');
      await fetchData(true);
    }
  };

  const filtered = guests.filter(g => {
    const s = search.toLowerCase();
    return (
      (g.name.toLowerCase().includes(s) || (g.phone && g.phone.includes(s)) || (g.email && g.email.toLowerCase().includes(s))) &&
      (sideFilter === 'all' || g.side === sideFilter) &&
      (catFilter === 'all' || g.category_id === catFilter)
    );
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-start', pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Guests</Typography>
          <Typography variant="caption" color="text.secondary">Track invited guests, RSVP states and send invitations.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleDownloadTemplate} startIcon={<Download size={16} />} sx={{ whiteSpace: 'nowrap' }}>
            Download Template
          </Button>
          <Button variant="outlined" component="label" startIcon={<Upload size={16} />} sx={{ whiteSpace: 'nowrap' }}>
            Upload CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} hidden />
          </Button>
          <Button variant="contained" color="success" startIcon={<WhatsappWhiteIcon />} onClick={() => setIsBulkOpen(true)} sx={{ whiteSpace: 'nowrap', bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}>
            Bulk Invite
          </Button>
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setIsAddOpen(true)} sx={{ whiteSpace: 'nowrap' }}>
            Add Guest
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              size="small" fullWidth placeholder="Search guests..." value={search}
              onChange={e => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Side</InputLabel>
              <Select value={sideFilter} label="Side" onChange={e => setSideFilter(e.target.value)}>
                <MenuItem value="all">All Sides</MenuItem>
                <MenuItem value="bride">Bride&apos;s Side</MenuItem>
                <MenuItem value="groom">Groom&apos;s Side</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={catFilter} label="Category" onChange={e => setCatFilter(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress /><Typography variant="body2" color="text.secondary">Loading guests...</Typography>
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3 }}>
          <Typography variant="body2" color="text.secondary">No guests found.</Typography>
        </Box>
      ) : (
        <>
          {/* Desktop Table */}
          <TableContainer component={Paper} elevation={1} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Guest Name</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell>Count</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(g => (
                  <TableRow key={g.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedGuest(g)}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{g.name}</Typography>
                      {g.notes && <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220, display: 'block' }}>{g.notes}</Typography>}
                    </TableCell>
                    <TableCell><SideChip side={g.side || 'bride'} /></TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {g.rsvp?.status === 'attending' 
                          ? `${g.rsvp.attending_count ?? g.rsvp.plus_one} / ${g.rsvp.plus_one}` 
                          : g.rsvp?.status === 'declined' 
                            ? `0 / ${g.rsvp.plus_one}` 
                            : `– / ${g.rsvp?.plus_one || 1}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                        {g.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone size={12} style={{ color: '#9CA3AF' }} /><Typography variant="caption">{g.phone}</Typography></Box>}
                        {g.email && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Mail size={12} style={{ color: '#9CA3AF' }} /><Typography variant="caption">{g.email}</Typography></Box>}
                      </Box>
                    </TableCell>
                    <TableCell><StatusChip guest={g} /></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }} onClick={e => e.stopPropagation()}>
                        {g.phone && (
                          <Tooltip title="Send WhatsApp">
                            <IconButton size="small" color="primary" disabled={sendingId !== null} onClick={() => handleSendWhatsApp(g)}>
                              {sendingId === g.id ? <CircularProgress size={14} /> : <WhatsappIcon size={16} />}
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Copy Link"><IconButton size="small" onClick={() => handleCopyLink(g)}><Copy size={16} /></IconButton></Tooltip>
                        <Tooltip title="Open Invite"><IconButton size="small" color="success" onClick={() => openInviteLink(g)}><ExternalLink size={16} /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" component={Link} href={`/guests/${g.id}`}><Edit2 size={16} /></IconButton></Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" disabled={deletingId !== null} onClick={() => handleDeleteGuest(g.id)}>
                            {deletingId === g.id ? <CircularProgress size={14} /> : <Trash2 size={16} />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Cards */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
            {filtered.map(g => (
              <Card 
                key={g.id} 
                elevation={1} 
                onClick={() => setSelectedGuest(g)} 
                sx={{ 
                  cursor: 'pointer',
                  borderTop: (g.side || 'bride') === 'groom' ? '4px solid #2563EB' : '4px solid #9333EA'
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{g.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <SideChip side={g.side || 'bride'} />
                        <Chip 
                          size="small" 
                          label={`Attending: ${
                            g.rsvp?.status === 'attending' 
                              ? `${g.rsvp.attending_count ?? g.rsvp.plus_one} / ${g.rsvp.plus_one}` 
                              : g.rsvp?.status === 'declined' 
                                ? `0 / ${g.rsvp.plus_one}` 
                                : `– / ${g.rsvp?.plus_one || 1}`
                          }`} 
                          sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600 }} 
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={e => e.stopPropagation()}>
                      <StatusChip guest={g} />
                      <IconButton size="small" color="success" onClick={() => openInviteLink(g)} sx={{ bgcolor: 'rgba(22,163,74,0.06)', width: 28, height: 28 }}>
                        <ExternalLink size={14} />
                      </IconButton>
                    </Box>
                  </Box>
                  {(g.phone || g.email) && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 1 }}>
                      {g.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone size={12} style={{ color: '#9CA3AF' }} /><Typography variant="caption">{g.phone}</Typography></Box>}
                      {g.email && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Mail size={12} style={{ color: '#9CA3AF' }} /><Typography variant="caption">{g.email}</Typography></Box>}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }} onClick={e => e.stopPropagation()}>
                    <IconButton size="medium" color="error" onClick={() => handleDeleteGuest(g.id)} disabled={deletingId !== null} sx={{ bgcolor: 'rgba(220,38,38,0.06)', width: 40, height: 40 }}>
                      {deletingId === g.id ? <CircularProgress size={18} /> : <Trash2 size={18} />}
                    </IconButton>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        component={Link} 
                        href={`/guests/${g.id}`} 
                        variant="outlined" 
                        color="inherit" 
                        startIcon={<Edit2 size={16} />} 
                        sx={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          textTransform: 'none', 
                          px: 1.5, 
                          height: 40, 
                          borderRadius: 10,
                          borderColor: 'rgba(0,0,0,0.12)',
                          bgcolor: 'rgba(0,0,0,0.02)'
                        }}
                      >
                        Edit
                      </Button>
                      {g.phone && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary" 
                          onClick={() => handleSendWhatsApp(g)} 
                          disabled={sendingId !== null} 
                          startIcon={sendingId === g.id ? <CircularProgress size={16} /> : <WhatsappIcon size={16} />} 
                          sx={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            textTransform: 'none', 
                            px: 1.5, 
                            height: 40, 
                            borderRadius: 10,
                            bgcolor: 'rgba(37,99,235,0.04)',
                            borderColor: 'rgba(37,99,235,0.2)'
                          }}
                        >
                          WhatsApp
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Guest Detail Dialog */}
      <Dialog open={selectedGuest !== null} onClose={() => setSelectedGuest(null)} maxWidth="sm" fullWidth>
        {selectedGuest && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedGuest.name}</Typography>
                <Typography variant="caption" color="text.secondary">Guest details</Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedGuest(null)}><X size={18} /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[
                  { label: 'Side', value: selectedGuest.side },
                  { 
                    label: 'Count (Attending / Confirmed)', 
                    value: selectedGuest.rsvp?.status === 'attending' 
                      ? `${selectedGuest.rsvp.attending_count ?? selectedGuest.rsvp.plus_one} / ${selectedGuest.rsvp.plus_one}` 
                      : selectedGuest.rsvp?.status === 'declined' 
                        ? `0 / ${selectedGuest.rsvp.plus_one}` 
                        : `– / ${selectedGuest.rsvp?.plus_one || 1}` 
                  },
                  { label: 'Phone', value: selectedGuest.phone || '–' },
                  { label: 'Email', value: selectedGuest.email || '–' },
                ].map(({ label, value }) => (
                  <Grid size={{ xs: 6 }} key={label}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {selectedGuest.notes && (
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.06em' }}>Notes</Typography>
                  <Typography variant="body2">{selectedGuest.notes}</Typography>
                </Paper>
              )}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" color="success" startIcon={<ExternalLink size={14} />} onClick={() => openInviteLink(selectedGuest)}>Open Invite</Button>
                <Button size="small" variant="outlined" startIcon={<Copy size={14} />} onClick={() => handleCopyLink(selectedGuest)}>Copy Link</Button>
                <Button size="small" variant="contained" startIcon={<Edit2 size={14} />} component={Link} href={`/guests/${selectedGuest.id}`}>Edit Guest</Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Add Guest Drawer */}
      <Drawer anchor="right" open={isAddOpen} onClose={() => setIsAddOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, background: '#FFFFFF', color: '#0F172A' } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Add New Guest</Typography>
          <IconButton size="small" onClick={() => setIsAddOpen(false)}><X size={18} /></IconButton>
        </Box>
        <Box component="form" onSubmit={handleAddGuest} sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField label="Guest Name *" value={name} onChange={e => setName(e.target.value)} size="small" fullWidth required />
          <TextField label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} size="small" fullWidth type="tel" helperText="Local numbers saved with +94 automatically." />
          <TextField label="Email Address" value={email} onChange={e => setEmail(e.target.value)} size="small" fullWidth type="email" />
          <Box>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', fontWeight: 700 }}>Wedding Side *</Typography>
            <ToggleButtonGroup value={side} exclusive onChange={(_, v) => v && setSide(v)} fullWidth size="small">
              <ToggleButton value="bride" sx={{ '&.Mui-selected': { bgcolor: '#FAF5FF', color: '#9333EA', borderColor: '#D8B4FE' } }}>Bride&apos;s Side</ToggleButton>
              <ToggleButton value="groom" sx={{ '&.Mui-selected': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' } }}>Groom&apos;s Side</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={categoryId} label="Category" onChange={e => setCategoryId(e.target.value)}>
              <MenuItem value="">No Category</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            label="Guest Count *"
            type="number"
            value={guestCount}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              setGuestCount(isNaN(val) ? 1 : Math.max(1, val));
            }}
            slotProps={{ htmlInput: { min: 1 } }}
            size="small"
            fullWidth
            required
          />
          <TextField label="Private Notes" value={notes} onChange={e => setNotes(e.target.value)} size="small" fullWidth multiline rows={3} />
          <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
            <Button variant="outlined" fullWidth onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Save Guest'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Bulk Send Selection Dialog */}
      <Dialog open={isBulkOpen} onClose={() => setIsBulkOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsappIcon size={20} className="text-[#16A34A]" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Send Bulk Invites</Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsBulkOpen(false)}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Target Guests</InputLabel>
            <Select value={bulkFilter} label="Target Guests" onChange={e => setBulkFilter(e.target.value as any)}>
              <MenuItem value="pending">Only Pending RSVP Guests</MenuItem>
              <MenuItem value="all">All Guests (with Phone Number)</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small" disabled>
            <InputLabel>Sending Method</InputLabel>
            <Select value={bulkMethod} label="Sending Method" onChange={e => setBulkMethod(e.target.value as any)}>
              <MenuItem value="automated">Automated (Scan QR Code - Free)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
            <Button variant="outlined" fullWidth onClick={() => setIsBulkOpen(false)}>Cancel</Button>
            <Button variant="contained" color="success" fullWidth onClick={handleStartBulk} sx={{ bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}>
              Start Sending
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Bulk Twilio sending loading overlay */}
      <Dialog open={isBulkSendingTwilio} keepMounted={false}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
          <CircularProgress size={40} color="success" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Sending invitations in background...</Typography>
          <Typography variant="caption" color="text.secondary">Please do not close this window.</Typography>
        </DialogContent>
      </Dialog>

      {/* Bulk Manual Sending Wizard Dialog */}
      <Dialog open={isBulkWizardOpen} keepMounted={false}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsappIcon size={20} className="text-[#16A34A]" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>WhatsApp Wizard</Typography>
          </Box>
          <Typography variant="caption" sx={{ bgcolor: '#F3F4F6', px: 1.5, py: 0.5, borderRadius: 10, fontWeight: 700 }}>
            {bulkIndex + 1} / {bulkList.length}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ minWidth: 320, py: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inviting Guest</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: '#111827' }}>
              {bulkList[bulkIndex]?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Phone: {bulkList[bulkIndex]?.phone}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth 
              startIcon={<WhatsappWhiteIcon size={18} />}
              onClick={() => handleManualSendNext(false)}
              sx={{ py: 1.2, fontWeight: 700, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
            >
              Open Chat & Next
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => handleManualSendNext(true)}
                sx={{ textTransform: 'none', color: '#6B7280', borderColor: '#E5E7EB', '&:hover': { borderColor: '#D1D5DB' } }}
              >
                Skip / Next
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setIsBulkWizardOpen(false)}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Automated WhatsApp Sender Wizard Dialog */}
      <Dialog open={isAutomatedWizardOpen} keepMounted={false} onClose={handleDisconnectAuto} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatsappIcon size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Local Auto Sender</Typography>
          </Box>
          <IconButton size="small" onClick={handleDisconnectAuto}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, minHeight: 320 }}>
          {autoStatus.state === 'idle' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4, textAlign: 'center' }}>
              <CircularProgress size={40} color="success" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Connecting to WhatsApp Gateway...</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280 }}>
                Please wait while your free Render server wakes up from sleep. This can take up to a minute on the first load.
              </Typography>
              <Button 
                variant="outlined" 
                color="success" 
                size="small" 
                onClick={() => {
                  fetch('/api/whatsapp/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                }}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Force Reconnect
              </Button>
            </Box>
          )}

          {autoStatus.state === 'initializing' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4, textAlign: 'center' }}>
              <CircularProgress size={40} color="success" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Starting WhatsApp Engine...</Typography>
              <Typography variant="caption" color="text.secondary">This may take up to a minute to launch the local browser instance.</Typography>
            </Box>
          )}

          {autoStatus.state === 'qr' && autoStatus.qrCode && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>Scan QR Code with WhatsApp</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280 }}>
                Go to WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device on your phone and scan the code below.
              </Typography>
              <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white', display: 'inline-block', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={autoStatus.qrCode} alt="WhatsApp QR Code" width={220} height={220} style={{ display: 'block' }} />
              </Box>
            </Box>
          )}

          {autoStatus.state === 'ready' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 2, bgcolor: '#F0FDF4', color: '#16A34A', borderRadius: '50%' }}>
                <CheckCircle2 size={40} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803D' }}>Connected Successfully!</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 260 }}>
                WhatsApp is linked. Ready to send invitations to {bulkList.length} guests.
              </Typography>
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleStartAutoSending} 
                sx={{ mt: 1, px: 4, py: 1.2, fontWeight: 700, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
                fullWidth
              >
                Start Automated Sending
              </Button>
            </Box>
          )}

          {autoStatus.state === 'sending' && autoStatus.progress && (
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, py: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={32} color="success" sx={{ mb: 1.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sending invitation</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: '#111827' }}>
                  {autoStatus.progress.currentGuestName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Guest {autoStatus.progress.current} of {autoStatus.progress.total}
                </Typography>
              </Box>
              
              <Box sx={{ width: '100%', mt: 1 }}>
                <Box sx={{ height: 8, width: '100%', bgcolor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      height: '100%', 
                      bgcolor: '#16A34A', 
                      borderRadius: 4, 
                      width: `${(autoStatus.progress.current / autoStatus.progress.total) * 100}%`,
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </Box>
              </Box>
            </Box>
          )}

          {autoStatus.state === 'completed' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 2, bgcolor: '#F0FDF4', color: '#16A34A', borderRadius: '50%' }}>
                <CheckCircle2 size={40} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803D' }}>Bulk Sending Completed!</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 260 }}>
                All wedding invitations have been successfully sent automatically to the guest list.
              </Typography>
              <Button variant="outlined" fullWidth onClick={() => setIsAutomatedWizardOpen(false)} sx={{ mt: 2 }}>
                Close Panel
              </Button>
            </Box>
          )}

          {autoStatus.state === 'error' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 2, bgcolor: '#FEF2F2', color: '#DC2626', borderRadius: '50%' }}>
                <AlertCircle size={40} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#DC2626' }}>Engine Error</Typography>
              <Typography variant="caption" color="error" sx={{ maxWidth: 280, wordBreak: 'break-word' }}>
                {autoStatus.error || 'An unexpected error occurred.'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                  fetch('/api/whatsapp/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                }} 
                sx={{ mt: 1 }}
                fullWidth
              >
                Retry Connection
              </Button>
            </Box>
          )}

          {autoStatus.state !== 'sending' && autoStatus.state !== 'completed' && (
            <Button variant="text" size="small" color="error" onClick={handleDisconnectAuto} sx={{ textTransform: 'none', mt: 1 }}>
              Disconnect & Stop Session
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ zIndex: 9999 }}>
        <Alert severity={toast?.type || 'success'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
