'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, CheckCircle2, XCircle, Clock, UserPlus,
  Armchair, Loader2, ArrowRight, TrendingUp, AlertCircle
} from 'lucide-react';
import { GuestWithDetails, Category } from '@/lib/types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';



function getInvitedCount(g: GuestWithDetails): number {
  const po = g.rsvp?.plus_one;
  if (typeof po === 'number') return Math.max(1, po);
  if (typeof po === 'boolean') return po ? 2 : 1;
  return 1;
}

function getAttendingCount(g: GuestWithDetails): number {
  if (g.rsvp?.status !== 'attending') return 0;
  const invited = getInvitedCount(g);
  const att = g.rsvp?.attending_count;
  if (typeof att === 'number' && att > 0) return att;
  return invited;
}

function getDeclinedCount(g: GuestWithDetails): number {
  if (g.rsvp?.status === 'declined') {
    return getInvitedCount(g);
  }
  return 0;
}

function getPendingCount(g: GuestWithDetails): number {
  if (!g.rsvp?.status || g.rsvp?.status === 'pending') {
    return getInvitedCount(g);
  }
  return 0;
}

export default function DashboardPage() {
  const [guests, setGuests] = useState<GuestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const gR = await fetch('/api/guests');
      if (!gR.ok) throw new Error('Failed to load dashboard metrics');
      setGuests(await gR.json());
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000); // Polling every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ py: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">Assembling dashboard metrics...</Typography>
      </Box>
    );
  }

  // Count every guest (party size) instead of counting just records
  const totalInvited = guests.reduce((sum, g) => sum + getInvitedCount(g), 0);
  const attending    = guests.reduce((sum, g) => sum + getAttendingCount(g), 0);
  const declined     = guests.reduce((sum, g) => sum + getDeclinedCount(g), 0);
  const pending      = guests.reduce((sum, g) => sum + getPendingCount(g), 0);
  
  const plusOnes = guests.filter(g => g.rsvp?.status === 'attending').reduce((sum, g) => {
    const count = getAttendingCount(g);
    return sum + Math.max(0, count - 1);
  }, 0);
  
  const totalSeats = attending;

  const brideTotal     = guests.filter(g => g.side?.startsWith('bride')).reduce((sum, g) => sum + getInvitedCount(g), 0);
  const groomTotal     = guests.filter(g => g.side?.startsWith('groom')).reduce((sum, g) => sum + getInvitedCount(g), 0);
  const brideAttending = guests.filter(g => g.side?.startsWith('bride')).reduce((sum, g) => sum + getAttendingCount(g), 0);
  const groomAttending = guests.filter(g => g.side?.startsWith('groom')).reduce((sum, g) => sum + getAttendingCount(g), 0);
  const bridePlusOnes  = guests.filter(g => g.side?.startsWith('bride')).reduce((sum, g) => sum + Math.max(0, getAttendingCount(g) - 1), 0);
  const groomPlusOnes  = guests.filter(g => g.side?.startsWith('groom')).reduce((sum, g) => sum + Math.max(0, getAttendingCount(g) - 1), 0);
  const brideSeats     = brideAttending;
  const groomSeats     = groomAttending;

  const attendingPct = totalInvited > 0 ? (attending / totalInvited) * 100 : 0;
  const declinedPct  = totalInvited > 0 ? (declined  / totalInvited) * 100 : 0;

  const statValues: Record<string, number> = { total: totalInvited, attend: attending, declined, pending, seats: totalSeats, plus: plusOnes };

  const recentActivities = guests
    .filter(g => g.rsvp?.responded_at)
    .sort((a, b) => new Date(b.rsvp!.responded_at!).getTime() - new Date(a.rsvp!.responded_at!).getTime())
    .slice(0, 8);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Dashboard</Typography>
        <Typography variant="caption" color="text.secondary">
          Real-time attendance summaries, seat counts, and guest configurations.
        </Typography>
      </Box>

      {error && <Alert severity="error" icon={<AlertCircle size={16} />}>{error}</Alert>}

      {/* Stat Cards */}
      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ flexWrap: 'nowrap' }}>
        {[
          { key: 'total',    label: 'Total Invited', color: '#7C3AED', bg: '#F5F3FF', Icon: Users },
          { key: 'attend',   label: 'Attending & Plus Ones', color: '#16A34A', bg: '#F0FDF4', Icon: CheckCircle2 },
          { key: 'declined', label: 'Declined',      color: '#DC2626', bg: '#FEF2F2', Icon: XCircle },
          { key: 'pending',  label: 'Pending',       color: '#D97706', bg: '#FFFBEB', Icon: Clock },
          { key: 'seats',    label: 'Total Seats',   color: '#0284C7', bg: '#F0F9FF', Icon: Armchair }
        ].map(({ key, label, color, bg, Icon }) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={key} sx={{ flex: 1, minWidth: 0 }}>
            <Card elevation={1} sx={{ height: '100%', borderTop: `3px solid ${color}`, bgcolor: bg }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2.5 } } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: 1 }}>
                  <Icon size={14} style={{ color, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.55rem', sm: '0.7rem' }, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, whiteSpace: { xs: 'normal', sm: 'nowrap' }, lineHeight: 1.1 }}>
                    {label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="h4" sx={{ color, lineHeight: 1, fontWeight: 800, fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
                    {statValues[key]}
                  </Typography>
                  {key === 'attend' && statValues.plus > 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                      (incl. {statValues.plus} plus ones)
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* RSVP Progress Bar */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>RSVP Response Ratios</Typography>
          <Typography variant="caption" color="text.secondary">
            {attending} attending · {declined} declined · {pending} pending
          </Typography>
        </Box>
        <Box sx={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', bgcolor: '#E5E7EB' }}>
          <Box sx={{ width: `${attendingPct}%`, bgcolor: '#16A34A', transition: 'width 0.5s ease' }} />
          <Box sx={{ width: `${declinedPct}%`,  bgcolor: '#DC2626', transition: 'width 0.5s ease' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
          {[
            { color: '#16A34A', label: `Attending (${Math.round(attendingPct)}%)` },
            { color: '#DC2626', label: `Declined (${Math.round(declinedPct)}%)` },
            { color: '#D97706', label: `Pending (${totalInvited > 0 ? Math.round((pending / totalInvited) * 100) : 0}%)` },
          ].map(({ color, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Grid: Representation + Categories + Activity */}
      <Grid container spacing={3}>
        {/* Left: Representation + Categories */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Representation */}
            <Paper elevation={1} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <TrendingUp size={16} style={{ color: '#7C3AED' }} />
                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 700 }}>
                  Representation
                </Typography>
              </Box>
              <Box sx={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', mb: 1 }}>
                <Box sx={{ width: `${totalInvited > 0 ? (brideTotal / totalInvited) * 100 : 50}%`, bgcolor: '#9333EA', transition: 'width 0.5s' }} />
                <Box sx={{ width: `${totalInvited > 0 ? (groomTotal / totalInvited) * 100 : 50}%`, bgcolor: '#2563EB', transition: 'width 0.5s' }} />
              </Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6 }}>
                  <Card elevation={0} sx={{ bgcolor: '#FAF5FF', border: '1px solid #E9D5FF', borderTop: '4px solid #9333EA', p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Bride&apos;s side confirmed</Typography>
                    <Typography variant="h5" sx={{ color: '#9333EA', mt: 0.5, fontWeight: 800 }}>{brideAttending}</Typography>
                    <Typography variant="caption" color="text.secondary">+ {bridePlusOnes} plus ones · {brideTotal} total</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Card elevation={0} sx={{ bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderTop: '4px solid #2563EB', p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Groom&apos;s side confirmed</Typography>
                    <Typography variant="h5" sx={{ color: '#2563EB', mt: 0.5, fontWeight: 800 }}>{groomAttending}</Typography>
                    <Typography variant="caption" color="text.secondary">+ {groomPlusOnes} plus ones · {groomTotal} total</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Grid>        {/* Right: Recent Activity */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={1} sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 700 }}>
                Recent Activity
              </Typography>
              <Button component={Link} href="/rsvp" size="small" endIcon={<ArrowRight size={14} />} sx={{ fontSize: '0.75rem' }}>
                All RSVPs
              </Button>
            </Box>

            {recentActivities.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">No RSVP activities yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivities.map((guest) => {
                  const status = guest.rsvp?.status;
                  const statusColor = status === 'attending' ? '#16A34A' : status === 'declined' ? '#DC2626' : '#D97706';
                  const date = guest.rsvp?.responded_at
                    ? new Date(guest.rsvp.responded_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    : '';
                  return (
                    <Box key={guest.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: statusColor + '22', color: statusColor, fontSize: '0.75rem', fontWeight: 700, mt: 0.3 }}>
                        {guest.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{guest.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.25 }}>
                          <Chip
                            label={status === 'attending' ? 'Confirmed' : status === 'declined' ? 'Declined' : 'Pending'}
                            size="small"
                            sx={{ height: 18, fontSize: '0.6rem', bgcolor: statusColor + '22', color: statusColor, fontWeight: 700 }}
                          />
                          <Chip
                            label={guest.side}
                            size="small"
                            sx={{ height: 18, fontSize: '0.6rem', bgcolor: guest.side === 'bride' ? '#FAF5FF' : '#EFF6FF', color: guest.side === 'bride' ? '#9333EA' : '#2563EB', fontWeight: 700 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', ml: 'auto' }}>{date}</Typography>
                        </Box>
                        {guest.rsvp?.message && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic', fontSize: '0.7rem' }}>
                            &ldquo;{guest.rsvp.message}&rdquo;
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
