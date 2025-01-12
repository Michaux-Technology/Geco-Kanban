import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Avatar, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { API_URL } from './config';

function FirstUserCreate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const navigate = useNavigate();
  
  const socket = io(API_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  });

  useEffect(() => {
    socket.on('CollaboratorAdded', () => {
      alert('User created successfully! Please log in.');
      window.location.reload();
    });

    socket.on('connect_error', (error) => {
      console.log('Connection Error:', error);
      socket.connect();
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('addCollab', {
      email,
      lastname: lastName,
      firstname: firstName,
      position: 'Admin',
      company,
      password,
      avatar: ""
    });
  };

  return (
    <Container component="main" maxWidth="xs">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '8vh'
      }}>
        <Avatar style={{ backgroundColor: '#f50057' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Create First Admin User
        </Typography>
        <form style={{ width: '100%', marginTop: '1rem' }} onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginTop: '1rem' }}
          >
            Create Admin User
          </Button>
        </form>
      </div>
    </Container>
  );
}

export default FirstUserCreate;
