import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Typography, Link, CssBaseline, Avatar, Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function AuthPage() {
    const API_URL = 'http://localhost:3001';

    const [email, setEmail] = useState(localStorage.getItem('email') || '');
    const [id, setId] = useState(localStorage.getItem('id') || '');
    const [avatar, setAvatar] = useState(localStorage.getItem('avataruser') || '');
    const [lastname, setLastname] = useState(localStorage.getItem('lastnameuser') || '');
    const [firstname, setFirstname] = useState(localStorage.getItem('firstnameuser') || '');
    const [company, setCompany] = useState(localStorage.getItem('companyuser') || '');

    let [password, setPassword] = useState('');
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            if (response.data && response.data.message === 'Login successful') {
                const responseUser = await axios.get(`${API_URL}/user`, { email });
                setId(responseUser.data._id);
                setAvatar(responseUser.data.avatar);
                setLastname(responseUser.data.lastName);
                setFirstname(responseUser.data.firstName);
                setCompany(responseUser.data.company);

                // Enregistrer l'avatar, le prenom et le nom de famille dans le localStorage

                //passage des Localstarage sous forme de fonction car sans fonction ca créé un bug
                //Probleme de rapidité 
                saveIdToLocalStorage(responseUser.data._id);
                saveAvatarToLocalStorage(responseUser.data.avatar);
                savefirstnameToLocalStorage(responseUser.data.firstname);
                savelastnameToLocalStorage(responseUser.data.lastname);
                saveCompanyToLocalStorage(responseUser.data.company);

                function saveIdToLocalStorage(_id) {
                    localStorage.setItem('id', _id);
                }

                function saveAvatarToLocalStorage(avatar) {
                    localStorage.setItem('avataruser', avatar);
                }

                function savefirstnameToLocalStorage(firstname) {
                    localStorage.setItem('firstnameuser', firstname);
                }

                function savelastnameToLocalStorage(company) {
                    localStorage.setItem('companyuser', company);
                }

                function saveCompanyToLocalStorage(lastname) {
                    localStorage.setItem('lastnameuser', lastname);
                }

                navigate('/projectList'); // Redirection vers la page projectList
            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error('Erreur d\'authentification', error);
        }
    };

    const handleGoogleLogin = () => {
        // Votre logique pour la connexion avec Google
        window.location.href = '/api/auth/google';
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        localStorage.setItem('email', newEmail);
        setEmail(newEmail);
    };

    return (
        <Container component="main" maxWidth="xs">

            <CssBaseline />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: '8vh'
            }}>
                <Avatar style={{ backgroundColor: '#f50057' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <form style={{ width: '100%', marginTop: '1rem' }} onSubmit={handleSubmit}>

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
                        onChange={handleEmailChange}
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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        style={{ marginTop: '1rem' }}
                    >
                        Login
                    </Button>

                    {/* Ajout du bouton de connexion Google */}
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        style={{ marginTop: '1rem' }}
                        onClick={handleGoogleLogin}
                    >
                        Login with Google
                    </Button>

                    <Grid container style={{ marginTop: '1rem' }}>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Password forgotten?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="signIn" variant="body2">
                                {"No account yet? Sign in"}
                            </Link>
                        </Grid>
                    </Grid>

                </form>
            </div>

        </Container>
    );
}

export default AuthPage;

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban