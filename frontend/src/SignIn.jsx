import React, { useState, useCallback } from 'react';
import { Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import {
    Container,
    TextField,
    Button,
    Typography,
    CssBaseline,
    Avatar,
    Grid,
    IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function SignInPage() {
    const API_URL = 'http://localhost:3001';
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
            await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('File uploaded successfully');
        } catch (error) {
            console.error('Erreur lors de l\'appel axios:', error);
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
            console.log('Finally après l\'appel axios');
        }
    }

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (tempImage) {
            await onUpload(tempImage);
        }

        const response = await axios.post(`${API_URL}/signup`, {
            email: email,
            password: password,
            company: company,
            lastName: lastName,
            firstName: firstName,
            position: position
        });

        const data = response.data.message;
        setMessage(data);

        if (response.status === 200 ) {
            if(data ==='User successfully registered!'){
            navigate('/');}
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
                    Sign in
                </Typography>
                <form style={{ width: '100%', marginTop: '1rem' }} onSubmit={handleSubmit}>
                    {message && <p style={{ width: '100%', marginTop: '1rem', color: 'red' }}>** {message} **</p>}
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="E-mail address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        value={password}
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
                        Sign in
                    </Button>

                    <Grid container style={{ marginTop: '1rem' }}>
                        <Grid item>
                            <Typography variant="body2">Already have an account?
                                <Link href="/" variant="body2">
                                    {"Login"}
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </Container>
    );
}

export default SignInPage;

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban
