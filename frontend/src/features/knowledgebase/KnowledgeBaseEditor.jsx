import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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
} from '@mui/material';
import {
  useGetArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useGetKbCategoriesQuery,
} from './knowledgebaseApi';
import RichTextEditor from '../../components/RichTextEditor';
import { useAuth } from '../../hooks/useAuth';

const KnowledgeBaseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { user } = useAuth();

  const { data: article, isLoading: articleLoading } = useGetArticleQuery(id || '', { skip: !isEditing });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetKbCategoriesQuery();
  const [createArticle, { isLoading: creating, error: createError }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: updating, error: updateError }] = useUpdateArticleMutation();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      content: '',
      category: '',
    },
  });

  useEffect(() => {
    if (isEditing && article) {
      setValue('title', article.title || '');
      setValue('content', article.content || '');
      setValue('category', article.category || '');
    }
  }, [article, isEditing, setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateArticle({ id, ...data }).unwrap();
      } else {
        await createArticle(data).unwrap();
      }
      navigate('/knowledgebase');
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const error = createError || updateError;

  if ((isEditing && articleLoading) || categoriesLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing ? 'Edit Article' : 'Create New Article'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to save article: {error.data?.detail || error.message || 'Unknown error'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
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

            <Grid item xs={12}>
              <Controller
                name="category"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      <MenuItem value="">Select category</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Content</Typography>
              <Controller
                name="content"
                control={control}
                rules={{ required: 'Content is required' }}
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Write your article here..."
                  />
                )}
              />
              {errors.content && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.content.message}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/knowledgebase')}
                  disabled={creating || updating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={creating || updating}
                >
                  {creating || updating ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Saving...
                    </>
                  ) : isEditing ? 'Update' : 'Create'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default KnowledgeBaseEditor;
