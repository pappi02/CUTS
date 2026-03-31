import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useGetArticleQuery } from './knowledgebaseApi';
import { useAuth } from '../../hooks/useAuth';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const KnowledgeBaseArticle = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: article, isLoading, error } = useGetArticleQuery(id || '');

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container>
        <Alert severity="error">Error loading article or article not found.</Alert>
      </Container>
    );
  }

  const canEdit = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'faculty';

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h3">{article.title}</Typography>
          {canEdit && (
            <Button
              component={RouterLink}
              to={`/knowledgebase/${id}/edit`}
              variant="outlined"
              startIcon={<Edit />}
            >
              Edit
            </Button>
          )}
        </Box>

        <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          {article.category_name && (
            <Chip label={article.category_name} size="small" />
          )}
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(article.updated_at || article.created_at || Date.now()).toLocaleDateString()}
          </Typography>
        </Box>

        <MarkdownRenderer content={article.content || ''} />
      </Paper>
    </Container>
  );
};

export default KnowledgeBaseArticle;
