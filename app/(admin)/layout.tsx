'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from './actions';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

import {
  LayoutGrid, Users, CheckCircle2, Split, Tags,
  BarChart3, Settings, LogOut, Heart, Menu,
} from 'lucide-react';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/guests', label: 'Guests', icon: Users },
  { href: '/rsvp', label: 'RSVPs', icon: CheckCircle2 },
  { href: '/tables', label: 'Tables', icon: Split },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeIndex = MOBILE_NAV.findIndex(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 1 }}>
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', fontSize: '1.1rem' }}>
          💍
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#F8FAFC', fontWeight: 700, lineHeight: 1.2 }}>
            Oshidhie & Kaveen
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', letterSpacing: '0.08em' }}>
            WEDDING MANAGER
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mx: 2, mb: 1 }} />
      <List sx={{ flex: 1, px: 0.5 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton component={Link} href={item.href} selected={isActive} onClick={() => setMobileOpen(false)}>
                <ListItemIcon><Icon size={18} /></ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 } } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mx: 2, mt: 1 }} />
      <Box sx={{ px: 1, py: 1.5 }}>
        <form action={logoutAction}>
          <ListItemButton component="button" type="submit" sx={{ borderRadius: 2, width: '100%', color: '#FCA5A5', '&:hover': { backgroundColor: 'rgba(239,68,68,0.12)' } }}>
            <ListItemIcon sx={{ color: '#FCA5A5' }}><LogOut size={18} /></ListItemIcon>
            <ListItemText primary="Sign Out" slotProps={{ primary: { sx: { fontSize: '0.82rem', fontWeight: 600 } } }} />
          </ListItemButton>
        </form>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Drawer */}
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
        {drawerContent}
      </Drawer>
      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
        {drawerContent}
      </Drawer>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile AppBar */}
        <AppBar position="sticky" elevation={0} sx={{ display: { xs: 'flex', md: 'none' }, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}>
          <Toolbar variant="dense" sx={{ gap: 1, minHeight: 56 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: 'primary.main' }}>
              <Menu size={20} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Heart size={16} style={{ color: '#7C3AED', fill: 'rgba(124,58,237,0.15)' }} />
              <Typography variant="subtitle2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontWeight: 700 }}>
                Oshidhie & Kaveen
              </Typography>
            </Box>
            <Tooltip title="Sign Out">
              <form action={logoutAction}>
                <IconButton type="submit" size="small" sx={{ color: 'error.main' }}>
                  <LogOut size={18} />
                </IconButton>
              </form>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, pb: { xs: 10, md: 3 }, maxWidth: 1200, width: '100%', mx: 'auto' }}>
          {children}
        </Box>

        {/* Mobile Bottom Navigation */}
        <Paper elevation={8} sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
          <BottomNavigation value={activeIndex === -1 ? false : activeIndex} sx={{ bgcolor: 'background.paper', height: 64, '& .MuiBottomNavigationAction-root': { minWidth: 0, color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }, '& .MuiBottomNavigationAction-label': { fontSize: '0.6rem !important' } }}>
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <BottomNavigationAction key={item.href} label={item.label} icon={<Icon size={20} />} component={Link} href={item.href} />
              );
            })}
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}
