import React, { useState, useEffect } from 'react';
import { Avatar, Badge } from '@mui/material';
import { handelUserExistInProject } from './ProjectList.js';
import { stringAvatar } from './ProjectList.js';

const TextAvatarComponent = ({ person, editingProject, selectedUsers, handleUserSelect }) => {
  console.log("TextAvatarComponent")
    const [userExists, setUserExists] = useState(null);
 
    useEffect(() => {
      const fetchData = async () => {
        const result = await handelUserExistInProject(person._id, editingProject?._id);
        setUserExists(result === 'yes');
      };
  
      fetchData();
    }, [person._id, editingProject]);
    
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