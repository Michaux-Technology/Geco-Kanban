import React, { useState } from 'react';
import io from 'socket.io-client'
import axios from 'axios'

import ShareIcon from '@mui/icons-material/Share'
import { Avatar } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, TextField, List, ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip, CssBaseline } from '@mui/material';

import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
//import Modal from '@mui/material/Modal';

const CollaboratorComponent = () => {
  //declaration des variables
  const [isModalOpen, setModalOpen] = useState(false);
  const [emailCollab, setEmailCollab] = useState('');

  const Modal = React.memo(({ onClose, children }) => {
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          {children}
        </div>
      </div>
    );
  });

  const handleEmailChange = (e) => {
    setEmailCollab(e.target.value);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <Box sx={{ '& > :not(style)': { m: 1 } }}>
        <Fab color="primary" aria-label="add" onClick={handleModalOpen}>
          <AddIcon />
        </Fab>
      </Box>

      <Modal open={isModalOpen} onClose={handleModalClose}>
      <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // pour le centrage vertical
            alignItems: 'center',
            height: '100%'
          }}
          >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-mail address"
            name="email"
            autoComplete="email"
            value={emailCollab}
            onChange={handleEmailChange}
            autoFocus // Ajout de l'attribut autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};

export default CollaboratorComponent;