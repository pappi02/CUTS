import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../services/api';

const COLOR_PALETTE = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

const Reports = () => {
  const [reportType, setReportType] = useState('volume');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [groupBy, setGroupBy] = useState('status');
  const [period, setPeriod] = useState('day');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate.toISOString().split('T')[0];
      if (endDate) params.end_date = endDate.toISOString().split('T')[0];
      if (reportType === 'volume') {
        params.group_by = groupBy;
        params.period = period;
      } else if (reportType === 'sla') {
        params.group_by = groupBy;
      }

      let endpoint = '';
      switch (reportType) {
        case 'volume':
          endpoint = '/reports/ticket-volume/';
          break;
        case 'sla':
          endpoint = '/reports/sla-compliance/';
          break;
        case 'agent':
          endpoint = '/reports/agent-performance/';
          break;
        default:
          return;
      }
      const response = await api.get(endpoint, { params });
      setData(response.data);
      setTaskId(null);
      setExportStatus(null);
    } catch (error) {
      console.error('Failed to fetch report', error);
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate, groupBy, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format) => {
    try {
      const response = await api.post('/reports/export/', {
        format,
        start_date: startDate?.toISOString().split('T')[0],
        end_date: endDate?.toISOString().split('T')[0],
        report_type: reportType,
      });
      const newTaskId = response.data.task_id;
      setTaskId(newTaskId);
      
      // Poll status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/reports/export/${newTaskId}/`);
          setExportStatus(statusRes.data);
          if (statusRes.data.status === 'SUCCESS') {
            clearInterval(pollInterval);
            if (statusRes.data.result) {
              // Download
              const blob = new Blob([statusRes.data.result], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `report-${reportType}-${format === 'csv' ? 'csv' : 'pdf'}`;
              a.click();
            }
          }
        } catch (err) {
          clearInterval(pollInterval);
        }
      }, 1000);

      setTimeout(() => clearInterval(pollInterval), 30000); // Max 30s
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const renderChart = () => {
    if (loading) return null;

    if (reportType === 'volume') {
      if (data.length === 0) return <Typography>No data</Typography>;
      
      // Transform for stacked bar: periods as keys, groups as series
      const periods = [...new Set(data.map(d => d.period))].sort();
      const groups = groupBy !== 'none' ? [...new Set(data.map(d => d[groupBy]))] : [];
      
      const chartData = periods.map(p => {
        const entry = { period: p };
        if (groups.length > 0) {
          groups.forEach(g => {
            const match = data.find(d => d.period === p && d[groupBy] === g);
            entry[g] = match ? match.count : 0;
          });
        } else {
          const match = data.find(d => d.period === p);
          entry.count = match ? match.count : 0;
        }
        return entry;
      });

      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            {groups.map((g, i) => (
              <Bar key={g} dataKey={g} stackId="a" fill={COLOR_PALETTE[i % COLOR_PALETTE.length]} />
            ))}
            {groups.length === 0 && <Bar dataKey="count" fill="#8884d8" />}
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (reportType === 'sla') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="total" nameKey={groupBy}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [value, `SLA ${Math.round(props.payload.sla_percentage)}%`]} />
          </PieChart>
        </ResponsiveContainer>
      );
    } else if (reportType === 'agent') {
      const formattedData = data.map(d => ({
        agent: d.agent_username,
        assigned: d.assigned_count,
        resolved: d.resolved_count,
        avg_days: Number(d.avg_resolution_days?.toFixed(1) || 0),
      }));
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="agent" angle={-45} height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="assigned" fill="#8884d8" name="Assigned" />
            <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Reports & Analytics</Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} label="Report Type" onChange={(e) => setReportType(e.target.value)}>
                <MenuItem value="volume">Ticket Volume</MenuItem>
                <MenuItem value="sla">SLA Compliance</MenuItem>
                <MenuItem value="agent">Agent Performance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {reportType === 'volume' && (
            <>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Group By</InputLabel>
                  <Select value={groupBy} label="Group By" onChange={(e) => setGroupBy(e.target.value)}>
                    <MenuItem value="none">Time Only</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Period</InputLabel>
                  <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
                    <MenuItem value="day">Day</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {reportType === 'sla' && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Group By</InputLabel>
                <Select value={groupBy} label="Group By" onChange={(e) => setGroupBy(e.target.value)}>
                  <MenuItem value="priority">Priority</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} md={2}>
            <DatePicker label="Start Date" value={startDate} onChange={setStartDate} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <DatePicker label="End Date" value={endDate} onChange={setEndDate} slotProps={{ textField: { fullWidth: true } }} />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button variant="contained" onClick={fetchData} fullWidth sx={{ height: '100%' }}>
              Refresh
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleExport('csv')} 
            disabled={!data.length || loading || taskId}
            sx={{ mr: 1 }}
          >
            CSV
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleExport('pdf')} 
            disabled={!data.length || loading || taskId}
            sx={{ mr: 1 }}
          >
            PDF
          </Button>
        </Box>

        {taskId && (
          <Alert severity="info">
            Export in progress... Status: {exportStatus?.status || 'PENDING'}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          renderChart()
        )}

        {data.length > 0 && (
          <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
            {data.length} data points loaded.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Reports;

