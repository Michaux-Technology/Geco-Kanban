import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AuthPage from './AuthPage';
import ProjectList from './ProjectList';
import ProjectTasks from './ProjectTasks';
import SignIn from './SignIn';
import AccountEdit from './AccountEdit';
import UserList from './UserList';

import './index.css';
import './styles.css';
import UserContext from './UserContext';


const App = () => {

  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
 
  return (
    <Router>
      <UserContext.Provider value={{ email, setEmail,avatar, setAvatar, setFirstname, setLastname  }}>
          <Routes>
            <Route path="/" element={<AuthPage />} />
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