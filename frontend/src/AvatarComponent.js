import React, { useState, useEffect } from 'react';
import { Avatar, Badge } from '@mui/material';
import { handelUserExistInProject } from './ProjectList.js';
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

const AvatarComponent = ({ person, editingProject, handleUserSelect }) => {
  const [userExists, setUserExists] = useState(null);
  const [userSelectedForUpdate, setUserSelectedForUpdate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const result = await handelUserExistInProject(person._id, editingProject?._id);
      setUserExists(result === true);
    };

    fetchData();
  }, [person._id, editingProject, userExists]);

  const handleAvatarClickOn = () => {
    //handleUserSelect(person._id, editingProject?._id);
    setUserSelectedForUpdate(true);
  };

  const handleAvatarClickOff = () => {
    //handleUserSelect(person._id, editingProject?._id);
    setUserSelectedForUpdate(false);
  };

  return (
    <React.Fragment>
      {
        (userExists === true  || userSelectedForUpdate)? (
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              src={`./uploads/${person.avatar}`}
              alt={person.firstName}
              onClick={handleAvatarClickOff}
              //onClick={() => handleUserSelect(person._id, editingProject?._id)}
              sx={{
                cursor: 'pointer',
              }}
            />
          </StyledBadge>
        ) : (
          <Avatar
            src={`./uploads/${person.avatar}`}
            alt={person.firstName}
            updateExistUser={userExists}
            onClick={handleAvatarClickOn}
            //onClick={() => handleUserSelect(person._id, editingProject?._id)}
            sx={{
              cursor: 'pointer',
            }}
          />
        )}
    </React.Fragment>
  );
};

export default AvatarComponent;