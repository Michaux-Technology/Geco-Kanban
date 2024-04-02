import React, { useState, useEffect } from 'react';
import { Avatar, Badge } from '@mui/material';
// import{ handelUserExistInProject } from './ProjectList';
//import { stringAvatar } from './ProjectList';

const TextAvatarComponent = ({ person, editingProject, selectedUsers, handleUserSelect, handelUserExistInProject }) => {
  console.log("TextAvatarComponent")
    const [userExists, setUserExists] = useState(null);
 
    useEffect(() => {
      const fetchData = async () => {
        const result = await handelUserExistInProject(person._id, editingProject?._id);
        setUserExists(result === 'yes');
      };
  
      fetchData();
    }, [person._id, editingProject]);


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
    
    if (userExists === null) {
      return null;
    }
  
    const isUserSelected = selectedUsers.some((user) => {
      if (user.personId === person._id && user.projectId === editingProject?._id) {
        console.log("true", user.personId);
        return true;
      }else {console.log("false", user.personId);
      return false;}
    });
  
    return (
      <React.Fragment>
       
        {isUserSelected ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              {...stringAvatar(`${person.firstName} ${person.lastName}`)}
              alt={person.firstName}
              onClick={() => handleUserSelect(person._id, editingProject?._id)}
              sx={{
                cursor: 'pointer',
              }}
            />
          </Badge>
        ) : (
          <Avatar
            {...stringAvatar(`${person.firstName} ${person.lastName}`)}
            alt={person.firstName}
            onClick={() => handleUserSelect(person._id, editingProject?._id)}
            sx={{
              cursor: 'pointer',
            }}
          />
        )}
      </React.Fragment>
    );
  };

export default TextAvatarComponent;