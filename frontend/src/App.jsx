import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App = () => {
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [hasUsers, setHasUsers] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`);
        setHasUsers(response.data.length > 0);
      } catch (error) {
        console.error('Error checking users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkUsers();
  }, []);

  if (isLoading) {
    return null; // or return a loading spinner if preferred
  }

  return (
    <Router>
      <UserContext.Provider value={{ email, setEmail, avatar, setAvatar, setFirstname, setLastname }}>
        <Routes>
          <Route path="/" element={hasUsers ? <AuthPage /> : <FirstUserCreate />} />
          <Route path="/projectList" element={<ProjectList />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/AccountEdit" element={<AccountEdit />} />
          <Route path="/userList" element={<UserList />} />
          <Route path="/projects/:projectId" element={<ProjectTasks />} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
};

export default App;
