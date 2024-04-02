import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

import ShareIcon from '@mui/icons-material/Share';
import { Avatar } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, TextField, List, ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip, CssBaseline } from '@mui/material';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';


const CollaboratorComponent = () => {

  //Definition des variables
  let [isEditingCollab, setIsEditingCollab] = useState(false);
  let [isModalOpenCollab, setModalOpenCollab] = useState(false);
  let [editingCollab, setEditingCollab] = useState(null);
  const [emailCollab, setEmailCollab] = useState('');
  const [lastNameCollab, setLastNameCollab] = useState('');
  const [firstNameCollab, setFirstNameCollab] = useState('');
  const [avatarCollab, setAvatarCollab] = useState(null);
  const [positionCollab, setPositionCollab] = useState('');
  let [tempImage, setTempImage] = useState(null);
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  let [isEditing, setIsEditing] = useState(false);
  const [collaborators, setCollaborators] = useState([]);

  const API_URL = 'http://localhost:3001'; // Adresse du serveur
  const socket = io(API_URL); // Se connecter au serveur WebSocket

  const resetEditingCollab = () => {
    setEditingCollab(null);
    setModalOpenCollab(false);
    setEmailCollab(null);
    setAvatarCollab(null);
    setLastNameCollab(null);
    setFirstNameCollab(null);
    setPositionCollab(null);
    setTempImage(null);

  };

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

  const fetchData = async () => {
    try {

      // Effectuer une requête GET pour obtenir la liste des personnes depuis le backend

      const responseCollaborators = await axios.get(`${API_URL}/user/${email}/collaborators`)
      setCollaborators(responseCollaborators.data);

    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('collaboratorAdded', (newCollaborator) => {
      setCollaborators((prevCollaborators) => [...prevCollaborators, newCollaborator]);
    });

  }, []);

  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1] ? name.split(' ')[1][0] : ''}`,
    };
  }

  const handleAvatarChange = (event) => {
    event.preventDefault();
    //console.log(event)

    if (event.target.files && event.target.files[0]) {
      setAvatarCollab(URL.createObjectURL(event.target.files[0]));
      const file = event.target.files[0];
      setTempImage(file);
    }
  };

  const handleAddCollab = async (e) => {

    try {

      // Réinitialisez les champs
      resetEditingCollab();
      //console.log('Image:', tempImage);
      if (tempImage) {
        await onUpload(tempImage);
      }

      if (tempImage) { // Si une nouvelle image a été déposée
        await onUpload(tempImage); // Uploadez l'image
      }

      const onUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {

          const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data', },
          });

          console.log('File uploaded successfully');
        } catch (error) {
          console.error('Erreur lors de l’appel axios:', error);
          if (error.response) {
            // La requête a été faites et le serveur a répondu avec un statut
            // qui est hors de la plage de 2xx

          } else if (error.request) {
            // La requête a été faites mais pas de réponse a été reçue
            console.error('Request data:', error.request);
          } else {
            // Quelque chose s'est produit lors de la configuration de la requête
            console.error('Error message:', error.message);
          }
        } finally {
          console.log('Finally après l’appel axios');
        }
      }

      socket.emit('addCollab', {
        email: emailCollab,
        lastname: lastNameCollab,
        firstname: firstNameCollab,
        position: positionCollab,
        emailGroup: email,
      });

      tempImage(null)
      setModalOpenCollab(false);
    } catch (error) {
      console.error('Error adding/editing Collaborator:', error);
    }
  }

  const handleSubmitCollab = async (e) => {
    e.preventDefault();
  }

  return (
    <>
      {!isModalOpenCollab && (
        <Box sx={{ '& > :not(style)': { m: 1 } }}>
          <Fab color="primary" aria-label="add" onClick={() => { setIsEditingCollab(false); setModalOpenCollab(true); }}>
            <AddIcon />
          </Fab>
        </Box>
      )}

      {isModalOpenCollab && (
        <Modal onClose={resetEditingCollab}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // pour le centrage vertical
            alignItems: 'center',
            height: '100%'
          }}>

            <CssBaseline />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '8vh',
              }}
            >

              <Avatar src={avatarCollab} style={{ backgroundColor: '#f50057', width: 80, height: 80 }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Collaborator
              </Typography>

              <form style={{ width: '100%', marginTop: '1rem' }} onSubmit={handleSubmitCollab}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="E-mail address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={emailCollab}
                  onChange={(e) => setEmailCollab(e.target.value)}
                />

                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="lname"
                  value={lastNameCollab}
                  onChange={(e) => setLastNameCollab(e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="fname"
                  value={firstNameCollab}
                  onChange={(e) => setFirstNameCollab(e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="position"
                  label="Position"
                  name="position"
                  value={positionCollab}
                  onChange={(e) => setPositionCollab(e.target.value)}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <div sx={{ alignItems: 'middle' }}>

                  <label htmlFor="icon-button-file">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      style={{ marginTop: '1rem' }}
                    >
                      <PhotoCamera />

                    </IconButton >
                  </label>

                  <Typography>Upload Avatar</Typography>
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    if (isEditing) {
                      //handleEditCollab(editingProject);
                    } else {
                      handleAddCollab();
                    }
                  }}
                >
                  Save
                </Button>

              </form>
            </div>

          </div>
        </Modal>
      )}
      <div style={{ maxWidth: '600px' }}>
        <List>
          {collaborators.map(collaborator => (
            <ListItem key={collaborator._id}>
              <ListItemAvatar>

                {collaborator.avatar ? (

                  <Avatar src={"./uploads/" + collaborator.avatar} onLoad={() => console.log("Avatar loaded:", collaborator.avatar)} />
                ) : (
                  <Avatar {...stringAvatar(`${collaborator.firstName} ${collaborator.lastName}`)} />
                )}
              </ListItemAvatar>
              <ListItemText
                primary={`${collaborator.firstName} ${collaborator.lastName}`}
                secondary={`${collaborator.position} | ${collaborator.email}`}
              />
              <Tooltip>
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </div>
    </>
  )
}

export default CollaboratorComponent;