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

const AvatarComponent = ({ person, editingProject, handleAvatarClickOnChild, selectedUsers, handelUserExistInProject }) => {

  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    // resultat des utilisateurs affectées en db
    if (person && person._id && editingProject && editingProject._id) {
    handelUserExistInProject(person._id, editingProject._id)
  }
  }, [editingProject, person, handelUserExistInProject]);


  useEffect(() => {
    if (selectedUsers.length > 0 && person) {
      const exists = selectedUsers.some(user => user._id === person._id);
      if (exists === true) {
        setUserExists(true);
      } else {
        setUserExists(false);
      }
    }
    //si userExists est true alors il faut ajouter un point vert
    // sinon (false) alors il faut enlever le point vers

  }, [editingProject, person, selectedUsers]);


  console.log("userExists", userExists)

  const handleAvatarClickOn = useCallback(() => {
    handleAvatarClickOnChild(person, userExists);
  }, [])

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
              key={person._id}
              src={`./uploads/${person.avatar}`}
              alt={person.firstName}
              onClick={handleAvatarClickOn}
              sx={{
                cursor: 'pointer',
              }}
            />

          </StyledBadge>
        ) : (
          <Avatar
            key={person._id}
            src={`./uploads/${person.avatar}`}
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

export default AvatarComponent;