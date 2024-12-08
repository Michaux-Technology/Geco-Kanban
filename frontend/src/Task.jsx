import React, { useState, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Button, Box, Typography, ListItemIcon, ListItem, ListItemText, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatIcon from '@mui/icons-material/Chat';
import { AvatarGroup, Avatar } from '@mui/material';
import { API_URL_FRONT } from './config';
import { API_URL } from './config';
import axios from 'axios';
import GaugeChart from 'react-gauge-chart';
import { Slider } from '@mui/material';

const Task = ({ task, index, handleEditTask, handleDeleteTask, handleLike, handleCommentCount, totalLikes, handleComment, showMessaging, toggleMessaging }) => {

  const [taskComments, setTaskComments] = useState(task.comments);
  const [taskUserDetails, setTaskUserDetails] = useState([]);
  const [gaugeValue, setGaugeValue] = useState(task.gauge || 0);

  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (task.users && task.users.length > 0) {
        try {
          const userPromises = task.users.map(userId =>
            axios.get(`${API_URL}/users/${userId}`)
          );
          const responses = await Promise.all(userPromises);
          const users = responses.map(response => response.data);
          setTaskUserDetails(users);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, [task.users]);

  useEffect(() => {
    setGaugeValue(task.gauge || 0);
  }, [task.gauge]);

  useEffect(() => {
    setTaskComments(task.comments);
  }, [task.comments]);

  const [localLikes, setLocalLikes] = useState(task.likes ? task.likes.length : 0);

  useEffect(() => {
    setLocalLikes(task.likes ? task.likes.length : 0);
  }, [task.likes]);

  const [localCommentText, setLocalCommentText] = useState('');

  const handleLocalCommentChange = (event) => {
    setLocalCommentText(event.target.value);
  };

  const handleLocalComment = () => {
    handleComment(task._id, localCommentText);
    setLocalCommentText('');
  };

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
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="task">
            <div style={{ backgroundColor: task.color }} className="task"></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><b>{task.title}</b></span>
              <div>
                <button onClick={() => handleEditTask(task._id)}><EditIcon /></button>
                <button onClick={() => handleDeleteTask(task._id)}><DeleteOutlineIcon /></button>
              </div>



            </div>

            <div style={{
              marginTop: '10px',
              width: '100px',
              marginLeft: 'auto',
              float: 'right'
            }}>
              <GaugeChart
                id={`gauge-chart-${task._id}`}
                nrOfLevels={20}
                percent={gaugeValue / 100}
                colors={['#FF5F6D', '#FFC371', '#4CAF50']}
                arcWidth={0.3}
                textColor="#000000"
              />
            </div>

            <Box component="div">
              <Typography display="block" sx={{ fontSize: 12 }}>
                {task.description}
              </Typography>
            </Box>
            <Typography display="block" sx={{ fontSize: 12, display: 'flex', alignItems: 'middle' }}>
              {task.priority ? 'Priority:' : ''}
              <ListItemIcon>
                <div style={{ marginLeft: '10px', width: '100%', height: '14px', backgroundColor: task.priority }}></div>
              </ListItemIcon>
            </Typography>


            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px', marginLeft: '10px' }}>

              <AvatarGroup max={100}>
                {taskUserDetails.map(user => (
                  user.avatar ? (
                    <Avatar
                      key={user._id}
                      src={`${API_URL_FRONT}/uploads/${user.avatar}`}
                      alt={user.name}
                      sx={{ width: 24, height: 24 }}
                    />
                  ) : (
                    <Avatar
                      key={user._id}
                      {...stringAvatar(`${user.firstName} ${user.lastName}`)}
                      alt={user.name}
                      sx={{ width: 24, height: 24 }}
                    />
                  )
                ))}
              </AvatarGroup>

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
                onClick={() => handleLike(task._id)}
                style={{ verticalAlign: 'middle' }}
              >
                <ThumbUpIcon sx={{ fontSize: 17 }} />
                {localLikes}
              </Button>
              <Button
                sx={{ fontSize: 12 }}
                color="primary"
                onClick={() => {
                  toggleMessaging(task._id);
                  handleCommentCount();
                }}
                style={{ verticalAlign: 'middle' }}
              >
                <ChatIcon sx={{ fontSize: 17 }} />  &nbsp;{task.comments ? task.comments.length : 0}
              </Button>

              <Typography
                sx={{ fontSize: 12, display: 'inline-block', marginLeft: 2 }}
                color="primary"
              >
                Working Days: {task.workingDay || 0}
              </Typography>



            </div>
            {showMessaging && (
              <div>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  label="Write a comment"
                  value={localCommentText}
                  onChange={handleLocalCommentChange}
                  style={{ marginTop: 20 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLocalComment}
                  style={{ marginTop: 20 }}
                >
                  Comment
                </Button>

                {task.comments && [...task.comments]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((comment, index) => (
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
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

};

export default Task;


// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban