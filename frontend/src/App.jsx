import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import AuthPage from './AuthPage';
import ProjectList from './ProjectList';
import ProjectTasks from './ProjectTasks';
import SignIn from './SignIn';
import AccountEdit from './AccountEdit';
import UserList from './UserList';
import FirstUserCreate from './FirstUserCreate';
import UserContext from './UserContext';
import VideoConference from './VideoConference';
import MyTasks from './MyTasks';

// Configuration d'Axios
axios.defaults.withCredentials = true;

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('id');
  const location = useLocation();

  if (!userId) {
    // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const App = () => {
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [hasUsers, setHasUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUsers = async () => {
      try {
        console.log('Checking users at:', `${API_URL}/users`);
        const response = await axios.get(`${API_URL}/users`);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response data:', response.data);
        const userCount = response.data.length;
        console.log('Number of users found:', userCount);
        setHasUsers(userCount > 0);
        console.log('hasUsers set to:', userCount > 0);
      } catch (error) {
        console.error('Error checking users:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        console.error('Error details:', error.response?.data || error.message);
        setHasUsers(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkUsers();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  console.log('Current hasUsers value:', hasUsers);

  return (
    <Router future={router.future}>
      <UserContext.Provider value={{ email, setEmail, avatar, setAvatar }}>
        <Routes>
          <Route path="/" element={hasUsers ? <AuthPage /> : <FirstUserCreate />} />
          <Route path="/signIn" element={<SignIn />} />
          
          {/* Routes protégées */}
          <Route path="/projectList" element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          } />
          <Route path="/AccountEdit" element={
            <ProtectedRoute>
              <AccountEdit />
            </ProtectedRoute>
          } />
          <Route path="/userList" element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          } />
          <Route path="/video-conference" element={
            <ProtectedRoute>
              <VideoConference />
            </ProtectedRoute>
          } />
          <Route path="/mytasks" element={
            <ProtectedRoute>
              <MyTasks />
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId" element={
            <ProtectedRoute>
              <ProjectTasks />
            </ProtectedRoute>
          } />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
};

export default App;
