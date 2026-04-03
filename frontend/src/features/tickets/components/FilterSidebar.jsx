import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  Stack,
  useTheme,
  Paper,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { setFilter, clearFilters } from '../../../store/slices/ticketSlice';
import { toggleFilterSidebar } from '../../../store/slices/uiSlice';
import { useGetCategoriesQuery } from '../ticketsApi';

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.tickets.filters);
  const filterSidebarOpen = useSelector((state) => state.ui.filterSidebarOpen);
  const { data: categoriesData, isError: categoriesError } = useGetCategoriesQuery();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const handleChange = (key, value) => {
    dispatch(setFilter({ key, value }));
  };

  const handleClear = () => {
    dispatch(clearFilters());
  };

  const handleAssignedToMe = (e) => {
    dispatch(setFilter({ key: 'assigned_to_me', value: e.target.checked }));
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Paper className="glass-card" sx={{ 
      width: { xs: '100%', md: 320 }, 
      p: { xs: 2, md: 3 }, 
      minHeight: { xs: 'auto', md: 'calc(100vh - 140px)' }, 
      maxHeight: { xs: 'none', md: 'calc(100vh - 140px)' },
      overflow: 'auto',
      borderRight: { xs: 'none', md: '1px solid rgba(148, 163, 184, 0.2)' },
      boxShadow: { xs: 'none', md: '10px 0 30px rgba(0,0,0,0.3)' },
      position: { xs: filterSidebarOpen ? 'fixed' : 'absolute', md: 'sticky' },
      top: { xs: 0, md: '88px' },
      left: { xs: 0 },
      right: { xs: 0 },
      zIndex: { xs: 1000, md: 'auto' },
      mb: { xs: 3, md: 0 },
      borderRadius: { xs: 'var(--radius-lg)', md: 0 },
      display: { xs: filterSidebarOpen ? 'block' : 'none', md: 'block' },
      backdropFilter: { xs: 'blur(4px)', md: 'none' },
      backgroundColor: { xs: 'rgba(255,255,255,0.95)', md: 'inherit' },
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom color="primary.main">
            🔍 Advanced Filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeFiltersCount} active filters
          </Typography>
        </Box>
        {isMobile && (
          <IconButton 
            size="small" 
            onClick={() => dispatch(toggleFilterSidebar())}
            sx={{ color: 'text.secondary', mt: -1 }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        label="Search tickets"
        placeholder="Title or ID..."
        value={filters.search || ''}
        onChange={(e) => handleChange('search', e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Status */}
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => handleChange('status', e.target.value || null)}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="new">New</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="pending_requester">Pending Requester</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </Select>
      </FormControl>

      {/* Priority */}
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority || ''}
          label="Priority"
          onChange={(e) => handleChange('priority', e.target.value || null)}
        >
          <MenuItem value="">All Priorities</MenuItem>
          <MenuItem value="p1">Critical</MenuItem>
          <MenuItem value="p2">High</MenuItem>
          <MenuItem value="p3">Medium</MenuItem>
          <MenuItem value="p4">Low</MenuItem>
        </Select>
      </FormControl>

      {/* Category */}
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category || ''}
          label="Category"
          onChange={(e) => handleChange('category', e.target.value || null)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categoriesError ? (
            <MenuItem disabled>No categories loaded</MenuItem>
          ) : (
            categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* Date Range */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
          📅 Date Range
        </Typography>
        <Stack spacing={2}>
          <DatePicker
            label="From Date"
            value={filters.created_after ? new Date(filters.created_after) : null}
            onChange={(date) => handleChange('created_after', date ? date.toISOString().split('T')[0] : null)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
          <DatePicker
            label="To Date"
            value={filters.created_before ? new Date(filters.created_before) : null}
            onChange={(date) => handleChange('created_before', date ? date.toISOString().split('T')[0] : null)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Stack>
      </Box>

      {/* Assigned to Me */}
      <FormControlLabel
        control={
          <Switch
            checked={filters.assigned_to_me || false}
            onChange={handleAssignedToMe}
            sx={{ '& .MuiSwitch-track': { bgcolor: 'rgba(99,102,241,0.5)' } }}
          />
        }
        label="Only my tickets"
        sx={{ mb: 3 }}
      />

      <Divider sx={{ my: 3 }} />

      {/* Active Filters */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Active Filters ({activeFiltersCount})
      </Typography>
      
      {activeFiltersCount === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">No filters applied</Typography>
        </Box>
      ) : (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {Object.entries(filters).map(([key, value]) => {
            if (value && key !== 'search' && key !== 'assigned_to_me') {
              let label = value;
              if (key === 'created_after') label = `From ${new Date(value).toLocaleDateString()}`;
              if (key === 'created_before') label = `To ${new Date(value).toLocaleDateString()}`;
              return (
                <Chip
                  key={key}
                  label={`${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${label}`}
                  color="primary"
                  onDelete={() => handleChange(key, null)}
                  variant="filled"
                  size="small"
                />
              );
            }
            return null;
          })}
        </Stack>
      )}

      {/* Actions */}
      <Button 
        variant="contained" 
        fullWidth 
        onClick={handleClear} 
        size="large"
        sx={{ 
          py: 1.5,
          fontWeight: 700,
          borderRadius: 12,
          boxShadow: theme.shadows[8],
          '&:hover': { boxShadow: theme.shadows[12] }
        }}
      >
        Clear All Filters
      </Button>

      <Button 
        variant="outlined" 
        fullWidth 
        sx={{ 
          mt: 2, 
          py: 1.5,
          fontWeight: 600,
          borderRadius: 12,
          borderColor: 'rgba(99,102,241,0.5)',
          color: 'primary.main',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.main',
            color: 'common.white',
          }
        }}
        onClick={() => {}}
      >
        Save Filter Set
      </Button>
    </Paper>
  );
};

export default FilterSidebar;

