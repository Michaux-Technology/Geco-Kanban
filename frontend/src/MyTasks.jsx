import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, API_URL_FRONT } from './config';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Paper,
  AvatarGroup,
  Chip,
  Grid
} from '@mui/material';
import TextAvatarComponent from './TextAvatarComponent';
import AvatarComponent from './AvatarComponent';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const userId = localStorage.getItem('id');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleAvatarClick = (person, exists) => {
    // Dans ce contexte, nous n'avons pas besoin de gérer le clic
    console.log("Avatar clicked:", person.firstName);
  };

  const handleUserExist = async (userId, projectId) => {
    // Dans ce contexte, nous n'avons pas besoin de vérifier l'existence
    return true;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/${userId}/tasks`);
        console.log('Initial tasks response:', response.data);
        
        const tasksWithDetails = await Promise.all(
          response.data.map(async (task) => {
            console.log('Processing task:', task);
            
            // Récupérer les détails du projet
            const projectResponse = await axios.get(`${API_URL}/projects/${task.projectId}`);
            console.log('Project data for task:', projectResponse.data);
            
            // Créer les données de la colonne à partir du status et des colonnes du projet
            const columnData = task.status && projectResponse.data.columns ? {
              title: projectResponse.data.columns[task.status]?.name || task.status.charAt(0).toUpperCase() + task.status.slice(1),
              color: projectResponse.data.columns[task.status]?.color || '#757575'
            } : null;
            
            // Récupérer les détails des utilisateurs assignés
            const assignedUsers = await Promise.all(
              task.users.map(async (userId) => {
                const userResponse = await axios.get(`${API_URL}/users/${userId}`);
                return userResponse.data;
              })
            );

            return {
              ...task,
              project: projectResponse.data,
              column: columnData,
              assignedUsers
            };
          })
        );

        console.log('Tasks with details:', tasksWithDetails);

        const savedOrder = localStorage.getItem(`taskOrder-${userId}`);
        
        let sortedTasks;
        if (savedOrder) {
          const orderMap = new Map(JSON.parse(savedOrder));
          sortedTasks = [...tasksWithDetails].sort((a, b) => {
            const orderA = orderMap.get(a._id) ?? Infinity;
            const orderB = orderMap.get(b._id) ?? Infinity;
            return orderA - orderB;
          });
        } else {
          sortedTasks = [...tasksWithDetails].sort((a, b) => 
            new Date(b.begindate) - new Date(a.begindate)
          );
        }
        setTasks(sortedTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask._id === targetTask._id) return;

    const newTasks = [...tasks];
    const draggedIndex = tasks.findIndex(t => t._id === draggedTask._id);
    const targetIndex = tasks.findIndex(t => t._id === targetTask._id);

    newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);

    // Sauvegarder le nouvel ordre
    const orderMap = new Map(
      newTasks.map((task, index) => [task._id, index])
    );
    localStorage.setItem(`taskOrder-${userId}`, JSON.stringify([...orderMap]));
    
    setTasks(newTasks);
  };

  const getPriorityColor = (priority) => {
    if (!priority) return '#757575';
    
    switch (priority.toLowerCase()) {
      case 'red':
      case 'high':
      case '#f44336':
        return '#f44336';
      case 'orange':
      case 'medium':
      case '#ff9800':
        return '#ff9800';
      case 'green':
      case 'low':
      case '#4caf50':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getPriorityText = (priority) => {
    if (!priority) return 'Not defined';
    
    switch (priority.toLowerCase()) {
      case 'red':
      case 'high':
      case '#f44336':
        return 'High';
      case 'orange':
      case 'medium':
      case '#ff9800':
        return 'Medium';
      case 'green':
      case 'low':
      case '#4caf50':
        return 'Low';
      default:
        return priority;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 4 }}>
        My Tasks
      </Typography>

      <Box>
        {tasks.map((task) => (
          <Paper 
            key={task._id} 
            sx={{ 
              mb: 2, 
              '&:hover': { 
                boxShadow: 3,
                cursor: 'grab'
              },
              '&:active': {
                cursor: 'grabbing'
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '6px',
                backgroundColor: task.color || '#4A90E2',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px'
              }
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task)}
          >
            <Card sx={{ ml: '6px' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  {/* Task title */}
                  <Grid item xs={12} sm={3} md={2.5}>
                    <Typography variant="h6" noWrap>
                      {task.title}
                    </Typography>
                  </Grid>

                  {/* Dates */}
                  <Grid item xs={12} sm={3} md={2.5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        From: {formatDate(task.begindate)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        End: {formatDate(task.enddate)}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Project */}
                  <Grid item xs={12} sm={3} md={2}>
                    <Typography variant="h6" noWrap>
                      {task.project?.title || 'N/A'}
                    </Typography>
                  </Grid>

                  {/* Assigned users */}
                  <Grid item xs={12} sm={1.5} md={2}>
                    <AvatarGroup 
                      max={4} 
                      sx={{ 
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'center',
                        '& .MuiAvatar-root': {
                          width: 35,
                          height: 35,
                          fontSize: '1rem',
                          marginLeft: '-8px',
                          '&:first-of-type': {
                            marginLeft: '0'
                          }
                        }
                      }}
                    >
                      {task.assignedUsers?.map((user) => (
                        user.avatar ? (
                          <AvatarComponent
                            key={user._id}
                            person={user}
                            editingProject={task.project}
                            handleAvatarClickOnChild={handleAvatarClick}
                            selectedUsers={selectedUsers}
                            handelUserExistInProject={handleUserExist}
                          />
                        ) : (
                          <TextAvatarComponent
                            key={user._id}
                            person={user}
                            editingProject={task.project}
                            handleAvatarClickOnChild={handleAvatarClick}
                            selectedUsers={selectedUsers}
                            handelUserExistInProject={handleUserExist}
                          />
                        )
                      ))}
                    </AvatarGroup>
                  </Grid>

                  {/* Column and Priority */}
                  <Grid item xs={12} sm={1.5} md={3}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      height: '100%',
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      ml: 2
                    }}>
                      <Chip
                        label={task.column?.title || 'No column'}
                        sx={{
                          backgroundColor: task.column?.color || '#757575',
                          color: 'white',
                          fontWeight: 'bold',
                          display: { xs: 'none', sm: 'none', md: 'flex' },
                          minWidth: '120px',
                          '& .MuiChip-label': {
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'center',
                            padding: '0 8px'
                          }
                        }}
                      />
                      <Chip
                        label={getPriorityText(task.priority)}
                        sx={{
                          backgroundColor: getPriorityColor(task.priority),
                          color: 'white',
                          fontWeight: 'bold',
                          minWidth: { xs: '80px', sm: '100px' },
                          display: { xs: 'none', sm: 'flex' }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Paper>
        ))}
      </Box>

      {tasks.length === 0 && (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No assigned tasks
        </Typography>
      )}
    </Container>
  );
};

export default MyTasks; 