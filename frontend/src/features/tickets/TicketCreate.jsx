import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { useGetCategoriesQuery, useCreateTicketMutation } from './ticketsApi';
import FileUpload from '../../components/FileUpload';

// Options for dropdowns
const impactOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'group', label: 'Group' },
  { value: 'department', label: 'Department' },
  { value: 'campus', label: 'Campus' },
];

const urgencyOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

// Map category IDs to extra fields (simplified; in real app you'd fetch field definitions from backend)
const categoryExtraFields = {
  1: ['asset_tag'], // IT
  2: ['location'],  // Facilities
  // Add more as needed
};

const TicketCreate = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const [createTicket, { isLoading: creating }] = useCreateTicketMutation();
  const [attachmentIds, setAttachmentIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Build validation schema dynamically based on selected category
  const getValidationSchema = (catId) => {
    let schema = {
      title: yup.string().required('Title is required'),
      description: yup.string().required('Description is required'),
      impact: yup.string().required('Impact is required'),
      urgency: yup.string().required('Urgency is required'),
      category: yup.number().required('Category is required'),
    };

    if (catId && categoryExtraFields[catId]) {
      categoryExtraFields[catId].forEach(field => {
        if (field === 'location') {
          schema.location = yup.string().required('Location is required');
        } else if (field === 'asset_tag') {
          schema.asset_tag = yup.string().nullable();
        }
      });
    }

    return yup.object().shape(schema);
  };

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(getValidationSchema(selectedCategory)),
    defaultValues: {
      title: '',
      description: '',
      impact: '',
      urgency: '',
      category: '',
      location: '',
      asset_tag: '',
    },
  });

  const categoryId = watch('category');

  useEffect(() => {
    if (categoryId && categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
      // Reset extra fields when category changes
      const extraFields = categoryExtraFields[categoryId] || [];
      const resetValues = {};
      extraFields.forEach(field => resetValues[field] = '');
      reset((prev) => ({ ...prev, ...resetValues }), { keepErrors: false });
    }
  }, [categoryId, reset, selectedCategory]);

  const onSubmit = async (data) => {
    try {
      // Build custom_fields from extra fields
      const custom_fields = {};
      if (categoryExtraFields[data.category]) {
        categoryExtraFields[data.category].forEach(field => {
          if (data[field]) custom_fields[field] = data[field];
        });
      }

      const ticketData = {
        title: data.title,
        description: data.description,
        impact: data.impact,
        urgency: data.urgency,
        category: parseInt(data.category),
        custom_fields,
        attachments: attachmentIds,
      };

      const result = await createTicket(ticketData).unwrap();
      navigate(`/tickets/${result.id}`);
    } catch (error) {
      console.error('Create failed', error);
    }
  };

  if (categoriesLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create New Ticket</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            {/* Impact */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="impact"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.impact}>
                    <InputLabel>Impact</InputLabel>
                    <Select {...field} label="Impact">
                      {impactOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                    {errors.impact && <FormHelperText>{errors.impact.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Urgency */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.urgency}>
                    <InputLabel>Urgency</InputLabel>
                    <Select {...field} label="Urgency">
                      {urgencyOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                    {errors.urgency && <FormHelperText>{errors.urgency.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {(categories || []).map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                    {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Dynamic extra fields */}
            {selectedCategory === 1 && (
              <Grid item xs={12}>
                <Controller
                  name="asset_tag"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Asset Tag"
                      fullWidth
                      error={!!errors.asset_tag}
                      helperText={errors.asset_tag?.message}
                    />
                  )}
                />
              </Grid>
            )}
            {selectedCategory === 2 && (
              <Grid item xs={12}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Location (e.g., building, room)"
                      fullWidth
                      error={!!errors.location}
                      helperText={errors.location?.message}
                    />
                  )}
                />
              </Grid>
            )}

            {/* File Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Attachments</Typography>
              <FileUpload
                onUploadComplete={(id) => setAttachmentIds(prev => [...prev, id])}
                onRemove={(id) => setAttachmentIds(prev => prev.filter(i => i !== id))}
              />
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/tickets')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Ticket'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TicketCreate;
