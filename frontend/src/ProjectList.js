// Imports
import React, { useState, useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './styles.css';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Rating from '@mui/material/Rating';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, TextField, CardActionArea, CardActions, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Tooltip, CssBaseline } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AvatarGroup from '@mui/material/AvatarGroup';
import AppBar from '@mui/material/AppBar';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GradeIcon from '@mui/icons-material/Grade';
import Container from '@mui/material/Container';

import ShareIcon from '@mui/icons-material/Share';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

import AvatarComponent from './AvatarComponent.js';
import TextAvatarComponent from './TextAvatarComponent.js';

const handelUserExistInProject = (personId, projectId) => {
  return axios
    .get(`${API_URL}/projects/${projectId}/users/${personId}`)
    .then((response) => {
      if (response.data.message) {
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      throw error;
    });
};

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

const API_URL = 'http://localhost:3001';
const socket = io(API_URL); // Connectez-vous au serveur WebSocket
const DEFAULT_IMAGE = "./img/gecko.jpg";

//Afficher la liste de projets
const ProjectList = () => {

  // Définissez un nouvel état pour stocker les données des utilisateurs
  const [userAvatars, setUserAvatars] = useState([]);

  let [projects, setProjects] = useState([]);
  let [editingProject, setEditingProject] = useState(null);
  let [isEditing, setIsEditing] = useState(false);
  let [isEditingCollab, setIsEditingCollab] = useState(false);
  let [tempImage, setTempImage] = useState(null);
  const [listUsers, setListUsers] = useState([]);

  let [isModalOpen, setModalOpen] = useState(false);
  let [isModalOpenCollab, setModalOpenCollab] = useState(false);
  let [editingCollab, setEditingCollab] = useState(null);

  const [collaborators, setCollaborators] = useState([]);
  const [emailCollab, setEmailCollab] = useState('');
  const [lastNameCollab, setLastNameCollab] = useState('');
  const [firstNameCollab, setFirstNameCollab] = useState('');
  const [positionCollab, setPositionCollab] = useState('');
  const [avatarCollab, setAvatarCollab] = useState(null);

  const newProjectNameRef = useRef();
  const newProjectDescriptionRef = useRef();
  const newProjectEnddateRef = useRef();

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [rating, setRating] = useState(0.5); // 0.5 est la valeur par défaut

  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [firstnameuser, setFirstNameUser] = useState(localStorage.getItem('firstnameuser') || '');
  const [lastnameuser, setLastNameUser] = useState(localStorage.getItem('lastnameuser') || '');
  const [avataruser, setAvatarUser] = useState(localStorage.getItem('avataruser') || '');

  const resetEditing = () => {
    setEditingProject(null);
    setModalOpen(false);
  };

  const [value, setValue] = useState(0);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchData();

    // Écoutez l'événement pour les projets ajoutés en temps réel
    socket.on('projectAdded', (newProject) => {
      setProjects((prevProjects) => [...prevProjects, newProject]);
    });

    socket.on('collaboratorAdded', (newCollaborator) => {
      setCollaborators((prevCollaborators) => [...prevCollaborators, newCollaborator]);
    });

    // Écoutez l'événement pour les projets supprimés en temps réel
    socket.on('projectDeleted', (deletedProjectId) => {
      setProjects((prevProjects) => prevProjects.filter((project) => project._id !== deletedProjectId));
    });



    // Écoutez l'événement pour les projets mis à jour en temps réel
    socket.on('projectUpdated', (updatedProject) => {
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? { ...project, title: updatedProject.title } : project
        )
      );
    });

    // Nettoyez les écouteurs d'événements lorsque le composant se démonte
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {

      // Effectuer une requête GET pour obtenir la liste des personnes depuis le backend
      const responseUsers = await axios.get(`${API_URL}/users`)
      setListUsers(responseUsers.data);

      const responseCollaborators = await axios.get(`${API_URL}/user/${email}/collaborators`)
      setCollaborators(responseCollaborators.data);

      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);

      const initialRatings = {};
      response.data.forEach(project => {
        initialRatings[project._id] = project.rating; // Ou peu importe comment la note est stockée dans votre API
      });
      setRating(initialRatings);

    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      try {
        const { data: tasks } = await axios.get(`${API_URL}/projects/${projectId}/tasks`);
        const taskDeletionPromises = tasks.map(task =>
          axios.delete(`${API_URL}/tasks/${task._id}`)
        );
        await Promise.all(taskDeletionPromises);

      } catch (error) {
        if (!error.response || error.response.status !== 404) {
          throw error; // Si ce n'est pas une erreur 404, nous la lançons à nouveau.
        }
        // Si c'est une erreur 404, nous l'ignorons simplement car cela signifie qu'il n'y avait pas de tâches à supprimer.
      }

      // Suppression du projet
      socket.emit('deleteProject', projectId);
      // Mise à jour de l'état pour retirer le projet supprimé de la liste des projets
      setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId));

    } catch (error) {
      console.error('Error deleting project and associated tasks:', error);
    }
  };

  const handleAddProject = useCallback(async () => {
    try {
      resetEditing()

      if (tempImage) {
        await onUpload(tempImage);
      }

      socket.emit('addProject', {
        title: editingProject.title,
        description: editingProject.description,
        enddate: editingProject.enddate,
      });

      // Réinitialisez les champs si nécessaire, mais ne le faites pas ici
      setModalOpen(false);
    } catch (error) {
      console.error('Error adding/editing project:', error);
    }
  }, [editingProject, tempImage]);


  const handleRatingChange = async (projectId, newRating) => {
    try {
      // Mettez à jour l'état local avec la nouvelle note
      setRating(prevState => ({ ...prevState, [projectId]: newRating }));

      // Enregistrez la nouvelle note dans la base de données
      await axios.patch(`${API_URL}/projects/${projectId}/rating`, { rating: newRating });
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  // Modifiez la logique pour ouvrir le modal en mode édition
  const handleEditProject = async (project) => {
    try {

      if (tempImage) { // Si une nouvelle image a été déposée
        await onUpload(tempImage); // Uploadez l'image
      }

      socket.emit('updateProject', {
        _id: project._id,
        title: editingProject.title,
        description: editingProject.description,
        enddate: editingProject.enddate
      });

      setProjects((prevProjects) =>
        prevProjects.map((p) => (p._id === project._id ? { ...project } : p)));

      // Fermeture du modal
      setModalOpen(false);

    } catch (error) {
      console.error('Error updating project:', error);
    }
  }

  const [preview, setPreview] = useState(DEFAULT_IMAGE);


  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setTempImage(file); // stocker temporairement l'image
      setPreview(URL.createObjectURL(file)); // pour montrer un aperçu de l'image
      setEditingProject((prevProject) => ({
        ...prevProject,
        image: file
      }));
    }
  };

  //sans envoi a un serveur 
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };


  // ----------------------- Collaborateurs -----------------------

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

  const handleAvatarChange = (event) => {
    event.preventDefault();
    //console.log(event)

    if (event.target.files && event.target.files[0]) {
      setAvatarCollab(URL.createObjectURL(event.target.files[0]));
      const file = event.target.files[0];
      setTempImage(file);
    }
  };

  const handleSubmitCollab = async (e) => {
    e.preventDefault();
  }

  const handleAddCollab = async (e) => {

    try {

      // Réinitialisez les champs
      resetEditingCollab();
      //console.log('Image:', tempImage);
      if (tempImage) {
        await onUpload(tempImage);
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



  // ----------------------- Fin Collaborateurs -----------------------

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const alignementGauche = {
    display: 'inline-flex',
    flexWrap: 'wrap'
  };

  const handleUserSelect = (personId, projectId) => {

    axios.get(`${API_URL}/projects/${projectId}/users/${personId}`).then(response => {

      if (response.data.message) {
        // Retirer la personne de la liste des personnes sélectionnées
        axios.delete(`${API_URL}/projects/${projectId}/users/${personId}`)
        return false;
      } else {
        // Ajouter la personne à la liste des personnes sélectionnées
        axios.post(`${API_URL}/projects/${projectId}/users/${personId}`)
        return true;
      }
    })
      .catch(error => {
        console.error("Une erreur s'est produite lors de la requête :", error);
      });
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogOut = () => {
    setAnchorEl(null);
    navigate('/');
  };
  const navigate = useNavigate();

  return (

    <div>

      <Box sx={{ width: '100%', textAlignVertical: "center", textAlign: "center" }}>
        <Typography variant="h2" gutterBottom>
          Kanban Geco
        </Typography>
      </Box>


      <AppBar sx={{ '& .MuiTab-root': { color: 'white' } }} position="static" variant="contained">
        <Container maxWidth="xl">
          <Toolbar disableGutters style={{ height: '60px', width: '100%', display: 'flex', alignItems: 'center' }}>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              {/* Format Smartphone */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={

                  handleOpenNavMenu
                }
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem value={0} onClick={() => handleChange(null, 0)} label="List of projects">List of projects</MenuItem>
                <MenuItem value={1} onClick={() => handleChange(null, 1)} label="List of collaborators">List of collaborators</MenuItem>

              </Menu>
              <Typography
                variant="h4"
                width="100%"
                textAlign="center"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                GECO
              </Typography>

            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {/* Format ordinateur */}
              <Typography
                variant="h4"

                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                GECO
              </Typography>
              <Tabs
                value={value}
                indicatorColor="white"
                variant="fullWidth"
                textColor="white"
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                <Tab label="List of projects" value={0} />
                <Tab label="List of collaborators" value={1} />
              </Tabs>

            </Box>
            <IconButton
              onClick={handleMenu}
            >
              <Box sx={{ flexGrow: 0 }}>
                {/* Tous Formats */}

                {avataruser ? (

                  <Avatar src={"./uploads/" + avataruser} onLoad={() => console.log("Avatar loaded:", avataruser)} />
                ) : (
                  <Avatar {...stringAvatar(`${firstnameuser} ${lastnameuser}`)} />
                )}

                {/* <Avatar src={avataruser} /> */}
              </Box>
            </IconButton>
            <Menu
              sx={{ mt: '51px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogOut}>Logout</MenuItem>
              {/* <MenuItem onClick={handleClose}>My account</MenuItem> */}
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
      <br></br>

      {value === 0 && (<div>

        {!isModalOpen && (
          <Box sx={{ '& > :not(style)': { m: 1 } }}>
            <Fab color="primary" aria-label="add" onClick={() => { setIsEditing(false); setModalOpen(true); }}>
              <AddIcon />
            </Fab>
          </Box>
        )}

        {isModalOpen && (
          <Modal onClose={resetEditing}>

            <div>
              <Typography variant="caption" display="block" gutterBottom>
                Drag the image of your project here
              </Typography>
              <div
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
                style={{ width: '300px', height: '170px', position: 'relative' }}
              >
                <img
                  src={preview}
                  alt="Uploaded preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

              </div>
              <Box
                component="form"
                sx={{
                  '& .MuiTextField-root': { m: 1, width: '34ch' },
                }}
                noValidate
                autoComplete="off"
              >
                <TextField
                  id="standard-basic"
                  variant="standard"
                  label="Project Name"
                  type="text"
                  value={editingProject ? editingProject.title : ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      title: e.target.value,
                    })
                  }
                  inputRef={newProjectNameRef}
                />
              </Box>
              <Box
                component="form"
                sx={{
                  '& .MuiTextField-root': { m: 1, width: '34ch' },
                }}
                noValidate
                autoComplete="off"
              >
                <TextField
                  id="outlined-multiline-flexible"
                  label="Description"
                  variant="standard"
                  value={editingProject ? editingProject.description : ''}
                  multiline
                  maxRows={4}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: e.target.value,
                    })
                  }
                  inputRef={newProjectDescriptionRef}
                />
              </Box>
              <div><br></br>
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                  >
                  Participants
                </Typography>

                <AvatarGroup sx={alignementGauche}>
                  {/* Afficher les avatars de toutes les utilisateurs */}
                  {listUsers.map((person) => {
                    return (
                      person.avatar ? (
                        <AvatarComponent
                          key={person._id}
                          person={person}
                          editingProject={editingProject}
                          selectedUsers={selectedUsers}
                          handleUserSelect={handleUserSelect}
                        />
                      ) : (
                        <TextAvatarComponent
                          key={person._id}
                          person={person}
                          editingProject={editingProject}
                          selectedUsers={selectedUsers}
                          handleUserSelect={handleUserSelect}
                        />
                      )
                    );
                  })}
                </AvatarGroup>
              </div>

              <br></br>
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs} component="div">
                  <DatePicker
                    value={
                      (editingProject && editingProject.enddate && editingProject.enddate instanceof dayjs)
                        ? editingProject.enddate // utilise tel quel s'il s'agit déjà d'une instance de dayjs
                        : editingProject && editingProject.enddate
                          ? dayjs(editingProject.enddate) // convertit en instance de dayjs si ce n'est pas déjà une
                          : null // ou une autre valeur par défaut si non existant
                    }
                    onChange={(date) =>
                      setEditingProject({
                        ...editingProject,
                        enddate: date
                      })
                    }
                    inputRef={newProjectEnddateRef}
                  />

                </LocalizationProvider>
              </div>
              <br></br>
              <Button
                variant="contained"
                onClick={() => {

                  if (isEditing) {
                    //const loadedUsers = loadSelectedUsers(editingProject._id);
                    //setSelectedUsers(loadedUsers);
                    handleEditProject(editingProject);
                  } else {
                    handleAddProject();
                  }
                }}
              >
                {isEditing ? 'Update Project' : 'Add Project'}
              </Button>

            </div>
          </Modal>
        )}

        <div className="card-container">
          {projects.map((project, index) => {
            return (
              <div className="card" key={project._id}>
                <Card sx={{ maxWidth: 345 }} component="div">
                  <CardActionArea component="div">
                    <Link to={`/projects/${project._id}`}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={project.image ? "./uploads/" + project.image : "./img/gecko.jpg"}
                        alt="green iguana"
                      />
                    </Link>
                    <CardContent component="div">
                      <Typography gutterBottom variant="h5" component="div">
                        {project.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {project.description}

                        {!isModalOpen && (
                          <Box sx={{ '& > :not(style)': { m: 1 } }}>
                            <Fab size="small" color="primary" aria-label="edit" onClick={() => {
                              setEditingProject(project);
                              setIsEditing(true);
                              setModalOpen(true);
                            }}>
                              <EditIcon />
                            </Fab>
                          </Box>
                        )}

                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <div className="button-container">
                      <div className="button-flex">
                        <Box
                          sx={{
                            '& > legend': { mt: 2 },
                          }}
                        >
                          <Rating name="no-value"

                            value={rating[project._id] || 0}
                            onChange={(event, newRating) => handleRatingChange(project._id, newRating)}
                            getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`}
                            precision={0.5}
                            icon={<GradeIcon fontSize="inherit" />}
                            emptyIcon={<GradeIcon fontSize="inherit" />}
                          />
                        </Box>
                        <Box component="div">
                          <Typography display="block">
                            {Date.parse(project.enddate) ? new Date(project.enddate).toLocaleDateString() : 'No End Date'}
                          </Typography>
                        </Box>
                        <div
                          //role="button"
                          aria-label="Delete"
                          onClick={() => handleDeleteProject(project._id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <DeleteOutlineIcon />
                        </div>
                      </div>
                    </div>
                  </CardActions>
                </Card>
              </div>
            );
          })}
        </div>
      </div>)};

      {value === 1 && (<div>

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
      </div>)}
    </div>
  );

};

export default ProjectList;
export { handelUserExistInProject };
export { stringAvatar };
