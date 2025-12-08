import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import { Navigation } from './components/Navigation';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtistDetailPage } from './pages/ArtistDetailPage';
import { AlbumDetailPage } from './pages/AlbumDetailPage';
import { EnvVarsPage } from './pages/EnvVarsPage';
import { CustomersPage } from './pages/CustomersPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { createAppTheme, defaultTheme } from './theme';

// Create theme from configuration
// In the future, this could be selected dynamically (e.g., from user preferences, URL param, etc.)
const theme = createAppTheme(defaultTheme);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Navigation />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - 240px)` },
            }}
          >
            <Container maxWidth="xl">
              <Routes>
                <Route path="/" element={<Navigate to="/artists" replace />} />
                <Route path="/artists" element={<ArtistsPage />} />
                <Route path="/artists/:id" element={<ArtistDetailPage />} />
                <Route path="/artists/:id/albums/:albumId" element={<AlbumDetailPage />} />
                <Route path="/envvars" element={<EnvVarsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;


console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);