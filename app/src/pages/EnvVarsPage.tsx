import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { envvarsApi } from '../services/api';

export const EnvVarsPage: React.FC = () => {
  const [apiEnvVars, setApiEnvVars] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvVars = async () => {
      try {
        const data = await envvarsApi.getAll();
        setApiEnvVars(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch environment variables');
      } finally {
        setLoading(false);
      }
    };
    fetchEnvVars();
  }, []);

  // Get frontend environment variables (build-time)
  const frontendEnvVars: Record<string, string> = {};
  // Vite env vars are available via import.meta.env, but only those prefixed with VITE_
  // We'll show what's actually available
  if (import.meta.env.VITE_API_URL) {
    frontendEnvVars['VITE_API_URL'] = import.meta.env.VITE_API_URL;
  } else {
    frontendEnvVars['VITE_API_URL'] = '(not set)';
  }
  
  // Note: In Vite, we can't easily iterate over import.meta.env at runtime
  // Environment variables are replaced at build time, so we manually list known ones

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const renderEnvVarTable = (envVars: Record<string, string>, title: string) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Variable Name</strong></TableCell>
              <TableCell><strong>Value</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(envVars).length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography color="text.secondary">No environment variables found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(envVars)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>
                      <code>{key}</code>
                      {key === 'VITE_API_URL' && (
                        <Chip
                          label="Important"
                          color="primary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <code style={{ wordBreak: 'break-all' }}>{value}</code>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Environment Variables
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This page shows environment variables from both the frontend (build-time) and API (runtime) pods.
        Note: Vite environment variables must be set at <strong>build time</strong> and are baked into the JavaScript bundle.
      </Typography>

      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
          <Typography color="error">Error fetching API environment variables: {error}</Typography>
        </Box>
      )}

      {renderEnvVarTable(frontendEnvVars, 'Frontend Environment Variables (Build-time)')}

      {apiEnvVars && renderEnvVarTable(apiEnvVars, 'API Environment Variables (Runtime)')}
    </Box>
  );
};

