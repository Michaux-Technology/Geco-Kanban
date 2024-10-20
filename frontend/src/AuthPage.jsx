import React, { useState, useContext } from 'react';
import { Container, TextField, Button, Link, CssBaseline, Avatar, Grid } from '@mui/material';
import Typography from '@mui/joy/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import axios from 'axios';
import Chip from '@mui/joy/Chip';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';


function AuthPage() {

    const [email, setEmail] = useState(localStorage.getItem('email') || '');
    const [id, setId] = useState(localStorage.getItem('id') || '');
    const [avatar, setAvatar] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstname, setFirstname] = useState('');
    const [company, setCompany] = useState('');

    let [password, setPassword] = useState('');
    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log('email:', email);
            const response = await axios.post(`${API_URL}/login`, { email, password });

            if (response.data && response.data.message === 'Login successful') {
                const responseUser = await axios.get(`${API_URL}/user/email/${email}`);
                setId(responseUser.data._id);
                setAvatar(responseUser.data.avatar);
                setLastName(responseUser.data.lastName);
                setFirstname(responseUser.data.firstName);
                setCompany(responseUser.data.company);

                // Enregistrer l'avatar, le prenom et le nom de famille dans le localStorage

                //passage des Localstarage sous forme de fonction car sans fonction ca créé un bug
                //Probleme de rapidité 
                
                saveIdToLocalStorage(responseUser.data._id);
                saveAvatarToLocalStorage(responseUser.data.avatar);
                savefirstnameToLocalStorage(responseUser.data.firstName);
                saveLastNameToLocalStorage(responseUser.data.lastName);
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

                function saveLastNameToLocalStorage(lastName) {
                    localStorage.setItem('lastnameuser', lastName);
                }

                function saveCompanyToLocalStorage(company) {
                    localStorage.setItem('companyuser', company);
                }

                navigate(`/projectList?user=${responseUser.data._id}`); // Redirection vers la page projectList

            } else {
                console.error(response.data.message);
            }
        } catch (error) {
            console.error('Erreur d\'authentification', error);
        }
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

                    <Typography
                        justifyContent="center"
                        color="primary"
                        level="body-xs"
                        noWrap={false}
                        variant="plain"
                        style={{ marginTop: '1.5rem', width: '100%', textAlign: 'center' }}
                    >
                        <Link href="signIn" variant="body2">
                            {"No account yet? Sign in"}
                        </Link>
                    </Typography>

                    <Typography
                        justifyContent="center"
                        color="primary"
                        level="body-xs"
                        noWrap={false}
                        variant="plain"
                        endDecorator={
                            <Chip
                                component="span"
                                size="sm"
                                color="primary">
                                Valéry-Jérôme Michaux
                            </Chip>}
                        style={{ marginTop: '2rem' }}
                    >
                        Application created by
                    </Typography >
                    <Typography
                        justifyContent="center"
                        color="primary"
                        level="body-xs"
                        noWrap={false}
                        variant="plain"
                        style={{ width: '100%', textAlign: 'center' }}
                    >
                        <a href="https://github.com/Michaux-Technology/Geco-Kanban">Kanban Geco</a>

                    </Typography >
                </form>
            </div>
        </Container >
    );
}

export default AuthPage;

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban