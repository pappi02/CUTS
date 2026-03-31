import { useState } from 'react';
import {
  Button,
  LinearProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from '@mui/material';
import { Delete, CloudUpload } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const FileUpload = ({ onUploadComplete, onRemove }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    setError(null);

    for (const file of files) {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:8000/api/tickets/attachments/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
            }
          },
        });

        const newFile = { id: response.data.id, name: response.data.filename, file };
        setUploadedFiles(prev => [...prev, newFile]);
        onUploadComplete(response.data.id);
      } catch (err) {
        setError(`Upload failed for ${file.name}`);
        console.error(err);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    }
  };

  const handleRemove = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    onRemove(id);
  };

  return (
    <Box>
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUpload />}
        disabled={uploading}
      >
        Upload Files
        <VisuallyHiddenInput type="file" multiple onChange={handleFileChange} />
      </Button>

      {uploading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption">{progress}%</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {uploadedFiles.length > 0 && (
        <List>
          {uploadedFiles.map((file) => (
            <ListItem
              key={file.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleRemove(file.id)}>
                  <Delete />
                </IconButton>
              }
            >
              <ListItemText primary={file.name} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUpload;
