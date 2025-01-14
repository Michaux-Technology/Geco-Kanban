import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import axios from 'axios'
import { API_URL } from './config';

import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShareIcon from '@mui/icons-material/Share'
import { Avatar } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, TextField, List, ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhotoCamera from '@mui/icons-material/PhotoCamera'

import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';

import GanttChart from './Gantt';

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
  const [errorMessage, setErrorMessage] = useState('');

  const [isGanttModalOpen, setIsGanttModalOpen] = useState(false);
  const [selectedUserTasks, setSelectedUserTasks] = useState([]);

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

  const [companyuser, setCompanyUser] = useState(localStorage.getItem('companyuser') || '')

  const resetEditingCollab = () => {
    resetErrorMessage()
    setEditingCollab(null)
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

  const handleChange = () => {
    setEmailCollab(emailRef.current.value);
    setFirstNameCollab(firstNameRef.current.value);
    setLastNameCollab(lastNameRef.current.value);
    setPositionCollab(positionRef.current.value);
  };

  const [tempLastName, setTempLastName] = useState("");
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempPosition, setTempPosition] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "lastName") {
      setTempLastName(value);
    } else if (name === "firstName") {
      setTempFirstName(value);
    } else if (name === "position") {
      setTempPosition(value);
    }
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

  }, [])

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
    //console.log(event)

    if (event.target.files && event.target.files[0]) {
      setAvatarCollab(URL.createObjectURL(event.target.files[0]))
      const file = event.target.files[0]
      setTempImage(file)
    }
  };

  const onUpload = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', },
      })

      //console.log('File uploaded successfully')
    } catch (error) {
      console.error('Erreur lors de l’appel axios:', error)
      if (error.response) {
        // La requête a été faites et le serveur a répondu avec un statut
        // qui est hors de la plage de 2xx

      } else if (error.request) {
        // La requête a été faites mais pas de réponse a été reçue
        console.error('Request data:', error.request)
      } else {
        // Quelque chose s'est produit lors de la configuration de la requête
        console.error('Error message:', error.message)
      }
    } finally {
      console.log('Finally après l’appel axios');
    }
  }

  // Add this function to handle opening the Gantt modal
  const handleOpenGanttModal = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/tasks`);
      setSelectedUserTasks(response.data);
      setIsGanttModalOpen(true);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
    }
  };

  // function to generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddCollab = async (e) => {
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
    resetErrorMessage()
    e.preventDefault()
  }

  const [layout, setLayout] = React.useState(undefined);

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

  return (
    <>
      {!isModalOpenCollab
        && (

          <Box sx={{ '& > :not(style)': { m: 1 } }}>
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => { setIsEditingCollab(false); setModalOpenCollab(true); setLayout('center'); }}>
              <AddIcon />
            </Fab>
          </Box>
        )
      }

      {isModalOpenCollab && (

        <Modal
          open={!!layout}
          id='modalCollab'
          onClose={resetEditingCollab}>

          <ModalDialog>
            <div style={{
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px',
              width: '500px',
              height: '700px',
            }}
            >

              <ModalClose
                onClick={() => setModalOpenCollab(false)}
              />

              <div
                style={
                  {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '8vh',
                  }
                }
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
                    label="Last Name"
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
                    label="First Name"
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
                    label="Position"
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
                      } else {
                        handleAddCollab()
                      }
                    }}
                  >
                    Save
                  </Button>
                </form>
              </div>
            </div>
          </ModalDialog>
        </Modal>
      )
      }


      <Modal open={isGanttModalOpen} onClose={() => setIsGanttModalOpen(false)}>
        <ModalDialog>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            width: '90vw',
            height: '80vh',
            maxWidth: '1200px'
          }}>
            <ModalClose onClick={() => setIsGanttModalOpen(false)} />
            <Typography variant="h6" style={{ marginBottom: '20px' }}>
              User Tasks Timeline
            </Typography>
            <GanttChart tasks={selectedUserTasks} />
          </div>
        </ModalDialog>
      </Modal>

      {showPasswordModal && (
        <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
          <ModalDialog>
            <div style={{
              padding: '20px',
              textAlign: 'center'
            }}>
              <Typography variant="h6" style={{ marginBottom: '20px' }}>
                New Collaborator Created Successfully
              </Typography>
              <Typography style={{ color: '#4CAF50', fontSize: '18px', fontWeight: 'bold' }}>
                Generated Password: {generatedPassword}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '20px' }}
                onClick={() => setShowPasswordModal(false)}
              >
                Close
              </Button>
            </div>
          </ModalDialog>
        </Modal>
      )}

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