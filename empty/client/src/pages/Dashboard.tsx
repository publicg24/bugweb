import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Photo {
  id: number;
  url: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://bugweb.onrender.com/api/photos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPhotos(res.data);
    } catch (err: any) {
      setError('Failed to fetch photos. Please login again.');
    }
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) return setError('Please select a file');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);
      await axios.post('https://bugweb.onrender.com/api/photos/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Photo uploaded!');
      setFile(null);
      fetchPhotos();
    } catch (err: any) {
      setError('Upload failed. Please login again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box maxWidth={800} mx="auto" mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
      </Box>
      <Box mb={2} p={2} bgcolor="#fff" borderRadius={2} boxShadow={2}>
        <form onSubmit={handleUpload}>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          <Button type="submit" variant="contained" color="primary" sx={{ ml: 2 }}>Upload Photo</Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Box>
      <Grid container spacing={2}>
        {photos.map(photo => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={`https://bugweb.onrender.com${photo.url}`}
                alt="Uploaded"
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
