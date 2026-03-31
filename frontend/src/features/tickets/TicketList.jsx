import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box, Typography, Alert, CircularProgress } from '@mui/material';
import { useGetTicketsQuery } from './ticketsApi';
import { setPage, setPageSize, getFilteredParams } from '../../store/slices/ticketSlice';
import { useDebounce } from '../../hooks/useDebounce';
import FilterSidebar from './components/FilterSidebar';
import TicketTable from './components/TicketTable';

const TicketList = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.tickets);

  const queryParams = useSelector(getFilteredParams);

  const { data, isLoading, error } = useGetTicketsQuery(queryParams);

  const handlePageChange = (event, newPage) => {
    dispatch(setPage(newPage + 1));
  };

  const handlePageSizeChange = (event) => {
    dispatch(setPageSize(parseInt(event.target.value, 10)));
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading tickets: {error?.data?.detail || error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Grid container>
      <Grid item xs={12} md={3}>
        <FilterSidebar />
      </Grid>
      <Grid item xs={12} md={9}>
        <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Tickets ({data?.count || 0})
          </Typography>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
              <CircularProgress />
            </Box>
          ) : (
            <TicketTable
              tickets={data?.results || []}
              totalCount={data?.count || 0}
              page={filters.pagination.page}
              pageSize={filters.pagination.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default TicketList;
