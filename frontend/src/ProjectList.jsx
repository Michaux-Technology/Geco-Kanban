// Imports
import React, { useEffect, useState } from 'react'

import axios from 'axios';
import { API_URL } from './config';

import { Avatar } from '@mui/material'
import { IconButton } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Container from '@mui/material/Container'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

import ProjectComponent from './ProjectComponent'
import CollaboratorComponent from './CollaboratorComponent'


const ProjectList = () => {

  //Definition des variables
  const [userId, setUserId] = useState(localStorage.getItem('id') || '')
  const [id, setId] = useState(localStorage.getItem('id') || '')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [avataruser] = useState(localStorage.getItem('avataruser') || '')
  const [value, setValue] = useState(0)
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const menu = searchParams.get('menu');

const getIduser = searchParams.get('user');

const getUserInfo = async (e) => {
  const responseUser = await axios.get(`${API_URL}/user/${getIduser}`);
  setFirstname(responseUser.data.firstName);
  setLastname(responseUser.data.lastName);
}

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

//retour de AccountEdit
  useEffect(() => {
    if (menu){
      handleChange(null, 1)
    }
    getUserInfo()
  }, [])
  
  const [anchorElNav, setAnchorElNav] = React.useState(null)

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  };

  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogOut = () => {
    setAnchorEl(null)
    navigate('/')
  }

  const handleEdit = () => {
    navigate('/AccountEdit')
  }

  const navigate = useNavigate()

  function stringToColor(string) {
    let hash = 0
    let i

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }

    let color = '#'

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff
      color += `00${value.toString(16)}`.slice(-2)
    }

    return color
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1] ? name.split(' ')[1][0] : ''}`,
    }
  }

  return (

    <div>

      <Box sx={{ width: '100%', textAlignVertical: "center", textAlign: "center" }}>
        <Typography variant="h2" gutterBottom>
          Kanban Geco
        </Typography>
      </Box>

      <AppBar sx={{ '& .MuiTab-root': { color: 'white' } }} position="static" variant="contained">
        <Container maxWidth="xl">
          <Toolbar disableGutters style={{ height: '60px', width: '100%', display: 'flex', alignItems: 'center' }}>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              {/* Format Smartphone */}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={

                  handleOpenNavMenu
                }
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem value={0} onClick={() => handleChange(null, 0)} label="List of projects">List of projects</MenuItem>
                <MenuItem value={1} onClick={() => handleChange(null, 1)} label="List of collaborators">List of collaborators</MenuItem>

              </Menu>
              <Typography
                variant="h4"
                width="100%"
                textAlign="center"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                GECO
              </Typography>

            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {/* Format ordinateur */}
              <Typography
                variant="h4"

                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                GECO
              </Typography>
              <Tabs
                value={value}
                indicatorColor="white"
                variant="fullWidth"
                textColor="inherit"
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                <Tab label="List of projects" value={0} />
                <Tab label="List of collaborators" value={1} />
              </Tabs>

            </Box>
            <IconButton
              onClick={handleMenu}
            >
              <Box sx={{ flexGrow: 0 }}>
                {/* Tous Formats */}

                {avataruser ? (
                  <Avatar src={"./uploads/" + avataruser} />
                ) : (
                  <Avatar {...stringAvatar(`${firstname} ${lastname}`)} />
                )}

                {/* <Avatar src={avataruser} /> */}
              </Box>
            </IconButton>
            <Menu
              sx={{ mt: '51px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogOut}>Logout</MenuItem>
              <MenuItem
                onClick={handleEdit}
                id={userId}>
                My account
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
      <br></br>

      {value === 0 && (
        <div>
          <ProjectComponent />
        </div>
      )}

      {value === 1 && (
        <div>
          <CollaboratorComponent />
        </div>
      )}

    </div>
  )

}

export default ProjectList

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban
// Imports
