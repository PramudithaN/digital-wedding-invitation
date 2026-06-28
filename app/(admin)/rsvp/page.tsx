'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserPlus, 
  UtensilsCrossed, 
  Loader2, 
  AlertCircle,
  Edit2,
  Calendar
} from 'lucide-react';
import { GuestWithDetails } from '@/lib/types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Chip from '@mui/material/Chip';

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

function StatusChip({ status }: { status?: string }) {
  if (status === 'attending') return <Chip label="Attending" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: '0.7rem' }} />;
  if (status === 'declined')  return <Chip label="Declined"  size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.7rem' }} />;
  return <Chip label="Pending" size="small" sx={{ bgcolor: '#F9FAFB', color: '#6B7280', fontWeight: 700, fontSize: '0.7rem' }} />;
}

export default function RSVPTrackerPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'declined' | 'pending'>('all');
  const [mealFilter, setMealFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchGuests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/guests');
      if (!res.ok) throw new Error('Failed to fetch guests');
      const data = await res.json();
      setGuests(data);
    } catch (err: any) {
      setError(err.message || 'Error loading guest RSVP data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleStatusChange = async (guestId: string, newStatus: 'attending' | 'declined' | 'pending') => {
    const guestObj = guests.find(g => g.id === guestId);
    try {
      setUpdatingId(guestId);
      const res = await fetch('/api/rsvp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guestId,
          status: newStatus
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update status');
      }

      setGuests((prevGuests) =>
        prevGuests.map((g) => {
          if (g.id === guestId) {
            return {
              ...g,
              rsvp: g.rsvp 
                ? { ...g.rsvp, status: newStatus, responded_at: new Date().toISOString() } 
                : { id: 'new-rsvp', guest_id: guestId, status: newStatus, plus_one: false, responded_at: new Date().toISOString() }
            };
          }
          return g;
        })
      );
      showToast(`RSVP status for ${guestObj?.name || 'guest'} updated to "${newStatus}"!`, 'success');
    } catch (err: any) {
      setError(err.message || 'Error updating RSVP');
      showToast(err.message || 'Error updating RSVP', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredGuests = guests.filter((g) => {
    const rsvpStatus = g.rsvp?.status || 'pending';
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rsvpStatus === statusFilter;
    
    let matchesMeal = true;
    if (mealFilter !== 'all') {
      if (mealFilter === 'none') {
        matchesMeal = !g.rsvp?.meal_choice;
      } else {
        matchesMeal = g.rsvp?.meal_choice === mealFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesMeal;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">RSVP Registry</Typography>
        <Typography variant="caption" color="text.secondary">
          Monitor response counts, filter dietary requirements, meal requests, and manually override attendance statuses.
        </Typography>
      </Box>

      {error && <Alert severity="error" icon={<AlertCircle size={16} />}>{error}</Alert>}

      {/* Filter and Search Bar */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search RSVPs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="status-filter-label">RSVP Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="RSVP Status"
                onChange={(e: any) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All RSVP Statuses</MenuItem>
                <MenuItem value="attending">Attending</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
                <MenuItem value="pending">Pending Response</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="meal-filter-label">Meal Selection</InputLabel>
              <Select
                labelId="meal-filter-label"
                value={mealFilter}
                label="Meal Selection"
                onChange={(e) => setMealFilter(e.target.value)}
              >
                <MenuItem value="all">All Meal Selections</MenuItem>
                <MenuItem value="veg">Vegetarian</MenuItem>
                <MenuItem value="non-veg">Non-Vegetarian</MenuItem>
                <MenuItem value="vegan">Vegan</MenuItem>
                <MenuItem value="none">No Preference</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table view */}
      {isLoading ? (
        <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={30} />
          <Typography variant="body2" color="text.secondary">Loading RSVP logs...</Typography>
        </Box>
      ) : filteredGuests.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant="caption" color="text.secondary">No RSVP logs match current filter criteria.</Typography>
        </Box>
      ) : (
        <>
          {/* Desktop Table View */}
          <TableContainer component={Paper} elevation={1} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Guest</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell>RSVP Status</TableCell>
                  <TableCell>Meal Choice</TableCell>
                  <TableCell>Plus One</TableCell>
                  <TableCell>Responded</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGuests.map((guest) => {
                  const rsvpStatus = guest.rsvp?.status || 'pending';
                  const hasPlusOne = guest.rsvp?.plus_one;
                  const plusOneName = guest.rsvp?.plus_one_name;
                  const meal = guest.rsvp?.meal_choice;
                  const responded = guest.rsvp?.responded_at;

                  return (
                    <TableRow key={guest.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{guest.name}</Typography>
                        {guest.category && (
                          <Typography
                            variant="caption"
                            sx={{ color: guest.category.colour, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', display: 'block', mt: 0.25 }}
                          >
                            {guest.category.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <SideChip side={guest.side || 'bride'} />
                      </TableCell>
                      <TableCell>
                        {updatingId === guest.id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CircularProgress size={12} />
                            <Typography variant="caption" color="text.secondary">Updating...</Typography>
                          </Box>
                        ) : (
                          <FormControl size="small" sx={{ minWidth: 110 }}>
                            <Select
                              value={rsvpStatus}
                              onChange={(e: any) => handleStatusChange(guest.id, e.target.value)}
                              size="small"
                              sx={{
                                fontSize: '0.75rem',
                                height: 28,
                                bgcolor: rsvpStatus === 'attending' ? '#F0FDF4' : rsvpStatus === 'declined' ? '#FEF2F2' : '#F9FAFB',
                                color: rsvpStatus === 'attending' ? '#16A34A' : rsvpStatus === 'declined' ? '#DC2626' : '#4B5563',
                                fontWeight: 600,
                                '.MuiOutlinedInput-notchedOutline': {
                                  borderColor: rsvpStatus === 'attending' ? '#BBF7D0' : rsvpStatus === 'declined' ? '#FCA5A5' : '#E5E7EB'
                                }
                              }}
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="attending">Attending</MenuItem>
                              <MenuItem value="declined">Declined</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell>
                        {rsvpStatus === 'attending' && meal ? (
                          <Chip
                            icon={<UtensilsCrossed size={12} />}
                            label={meal}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {rsvpStatus === 'attending' && hasPlusOne ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <UserPlus size={12} style={{ color: '#9CA3AF' }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Yes</Typography>
                            </Box>
                            {plusOneName && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{plusOneName}</Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">No</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {responded ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Calendar size={12} style={{ color: '#9CA3AF' }} />
                            <Typography variant="caption">{new Date(responded).toLocaleDateString()}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>Pending</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          component={Link}
                          href={`/guests/${guest.id}`}
                          variant="outlined"
                          startIcon={<Edit2 size={12} />}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
            {filteredGuests.map((guest) => {
              const rsvpStatus = guest.rsvp?.status || 'pending';
              const hasPlusOne = guest.rsvp?.plus_one;
              const plusOneName = guest.rsvp?.plus_one_name;
              const meal = guest.rsvp?.meal_choice;
              const responded = guest.rsvp?.responded_at;

              return (
                <Card 
                  key={guest.id} 
                  elevation={1} 
                  sx={{ 
                    borderTop: (guest.side || 'bride') === 'groom' ? '4px solid #2563EB' : '4px solid #9333EA' 
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{guest.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          <SideChip side={guest.side || 'bride'} />
                          {guest.category && (
                            <Chip
                              size="small"
                              label={guest.category.name}
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: guest.category.colour + '22',
                                color: guest.category.colour,
                                fontWeight: 700
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      <StatusChip status={rsvpStatus} />
                    </Box>

                    {/* Meal / Plus One details */}
                    {(rsvpStatus === 'attending' && (meal || hasPlusOne)) && (
                      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        {meal && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <UtensilsCrossed size={12} style={{ color: '#9CA3AF' }} />
                            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{meal}</Typography>
                          </Box>
                        )}
                        {hasPlusOne && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <UserPlus size={12} style={{ color: '#9CA3AF' }} />
                            <Typography variant="caption">
                              Plus One {plusOneName ? `(${plusOneName})` : ''}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <FormControl size="small" sx={{ minWidth: 110 }}>
                        <Select
                          value={rsvpStatus}
                          onChange={(e: any) => handleStatusChange(guest.id, e.target.value)}
                          disabled={updatingId !== null}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            height: 28,
                            bgcolor: rsvpStatus === 'attending' ? '#F0FDF4' : rsvpStatus === 'declined' ? '#FEF2F2' : '#F9FAFB',
                            color: rsvpStatus === 'attending' ? '#16A34A' : rsvpStatus === 'declined' ? '#DC2626' : '#4B5563',
                            fontWeight: 600,
                            '.MuiOutlinedInput-notchedOutline': {
                              borderColor: rsvpStatus === 'attending' ? '#BBF7D0' : rsvpStatus === 'declined' ? '#FCA5A5' : '#E5E7EB'
                            }
                          }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="attending">Attending</MenuItem>
                          <MenuItem value="declined">Declined</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Button
                        size="small"
                        component={Link}
                        href={`/guests/${guest.id}`}
                        variant="outlined"
                        startIcon={<Edit2 size={12} />}
                        sx={{ fontSize: '0.7rem', height: 28, py: 0 }}
                      >
                        Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </>
      )}

      {toast && (
        <Box sx={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          width: '90%', sm: 'auto', maxWidth: 360
        }}>
          <Alert severity={toast.type} sx={{ width: '100%', boxShadow: 3 }}>
            {toast.message}
          </Alert>
        </Box>
      )}
    </Box>
  );
}
