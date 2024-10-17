// ProjectTasks.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

import { API_URL } from './config';

import './styles.css';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled, createTheme, ThemeProvider } from '@mui/system';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Button, FormControl, Select, MenuItem, TextField, InputLabel, ListItemIcon, List, ListItem } from '@mui/material';
import { SketchPicker } from 'react-color';
import EditIcon from '@mui/icons-material/Edit';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatIcon from '@mui/icons-material/Chat';
import { ListItemText } from '@mui/material';

const socket = io(API_URL); // Connectez-vous au serveur WebSocket

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

const ProjectTasks = () => {
  const [editingTask, setEditingTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('id') || '')
  const { projectId } = useParams();
  const [projectTitle, setProjectTitle] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskDescription, setNewTaskDescription] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskBeginDate, setNewTaskBeginDate] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskEndDate, setNewTaskEndDate] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskStatus, setNewTaskStatus] = useState('todo'); // État pour l'état initial
  const [newTaskPriority, setNewTaskPriority] = useState(''); // État pour la prioriété de la nouvelle tâche

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000"); // Couleur par défaut

  const [commentsCount, setCommentsCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState('');
  const [showMessaging, setShowMessaging] = useState(false);

  const [totalLikes, setTotalLikes] = useState(0);

  const resetEditing = () => {
    setModalOpen(false);
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/project/${projectId}`); // Modifiez l'URL pour obtenir les tâches spécifiques au projet
      setTasks(response.data);

      const response2 = await axios.get(`${API_URL}/tasks/project/${projectId}`);
      const fetchedTasks = response2.data;
      setTasks(fetchedTasks);

      // Calculate total likes
      const totalLikes = fetchedTasks.reduce((sum, task) => sum + (task.likes ? task.likes.length : 0), 0);
      setTotalLikes(totalLikes);

    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`);
      setProjectTitle(response.data.title);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    // Écoutez l'événement 'taskCreated'
    socket.on('taskCreated', (newTask) => {
      // Ajoutez la nouvelle tâche au début de la liste des tâches
      setTasks(prevTasks => [newTask, ...prevTasks]);
    });

    // Retirez l'écouteur lorsque le composant est démonté
    return () => {
      socket.off('taskCreated');
    };
  }, []);

  useEffect(() => {
    socket.on('taskDeleted', ({ taskId }) => {
      // Mettez à jour l'état local pour refléter la tâche supprimée
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    });

    // Retirez l'écouteur lorsque le composant est démonté
    return () => {
      socket.off('taskDeleted');
    };
  }, []);

  // Écouter les événements de mise à jour de tâche via WebSocket
  useEffect(() => {
    fetchTasks(); // Appel initial lors du chargement de la page

    socket.on('taskUpdated', ({ taskId, status, order }) => {

      // Mettre à jour l'état local avec les changements reçus
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, status, order } : task
        )
      );
    });

    return () => {
      socket.off('taskUpdated');
    };
  }, []);


  const handleLike = async (taskId) => {


    try {
      const response = await axios.post(`${API_URL}/tasks/${taskId}/userId/${userId}/like`);
      const updatedLikes = response.data.likes || 0;


      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task =>
          task._id === taskId ? { ...task, likes: updatedLikes } : task
        );

        // Recalculate total likes
        const newTotalLikes = newTasks.reduce((sum, task) => sum + (task.likes || 0), 0);
        setTotalLikes(newTotalLikes);

        return newTasks;
      });

    } catch (error) {
      console.error('Error updating like:', error);
    }
  };



  const handleCommentCount = () => {
    setLikes(commentsCount + 1);
  };

  const handleComment = async (taskId) => {

    if (commentText.trim()) {
      try {
        const response = await axios.post(`${API_URL}/tasks/${taskId}/comments`, {
          userId: userId,
          content: commentText
        });

        const newComment = response.data;

        setTasks(prevTasks => prevTasks.map(task =>
          task._id === taskId
            ? { ...task, comments: [...(task.comments || []), newComment] }
            : task
        ));

        setCommentText('');

      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleEditTask = async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}`);
      const task = response.data;

      setEditingTask(task);
      setNewTaskTitle(task.title);
      setNewTaskDescription(task.description);
      setNewTaskStatus(task.status);
      setNewTaskPriority(task.priority);
      setNewTaskBeginDate(dayjs(task.begindate));
      setNewTaskEndDate(dayjs(task.enddate));
      setSelectedColor(task.color);
      setIsEditing(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching task for editing:', error);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const updatedTask = {
        title: newTaskTitle,
        status: newTaskStatus,
        description: newTaskDescription,
        priority: newTaskPriority,
        begindate: newTaskBeginDate,
        enddate: newTaskEndDate,
        color: selectedColor,
      };

      const response = await axios.put(`${API_URL}/tasks/${editingTask._id}`, updatedTask);

      setTasks(tasks.map(task => task._id === editingTask._id ? response.data : task));

      resetEditing();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const resetEditingTask = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskStatus('todo');
    setNewTaskPriority('');
    setNewTaskBeginDate(null);
    setNewTaskEndDate(null);
    setSelectedColor("#000000");
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      // Mettez à jour la liste des tâches en supprimant la tâche supprimée
      setTasks(tasks.filter(task => task._id !== taskId));
      socket.emit('taskDeleted', { taskId });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCreateTask = async () => {
    try {

      // Envoyez la demande POST pour créer une nouvelle tâche
      const response = await axios.post(`${API_URL}/tasks`, {
        title: newTaskTitle,
        status: newTaskStatus,
        description: newTaskDescription,
        priority: newTaskPriority,
        begindate: newTaskBeginDate,
        enddate: newTaskEndDate,
        order: 0, // Vous pouvez définir l'ordre initial ici
        color: selectedColor, // Ajoutez la couleur sélectionnée à la requête
        projectId: projectId, // Utilisez l'ID du projet actuel
      });

      // Mettez à jour la liste des tâches en ajoutant la nouvelle tâche au début du tableau
      setTasks([response.data, ...tasks]);

      // Réinitialisez les champs du formulaire
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('');
      setNewTaskBeginDate('');
      setNewTaskEndDate('');
      setNewTaskStatus('todo'); // Réinitialisez l'état initial au choix
      setSelectedColor("#000000"); // Réinitialisez la couleur à une valeur par défaut

      // Fermeture du modal
      setModalOpen(false);

    } catch (error) {
      console.error('Error creating task:', error);
    }
  };


  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleDragEnd = async result => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceIndex = source.index;
    const sourceDroppableId = source.droppableId;

    const destinationIndex = destination.index;
    const destinationDroppableId = destination.droppableId;

    let updatedTasksTodo = tasks.filter(task => task.status === 'todo');
    let updatedTasksInProgress = tasks.filter(task => task.status === 'inProgress');
    let updatedTasksDone = tasks.filter(task => task.status === 'done');
    let movedTask = '';

    // delete
    if (sourceDroppableId === 'todo') {
      movedTask = updatedTasksTodo.splice(sourceIndex, 1)[0];
    }
    if (sourceDroppableId === 'inProgress') {
      movedTask = updatedTasksInProgress.splice(sourceIndex, 1)[0];
    }
    if (sourceDroppableId === 'done') {
      movedTask = updatedTasksDone.splice(sourceIndex, 1)[0];
    }

    //insert
    if (destinationDroppableId === 'todo') {

      movedTask.status = 'todo';
      updatedTasksTodo.splice(destinationIndex, 0, movedTask);

    }
    if (destinationDroppableId === 'inProgress') {

      movedTask.status = 'inProgress';
      updatedTasksInProgress.splice(destinationIndex, 0, movedTask);

    }
    if (destinationDroppableId === 'done') {

      movedTask.status = 'done';
      updatedTasksDone.splice(destinationIndex, 0, movedTask);

    }


    // Mettez à jour l'ordre de chaque tâche dans chaque tableau séparément
    updatedTasksTodo.forEach((task, index) => {
      task.order = index;
    });
    updatedTasksInProgress.forEach((task, index) => {
      task.order = index;
    });
    updatedTasksDone.forEach((task, index) => {
      task.order = index;
    });


    // Fusionner les trois tableaux pour obtenir la nouvelle liste de tâches
    const updatedTasks = [...updatedTasksTodo, ...updatedTasksInProgress, ...updatedTasksDone];

    // Mettez à jour l'état local avec les tâches mises à jour
    setTasks(updatedTasks);

    // Effectuez les mises à jour nécessaires dans votre base de données
    await axios.put(`${API_URL}/task/reorder`, updatedTasks);

    // Émettez un événement pour chaque tâche mise à jour
    updatedTasks.forEach(task => {
      socket.emit('taskUpdated', { taskId: task._id, status: task.status, order: task.order });
    });

  };

  const customTheme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
        contrastText: 'white',
      },
    },
  });

  const MyThemeComponent = styled('div')(({ theme }) =>
    theme.unstable_sx({
      color: 'primary.contrastText',
      backgroundColor: 'primary.main',
      padding: 1,
      borderRadius: 1,
    }),
  );



  return (

    <DragDropContext onDragEnd={handleDragEnd}>

      <Box sx={{ width: '100%', textAlignVertical: "center", textAlign: "center" }}>
        <Typography variant="h2" gutterBottom>
          Kanban Geco
        </Typography>
      </Box>

      {isModalOpen && (

        <Modal onClose={resetEditing} >

          <div className="create-task">

            {isEditing ? <h2>Edit Task</h2> : <h2>Create New Task</h2>}


            <div className="columns-CreateTask">

              {/* Colonne de gauche */}
              <div className="column-CreateTask">
                <div>
                  <TextField sx={{ width: '25ch' }}
                    id="standard-basic"
                    variant="standard"
                    label="Task Title"
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>

                <FormControl variant="standard" sx={{ marginTop: 2, minWidth: 120, width: '25ch' }}>
                  <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    label="Status"
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}

                  >
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="inProgress">In Progress</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>

                <div style={{ flex: 1, marginRight: '10px' }}>

                  <TextField sx={{ marginTop: 2, width: '25ch' }}
                    id="outlined-multiline-flexible"
                    label="Description"
                    variant="standard"
                    value={newTaskDescription}
                    multiline
                    maxRows={4}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    width="200px"
                  />
                </div>

                <div style={{ flex: 1, marginTop: '4ch', marginRight: '10px' }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} component="div">
                    <DatePicker
                      label="Starting date"
                      value={dayjs(newTaskBeginDate)}
                      onChange={(date) => setNewTaskBeginDate(date)}
                    /></LocalizationProvider>
                </div>
                <div style={{ flex: 1, marginTop: '2ch', marginRight: '10px' }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} component="div">
                    <DatePicker
                      label="End date"
                      value={dayjs(newTaskEndDate)}
                      onChange={(date) => setNewTaskEndDate(date)}
                    />

                  </LocalizationProvider>
                </div>

              </div>

              {/* Colonne de droite */}

              <div className="column-CreateTask">

                <FormControl variant="standard" sx={{ width: '26ch' }}>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority-select"
                    value={newTaskPriority}
                    onChange={(event) => setNewTaskPriority(event.target.value)}
                    label="Priority"
                  >
                    <MenuItem value={'green'}>
                      <ListItemIcon style={{ minWidth: '30px', marginRight: '10px' }}>
                        <div style={{ width: '100%', height: '24px', backgroundColor: 'green' }}></div>
                      </ListItemIcon>
                      <Typography>Low</Typography>
                    </MenuItem>
                    <MenuItem value={'orange'}>
                      <ListItemIcon style={{ minWidth: '30px', marginRight: '10px' }}>
                        <div style={{ width: '100%', height: '24px', backgroundColor: 'orange' }}></div>
                      </ListItemIcon>
                      <Typography>Medium</Typography>
                    </MenuItem>
                    <MenuItem value={'red'}>
                      <ListItemIcon style={{ minWidth: '30px', marginRight: '10px' }}>
                        <div style={{ width: '100%', height: '24px', backgroundColor: 'red' }}></div>
                      </ListItemIcon>
                      <Typography>High</Typography>
                    </MenuItem>
                  </Select>
                </FormControl>


                <Typography variant="caption" display="block" gutterBottom sx={{ marginTop: 2, width: '26ch' }}>
                  Choose a task color
                </Typography>

                <SketchPicker
                  color={selectedColor}
                  onChangeComplete={(color) => setSelectedColor(color.hex)}
                />

              </div>
            </div>

            <Button sx={{ marginTop: 6 }}
              variant="contained"
              onClick={() => {
                if (isEditing) {
                  handleUpdateTask()
                } else {
                  handleCreateTask()
                }
              }}
            >
              {isEditing ? 'Update Task' : 'Add Task'}
            </Button>

          </div>

        </Modal>
      )
      }


      <div className="App">
        <ThemeProvider theme={customTheme}>
          <MyThemeComponent> <h2>Project name: {projectTitle}</h2></MyThemeComponent><br></br>
        </ThemeProvider>


        {!isModalOpen && (
          <Box sx={{ '& > :not(style)': { m: 1 } }}>
            <Fab color="primary" aria-label="add" onClick={() => {
              setIsEditing(false);
              setNewTaskTitle('');
              setNewTaskDescription('');
              setNewTaskStatus('todo');
              setNewTaskPriority('');
              setNewTaskBeginDate(null);
              setNewTaskEndDate(null);
              setSelectedColor("#000000");
              setModalOpen(true);
            }}>
              <AddIcon />
            </Fab>
          </Box>
        )}

        {/*         {isModalOpen && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
            <Modal onClose={resetEditing}>
            </Modal>
          </Box>
        )} */}

        <div className="columns-container">

          {/* Column: Todo */}
          <div className="columnTitleDescription">

            <div className="columnTitle1">
              <h2>Todo</h2>
            </div>

            <div className="column">

              <Droppable droppableId="todo" direction="vertical">
                {provided => (
                  <div ref={provided.innerRef} className="task-list">
                    {tasks
                      .filter(task => task.status === 'todo')
                      .sort((a, b) => a.order - b.order) // Tri des tâches par ordre
                      .map((task, index) => (

                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {provided => (

                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}

                            >
                              <div
                                className="task"
                              >
                                <div style={{ backgroundColor: task.color }} className="task"></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span><b>{task.title}</b></span>
                                  <div>
                                    <button onClick={() => handleEditTask(task._id)}><EditIcon /></button>
                                    <button onClick={() => handleDeleteTask(task._id)}><DeleteOutlineIcon /></button>
                                  </div>
                                </div>
                                <div>
                                  <Box component="div">
                                    <Typography display="block" sx={{ fontSize: 12 }}>
                                      {task.description}
                                    </Typography>
                                  </Box>
                                </div>
                                <div>
                                  <Typography display="block" sx={{ fontSize: 12, display: 'flex', alignItems: 'middle' }}>{task.priority ? 'Priority:' : ''}
                                    <ListItemIcon>
                                      <div style={{ marginLeft: '10px', width: '100%', height: '14px', backgroundColor: task.priority }}></div>
                                    </ListItemIcon>
                                  </Typography>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box component="div" sx={{ marginTop: 2 }}>
                                    <Typography sx={{ fontSize: 12 }}>
                                      Starting Date : <b>{Date.parse(task.begindate) ? new Date(task.begindate).toLocaleDateString() : 'No Date'}</b>
                                    </Typography>
                                  </Box>
                                  <Box component="div" sx={{ marginTop: 2, fontSize: 10 }}>
                                    <Typography sx={{ fontSize: 12 }}>
                                      End Date : <b>{Date.parse(task.enddate) ? new Date(task.enddate).toLocaleDateString() : 'No Date'}</b>
                                    </Typography>
                                  </Box>
                                </div>
                                <div>
                                  <Button
                                    sx={{ fontSize: 12 }}
                                    color="primary"
                                    onClick={() => {
                                      console.log('Task ID before handleLike:', task._id);
                                      handleLike(task._id);
                                    }}
                                    style={{ verticalAlign: 'middle' }}
                                  >
                                    <ThumbUpIcon sx={{ fontSize: 17 }} />
                                    {totalLikes}
                                  </Button>

                                  <Button sx={{ fontSize: 12 }}
                                    color="primary"
                                    onClick={() => {
                                      setShowMessaging(!showMessaging);
                                      handleCommentCount();
                                    }}
                                    style={{ verticalAlign: 'middle' }}

                                  >
                                    <ChatIcon sx={{ fontSize: 17 }} />  &nbsp;{task.comments ? task.comments.length : 0}
                                  </Button>
                                </div>
                                {showMessaging && (
                                  <div>
                                    <TextField
                                      variant="outlined"
                                      fullWidth
                                      multiline
                                      rows={3}
                                      label="Write a comment"
                                      value={commentText}
                                      onChange={handleCommentChange}
                                      style={{ marginTop: 20 }}
                                    />
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => handleComment(task._id)}
                                      style={{ marginTop: 20 }}
                                    >
                                      Comment
                                    </Button>

                                    {task.comments && task.comments.map((comment, index) => (
                                      <ListItem key={index}>
                                        <ListItemText
                                          primary={
                                            <Typography variant="body2">
                                              {comment.content}
                                            </Typography>
                                          }
                                          secondary={
                                            <Typography variant="caption">
                                              By <strong>{comment.firstName} {comment.lastName}</strong> on {new Date(comment.createdAt).toLocaleString()}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </div>)}

                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

            </div>
          </div>


          {/* Column: In Progress */}
          <div className="columnTitleDescription">
            <div className="columnTitle2">
              <h2 className="columnTitle">In Progress</h2>
            </div>
            <div className="column">
              <Droppable droppableId="inProgress" direction="vertical">
                {provided => (
                  <div ref={provided.innerRef} className="task-list">
                    {tasks
                      .filter(task => task.status === 'inProgress')
                      .sort((a, b) => a.order - b.order) // Tri des tâches par ordre
                      .map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {provided => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}

                            >
                              <div
                                className="task"
                              >
                                <div style={{ backgroundColor: task.color }} className="task">
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span><b>{task.title}</b></span>
                                  <div>
                                    <button onClick={() => handleEditTask(task._id)}><EditIcon /></button>
                                    <button onClick={() => handleDeleteTask(task._id)}><DeleteOutlineIcon /></button>
                                  </div>

                                </div>
                                <div>
                                  <Box component="div">
                                    <Typography display="block" sx={{ fontSize: 12 }}>
                                      {task.description}
                                    </Typography>
                                  </Box>
                                </div>
                                <div>
                                  <Typography display="block" sx={{ fontSize: 12, display: 'flex', alignItems: 'middle' }}>{task.priority ? 'Priority:' : ''}
                                    <ListItemIcon>
                                      <div style={{ marginLeft: '10px', width: '100%', height: '14px', backgroundColor: task.priority }}></div>
                                    </ListItemIcon>
                                  </Typography>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box component="div" sx={{ marginTop: 2 }}>
                                    <Typography sx={{ fontSize: 12 }}>
                                      Starting Date : <b>{Date.parse(task.begindate) ? new Date(task.begindate).toLocaleDateString() : 'No Date'}</b>
                                    </Typography>
                                  </Box>
                                  <Box component="div" sx={{ marginTop: 2, fontSize: 10 }}>
                                    <Typography sx={{ fontSize: 12 }}>
                                      End Date : <b>{Date.parse(task.enddate) ? new Date(task.enddate).toLocaleDateString() : 'No Date'}</b>
                                    </Typography>
                                  </Box>
                                </div>
                                <div>
                                  <Button
                                    sx={{ fontSize: 12 }}
                                    color="primary"
                                    onClick={() => {
                                      console.log('Task ID before handleLike:', task._id);
                                      handleLike(task._id);
                                    }}
                                    style={{ verticalAlign: 'middle' }}
                                  >
                                    <ThumbUpIcon sx={{ fontSize: 17 }} />
                                    {totalLikes}
                                  </Button>

                                  <Button sx={{ fontSize: 12 }}
                                    color="primary"
                                    onClick={() => {
                                      setShowMessaging(!showMessaging);
                                      handleCommentCount();
                                    }}
                                    style={{ verticalAlign: 'middle' }}
                                  >

                                    <ChatIcon sx={{ fontSize: 17 }} />  &nbsp;{task.comments ? task.comments.length : 0}
                                  </Button>
                                </div>
                                {showMessaging && (
                                  <div>
                                    <TextField
                                      variant="outlined"
                                      fullWidth
                                      multiline
                                      rows={3}
                                      label="Write a comment"
                                      value={commentText}
                                      onChange={handleCommentChange}
                                      style={{ marginTop: 20 }}
                                    />
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => handleComment(task._id)}
                                      style={{ marginTop: 20 }}
                                    >
                                      Comment
                                    </Button>

                                    {task.comments && task.comments.map((comment, index) => (
                                      <ListItem key={index}>
                                        <ListItemText
                                          primary={
                                            <Typography variant="body2">
                                              {comment.content}
                                            </Typography>
                                          }
                                          secondary={
                                            <Typography variant="caption">
                                              By <strong>{comment.firstName} {comment.lastName}</strong> on {new Date(comment.createdAt).toLocaleString()}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </div>)}
                              </div></div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>


          {/* Column: done */}
          <div className="columnTitleDescription">
            <div className="columnTitle3">
              <h2 className="columnTitle">Done</h2>
            </div>
            <div className="column">
              <Droppable droppableId="done" direction="vertical">
                {provided => (
                  <div ref={provided.innerRef} className="task-list">
                    {tasks
                      .filter(task => task.status === 'done')
                      .sort((a, b) => a.order - b.order) // Tri des tâches par ordre
                      .map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {provided => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div
                                className="task"
                              >
                                <div style={{ backgroundColor: task.color }} className="task">
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span><b>{task.title}</b></span>
                                  <div>
                                    <button onClick={() => handleEditTask(task._id)}><EditIcon /></button>
                                    <button onClick={() => handleDeleteTask(task._id)}><DeleteOutlineIcon /></button>
                                  </div>

                                </div>
                                <div>
                                  <Box component="div">
                                    <Typography display="block" sx={{ fontSize: 12 }}>
                                      {task.description}
                                    </Typography>
                                  </Box></div>
                                <div>
                                  <Typography display="block" sx={{ fontSize: 12, display: 'flex', alignItems: 'middle' }}>{task.priority ? 'Priority:' : ''}
                                    <ListItemIcon>
                                      <div style={{ marginLeft: '10px', width: '100%', height: '14px', backgroundColor: task.priority }}></div>
                                    </ListItemIcon>
                                  </Typography>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box component="div" sx={{ marginTop: 2 }}>
                                    <Typography sx={{ fontSize: 12 }}>
                                      Starting Date : <b>{Date.parse(task.begindate) ? new Date(task.begindate).toLocaleDateString() : 'No Date'}</b>
                                    </Typography>
                                  </Box>
                                  <Box component="div" sx={{ marginTop: 2, fontSize: 10 }}>
                                    <Typography sx={{ fontSize: 12 }}>
                                      End Date : <b>{Date.parse(task.enddate) ? new Date(task.enddate).toLocaleDateString() : 'No Date'}</b>
                                    </Typography>
                                  </Box>
                                </div>

                                <div >
                                  <Button
                                    sx={{ fontSize: 12 }}
                                    color="primary"
                                    onClick={() => {
                                      console.log('Task ID before handleLike:', task._id);
                                      handleLike(task._id);
                                    }}
                                    style={{ verticalAlign: 'middle' }}
                                  >
                                    <ThumbUpIcon sx={{ fontSize: 17 }} />
                                    {totalLikes}
                                  </Button>

                                  <Button sx={{ fontSize: 12 }}
                                    color="primary"
                                    onClick={() => {
                                      setShowMessaging(!showMessaging);
                                      handleCommentCount();
                                    }}
                                    style={{ verticalAlign: 'middle' }}

                                  >
                                    <ChatIcon sx={{ fontSize: 17 }} />  &nbsp;{task.comments ? task.comments.length : 0}
                                  </Button>
                                </div>
                                {showMessaging && (
                                  <div>
                                    <TextField
                                      variant="outlined"
                                      fullWidth
                                      multiline
                                      rows={3}
                                      label="Write a comment"
                                      value={commentText}
                                      onChange={handleCommentChange}
                                      style={{ marginTop: 20 }}
                                    />
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => handleComment(task._id)}
                                      style={{ marginTop: 20 }}
                                    >
                                      Comment
                                    </Button>

                                    {task.comments && task.comments.map((comment, index) => (
                                      <ListItem key={index}>
                                        <ListItemText
                                          primary={
                                            <Typography variant="body2">
                                              {comment.content}
                                            </Typography>
                                          }
                                          secondary={
                                            <Typography variant="caption">
                                              By <strong>{comment.firstName} {comment.lastName}</strong> on {new Date(comment.createdAt).toLocaleString()}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </div>)}
                              </div>

                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext >

  );
};


export default ProjectTasks;

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban