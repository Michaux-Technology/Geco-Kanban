import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Badge } from '@mui/material';
// import{ handelUserExistInProject } from './ProjectList';
//import { stringAvatar } from './ProjectList';

const TextAvatarComponent = ({ person, editingProject, handleAvatarClickOnChild, selectedUsers, handleUserSelect, handelUserExistInProject, addGreenBotton }) => {

    const [userExists, setUserExists] = useState(null);
 
    const fetchData = async () => {

      const result = await handelUserExistInProject(person._id, editingProject?._id);
  
      if (result === true) {
        // Chargement des parsticipants au projet present dans la base de données
        addGreenBotton(person, editingProject?._id, false)
      }
    }

    useEffect(() => {
      fetchData();
    }, [person._id, editingProject]);


    const handleAvatarClickOn = useCallback(() => {
      handleAvatarClickOnChild(person, userExists);
    }, [])

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
       
       {
        (userExists === true) ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              {...stringAvatar(`${person.firstName} ${person.lastName}`)}
              key={person._id}
              alt={person.firstName}
              onClick={handleAvatarClickOn}
              sx={{
                cursor: 'pointer',
              }}
            />
          </Badge>
        ) : (
          <Avatar
            {...stringAvatar(`${person.firstName} ${person.lastName}`)}
            key={person._id}
            alt={person.firstName}
            onClick={handleAvatarClickOn}
            sx={{
              cursor: 'pointer',
            }}
          />
        )}
      </React.Fragment>
    );
  };

export default TextAvatarComponent;