import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import {
    Container,
    CssBaseline,
    Avatar,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const AccountEdit = ({ userId, idListUsers }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [position, setPosition] = useState('');
    const [message, setMessage] = useState('');
    const [avatar, setAvatar] = useState('');
    const [tempImage, setTempImage] = useState(null);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Vérifier si le fichier est une image
            if (!file.type.startsWith('image/')) {
                setMessage('Please upload an image file');
                return;
            }
            // Vérifier la taille du fichier (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setMessage('File size should not exceed 5MB');
                return;
            }
            setTempImage(file);
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        let avatarPath = avatar;

        try {
            if (tempImage) {
                const formData = new FormData();
                formData.append('avatar', tempImage);
                
                const uploadResponse = await axios.post(`${API_URL}/upload/avatar`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                if (!uploadResponse.data.path) {
                    throw new Error('No path received from server');
                }
                
                avatarPath = uploadResponse.data.path;
            }

            const formPassword = e.target.password.value !== '' ? e.target.password.value : undefined;

            let response;
            const userData = {
                email,
                company,
                lastName,
                firstName,
                position,
                avatar: avatarPath,
                ...(formPassword && { password: formPassword }),
            };

            if (idListUsers) {
                response = await axios.put(`${API_URL}/user/${idListUsers}`, userData);
            } else {
                response = await axios.put(`${API_URL}/user/${userId}`, userData);
            }

            setMessage(response.data.message);
            if (response.status === 200) {
                if (response.data.message === 'User successfully edited!') {
                    localStorage.setItem('avataruser', avatarPath);
                    window.dispatchEvent(new Event('avatarUpdated'));
                    navigate('/projectList');
                }
            }
        } catch (error) {
            console.error('Error during update:', error);
            setMessage(error.response?.data?.message || 'Error updating user information');
        }
    }, [email, company, lastName, firstName, position, navigate, tempImage, avatar, idListUsers, userId]);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '8vh',
                }}
            >
                <Avatar 
                    src={tempImage ? avatar : avatar ? `${API_URL}${avatar}` : null}
                    style={{ 
                        backgroundColor: '#f50057', 
                        width: 80, 
                        height: 80,
                        cursor: 'pointer'
                    }}
                >
                    {!avatar && <LockOutlinedIcon />}
                </Avatar>
                <Typography component="h1" variant="h5">
                    Account Edit
                </Typography>
                <form style={{ width: '100%', marginTop: '1rem' }} onSubmit={handleSubmit}>
                    {message && <p style={{ width: '100%', marginTop: '1rem', color: 'red' }}>** {message} **</p>}
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Adresse e-mail"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="company"
                        label="company"
                        name="company"
                        autoComplete="lname"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="lname"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        name="firstName"
                        autoComplete="fname"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="position"
                        label="Position"
                        name="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                    />
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="icon-button-file"
                        type="file"
                        onChange={handleAvatarChange}
                    />
                    <div sx={{ alignItems: 'middle' }}>
                        <label htmlFor="icon-button-file">
                            <IconButton
                                color="primary"
                                aria-label="upload picture"
                                component="span"
                                style={{ marginTop: '1rem' }}
                            >
                                <PhotoCamera />
                            </IconButton >
                        </label>
                        <Typography>Upload Avatar</Typography>
                    </div>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '1rem' }}
                    >
                        Validate
                    </Button>
                </form>
            </div>
        </Container>
    );
}

export default AccountEdit;

// **************************************************
//
// Application created by Valery-Jerome Michaux
//
// **************************************************
