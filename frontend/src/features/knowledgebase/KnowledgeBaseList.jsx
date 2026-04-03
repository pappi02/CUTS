import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Chip,
  Pagination,
  Button,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { 
  useGetArticlesQuery, 
  useGetKbCategoriesQuery, 
  useDeleteArticleMutation 
} from './knowledgebaseApi';
import { useAuth } from '../../hooks/useAuth';

const KnowledgeBaseList = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: articlesData, isLoading } = useGetArticlesQuery({
    search,
    category: category || undefined,
    page,
    page_size: pageSize,
  });
  const { data: categoriesData } = useGetKbCategoriesQuery();
  const [deleteArticle] = useDeleteArticleMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(id).unwrap();
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'faculty';

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4">Knowledge Base</Typography>
              {canEdit && (
                <Button
                  component={RouterLink}
                  to="/knowledgebase/new"
                  variant="contained"
                  startIcon={<Add />}
                >
                  New Article
                </Button>
              )}
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Search articles"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Article List */}
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {(!articlesData?.results || articlesData.results.length === 0) ? (
                  <Typography>No articles found.</Typography>
                ) : (
                  <List>
                    {articlesData.results.map((article) => (
                      <ListItem
                        key={article.id}
                        component={RouterLink}
                        to={`/knowledgebase/${article.id}`}
                        sx={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <ListItemText
                          primary={article.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {article.excerpt || (article.content || '').substring(0, 100)}...
                              </Typography>
                              {article.category_name && (
                                <Chip
                                  label={article.category_name}
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </Box>
                          }
                        />
                        {canEdit && (
                          <ListItemSecondaryAction sx={{ right: 0 }}>
                            <IconButton
                              component={RouterLink}
                              to={`/knowledgebase/${article.id}/edit`}
                              edge="end"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(article.id);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}

                {articlesData?.count > pageSize && (
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                      count={Math.ceil((articlesData?.count || 0) / pageSize)}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default KnowledgeBaseList;
