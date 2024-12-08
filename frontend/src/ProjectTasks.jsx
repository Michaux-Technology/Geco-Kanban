// ProjectTasks.js
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { API_URL } from './config';
import GaugeChart from 'react-gauge-chart';
import GanttChart from './Gantt';
import { Slider } from '@mui/material';
import { Chip } from '@mui/material';

import TimelineIcon from '@mui/icons-material/Timeline';

import AvatarComponent from './AvatarComponent';
import AvatarGroup from '@mui/material/AvatarGroup';
import TextAvatarComponent from './TextAvatarComponent';

import Column from './Column';

import './styles.css';
import Box from '@mui/material/Box';
import { IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import { styled, createTheme, ThemeProvider } from '@mui/system';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Button, FormControl, Select, MenuItem, TextField, InputLabel, ListItemIcon } from '@mui/material';
import { SketchPicker } from 'react-color';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import NumberInput from './NumberInput';

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

  const [taskDependencies, setTaskDependencies] = useState([]);
  const [selectedDependencies, setSelectedDependencies] = useState(null);

  const [workingDay, setWorkingDay] = useState(1);
  const [showGanttModal, setShowGanttModal] = useState(false);
  const [newTaskGauge, setNewTaskGauge] = useState(0);
  const alignementGauche = {
    display: 'inline-flex',
    flexWrap: 'wrap'
  };

  const [columnNames, setColumnNames] = useState({
    todo: 'Todo',
    inProgress: 'In Progress',
    done: 'Done'
  });

  let updatedSelectedUsers = [];
  const [listUsersProject, setListUsersProject] = useState([]);
  const [selectedUsersProject, setSelectedUsersProject] = useState([]);
  const [columnData, setColumnData] = useState({});
  const [layout, setLayout] = useState(undefined);
  const [editingTask, setEditingTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('id') || '')
  const [firstName, setFirstName] = useState(localStorage.getItem('firstnameuser') || '')
  const [lastName, setLastName] = useState(localStorage.getItem('lastnameuser') || '')
  const { projectId } = useParams();
  const [projectTitle, setProjectTitle] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskDescription, setNewTaskDescription] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskBeginDate, setNewTaskBeginDate] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskEndDate, setNewTaskEndDate] = useState(''); // État pour le titre de la nouvelle tâche
  const [newTaskStatus, setNewTaskStatus] = useState('todo'); // État pour l'état initial
  const [newTaskPriority, setNewTaskPriority] = useState(''); // État pour la prioriété de la nouvelle tâche
  const [modalKey, setModalKey] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#4A90E2"); // Couleur par défaut

  const [commentsCount, setCommentsCount] = useState(0);
  const [likes, setLikes] = useState(0);
  // const [comments, setComments] = useState([]);
  // const [currentComment, setCurrentComment] = useState('');
  const [showMessaging, setShowMessaging] = useState(false);

  const [totalLikes, setTotalLikes] = useState(0);

  const [editingColumn, setEditingColumn] = useState(null);

  const [newColumnName, setNewColumnName] = useState('');

  // Add these state variables

  const [collaborators, setCollaborators] = useState([]);

  const fetchCollaborators = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setCollaborators(response.data);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleAvatarClickOnChild = useCallback((person) => {

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

  const handelUserExistInProject = useCallback((personId, taskId) => {
    return axios
      .get(`${API_URL}/tasks/${taskId}/users/${personId}`)
      .then((response) => {
        if (response.data.exists) {
          setSelectedUsers(prevSelectedUsers => {
            const isUserIdPresent = prevSelectedUsers.some(user => user._id === personId);
            if (!isUserIdPresent) {
              const userToAdd = collaborators.find(user => user._id === personId);
              return [...prevSelectedUsers, userToAdd];
            }
            return prevSelectedUsers;
          });
        }
      });
  }, [collaborators]);

  const resetEditing = () => {
    setModalOpen(false);
  };

  const handleAddColumn = async () => {
    if (newColumnName.trim()) {
      try {
        const response = await axios.put(`${API_URL}/projects/${projectId}/columns`, {
          name: newColumnName
        });

        setColumnNames(prev => ({
          ...prev,
          [response.data.id]: {
            name: response.data.name,
            color: response.data.color
          }
        }));
        setNewColumnName('');
      } catch (error) {
        console.error('Error adding new column:', error);
      }
    }
  };

  const handleColumnNameChange = async (columnId, newName) => {
    // Check if newName is a string and not empty
    if (typeof newName !== 'string' || !newName || newName === columnNames[columnId]?.name) {
      return;
    }

    try {
      await axios.put(`${API_URL}/projects/${projectId}/columns/${columnId}`, { name: newName });
      setColumnNames(prev => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          name: newName
        }
      }));
    } catch (error) {
      console.error('Error updating column name:', error);
    }
  };

  const handleColumnNameEdit = (columnId) => {
    setEditingColumn(columnId);
  };

  const handleColumnNameSave = (columnId, newName) => {
    handleColumnNameChange(columnId, newName);
    setEditingColumn(null);
  };

  const [messagingStates, setMessagingStates] = useState({});

  const toggleMessaging = (taskId) => {
    setMessagingStates(prevState => ({
      ...prevState,
      [taskId]: !prevState[taskId]
    }));
  };

  const fetchUpdatedTaskData = async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}`, {

      });
      return response.data;
    } catch (error) {
      console.error('Error fetching updated task data:', error);
      return null;
    }
  };

  const fetchTasks = async () => {
    let totalLikes = 0;  // Initialize totalLikes here
    try {

      const response = await axios.get(`${API_URL}/tasks/project/${projectId}`);
      const tasksData = response.data;

      const updatedTasks = tasksData.map(task => {
        const taskLikes = task.likes ? task.likes.length : 0;
        totalLikes += taskLikes;
        return {
          ...task,
          totalLikes: taskLikes
        };
      });

      setTasks(updatedTasks);
      setTotalLikes(totalLikes);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`);
      console.log('API Response:', response.data);
      setProjectTitle(response.data.title);
      const columns = {};
      Object.entries(response.data.columns).forEach(([key, value]) => {
        columns[key] = value.name || value;
      });
      setColumnNames(columns);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };


  const fetchColumnNames = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}/columns`);
      const processedData = {};
      Object.entries(response.data).forEach(([key, value]) => {
        processedData[key] = {
          name: value.name,
          color: value.color
        };
      });
      console.log('Setting column names:', processedData);
      // Add a small delay before setting the state
      setTimeout(() => {
        setColumnNames(processedData);
      }, 1);
    } catch (error) {
      console.error('Error fetching column names:', error);
    }
  };

  useEffect(() => {
    if (isModalOpen && editingTask) {
      const taskUsers = collaborators.filter(collab =>
        editingTask.users.includes(collab._id)
      );
      setSelectedUsers(taskUsers);
    }
  }, [isModalOpen, editingTask, collaborators]);

  //Chargement des Avatars
  useEffect(() => {
    const fetchProjectUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/projectusers`);
        console.log('projectUsers :', response.data);
        setListUsersProject(response.data);
      } catch (error) {
        console.log('Error:', error);
      }
    };

    fetchProjectUsers();
  }, [projectId]);




  useEffect(() => {
    fetchColumnNames();
  }, [projectId]);

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
          task._id === taskId ? { ...task, likes: response.data.likes } : task
        );

        // Recalculate total likes
        const newTotalLikes = newTasks.reduce((sum, task) => sum + (Array.isArray(task.likes) ? task.likes.length : 0), 0);
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

  const handleComment = async (taskId, commentText) => {
    try {

      const response = await axios.post(`${API_URL}/tasks/comment`, {
        taskId,
        comment: commentText,
        firstName: firstName || '',
        lastName: lastName || ''
      });

      if (response.status === 200) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId
              ? { ...task, comments: [...task.comments, response.data] }
              : task
          )
        );

        // After successful comment addition:
        const updatedTask = await fetchUpdatedTaskData(taskId);
        setTasks(prevTasks => prevTasks.map(task =>
          task._id === taskId ? updatedTask : task
        ));

      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditTask = async (taskId) => {
    try {


      const response = await axios.get(`${API_URL}/tasks/${taskId}`);
      const task = response.data;

      setSelectedDependencies(task.dependencies || '');

      const taskUsers = collaborators.filter(collab =>
        task.users.includes(collab._id)

      );

      setSelectedUsers(taskUsers);
      setEditingTask(task);
      setNewTaskTitle(task.title);
      setNewTaskDescription(task.description);
      setNewTaskStatus(task.status);
      setNewTaskPriority(task.priority);
      setNewTaskBeginDate(dayjs(task.begindate));
      setNewTaskEndDate(dayjs(task.enddate));
      setSelectedColor(task.color);
      setNewTaskGauge(task.gauge || 0);
      setWorkingDay(task.workingDay || 1);
      setIsEditing(true);
      setModalOpen(true);
      setLayout('center');
      setSelectedDependencies(task.dependencies || []);

    } catch (error) {
      console.error('Error fetching task for editing:', error);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const taskUsers = selectedUsers.filter(user => user._id && !user.projectId);

      // Convert dependencies to string, ensuring it's not an array
      const dependencyValue = typeof selectedDependencies === 'string' ?
        selectedDependencies :
        (selectedDependencies || '').toString();

      console.log('Dependency value:', dependencyValue); // Debug log

      const updatedTask = {
        title: newTaskTitle,
        status: newTaskStatus,
        description: newTaskDescription,
        priority: newTaskPriority,
        begindate: newTaskBeginDate,
        enddate: newTaskEndDate,
        color: selectedColor,
        users: taskUsers.map(user => user._id),
        gauge: newTaskGauge,
        workingDay: workingDay,
        dependencies: dependencyValue
      };

      console.log('Updated task:', updatedTask); // Debug log
      const response = await axios.put(`${API_URL}/tasks/${editingTask._id}`, updatedTask);
      setTasks(tasks.map(task => task._id === editingTask._id ? response.data : task));
      resetEditing();
    } catch (error) {
      console.error('Error updating task:', error);
    }
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
      if (dayjs(newTaskEndDate).isBefore(dayjs(newTaskBeginDate))) {
        alert("End date must be after start date");
        return;
      }

      const taskUsers = selectedUsers.filter(user => user._id && !user.projectId);

      // Define dependenciesString before using it
      const dependenciesString = selectedDependencies ? selectedDependencies.toString() : '';

      const response = await axios.post(`${API_URL}/tasks`, {
        title: newTaskTitle,
        status: newTaskStatus,
        description: newTaskDescription,
        priority: newTaskPriority,
        begindate: newTaskBeginDate,
        enddate: newTaskEndDate,
        order: 0,
        color: selectedColor,
        projectId: projectId,
        users: taskUsers.map(user => user._id),
        gauge: newTaskGauge,
        dependencies: dependenciesString,  // Now using the defined variable
        workingDay: workingDay
      });

      // Rest of the function...



      setTasks([response.data, ...tasks]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('');
      setNewTaskBeginDate('');
      setNewTaskEndDate('');
      setNewTaskStatus('todo');
      setSelectedColor("#000000");
      setSelectedUsers([]); // Reset selected users after creation
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

    let updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(updatedTasks.findIndex(task => task.status === sourceDroppableId && task.order === sourceIndex), 1);

    movedTask.status = destinationDroppableId;
    updatedTasks.splice(updatedTasks.findIndex(task => task.status === destinationDroppableId && task.order >= destinationIndex), 0, movedTask);

    // Update order for all tasks in affected columns
    updatedTasks = updatedTasks.map((task, index) => ({
      ...task,
      order: task.status === sourceDroppableId || task.status === destinationDroppableId ?
        updatedTasks.filter(t => t.status === task.status).indexOf(task) :
        task.order
    }));

    setTasks(updatedTasks);

    // Update database
    await axios.put(`${API_URL}/task/reorder`, updatedTasks);

    // Emit socket event for each updated task
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

        <Modal key={modalKey} onClose={resetEditing}>

          <div className="create-task">

            {isEditing ? <h2>Edit Task</h2> : <h2>Create New Task</h2>}


            <div className="columns-CreateTask">

              {/* 1ere colonne */}
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
                    {Object.entries(columnNames).map(([status, columnData]) => (
                      <MenuItem key={status} value={status}>
                        {typeof columnData === 'object' ? columnData.name : columnData}
                      </MenuItem>
                    ))}
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
                      format="DD/MM/YYYY"
                    /></LocalizationProvider>
                </div>
                <div style={{ flex: 1, marginTop: '2ch', marginRight: '10px' }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs} component="div">
                    <DatePicker
                      label="End date"
                      value={dayjs(newTaskEndDate)}
                      onChange={(date) => {
                        if (date && newTaskBeginDate && date < newTaskBeginDate) {
                          // End date cannot be before start date
                          return;
                        }
                        setNewTaskEndDate(date);
                      }}
                      minDate={newTaskBeginDate} // This prevents selecting dates before start date
                      format="DD/MM/YYYY"
                    />
                  </LocalizationProvider>
                </div>

                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                >
                  <br />
                  Participants
                </Typography>



                <AvatarGroup max={100} sx={alignementGauche}>
                  {collaborators
                    .filter(person =>
                      listUsersProject.some(projectUser => projectUser.userId === person._id)
                    )
                    .map((person) => (
                      person.avatar ? (
                        <AvatarComponent
                          key={person._id}
                          person={person}
                          editingProject={editingTask}
                          handleAvatarClickOnChild={handleAvatarClickOnChild}
                          selectedUsers={selectedUsers}
                          handelUserExistInProject={handelUserExistInProject}
                        />
                      ) : (
                        <TextAvatarComponent
                          key={person._id}
                          person={person}
                          editingProject={editingTask}
                          handleAvatarClickOnChild={handleAvatarClickOnChild}
                          selectedUsers={selectedUsers}
                          handelUserExistInProject={handelUserExistInProject}
                        />
                      )
                    ))}
                </AvatarGroup>
                <br />


              </div>

              {/* 2eme colonne */}
              <div className="column-CreateTask">

                {/* Add dependencies select */}
                <FormControl sx={{ marginTop: 4, width: '300px' }}>
                  <InputLabel>Task Dependency</InputLabel>
                  <Select
                    value={selectedDependencies ?? null}
                    onChange={(e) => {
                      if (e && e.target) {
                        setSelectedDependencies(e.target.value);
                      }
                    }}
                  >
                    <MenuItem value={null}>
                      <em>None</em>
                    </MenuItem>
                    {tasks && tasks.length > 0 && tasks
                      .filter(task => task?._id !== editingTask?._id)
                      .map((task) => (
                        task && (
                          <MenuItem key={task._id} value={task._id}>
                            {task.title || 'Untitled Task'}
                          </MenuItem>
                        )
                      ))}
                  </Select>
                </FormControl>



                <div style={{ marginTop: '20px' }}>
                  <Typography variant="caption">Working Day</Typography>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <NumberInput
                      aria-label="Working Day"
                      min={1}
                      max={99}
                      value={workingDay}
                      onChange={(event, val) => setWorkingDay(val)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px', width: '200px' }}>
                  <GaugeChart
                    id="gauge-chart-modal"
                    nrOfLevels={20}
                    percent={newTaskGauge / 100}
                    colors={['#FF5F6D', '#FFC371', '#4CAF50']}
                    arcWidth={0.3}
                    textColor="#000000"
                    animate={false}
                  />
                </div>


                <Slider
                  value={newTaskGauge}
                  onChange={(e, newValue) => setNewTaskGauge(newValue)}
                  onChangeCommitted={(e, newValue) => setNewTaskGauge(newValue)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  sx={{ width: '150px', marginTop: '10px', marginLeft: '30px' }}
                />
              </div>
              {/* 3eme colonne */}

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
              setSelectedColor("#4A90E2");
              setModalOpen(true);
            }}>
              <AddIcon />
            </Fab>
          </Box>
        )}

        <div className="columns-container">
          {Object.entries(columnNames).map(([status, columnData]) => (
            <Column
              key={status}
              status={status}
              title={columnNames[status]}
              ccolumnData={columnNames[status]}  // Pass the full object from columnNames
              color={columnData.color}  // Add this line
              tasks={tasks.filter(task => task.status === status)}
              editingColumn={editingColumn}
              Modal
              projectId={projectId}
              handleColumnNameEdit={handleColumnNameEdit}
              handleColumnNameSave={handleColumnNameSave}
              columnNames={columnNames}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
              handleLike={handleLike}
              setShowMessaging={setShowMessaging}
              handleCommentCount={handleCommentCount}
              totalLikes={totalLikes}
              showMessaging={showMessaging}
              commentText={commentText}
              handleCommentChange={handleCommentChange}
              handleComment={handleComment}
              toggleMessaging={toggleMessaging}
              messagingStates={messagingStates}
              setColumnNames={setColumnNames}
              setTasks={setTasks}
            //onColumnDeleted={handleColumnDeleted}
            />
          ))}

          <div className="columns-container" style={{ position: 'relative', minHeight: '100vh' }}>
            <div className="column add-column" style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              width: '150px',
              minWidth: '150px',
              zIndex: 1000,
              backgroundColor: '#1976d2',  // Primary blue color
              padding: '15px',
              borderRadius: '4px',
              color: 'white'
            }}>
              <div className="column-header">
                <TextField
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column Name"
                  variant="standard"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleAddColumn} size="small">
                        <AddIcon />
                      </IconButton>
                    ),
                  }}
                />
              </div>
              <div className="column-content">
                <Typography variant="body2" sx={{ color: 'white' }} align="center">
                  Add a new column
                </Typography>
              </div>

            </div>
            <div style={{
              position: 'fixed',
              bottom: '30px',
              left: '220px',
              width: '150px',
              minWidth: '150px',
              zIndex: 1000
            }}>
              <Box sx={{ '& > :not(style)': { m: 1 } }}>

                <Fab color="secondary" aria-label="gantt" onClick={() => setShowGanttModal(true)}>
                  <TimelineIcon />
                </Fab>
              </Box>
            </div>

            {showGanttModal && (
              <Modal onClose={() => setShowGanttModal(false)}>
                <div className="gantt-view">
                  <h1>{projectTitle}</h1>
                  <h2>Gantt chart</h2>
                  <GanttChart tasks={tasks} />
                </div>
              </Modal>
            )}


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