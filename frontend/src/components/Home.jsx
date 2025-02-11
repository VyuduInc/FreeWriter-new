import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Card, CardContent, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { apiTest } from '../services/api';
import Tutorials from './Tutorials';


function Home() {
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  

  useEffect(() => {
    const completed = localStorage.getItem('tutorialsCompleted');
    setTutorialCompleted(completed === 'true');
  }, []);

  const handleSkipTutorial = () => {
    localStorage.setItem('tutorialsCompleted', 'true');
    setTutorialCompleted(true);
  };

  return (
    <>
      
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 4 }}>
            <img src="/assets/images/logo.svg" alt="freeWriter Logo" style={{ width: '100px', height: '100px' }} />
          </Box>
          <Typography variant="h2" gutterBottom>
            Welcome to freeWriter
          </Typography>
          <Typography variant="body1" paragraph>
            An innovative storytelling and writing assistance tool designed to help aspiring writers create and develop their stories.
          </Typography>
          <Box sx={{ mt: 4, mb: 6 }}>
            <Button variant="contained" color="primary" component={RouterLink} to="/register" size="large">
              Get Started
            </Button>
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>AI Assistant</Typography>
                  <Typography variant="body2">Get intelligent writing suggestions and overcome writer's block with our AI-powered assistant.</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Story Mapping</Typography>
                  <Typography variant="body2">Visualize and organize your story elements with our intuitive story mapping tool.</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Progress Tracking</Typography>
                  <Typography variant="body2">Set goals and track your writing progress to stay motivated and productive.</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <button onClick={apiTest}>Test API</button>
        </Container>
    </>
  );
}

export default Home;