'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Phone, Edit2, Trash2, MessageCircle, Loader2, AlertCircle, X, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [gR, cR] = await Promise.all([fetch('/api/guests'), fetch('/api/categories')]);
      setGuests(await gR.json());
      setCategories(await cR.json());
    } catch (err: any) { setError(err.message || 'An error occurred.'); }
    finally { setIsLoading(false); }
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
      await fetchData();
      setName(''); setPhone(''); setEmail(''); setSide('bride'); setCategoryId(''); setNotes(''); setIsAddOpen(false);
    } catch (err: any) { showToast(err.message || 'Could not add', 'error'); }
    finally { setIsSubmitting(false); }
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
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setIsAddOpen(true)} sx={{ whiteSpace: 'nowrap' }}>
          Add Guest
        </Button>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                    <StatusChip guest={g} />
                  </Box>
                  {(g.phone || g.email) && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 1 }}>
                      {g.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone size={12} style={{ color: '#9CA3AF' }} /><Typography variant="caption">{g.phone}</Typography></Box>}
                      {g.email && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Mail size={12} style={{ color: '#9CA3AF' }} /><Typography variant="caption">{g.email}</Typography></Box>}
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }} onClick={e => e.stopPropagation()}>
                    {g.phone && <IconButton size="small" color="primary" onClick={() => handleSendWhatsApp(g)} disabled={sendingId !== null}><MessageCircle size={15} /></IconButton>}
                    <IconButton size="small" onClick={() => handleCopyLink(g)}><Copy size={15} /></IconButton>
                    <IconButton size="small" color="success" onClick={() => openInviteLink(g)}><ExternalLink size={15} /></IconButton>
                    <IconButton size="small" component={Link} href={`/guests/${g.id}`}><Edit2 size={15} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteGuest(g.id)} disabled={deletingId !== null}><Trash2 size={15} /></IconButton>
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
      <Drawer anchor="right" open={isAddOpen} onClose={() => setIsAddOpen(false)} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 } } } }}>
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
      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast?.type || 'success'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
