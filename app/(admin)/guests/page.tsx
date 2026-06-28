'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Phone, Edit2, Trash2, MessageCircle, Loader2, AlertCircle, X, CheckCircle2, Copy, ExternalLink, Upload } from 'lucide-react';
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

  const getInviteUrl = (guest: GuestWithDetails) => `${globalThis.location?.origin || ''}/invite/${guest.invite_token}`;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestWithDetails | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const [gR, cR] = await Promise.all([fetch('/api/guests'), fetch('/api/categories')]);
      setGuests(await gR.json());
      setCategories(await cR.json());
    } catch (err: any) { setError(err.message || 'An error occurred.'); }
    finally { if (!silent) setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: normalizePhoneNumber(phone.trim()), email: email.trim(), side, category_id: categoryId || null, notes: notes.trim() }),
      });
      await fetchData(true);
      setName(''); setPhone(''); setEmail(''); setSide('bride'); setCategoryId(''); setNotes(''); setIsAddOpen(false);
      showToast('Guest added successfully!', 'success');
    } catch (err: any) { showToast(err.message || 'Could not add', 'error'); }
    finally { setIsSubmitting(false); }
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
          
          let side = 'bride';
          if (rawSide.includes('groom') || rawSide === 'g') side = 'groom';
          
          let matchedCategoryId: string | null = null;
          if (rawCategory) {
            const matchedCat = categories.find(c => c.name.toLowerCase().trim() === rawCategory.toLowerCase().trim());
            if (matchedCat) matchedCategoryId = matchedCat.id;
          }
          
          return {
            name: rawName.trim(),
            phone: rawPhone ? normalizePhoneNumber(rawPhone.trim()) : '',
            email: rawEmail.trim(),
            side,
            category_id: matchedCategoryId,
            notes: rawNotes.trim()
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
          <Button variant="outlined" component="label" startIcon={<Upload size={16} />} sx={{ whiteSpace: 'nowrap' }}>
            Upload CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} hidden />
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
                  <TableCell>Category</TableCell>
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
                      {g.category ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: g.category.colour }} />
                          <Typography variant="caption">{g.category.name}</Typography>
                        </Box>
                      ) : <Typography variant="caption" color="text.disabled">–</Typography>}
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
                              {sendingId === g.id ? <CircularProgress size={14} /> : <MessageCircle size={16} />}
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
                        {g.category && (
                          <Chip size="small" label={g.category.name} sx={{ height: 18, fontSize: '0.65rem',
                            bgcolor: g.category.colour + '22', color: g.category.colour }} />
                        )}
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
                          startIcon={sendingId === g.id ? <CircularProgress size={16} /> : <MessageCircle size={16} />} 
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
                  { label: 'Category', value: selectedGuest.category?.name || '–' },
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
          <TextField label="Private Notes" value={notes} onChange={e => setNotes(e.target.value)} size="small" fullWidth multiline rows={3} />
          <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
            <Button variant="outlined" fullWidth onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Save Guest'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Toast */}
      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ zIndex: 9999 }}>
        <Alert severity={toast?.type || 'success'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
