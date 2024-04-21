import React, { useEffect, useCallback } from 'react';
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

const AvatarComponent = ({ person, editingProject, handleAvatarClickOnChild, selectedUsersProject, handelUserExistInProject, addGreenBotton, handelUserExistnewPeople, setNewPeople }) => {
  const userExists = selectedUsersProject.includes(person._id);


  useEffect(() => {
    //console.log('User exists in the component thanks useEffect: ', userExists)
  }, [userExists])

  const fetchData = async () => {

    const result = await handelUserExistInProject(person._id, editingProject?._id);

    if (result === true) {
      // Chargement des parsticipants au projet present dans la base de données
      addGreenBotton(person, editingProject?._id, false)
    }
  }

  useEffect(() => {
    fetchData();
  }, [editingProject?._id, person._id]);

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
        )}
    </>
  );
};

export default AvatarComponent;