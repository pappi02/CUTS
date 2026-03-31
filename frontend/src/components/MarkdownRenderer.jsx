import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Link, Box } from '@mui/material';

const MarkdownRenderer = ({ content }) => {
  return (
    <Box sx={{ '& img': { maxWidth: '100%' } }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <Typography variant="h4" gutterBottom>{children}</Typography>,
          h2: ({ children }) => <Typography variant="h5" gutterBottom>{children}</Typography>,
          h3: ({ children }) => <Typography variant="h6" gutterBottom>{children}</Typography>,
          p: ({ children }) => <Typography variant="body1" paragraph>{children}</Typography>,
          a: ({ href, children }) => <Link href={href} target="_blank" rel="noopener">{children}</Link>,
          ul: ({ children }) => <Box component="ul" sx={{ pl: 2 }}>{children}</Box>,
          ol: ({ children }) => <Box component="ol" sx={{ pl: 2 }}>{children}</Box>,
          li: ({ children }) => <Typography component="li" variant="body1">{children}</Typography>,
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
