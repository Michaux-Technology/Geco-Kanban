import React, { useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';


import {
    Container,
    TextField,
    Button,
    Typography,
    CssBaseline,
    Avatar,
    IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function AccountEdit() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [firstName, setFirstName] = useState('');
    const [position, setPosition] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [message, setMessage] = useState('');
    let [tempImage, setTempImage] = useState(null);
    const navigate = useNavigate();
    const [userId, setUserId] = useState(localStorage.getItem('id') || '')
    const socket = io(API_URL); // Connectez-vous au serveur WebSocket
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const idListUsers = searchParams.get('id');

    useEffect(() => {
        const fetchData = async () => {
            try {

                let response;

                if (idListUsers) {
                    response = await axios.get(`${API_URL}/user/${idListUsers}`);
                } else {
                    response = await axios.get(`${API_URL}/user/${userId}`);
                }

                const userData = response.data;

                // Mettre à jour les valeurs des champs de l'utilisateur avec les données récupérées
                setEmail(userData.email);
                setLastName(userData.lastName);
                setCompany(userData.company);
                setFirstName(userData.firstName);
                setPosition(userData.position);
                setAvatar(userData.avatar);
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
            }
        };

        fetchData();
    }, []);

    //retour vers projectList
    const handleGoBack = () => {
        window.location.href = `/projectList?menu=1&user=${userId}`;
      };

    const handleAvatarChange = (event) => {
        event.preventDefault();
        console.log(event)

        if (event.target.files && event.target.files[0]) {
            setAvatar(URL.createObjectURL(event.target.files[0]));
            const file = event.target.files[0];
            setTempImage(file);
        }
    };

    //sans envoi a un serveur 
    const onUpload = async (file) => {
        console.log('Uploaded:', file)
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', },
            });

            console.log('File uploaded successfully');
        } catch (error) {
            console.error('Erreur lors de l’appel axios:', error);
            if (error.response) {
                // La requête a été faites et le serveur a répondu avec un statut
                // qui est hors de la plage de 2xx
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                // La requête a été faites mais pas de réponse a été reçue
                console.error('Request data:', error.request);
            } else {
                // Quelque chose s'est produit lors de la configuration de la requête
                console.error('Error message:', error.message);
            }
        } finally {
            console.log('Finally après l’appel axios');
        }
    }

    const handleSubmit = useCallback(async (e, userId, idListUsers) => {
        e.preventDefault();

        if (tempImage) {
            await onUpload(tempImage);
        }

        const password = e.target.password.value !== '' ? e.target.password.value : undefined;

        let response;
        if (idListUsers) {
             response = await axios.put(`${API_URL}/user/${idListUsers}`, {
                email: email,
                company: company,
                lastName: lastName,
                firstName: firstName,
                position: position,
                ...(password && { password: password }),
            });

            socket.emit('updateCollaborator', {
                _id: idListUsers,
                email: email,
                company: company,
                lastName: lastName,
                firstName: firstName,
                position: position,
                ...(password && { password: password }),
            });

        } else {
             response = await axios.put(`${API_URL}/user/${userId}`, {
                email: email,
                company: company,
                lastName: lastName,
                firstName: firstName,
                position: position,
                ...(password && { password: password }),
            });

            socket.emit('updateCollaborator', {
                _id: userId,
                email: email,
                company: company,
                lastName: lastName,
                firstName: firstName,
                position: position,
                ...(password && { password: password }),
            });
        }
        const data = response.data.message;
        setMessage(data);

        if (response.status === 200) {
            if (data === 'User successfully edited!') {
                navigate('/');
            }
        }

    }, [email, password, company, lastName, firstName, position, navigate, tempImage]);

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
                <Avatar src={avatar} style={{ backgroundColor: '#f50057', width: 80, height: 80 }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Account Edit
                </Typography>
                <form style={{ width: '100%', marginTop: '1rem' }} onSubmit={(e) => {

                    handleSubmit(e, userId, idListUsers);
                }}>
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
                        onChange={(e) => setPassword(e.target.value)}
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
                        filename={`/upload/${avatar}`}
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
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '1rem' }}
                    onClick={handleGoBack}
                >
                    Return
                </Button>
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
