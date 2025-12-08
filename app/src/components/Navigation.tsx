import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import {
  MusicNote,
  People,
  Business,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Artists', icon: <MusicNote />, path: '/artists' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Employees', icon: <Business />, path: '/employees' },
];

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Get colors from theme
  const primaryColor = theme.palette.primary.main;
  const contrastText = theme.palette.primary.contrastText || '#fff';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Box
            component="svg"
            viewBox="0 0 100 100"
            sx={{
              width: 120,
              height: 120,
              mb: 2,
            }}
          >
            {/* Outer record circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill={primaryColor}
              stroke={contrastText}
              strokeWidth="2"
            />
            {/* Inner grooves */}
            <circle cx="50" cy="50" r="35" fill="none" stroke={contrastText} strokeWidth="1" opacity="0.3" />
            <circle cx="50" cy="50" r="25" fill="none" stroke={contrastText} strokeWidth="1" opacity="0.3" />
            <circle cx="50" cy="50" r="15" fill="none" stroke={contrastText} strokeWidth="1" opacity="0.3" />
            {/* Center hole */}
            <circle cx="50" cy="50" r="5" fill={contrastText} />
            {/* Music notes */}
            <g transform="translate(50, 50)">
              {/* First note */}
              <g transform="translate(-20, -10)">
                <ellipse cx="0" cy="0" rx="3" ry="5" fill={contrastText} />
                <line x1="3" y1="0" x2="3" y2="-15" stroke={contrastText} strokeWidth="2" />
                <circle cx="8" cy="-12" r="2" fill={contrastText} />
              </g>
              {/* Second note */}
              <g transform="translate(15, -5)">
                <ellipse cx="0" cy="0" rx="3" ry="5" fill={contrastText} />
                <line x1="3" y1="0" x2="3" y2="-15" stroke={contrastText} strokeWidth="2" />
                <circle cx="8" cy="-12" r="2" fill={contrastText} />
              </g>
            </g>
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary' }}>
            Chinook Music
          </Typography>
        </Box>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

