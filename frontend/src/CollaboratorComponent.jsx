import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import axios from 'axios'
import { API_URL } from './config';

import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import VideocamIcon from '@mui/icons-material/Videocam';
import Checkbox from '@mui/material/Checkbox';
import SendIcon from '@mui/icons-material/Send';

import { Avatar } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, TextField, List, ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip, Modal } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import CloseIcon from '@mui/icons-material/Close';

import GanttChart from './Gantt';

const CollaboratorComponent = () => {

  // Variables utilisées dans le composant
  const [isModalOpenCollab, setModalOpenCollab] = useState(false);
  const [emailCollab, setEmailCollab] = useState('');
  const [lastNameCollab, setLastNameCollab] = useState('');
  const [firstNameCollab, setFirstNameCollab] = useState('');
  const [avatarCollab, setAvatarCollab] = useState(null);
  const [positionCollab, setPositionCollab] = useState('');
  let [tempImage, setTempImage] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false);
  const [selectedUserTasks, setSelectedUserTasks] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [meetingNameModal, setMeetingNameModal] = useState({ open: false, name: '' });

  const socket = io(API_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  });

  // Add error handling
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

  const [companyuser] = useState(localStorage.getItem('companyuser') || '')

  const resetEditingCollab = () => {
    resetErrorMessage()
    setModalOpenCollab(false)
    setEmailCollab(null)
    setAvatarCollab(null)
    setLastNameCollab(null)
    setFirstNameCollab(null)
    setPositionCollab(null)
    setTempImage(null)
  }

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [activeMeetingsModal, setActiveMeetingsModal] = useState({ open: false });
  const [activeMeetings, setActiveMeetings] = useState([]);

  const emailRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const positionRef = useRef();

  const fetchData = async () => {
    try {
      // Effectuer une requête GET pour obtenir la liste des personnes depuis le backend
      const responseCollaborators = await axios.get(`${API_URL}/users`)
      setCollaborators(responseCollaborators.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  };

  const resetErrorMessage = () => {
    setErrorMessage('');
  };

  useEffect(() => {
    fetchData();

    // Écoutez l'événement pour les projets ajoutés en temps réel
    socket.on('CollaboratorAdded', (newUser) => {
      setCollaborators((prevCollaborators) => [...prevCollaborators, newUser]);
    });

    // Écoutez l'événement pour les projets supprimés en temps réel
    socket.on('userDeleted', (deletedUserId) => {
      setCollaborators((prevCollaborators) => prevCollaborators.filter((collaborator) => collaborator._id !== deletedUserId));
    });

    // Écoutez l'événement pour les collaborateurs mis à jour en temps réel
    socket.on('userUpdated', (updatedUser) => {
      setCollaborators((prevCollaborators) =>
        prevCollaborators.map((collaborator) =>
          collaborator._id === updatedUser._id ? { ...collaborator, title: updatedUser.title, description: updatedUser.description, enddate: updatedUser.enddate } : collaborator
        )
      );
    });

    return () => {
      resetErrorMessage()
      socket.disconnect();
    };
  }, [socket])

  function stringToColor(string) {
    let hash = 0
    let i

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#'

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color
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

    if (event.target.files && event.target.files[0]) {
      setAvatarCollab(URL.createObjectURL(event.target.files[0]))
      const file = event.target.files[0]
      setTempImage(file)
    }
  };

  const handleOpenGanttModal = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/tasks`);
      setSelectedUserTasks(response.data);
      setIsGanttModalOpen(true);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddCollab = async () => {
    try {
      resetErrorMessage();
      const randomPassword = generateRandomPassword();
      setGeneratedPassword(randomPassword);

      let avatarPath = null;

      if (tempImage) {
        const formData = new FormData();
        formData.append('avatar', tempImage);

        const response = await axios.post(`${API_URL}/upload/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarPath = `${response.data.path}`;
      }

      console.log('Avatar Path:', avatarPath);

      socket.emit('addCollab', {
        email: emailCollab,
        lastname: lastNameCollab,
        firstname: firstNameCollab,
        position: positionCollab,
        company: companyuser,
        password: randomPassword,
        avatar: avatarPath
      });

      setTempImage(null);
      setModalOpenCollab(false);
      setShowPasswordModal(true);
      fetchData();

    } catch (error) {
      console.error('Error adding/editing Collaborator:', error);
    }
  };


  const handleSubmitCollab = async (e) => {
    e.preventDefault();
    handleAddCollab();
  };

  const handleDeleteCollab = async (collabId) => {
    try {
      console.log('ErrorMessage');

      // Effectuer une requête GET pour obtenir la liste des projectUsers depuis le backend
      const responseProjectUsers = await axios.get(`${API_URL}/projectUsers`);
      const projectUsers = responseProjectUsers.data;

      // Vérifier si le collabId se trouve dans la liste des userId des projectUsers
      const isCollabInProjects = projectUsers.some((projectUser) => projectUser.userId === collabId);

      if (isCollabInProjects) {
        setErrorMessage("The collaborator exists in a project and cannot be deleted.");
      } else {
        setErrorMessage('');
        // Effectuer une requête DELETE pour supprimer le collaborateur du backend
        await axios.delete(`${API_URL}/users/${collabId}`);

        fetchData();

        socket.emit('deleteUser', collabId);
      }
    } catch (error) {
      console.error('Error deleting Collaborator:', error);
    }
  };

  const handleEditCollab = (collabId) => {
    // Redirection vers la page /AccountEdit avec l'envoi de l'ID du collaborateur
    window.location.href = `/AccountEdit?id=${collabId}`;
  };

  const handleStartVideoConference = () => {
    setMeetingNameModal({ open: true, name: '' });
  };

  const startMeetingWithName = async () => {
    const currentUserId = localStorage.getItem('userId');
    const allParticipants = [...selectedUsers, currentUserId];
    const roomId = `room-${Date.now()}`;

    try {
      // Create meeting in database
      await axios.post(`${API_URL}/meetings`, {
        roomId,
        name: meetingNameModal.name,
        participants: allParticipants,
        createdBy: currentUserId,
        createdAt: new Date(),
        active: true
      });

      socket.emit('initiateVideoConference', {
        participants: allParticipants,
        roomId: roomId,
        meetingName: meetingNameModal.name
      });

    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const fetchActiveMeetings = async () => {
    const currentUserId = localStorage.getItem('id'); // Changed from 'userId' to 'id'
    try {
      const response = await axios.get(`${API_URL}/meetings/user/${currentUserId}`);
      setActiveMeetings(response.data);
    } catch (error) {
      console.error('Error fetching active meetings:', error);
    }
  };

  const handleOpenActiveMeetings = () => {
    fetchActiveMeetings();
    setActiveMeetingsModal({ open: true });
  };

  return (
    <>

      {!isModalOpenCollab
        && (
          <Box sx={{ '& > :not(style)': { m: 1 } }}>
            <Tooltip title="Ajouter un utilisateur">
              <Fab
                color="primary"
                aria-label="add"
                onClick={() => { setModalOpenCollab(true); }}>
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        )
      }

      <Box sx={{
        position: 'fixed',
        bottom: 30, // Increased from 16 to 80 to place above notifications
        right: 16,
        display: 'flex',
        gap: 2,
        zIndex: 1000 // Add zIndex to ensure buttons stay on top
      }}>

        <Tooltip title="join a meeting">
          <Fab color="primary" onClick={handleOpenActiveMeetings}>
            <VideocamIcon />
          </Fab>
        </Tooltip>

        <Tooltip title="invite to a meeting">
          <span>
            <Fab
              color="secondary"
              disabled={selectedUsers.length === 0}
              onClick={handleStartVideoConference}
            >
              <SendIcon />
            </Fab>
          </span>
        </Tooltip>

      </Box>

      {isModalOpenCollab && (
        <Modal
          open={isModalOpenCollab}
          onClose={resetEditingCollab}
          aria-labelledby="modal-collaborator"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <IconButton
              aria-label="close"
              onClick={resetEditingCollab}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 4
            }}>
              <Avatar src={avatarCollab} sx={{ bgcolor: '#f50057', width: 80, height: 80 }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
                Collaborateur
              </Typography>

              <Box component="form" sx={{ width: '100%', mt: 2 }} onSubmit={handleSubmitCollab}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Adresse e-mail"
                  name="email"
                  autoComplete="email"
                  value={emailCollab || ""}
                  onChange={(e) => setEmailCollab(e.target.value)}
                  inputRef={emailRef}
                  autoFocus
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Nom"
                  name="lastName"
                  autoComplete="lname"
                  value={lastNameCollab || ""}
                  inputRef={lastNameRef}
                  onChange={(e) => setLastNameCollab(e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="Prénom"
                  name="firstName"
                  autoComplete="fname"
                  value={firstNameCollab || ""}
                  inputRef={firstNameRef}
                  onChange={(e) => setFirstNameCollab(e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="position"
                  label="Poste"
                  name="position"
                  value={positionCollab || ""}
                  inputRef={positionRef}
                  onChange={(e) => setPositionCollab(e.target.value)}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <label htmlFor="icon-button-file">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                    >
                      <PhotoCamera />
                    </IconButton>
                  </label>
                  <Typography>Upload an avatar</Typography>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    handleAddCollab()
                  }}
                >
                  Enregistrer
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}


      <Modal open={isGanttModalOpen} onClose={() => setIsGanttModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          width: '90vw',
          height: '80vh',
          maxWidth: '1200px'
        }}>
          <IconButton
            aria-label="close"
            onClick={() => setIsGanttModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mb: 2 }}>
          User task timeline
          </Typography>
          <GanttChart tasks={selectedUserTasks} />
        </Box>
      </Modal>

      <Modal open={activeMeetingsModal.open} 
             onClose={() => setActiveMeetingsModal({ open: false })}
             aria-labelledby="active-meetings-modal"
             aria-describedby="active-meetings-list">
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <IconButton
            aria-label="close"
            onClick={() => setActiveMeetingsModal({ open: false })}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" sx={{ 
            mb: 3,
            fontWeight: 'bold',
            color: '#1976d2'
          }}>
            Active Meetings
          </Typography>
          <List>
            {activeMeetings.map((meeting) => (
              <ListItem 
                key={meeting._id}
                button
                onClick={() => {
                  window.location.href = `/video-conference?room=${meeting.roomId}`;
                }}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    <VideocamIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                      {meeting.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Created on: {new Date(meeting.createdAt).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>

      {showPasswordModal && (
        <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: '300px',
            textAlign: 'center'
          }}>
            <IconButton
              aria-label="close"
              onClick={() => setShowPasswordModal(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mb: 2 }}>
            New employee successfully created
            </Typography>
            <Typography sx={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold', mb: 2 }}>
            Password generated: {generatedPassword}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowPasswordModal(false)}
            >
              Close
            </Button>
          </Box>
        </Modal>
      )}


      <Modal open={meetingNameModal.open} onClose={() => setMeetingNameModal({ ...meetingNameModal, open: false })}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: '400px',
          textAlign: 'center'
        }}>
          <IconButton
            aria-label="close"
            onClick={() => setMeetingNameModal({ ...meetingNameModal, open: false })}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mb: 2 }}>
          Meeting name
          </Typography>
          <TextField
            fullWidth
            value={meetingNameModal.name}
            onChange={(e) => setMeetingNameModal({ ...meetingNameModal, name: e.target.value })}
            placeholder="Nom de la réunion"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              startMeetingWithName();
              setMeetingNameModal({ open: false, name: '' });
            }}
            disabled={!meetingNameModal.name}
          >
            Save
          </Button>
        </Box>
      </Modal>

      <div style={{ maxWidth: '600px' }}>

        <List>
          <p style={{ marginLeft: "20px", marginRight: "20px" }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'red' }}>
              {errorMessage}
            </span>
          </p>
          {collaborators && collaborators.map(collaborator => (
            <ListItem key={collaborator._id}>

              <ListItemAvatar>

                {collaborator.avatar ? (

                  <Avatar src={collaborator.avatar} />
                ) : (
                  <Avatar
                    {...stringAvatar(`${collaborator.firstName} ${collaborator.lastName}`)}
                    key={collaborator._id}
                  />
                )}
              </ListItemAvatar>
              <ListItemText
                primary={`${collaborator.firstName} ${collaborator.lastName}`}
                secondary={`${collaborator.position} | ${collaborator.email}`}
              />
              <Tooltip>
                <div style={{ display: "grid", gridAutoFlow: "column", gridGap: "8px" }}>
                  <IconButton onClick={() => handleEditCollab(collaborator._id)}>
                    <EditNoteIcon />
                  </IconButton>
                  <IconButton aria-label="delete"
                    onClick={() => handleDeleteCollab(collaborator._id)}>
                    <DeleteOutlineIcon />
                  </IconButton>

                  <IconButton onClick={() => handleOpenGanttModal(collaborator._id)}>
                    <TimelineIcon />
                  </IconButton>
                  <Checkbox
                    checked={selectedUsers.includes(collaborator._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, collaborator._id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== collaborator._id));
                      }
                    }}
                  />

                </div>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </div>

    </>
  )
}

export default CollaboratorComponent;

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban