import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const TextAvatarComponent = ({ person, editingProject, handleAvatarClickOnChild, selectedUsers, handleUserSelect, handelUserExistInProject }) => {

  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    // resultat des utilisateurs affectées en db
    if (person && person._id && editingProject && editingProject._id) {
      //console.log("person", person)
      handelUserExistInProject(person._id, editingProject._id)
    }
    }, [editingProject, person, handelUserExistInProject]);


useEffect(() => {
  if (selectedUsers.length > 0 && person) {
  const exists = selectedUsers.some(user => user._id === person._id);
  if (exists === true) {
    setUserExists(true);
  }else{
    setUserExists(false);
  }
}
//si userExists est true alors il faut ajouter un point vert
// sinon (false) alors il faut enlever le point vers

}, [editingProject, person, selectedUsers]);


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


  if (selectedUsers && selectedUsers.some) {
    const isUserSelected = selectedUsers.some((user) => {
      if (user.personId === person._id && user.projectId === editingProject?._id) {
        //console.log("true", user.personId);
        return true;
      } else {
        //console.log("false", user.personId);
        return false;
      }
    });
  }

  return (
    <>
      {
        (userExists === true) ? (
          <StyledBadge
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

          </StyledBadge>

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

        )
      }
    </>
  );
};

export default TextAvatarComponent;