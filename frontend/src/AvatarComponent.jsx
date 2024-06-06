import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

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

  const API_URL = 'http://localhost:3001';
  const [userExists, setUserExists] = useState(false);

  // resultat des utilisateurs affectées au projet cliqué temporairement lors de la creation/modif d'un projet

  useEffect(() => {
    handelUserExistInProject(person._id, editingProject._id)
  }, [editingProject, person._id,handelUserExistInProject]);


  useEffect(() => {
  console.log("selectedUsers1", selectedUsers)
  console.log('person._id1', person._id)
  if (selectedUsers.length > 0) {
    const exists = selectedUsers.some(user => user._id === person._id);
    console.log('test1', exists)
    if (exists === true) {
      setUserExists(true);
      console.log('test2')
    }else{
      setUserExists(false);
    }
  }
  //si userExists est true alors il faut ajouter un point vert
  // sinon (false) alors il faut enlever le point vers

}, [editingProject, person._id, selectedUsers]);

  // useEffect(() => {

  //   const fetchData = async () => {

  //     //Mettre un boutton vert sur les avatars en bd
  //     const response = await axios.get(`${API_URL}/projects/${editingProject._id}/users/${person._id}`);

  //     if (response.data.userId === person._id && response.data.isSelected) {
  //       setUserExists(true);
  //       console.log('editingProject', editingProject._id)
  //       console.log('TESTAvatarComponent')
  //     }
  //   }

  //   fetchData();

  // },  [editingProject, person._id]);


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