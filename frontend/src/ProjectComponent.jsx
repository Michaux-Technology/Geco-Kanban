import React, { useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import { API_URL } from './config';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, TextField } from '@mui/material';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import GradeIcon from '@mui/icons-material/Grade';
import { CardActionArea, CardActions } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EditIcon from '@mui/icons-material/Edit';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

//Components
import AvatarComponent from './AvatarComponent';
import TextAvatarComponent from './TextAvatarComponent';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';


const ProjectComponent = () => {


    // Declaration des variables
    let [isModalOpen, setModalOpen] = useState(false);

    let [editingProject, setEditingProject] = useState(null);
    let [isEditing, setIsEditing] = useState(false);
    //let [isUserFromDB, setIsUserFromDB] = useState(false);

    let [tempImage, setTempImage] = useState(null);
    const DEFAULT_IMAGE = "./img/gecko.jpg";
    const [preview, setPreview] = useState(DEFAULT_IMAGE);

    const [listUsers, setListUsers] = useState([]);
    const [listUsersProject, setListUsersProject] = useState([]);

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUsersProject, setSelectedUsersProject] = useState([]);
    let updatedSelectedUsers = [];

    let [projects, setProjects] = useState([]);

    const [rating, setRating] = useState(0.5); // 0.5 est la valeur par défaut

    const socket = io(API_URL); // Connectez-vous au serveur WebSocket

    const alignementGauche = {
        display: 'inline-flex',
        flexWrap: 'wrap'
    };

    const fetchData = async () => {
        try {
            // Effectuer une requête GET pour obtenir la liste des personnes depuis le backend
            const responseUsers = await axios.get(`${API_URL}/users`)
            setListUsers(responseUsers.data);

            // Recherche d'utilisateur(s) affecté(s) à un projet
            const responseUsersProject = await axios.get(`${API_URL}/projectusers`);
            setListUsersProject(responseUsersProject.data.map(userProject => {
                const matchingUser = responseUsers.data.find(user => user._id === userProject.userId);
                return {
                    ...userProject,
                    avatar: matchingUser ? matchingUser.avatar : null,
                    firstName: matchingUser ? matchingUser.firstName : null,
                    lastName: matchingUser ? matchingUser.lastName : null,
                    // Ajoutez d'autres champs de responseUsers.data que vous souhaitez insérer ici
                };
            }));

            console.log("avatarNonVisible", listUsersProject)

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

    useEffect(() => {
        fetchData();

        // Écoutez l'événement pour les projets ajoutés en temps réel
        socket.on('projectAdded', (newProject) => {
            setProjects((prevProjects) => [...prevProjects, newProject]);
        });

        // Écoutez l'événement pour les projets supprimés en temps réel
        socket.on('projectDeleted', (deletedProjectId) => {
            setProjects((prevProjects) => prevProjects.filter((project) => project._id !== deletedProjectId));
        });

        // Écoutez l'événement pour les utilisateurs dans un projet

        socket.on('projectusers', (responseUsersProject) => {
            console.log(responseUsersProject);
            setListUsersProject(responseUsersProject.data);
        });

        // Écoutez l'événement pour l'ajout d'un utilisateur au projet
        socket.on('userAdded', (userProject) => {
            setListUsersProject(prevListUsersProject => [...prevListUsersProject, userProject]);
        });

        // // Écoutez l'événement pour la suppression d'un utilisateur du projet
        socket.on('userRemoved', (userId) => {
            setListUsersProject(prevListUsersProject => prevListUsersProject.filter(userProject => userProject.userId !== userId));
        });

        // Écoutez l'événement pour les projets mis à jour en temps réel
        socket.on('projectUpdated', (updatedProject) => {
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                    project._id === updatedProject._id ? { ...project, title: updatedProject.title, description: updatedProject.description, enddate: updatedProject.enddate } : project
                )
            );
        });

        // Écoutez l'événement Rating en temps réel
        socket.on('ratingUpdated', (updatedRating) => {
            setProjects((prevRating) =>
                prevRating.map((rate) =>
                    rating._id === updatedRating._id ? { ...rate, rating: updatedRating.rating } : rate
                )
            );
        });


        // Nettoyez les écouteurs d'événements lorsque le composant se démonte
        return () => {
            socket.disconnect();
        };
    }, []);

    const resetEditing = () => {
        setEditingProject(null);
        setModalOpen(false);
        setSelectedUsers([]);
        setSelectedUsersProject([]);
        setIsEditing(false);
        setTempImage(null)
    };

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

    const UpdateUserSelect = async (selectedUsers, project) => {

        try {

            const response = await axios.get(`${API_URL}/projects/${project._id}/users`);
            const projectUsers = response.data.users;

            // Supprimer les utilisateurs qui ne sont pas dans la liste selectedUsers mais qui appartiennent au projet

            const usersToDelete = projectUsers.filter(user =>
                projectUsers.includes(user) && !selectedUsers.some(person => person._id === user.userId)
            );

            for (const user of usersToDelete) {
                console.log("DELETE");
                //console.log("selectedUsers", selectedUsers);

                await axios.delete(`${API_URL}/projects/${project._id}/users/${user.userId}`);
            }

            // Ajouter les utilisateurs de la liste selectedUsers qui n'appartiennent pas encore au projet
            for (const person of selectedUsers) {
                //console.log(project._id, "/", person._id)
                const response = await axios.get(`${API_URL}/projects/${project._id}/users/${person._id}`);
                const userExists = response.data.exists;

                //Si n'exite pas dans la db pas alors ajouter
                if (!userExists && person._id) {
                    console.log("ADD")
                    await axios.post(`${API_URL}/projects/${project._id}/users/${person._id}`);

                    socket.on('userProjectAdded', (person) => {
                        setListUsersProject(prevListUsersProject => [...prevListUsersProject, person]);
                    });
                }

                // Mettre à jour la liste des avatars
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Modifiez la logique pour ouvrir le modal en mode édition
    const handleEditProject = useCallback(async (project) => {
        try {
            //Mise a jour des utilisateurs affecté au projet
            UpdateUserSelect(selectedUsers, project)

            if (tempImage) { // Si une nouvelle image a été déposée
                await onUpload(tempImage); // Uploadez l'image
            }

            //await new Promise((resolve, reject) => {
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
    }, [selectedUsers, tempImage, onUpload, editingProject, setProjects, fetchData, socket]);

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
    }, [socket, editingProject, tempImage]);

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

    const handelUserExistInProject = useCallback((personId, projectId) => {
        return axios
            .get(`${API_URL}/projects/${projectId}/users/${personId}`)
            .then((response) => {

                // Vérifier si l'utilisateur existe dans la base de données et s'il est sélectionné
                if (response.data.userId === personId && response.data.isSelected) {
                    setSelectedUsers(prevSelectedUsers => {
                        // Vérifier si prevSelectedUsers est un tableau
                        if (Array.isArray(prevSelectedUsers)) {
                            const isUserIdPresent = prevSelectedUsers.some(user => user._id === personId);
                            if (!isUserIdPresent) {
                                const updatedSelectedUsers = [...prevSelectedUsers, { ...response.data, _id: response.data.userId }];
                                return updatedSelectedUsers;
                            }
                        }
                        return prevSelectedUsers;
                    });
                }
            })
            .catch((error) => {
                throw error;
            });
    }, []); // Ajoutez ici les dépendances nécessaires pour la fonction memoized

    //renvoie le click de l'Avatar
    const handleAvatarClickOn = useCallback((person) => {

        //AJOUT ou SUPPRESSION un point vert sur l'icone du participant au projet

        if (updatedSelectedUsers.some(user => String(user._id) === String(person._id))) {

            console.log('DELETE');

            setSelectedUsers(prevSelectedUsers => {
                updatedSelectedUsers = prevSelectedUsers.filter(user => user._id !== person._id);
                return updatedSelectedUsers;
            });

        } else {
            console.log('ADD');

            setSelectedUsers(prevSelectedUsers => {
                updatedSelectedUsers = Array.isArray(prevSelectedUsers) ? [...prevSelectedUsers, person] : [person];
                return updatedSelectedUsers;
            });

            setSelectedUsersProject(prevSelectedUsersProject => [...prevSelectedUsersProject, person._id]);
        }


    }, []);

    const [layout, setLayout] = React.useState(undefined);

    function stringAvatar(name) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1] ? name.split(' ')[1][0] : ''}`,
        };
    }

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


    return (
        <>
            {!isModalOpen && (
                <Box sx={{ '& > :not(style)': { m: 1 } }}>
                    <Fab color="primary"
                        aria-label="add"
                        onClick={() => { setIsEditing(false); setModalOpen(true); setLayout('center'); }}>
                        <AddIcon />
                    </Fab>
                </Box>
            )}

            {isModalOpen && (
                <Modal
                    open={!!layout}
                    onClose={resetEditing}
                >
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
                            <ModalClose onClick={() => setModalOpen(false)} />

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
                                    onChange={(e) =>
                                        setEditingProject({
                                            ...editingProject,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </Box>

                            <Typography
                                variant="caption"
                                display="block"
                                gutterBottom
                            >
                                Participants
                            </Typography>

                            {/* Liste des avatars en modification ou en creation */}
                            <AvatarGroup max={100}
                                sx={alignementGauche}>
                                {/* Afficher les avatars de toutes les utilisateurs */}
                                {listUsers.map((person) => {
                                    return (
                                        person.avatar ? (
                                            <AvatarComponent
                                                key={person._id}
                                                person={person}
                                                handleAvatarClickOnChild={handleAvatarClickOn}
                                                editingProject={editingProject}
                                                selectedUsers={selectedUsers}
                                                handelUserExistInProject={handelUserExistInProject}
                                            //addGreenBotton={addGreenBotton}

                                            />
                                        ) : (
                                            // Afficher les utilisateurs qui n'ont pas d'avatar
                                            <TextAvatarComponent
                                                key={person._id}
                                                person={person}
                                                handleAvatarClickOnChild={handleAvatarClickOn}
                                                editingProject={editingProject}
                                                selectedUsers={selectedUsers}
                                                handelUserExistInProject={handelUserExistInProject}
                                            />
                                        )
                                    );
                                })}
                            </AvatarGroup>

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
                                    />

                                </LocalizationProvider>
                            </div>
                            <br></br>
                            <Button
                                variant="contained"
                                onClick={() => {

                                    if (isEditing) {
                                        handleEditProject(editingProject);
                                    } else {
                                        handleAddProject();
                                    }
                                }}
                            >
                                {isEditing ? 'Update Project' : 'Add Project'}
                            </Button>

                        </div>
                    </ModalDialog>
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
                                                <div>
                                                    {/* Liste des projets avec affichage des avatars */}

                                                    <AvatarGroup max={100}>
                                                        {listUsersProject.map(userProject => {
                                                            return (
                                                                userProject.projectId === project._id && (
                                                                    userProject.avatar ? (
                                                                        <Avatar
                                                                            key={userProject._id}
                                                                            src={`./uploads/${userProject.avatar}`}
                                                                            alt={userProject.name}
                                                                        />
                                                                    ) : (
                                                                        <Avatar
                                                                            key={userProject._id}
                                                                            {...stringAvatar(`${userProject.firstName} ${userProject.lastName}`)}
                                                                            alt={userProject.name}
                                                                        />
                                                                    )
                                                                )
                                                            );
                                                        })}
                                                    </AvatarGroup>

                                                    <Box sx={{ '& > :not(style)': { m: 1 } }}>
                                                        <Fab size="small" color="primary" aria-label="edit"
                                                            onClick={() => {
                                                                setEditingProject(project);
                                                                setIsEditing(true);
                                                                setModalOpen(true);
                                                                setLayout('center');
                                                            }}>
                                                            <EditIcon />
                                                        </Fab>
                                                    </Box>
                                                </div>
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
        </>
    )
}

export default ProjectComponent;

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban