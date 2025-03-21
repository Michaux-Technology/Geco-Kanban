import React, { useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import FileListScreen from './FileListScreen';

import { API_URL } from './config';

import GaugeChart from 'react-gauge-chart';
import { Slider } from '@mui/material';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, TextField } from '@mui/material';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { CardActionArea, CardActions } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EditIcon from '@mui/icons-material/Edit';
import AvatarGroup from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BarChartIcon from '@mui/icons-material/BarChart';

//Components
import AvatarComponent from './AvatarComponent';
import TextAvatarComponent from './TextAvatarComponent';
import Modal from '@mui/joy/Modal';

import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';
import StatPrice from './components/StatPrice';


const ProjectComponent = () => {

    const [isFileModalOpen, setIsFileModalOpen] = useState(false);

    const [projectGauge, setProjectGauge] = useState(0);

    // Declaration des variables
    let [isModalOpen, setModalOpen] = useState(false);

    let [editingProject, setEditingProject] = useState(null);
    let [isEditing, setIsEditing] = useState(false);


    let [tempImage, setTempImage] = useState(null);
    const DEFAULT_IMAGE = "./img/gecko.jpg";
    const [preview, setPreview] = useState(DEFAULT_IMAGE);

    const [listUsers, setListUsers] = useState([]);
    const [listUsersProject, setListUsersProject] = useState([]);

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUsersProject, setSelectedUsersProject] = useState([]);
    let updatedSelectedUsers = [];

    let [projects, setProjects] = useState([]);
    let [ratingProjects, setRatingProjects] = useState([]);

    const [rating, setRating] = useState(0.5); // 0.5 est la valeur par défaut

    const socket = io(API_URL); // Connectez-vous au serveur WebSocket

    const alignementGauche = {
        display: 'inline-flex',
        flexWrap: 'wrap'
    };

    const [isStatPriceModalOpen, setIsStatPriceModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

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
        if (editingProject) {
            console.log('Editing project gauge ************:', editingProject.gauge);
            setProjectGauge(editingProject.gauge || 0);
        }
    }, [editingProject]);


    useEffect(() => {
        fetchData()
    }, [isModalOpen]);

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

        // Écoutez l'événement pour les projets mis à jour en temps réel concernant le rating
        socket.on('projectRatingUpdated', (updatedRatingProject) => {
            setRating(prevState => ({ ...prevState, [updatedRatingProject._id]: updatedRatingProject.rating }));
        });

        // Nettoyez les écouteurs d'événements lorsque le composant se démonte
        return () => {
            socket.disconnect();
        };
    }, []);

    const resetEditing = () => {
        setPreview(DEFAULT_IMAGE)
        setEditingProject(null);
        setModalOpen(false);
        setSelectedUsers([]);
        setSelectedUsersProject([]);
        setIsEditing(false);
        setTempImage(null);
        setProjectGauge(0);

    };

    const handleDrop = (event) => {
        event.preventDefault();
        let file = event.dataTransfer.files[0];
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
    const onUpload = async (file, projectId) => {

        const formData = new FormData();
        formData.append('projectImage', file);

        try {
            //const projectId = editingProject._id;
            console.log('Uploading to project:', projectId);

            const response = await axios.post(`${API_URL}/upload/projects/${projectId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload successful:', response.data);
            return response.data.path;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    const UpdateUserSelect = async (selectedUsers, project) => {

        try {

            const response = await axios.get(`${API_URL}/projects/${project._id}/users`);
            let projectUsers = response.data.users;

            // Supprimer les utilisateurs qui ne sont pas dans la liste selectedUsers mais qui appartiennent au projet

            const usersToDelete = projectUsers.filter(user =>
                projectUsers.includes(user) && !selectedUsers.some(person => person._id === user.userId)
            );

            for (const user of usersToDelete) {

                await axios.delete(`${API_URL}/projects/${project._id}/users/${user.userId}`);

                // Mettre à jour la liste des avatars
                fetchData();
            }

            // Ajouter les utilisateurs de la liste selectedUsers qui n'appartiennent pas encore au projet
            for (const person of selectedUsers) {
                const response = await axios.get(`${API_URL}/projects/${project._id}/users/${person._id}`);
                const userExists = response.data.exists;

                //Si n'exite pas dans la db pas alors ajouter
                if (!userExists && person._id) {
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

    // Modifiez un projet
    const handleEditProject = useCallback(async (project) => {
        try {
            console.log("handleEditProject started");
            resetEditing();

            let imagePath = null;
            if (tempImage) {
                console.log("Uploading new image");
                imagePath = await onUpload(tempImage, editingProject._id);
            }

            // Update user assignments

            socket.emit('updateProject', {
                _id: project._id,
                title: editingProject.title,
                description: editingProject.description,
                enddate: editingProject.enddate,
                tempImage: imagePath ? true : false,
                gauge: projectGauge
            });

            // Then handle user assignments with complete update
            await UpdateUserSelect(selectedUsers, project);

            setProjects((prevProjects) =>
                prevProjects.map((p) => (p._id === project._id ? {
                    ...project,
                    image: imagePath || project.image
                } : p))
            );

            setModalOpen(false);

        } catch (error) {
            console.log("Error in handleEditProject:", error);
        }
    }, [selectedUsers, tempImage, onUpload, editingProject, setProjects, fetchData, projectGauge, socket]);


    // Inserer un Projet
    const handleAddProject = useCallback(async () => {
        try {
            resetEditing();
            let imagePath = null;

            socket.emit('addProject', {
                title: editingProject.title,
                description: editingProject.description,
                enddate: editingProject.enddate,
                //tempImage: imagePath,
                gauge: projectGauge
            });

            function handleAddProjectCallback(project) {

                if (tempImage) {
                    onUpload(tempImage, project._id).then(path => {

                        imagePath = path;

                        socket.emit('updateProject', {
                            _id: project._id,
                            tempImage: imagePath,
                        });
                    });
                }

                UpdateUserSelect(selectedUsers, project);
            }

            socket.on('addProjectResponse', handleAddProjectCallback);
            //setModalOpen(false);

        } catch (error) {
            console.error('Error adding/editing project:', error);
        }
    }, [socket, editingProject, tempImage, projectGauge, selectedUsers]);


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

    const handleRatingChange = async (projectId, newValue) => {
        try {
            socket.emit('updateRatingProject', {
                _id: projectId,
                rating: newValue * 5 // Convert gauge value (0-1) to rating (0-5)
            });
            setRating(prevState => ({
                ...prevState,
                [projectId]: newValue * 5
            }));
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

            setSelectedUsers(prevSelectedUsers => {
                updatedSelectedUsers = prevSelectedUsers.filter(user => user._id !== person._id);
                return updatedSelectedUsers;
            });

        } else {

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
                <Box sx={{ 
                    '& > :not(style)': { m: 1 },
                    display: 'flex',
                    gap: 1
                }}>
                    <Fab 
                        color="primary"
                        aria-label="add"
                        onClick={() => { 
                            setIsEditing(false); 
                            setModalOpen(true); 
                            setLayout('center'); 
                        }}
                    >
                        <AddIcon />
                    </Fab>
                    <Fab 
                        color="secondary"
                        aria-label="statistics"
                        onClick={() => {
                            setSelectedProjectId(null);
                            setIsStatPriceModalOpen(true);
                        }}
                    >
                        <BarChartIcon />
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
                            <div style={{ marginTop: '20px', width: '200px' }}>
                                <GaugeChart
                                    id="gauge-chart-modal"
                                    nrOfLevels={20}
                                    percent={projectGauge / 100} // Remove project reference, use state directly
                                    colors={['#FF5F6D', '#FFC371', '#4CAF50']}
                                    arcWidth={0.3}
                                    textColor="#000000"
                                    animate={false}
                                />
                            </div>
                            <Slider
                                value={projectGauge}
                                onChange={(e, newValue) => setProjectGauge(newValue)}
                                min={0}
                                max={100}
                                valueLabelDisplay="auto"
                                sx={{ width: '150px', marginTop: '10px', marginLeft: '30px' }}
                            />
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
                                            image={project.image ? "." + project.image : "./img/gecko.jpg"}
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
                                                                            src={`${userProject.avatar}`}
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

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                                                        <Fab size="small" color="primary" aria-label="edit"
                                                            onClick={() => {
                                                                setEditingProject(project);
                                                                setIsEditing(true);
                                                                setModalOpen(true);
                                                                setLayout('center');
                                                                if (project) {
                                                                    if (project.image) {
                                                                        setPreview("./" + project.image)
                                                                    } else {
                                                                        setPreview("./img/gecko.jpg")
                                                                    }
                                                                } else {
                                                                    setPreview("./img/gecko.jpg")
                                                                }
                                                            }}>
                                                            <EditIcon />
                                                        </Fab>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '16px' }}>
                                                            <FileListScreen projectId={project._id} />
                                                        </div>
                                                    </div>


                                                </div>
                                            )}

                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                                <CardActions sx={{
                                    width: '100%',
                                    minWidth: '340px',
                                    padding: '16px',
                                    boxSizing: 'border-box'
                                }}>
                                    <div className="button-container" style={{ width: '100%' }}>
                                        <div className="button-flex" style={{
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            maxWidth: '100%',
                                            overflow: 'hidden'
                                        }}>
                                            {/* Left side - Gauge only */}
                                            <Box sx={{ width: '120px', height: '45px' }}>
                                                <GaugeChart
                                                    id={`gauge-chart-${project._id}`}
                                                    nrOfLevels={20}
                                                    percent={project.gauge ? project.gauge / 100 : 0}
                                                    arcWidth={0.3}
                                                    colors={['#FF5F6D', '#FFC371', '#4CAF50']}
                                                    arcPadding={0.02}
                                                    hideText={true}
                                                    cornerRadius={2}
                                                    animate={true}
                                                />
                                            </Box>

                                            {/* Right side - Date and Delete */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                flexShrink: 0
                                            }}>
                                                <Typography noWrap>
                                                    {Date.parse(project.enddate) ? new Date(project.enddate).toLocaleDateString() : 'No End Date'}
                                                </Typography>
                                                <div
                                                    onClick={() => handleDeleteProject(project._id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <DeleteOutlineIcon />
                                                </div>
                                            </Box>
                                        </div>
                                    </div>
                                </CardActions>





                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Modal pour StatPrice */}
            <Modal
                open={isStatPriceModalOpen}
                onClose={() => {
                    setIsStatPriceModalOpen(false);
                    setSelectedProjectId(null);
                }}
            >
                <ModalDialog
                    sx={{
                        maxWidth: '90vw',
                        minWidth: '80vw',
                        minHeight: '80vh',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        padding: '24px'
                    }}
                >
                    <ModalClose 
                        onClick={() => {
                            setIsStatPriceModalOpen(false);
                            setSelectedProjectId(null);
                        }} 
                    />
                    <Typography level="h2" mb={2}>
                        Statistiques des prix {selectedProjectId ? 'du projet' : 'globales'}
                    </Typography>
                    <StatPrice projectId={selectedProjectId} />
                </ModalDialog>
            </Modal>
        </>
    )
}

export default ProjectComponent;

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban