// backend/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const config = require('./config.js');
const winston = require('winston');

// Utiliser 'psl' (Public Suffix List) au lieu de 'punycode'
// Cette dépendance doit être installée via npm install psl
const fs = require('fs');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Configuration du logger
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.101:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  credentials: true
}));
app.use(express.json());

// Servir les fichiers statiques depuis le dossier public de frontend
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads')));

const server = http.createServer(app);

// Utilisation de la configuration CORS avec socket.io
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.1.101:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Désactiver l'avertissement de dépréciation de punycode
process.noDeprecation = true;

mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Database connection successful');
  io.emit('dbStatus', { status: 'connected' });
}).catch((error) => {
  console.log('❌ Database connection failed:', error.message);
  io.emit('dbStatus', { 
    status: 'error',
    message: `Database connection failed: ${error.message}` 
  });
});


// -------- Schemas ------------------------

const FileSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  size: Number
});

const File = mongoose.model('File', FileSchema);

const meetingSchema = new mongoose.Schema({
  roomId: String,
  name: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: Date,
  active: { type: Boolean, default: true }
});

const Meeting = mongoose.model('Meeting', meetingSchema);

const TaskSchema = new mongoose.Schema({
  title: String,
  status: String, // 'todo', 'inProgress', 'done'
  order: Number,
  color: { type: String, default: '#4A90E2' },
  description: String,
  begindate: Date,
  enddate: Date,
  priority: String,
  projectId: String,
  gauge: { type: Number, default: 0 },
  workingDay: { type: Number, default: 0 },
  dependencies: { type: String, default: null },
  users: [{ type: String }],
  likes: [{ type: String }], // Array of user IDs who liked the task
  comments: [{
    user: String,
    content: String,
    createdAt: Date,
    firstName: String,
    lastName: String
  }]
});

const Task = mongoose.model('Task', TaskSchema);

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  rating: Number,
  enddate: Date,
  image: String,
  gauge: { type: Number, default: 0 },
  columns: {
    type: Map,
    of: {
      type: {
        name: String,
        color: { type: String, default: '#4CAF50' }
      },
      default: {
        todo: { name: 'Todo', color: '#4CAF50' },
        inProgress: { name: 'In Progress', color: '#4CAF50' },
        done: { name: 'Done', color: '#4CAF50' }
      }
    }
  },

});

ProjectSchema.statics.findColumnNamesByProjectId = async function (projectId) {
  const project = await this.findById(projectId);
  return project ? project.columns : null;
};

const Project = mongoose.model('Project', ProjectSchema);

const ProjectUsersSchema = new mongoose.Schema({
  projectId: String,
  userId: String,
});

const ProjectUsers = mongoose.model('ProjectUsers', ProjectUsersSchema);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // Assurez-vous de hacher les mots de passe avant de les sauvegarder !
  company: { type: String, required: true },
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  position: { type: String, required: true },
  avatar: { type: String }  // Vous pouvez sauvegarder le chemin vers l'avatar ici
});

const User = mongoose.model('User', UserSchema);


const CollaboratorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  position: { type: String, required: true },
  avatar: { type: String },  // Vous pouvez sauvegarder le chemin vers l'avatar ici
  emailGroup: { type: String, required: true }
});

const Collaborator = mongoose.model('Collaborator', CollaboratorSchema);

let namefile = '';

// io.socket 
const fileChunks = new Map();

io.on('connection', (socket) => {

  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('signal', ({ userId, signal }) => {
      socket.to(roomId).emit('signal', { userId, signal });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  socket.on('fileChunk', async (data) => {
    const { projectId, fileName, chunk, chunkIndex, totalChunks, fileType, fileSize } = data;

    if (!fileChunks.has(fileName)) {
      fileChunks.set(fileName, new Array(totalChunks));
    }

    const chunks = fileChunks.get(fileName);
    chunks[chunkIndex] = Buffer.from(chunk);

    const receivedChunks = chunks.filter(Boolean).length;

    if (receivedChunks === totalChunks) {
      const completeFile = Buffer.concat(chunks);

      const uploadDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', projectId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, completeFile);

      const uploadedFile = await File.create({
        projectId,
        name: fileName,
        path: `/uploads/${projectId}/${fileName}`,
        type: fileType,
        size: fileSize
      });

      socket.emit('fileUploaded', uploadedFile);
      fileChunks.delete(fileName);
    }
  });


  socket.on('uploadFile', async (data) => {
    try {
      const { projectId, file } = data;

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', projectId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Write file using Buffer
      const buffer = Buffer.from(file.data);
      const filePath = path.join(uploadDir, file.name);
      fs.writeFileSync(filePath, buffer);

      // Create database entry
      const uploadedFile = await File.create({
        projectId: projectId,
        name: file.name,
        path: `/uploads/${projectId}/${file.name}`,
        type: file.type,
        size: file.size
      });

      socket.emit('fileUploaded', uploadedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  });


  socket.on('updateTask', async ({ taskId, status, order }) => {
    try {
      await Task.findByIdAndUpdate(taskId, { status, order });
      io.emit('taskUpdated', { taskId, status, order });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  });

  socket.on('taskUpdated', (task) => {
    socket.broadcast.emit('taskUpdated', task);
  });


  // Gérez les événements pour les projets ici
  socket.on('addProject', async (projectData) => {
    try {
      let project = '';
      const defaultColumns = new Map([
        ['todo', { name: 'Todo', color: '#4CAF50' }],
        ['inProgress', { name: 'In Progress', color: '#4CAF50' }],
        ['done', { name: 'Done', color: '#4CAF50' }]
      ]);

      if (projectData.tempImage) {
        project = new Project({
          title: projectData.title,
          description: projectData.description,
          enddate: projectData.enddate,
          image: `/uploads/projects/${projectData._id}/${namefile}`,
          gauge: projectData.gauge, // Add this
          columns: defaultColumns
        });
      } else {
        project = new Project({
          title: projectData.title,
          description: projectData.description,
          enddate: projectData.enddate,
          image: '',
          gauge: projectData.gauge, // Add this
          columns: defaultColumns
        });
      }

      await project.save();
      const projectId = { _id: project._id };
      io.emit('addProjectResponse', projectId);
      return projectId;

    } catch (error) {
      console.error('Error adding project:', error);
    }
  });


  socket.on('addCollab', async (collabData) => {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(collabData.password, salt);

      const collaborator = new User({
        email: collabData.email,
        lastName: collabData.lastname,
        firstName: collabData.firstname,
        position: collabData.position,
        company: collabData.company,
        password: hashedPassword,
        avatar: collabData.avatar
      });

      await collaborator.save();
      io.emit('CollaboratorAdded', collaborator);

    } catch (error) {
      console.error('Error adding Collaborator:', error);
    }
  });

  socket.on('updateProject', async (projectData) => {
    try {
      const { _id, title, description, enddate, tempImage, gauge } = projectData;

      if (tempImage) {
        await Project.findByIdAndUpdate(_id, {
          title,
          description,
          enddate,
          image: `/uploads/projects/${_id}/${namefile}`, // Store complete path with filename
          gauge
        });
      } else {
        await Project.findByIdAndUpdate(_id, {
          title,
          description,
          enddate,
          gauge
        });
      }

      io.emit('projectUpdated', projectData);

      return () => {
        socket.off('projectUpdated');
      };

    } catch (error) {
      console.error('Error updating project:', error);
    }
  });




  socket.on('updateRatingProject', async (projectData) => {
    try {
      const { _id, rating } = projectData;

      await Project.findByIdAndUpdate(_id, { rating: rating });

      io.emit('projectRatingUpdated', projectData);

    } catch (error) {

      console.error('Error updating project:', error);
    }
  });


  socket.on('updateCollaborator', async (collaboratorData) => {
    try {

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { _id, email, company, lastName, firstName, position, password } = collaboratorData;

      await Project.findByIdAndUpdate(_id, { email: email, company: company, lastName: lastName, firstName: firstName, position: position, password: hashedPassword, });

      io.emit('projectUpdated', collaboratorData);

    } catch (error) {
      console.error('Error updating project:', error);
    }
  });


  socket.on('updateCollaborators', async (userData) => {
    try {
      const { _id, email, compagny, lastName, firstName, position, avatar } = userData;

      await User.findByIdAndUpdate(_id, { email: email, compagny: compagny, lastName: lastName, firstName: firstName, position: position, avatar: avatar });
      io.emit('collaboratorsUpdated', userData);

    } catch (error) {
      console.error('Error updating project:', error);
    }
  });

  socket.on('deleteProject', async (projectId) => {
    try {
      const validProjectId = new mongoose.Types.ObjectId(projectId);

      // Check existing records before deletion
      const existingUsers = await ProjectUsers.find({ projectId: projectId });

      // Delete project users with both formats to ensure matching
      const deleteResult = await ProjectUsers.deleteMany({
        $or: [
          { projectId: projectId },
          { projectId: validProjectId }
        ]
      });

      await Task.deleteMany({ projectId: projectId });
      await Project.findByIdAndDelete(validProjectId);

      // Add directory deletion here
      const projectUploadPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'projects', projectId);

      if (fs.existsSync(projectUploadPath)) {
        fs.rmSync(projectUploadPath, { recursive: true, force: true });
      }

      io.emit('projectDeleted', projectId);

    } catch (error) {
      console.error('Error deleting project:', error);
    }
  });


  socket.on('deleteUser', async (userId) => {
    try {
      const validUserId = new mongoose.Types.ObjectId(userId);
      await User.findByIdAndDelete(validUserId);
      io.emit('userDeleted', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }

  });

  socket.on('disconnect', () => {
  });

  // Gestion de la suppression d'une room
  socket.on('delete_room', () => {
    const roomID = [...socket.rooms][1]; // Obtenir l'ID de la room (le premier est l'ID du socket)
    if (roomID) {
      // Informer tous les utilisateurs de la room qu'elle va être supprimée
      io.to(roomID).emit('room_deleted');
      
      // Déconnecter tous les utilisateurs de la room
      const clientsInRoom = io.sockets.adapter.rooms.get(roomID);
      if (clientsInRoom) {
        clientsInRoom.forEach(clientId => {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket) {
            clientSocket.disconnect(true);
          }
        });
      }
    }
  });

});


// -------- Authentification ------------------------

app.use(passport.initialize());

// Configuration de Passport pour l'authentification locale

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
  async function (email, password, done) {

    try {
      const user = await User.findOne({ email: email });

      if (!user.firstName) {

        return done(null, false, { message: 'Incorrect email.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });

      }

      return done(null, user);

    } catch (err) {
      return done(err);
    }

  }));

  // Create new meeting
  app.post('/meetings', async (req, res) => {
  try {
    const meeting = new Meeting(req.body);
    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route with your other endpoints
app.get('/meetings/active/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId || userId === 'null') {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    const activeMeetings = await Meeting.find({
      participants: userId,
      active: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('createdBy', 'firstName lastName');
    
    res.json(activeMeetings);
  } catch (error) {
    console.error('Error fetching active meetings:', error);
    res.status(500).json({ message: 'Error fetching active meetings' });
  }
});


// Get user's meetings
app.get('/meetings/user/:userId', async (req, res) => {
  try {
    const meetings = await Meeting.find({
      participants: req.params.userId,
      active: true
    }).populate('participants', 'firstName lastName');
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete meeting
app.delete('/meetings/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/projects/:projectId/columns/:columnId/color', async (req, res) => {
  try {
    const { color } = req.body;
    const project = await Project.findById(req.params.projectId);
    const columnData = project.columns.get(req.params.columnId);

    project.columns.set(req.params.columnId, {
      name: columnData.name,  // Keep the existing name
      color: color  // Update only the color
    });

    await project.save();
    res.json(project.columns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/users/:userId/tasks', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find all tasks where this user is assigned
    const tasks = await Task.find({ users: userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user tasks', error: error.message });
  }
});

app.post('/tasks/:taskId/userId/:userId/like', async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.params.userId;

  try {

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const userLikedIndex = task.likes.indexOf(userId);
    if (userLikedIndex === -1) {
      task.likes.push(userId);
    } else {
      task.likes.splice(userLikedIndex, 1);
    }

    await task.save();
    res.json({ likes: task.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Error updating likes' });
  }
});

app.get('/projects/:projectId/columns', async (req, res) => {
  try {
    const { projectId } = req.params;
    // Fetch column names from the database for the given projectId
    // Replace this with your actual database query
    const columnNames = await Project.findColumnNamesByProjectId(projectId);
    res.json(columnNames);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching column names', error });
  }
});

app.put('/projects/:projectId/columns/:columnId', async (req, res) => {
  const { projectId, columnId } = req.params;
  const { name } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const currentColumn = project.columns.get(columnId);
    project.columns.set(columnId, {
      name: name,
      color: currentColumn.color || '#4CAF50'
    });

    await project.save();

    res.json({ message: 'Column name updated successfully', column: project.columns.get(columnId) });
  } catch (error) {
    console.error('Error updating column name:', error);
    res.status(500).json({ message: 'Error updating column name', error: error.message });
  }
});

app.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/tasks/:taskId/users/:userId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const exists = task.users.includes(req.params.userId);
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByIdAndUpdate(
      taskId,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

app.get('/tasks/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

app.post('/tasks/comment', async (req, res) => {
  const { taskId, comment, firstName, lastName } = req.body;
  try {

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          comments: {
            content: comment,
            createdAt: new Date(),
            firstName: firstName,
            lastName: lastName,
          }
        }
      },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
});

app.post('/tasks/:taskId/comments', async (req, res) => {
  const { taskId } = req.params;
  const { userId, content } = req.body;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newComment = {
      user: userId,
      content: content,
      createdAt: new Date()
    };

    // Fetch user details
    const user = await User.findById(userId);

    // Attach user details to the comment
    const commentWithUserDetails = {
      ...newComment,
      firstName: user.firstName,
      lastName: user.lastName
    };

    task.comments.push(commentWithUserDetails);
    await task.save();

    res.status(201).json(commentWithUserDetails);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Point de terminaison /login
app.post('/login', async (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {

    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ message: info.message });
    }
    // Vous pouvez aussi implémenter des sessions ici si nécessaire
    return res.json({ message: 'Login successful', user: user });
  })(req, res, next);
});

// Route pour enregistrer un nouvel utilisateur
app.post('/signup', async (req, res) => {
  try {

    // Extract the password from the request body
    const { email, password, company, lastName, firstName, position } = req.body;

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(200).send({ message: 'Already existing user' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email: email,
      password: hashedPassword,
      company: company,
      lastName: lastName,
      firstName: firstName,
      position: position,
      avatar: namefile
    });

    await user.save();

    res.status(200).send({ message: 'User successfully registered!' });

  } catch (error) {
    res.status(500).send({ message: 'Could not register user.' });
    res.status(400).send({ message: 'Could not register user.' });
  }
});

app.put('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Update all fields including avatar
    user.email = req.body.email;
    user.company = req.body.company;
    user.lastName = req.body.lastName;
    user.firstName = req.body.firstName;
    user.position = req.body.position;
    user.avatar = req.body.avatar; // Make sure this line exists

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).send({ message: 'User successfully edited!' });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ message: 'Could not update user.' });
  }
});



app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// -------- Fin de Authentification ------------------------


//sans io.socket
app.get('/tasks/project/:projectId', async (req, res) => {
  const projectId = req.params.projectId;
  const order = req.params.order
  try {
    const tasks = await Task.find({ projectId }).sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

app.put('/projects/:projectId/columns', async (req, res) => {
  const { projectId } = req.params;
  const { name } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newColumnId = generateUniqueId();
    project.columns.set(newColumnId, {
      name: name,
      color: '#4CAF50' // Default color for new columns
    });

    await project.save();

    res.status(200).json({
      id: newColumnId,
      name: name,
      color: '#4CAF50'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project columns', error: error.message });
  }
});

app.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const validProjectId = new mongoose.Types.ObjectId(id);

    // Check existing records before deletion
    const existingUsers = await ProjectUsers.find({ projectId: id });

    // Delete project users with both formats to ensure matching
    const deleteResult = await ProjectUsers.deleteMany({
      $or: [
        { projectId: id },
        { projectId: validProjectId }
      ]
    });

    // Supprimer les tâches du projet
    await Task.deleteMany({ projectId: id });
    
    // Supprimer le projet de la base de données
    await Project.findByIdAndDelete(validProjectId);

    // Supprimer le dossier du projet
    const projectUploadPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'projects', id);

    if (fs.existsSync(projectUploadPath)) {
      fs.rmSync(projectUploadPath, { recursive: true, force: true });
    }

    io.emit('projectDeleted', id);
    res.status(200).json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Error in deletion process:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.patch('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Trouver le projet avec l'ID donné
    const project = await Project.findById(id);

    // Si le projet n'est pas trouvé, renvoyer une erreur 404
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Mettre à jour le projet avec les nouvelles données
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, { new: true });

    // Renvoyer le projet mis à jour
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.patch('/projects/:projectId/rating', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const newRating = req.body.rating;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.rating = newRating;
    await project.save();

    res.status(200).json({ message: 'Rating updated successfully', project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/user/email/:email', async (req, res) => {
  const emailUser = req.params.email;

  try {
    const user = await User.findOne({ email: emailUser })

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/users', async (req, res) => {

  try {
    const users = await User.find();
    res.json(users); // Retourne simplement une liste vide si aucune tâche n'est trouvée
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/projectUsers', async (req, res) => {

  try {
    const users = await ProjectUsers.find();
    res.json(users); // Retourne simplement une liste vide si aucune tâche n'est trouvée
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.put('/task/reorder', async (req, res) => {
  const updatedTasks = req.body;

  try {
    for (const updatedTask of updatedTasks) {
      const { _id, order, status } = updatedTask;
      await Task.findByIdAndUpdate(_id, { order, status });
    }

    res.json({ message: 'Task order updated successfully' });
  } catch (error) {
    console.error('Error updating task order:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Supprimez la tâche de la base de données
    await Task.findByIdAndDelete(id);
    // Envoyez une réponse pour indiquer que la tâche a été supprimée avec succès
    res.json({ message: 'Task deleted successfully' });
    // Diffusez la suppression à tous les clients connectés si nécessaire
    io.emit('taskDeleted', { taskId: id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'An error occurred' });
  }

});

app.post('/tasks', async (req, res) => {
  const { title, status, order, color, description, priority, begindate, enddate, projectId, users, gauge, workingDay, dependencies } = req.body;

  try {
    const tasksToUpdate = await Task.find({ projectId, status, description, priority, begindate, enddate });

    const updatePromises = tasksToUpdate.map(task => {
      return Task.findByIdAndUpdate(task._id, { order: task.order + 1 });
    });

    await Promise.all(updatePromises);

    const task = new Task({
      title,
      status,
      order: 0,
      color,
      projectId,
      description,
      priority,
      begindate,
      enddate,
      gauge,
      workingDay,
      dependencies,
      users // Add this line to include users array
    });

    await task.save();
    io.emit('taskCreated', task);
    res.json(task);

  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status, order } = req.body;

  try {
    // Mettre à jour la tâche dans la base de données
    const updatedTask = await Task.findByIdAndUpdate(id, { status, order }, { new: true });

    // Diffuser la mise à jour à tous les clients connectés
    io.emit('taskUpdated', { taskId: id, status, order });

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.post('/projects', async (req, res) => {
  const { title, description, enddate, tempImage } = req.body;

  try {
    const project = new Project({
      title,
      description,
      enddate,
      image: namefile, // This will contain the latest uploaded image path
      columns: new Map([
        ['todo', { name: 'Todo', color: '#4CAF50' }],
        ['inProgress', { name: 'In Progress', color: '#4CAF50' }],
        ['done', { name: 'Done', color: '#4CAF50' }]
      ])
    });

    await project.save();
    io.emit('projectAdded', project);
    res.status(201).json(project);

  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'An error occurred while adding the project.' });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/projects/:id', async (req, res) => {
  const projectNum = req.params.id;

  try {
    const projects = await Project.findById(projectNum);
    res.json(projects);

  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/tasks/:projectId', async (req, res) => {
  const projectId = req.params.projectId;
  try {
    const tasks = await Task.find({ projectId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/projects/:projectId/tasks', async (req, res) => {
  const { projectId } = req.params;
  try {
    const tasks = await Task.find({ projectId });
    res.json(tasks); // Retourne simplement une liste vide si aucune tâche n'est trouvée
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

//jointure entre users et projectusers
app.get('/projectusers', async (req, res) => {
  try {
    const projectUsers = await ProjectUsers.find()
      .populate({
        path: 'userId',
        select: 'avatar firstName lastName',
        model: 'User', // Assurez-vous d'utiliser le nom du modèle 'User' correct
      })
      .select('projectId userId');

    res.json(projectUsers);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/projects/:projectId/users', async (req, res) => {
  const { projectId } = req.params;
  try {
    const projectUsers = await ProjectUsers.find({ projectId: projectId });
    res.json({ users: projectUsers });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/projects/:projectId/users/:personId', async (req, res) => {
  const { projectId, personId } = req.params;
  try {

    const isSelected = await ProjectUsers.exists({
      projectId: projectId,
      userId: personId
    });

    res.json({
      userId: personId,
      projectId: projectId,
      isSelected: isSelected
    });

  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/projects/:projectId/users/:personId', async (req, res) => {
  const { projectId, personId } = req.params;
  try {
    const projectUsers = await ProjectUsers.findOne({
      projectId: projectId,
      userId: personId
    });
    if (!projectUsers) {
      const newProjectUser = new ProjectUsers({
        projectId: projectId,
        userId: personId
      });
      await newProjectUser.save();
      res.json({ success: true, message: 'User created successfully' });
    } else {
      res.json({ success: false, message: 'User already exists for the project' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.delete('/projects/:projectId/users/:personId', async (req, res) => {
  const { projectId, personId } = req.params;
  try {
    const deletedUser = await ProjectUsers.findOneAndDelete({ userId: personId, projectId: projectId });
    if (deletedUser) {
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Trouver l'utilisateur avec l'ID donné
    const user = await User.findById(id);

    // Si l'utilisateur n'est pas trouvé, renvoyer une erreur 404
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Supprimer l'avatar s'il existe
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', '..', 'frontend', 'public', user.avatar);
      
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    // Envoyer une notification que l'utilisateur a été supprimé
    io.emit('userDeleted', { userId: id });

    // Renvoyer une réponse indiquant que la suppression a réussi
    res.json({ message: 'User and avatar deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/user/:emailGroup/collaborators', async (req, res) => {

  const emailGroup = req.params.emailGroup;

  try {
    const collaborators = await Collaborator.find({ emailGroup });
    res.json(collaborators); // Retourne simplement une liste vide si aucune tâche n'est trouvée
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Configuration de stockage de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    try {
      // For avatar uploads
      if (file.fieldname === 'avatar') {
        uploadPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'avatars');
      }
      // For project files
      else if (file.fieldname === 'file') {
        if (!req.params.projectId) {
          return cb(new Error('Project ID is required for file uploads'));
        }
        uploadPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'projects', req.params.projectId);
      }
      // For project images
      else if (file.fieldname === 'projectImage') {
        uploadPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'projects', req.params.projectId || 'temp');
      } else {
        return cb(new Error('Invalid field name'));
      }

      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(uploadPath)) {
        try {
          fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
        } catch (err) {
          console.error('Error creating directory:', err);
          return cb(new Error('Could not create upload directory'));
        }
      }

      // Vérifier les permissions du dossier
      try {
        fs.accessSync(uploadPath, fs.constants.W_OK);
      } catch (err) {
        console.error('Directory not writable:', err);
        return cb(new Error('Upload directory is not writable'));
      }
      
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      const extension = path.extname(file.originalname);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      namefile = `${timestamp}-${randomString}${extension}`;
      cb(null, namefile);
    } catch (error) {
      console.error('Error in multer filename:', error);
      cb(error);
    }
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    try {
      // Vérifier la taille du fichier avant l'upload
      if (parseInt(req.headers['content-length']) > 5 * 1024 * 1024) {
        return cb(new Error('File size exceeds 5MB limit'), false);
      }

      // Vérifier le type de fichier
      if (file.fieldname === 'avatar' || file.fieldname === 'projectImage') {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed for avatars and project images'), false);
        }
      }

      cb(null, true);
    } catch (error) {
      console.error('Error in multer fileFilter:', error);
      cb(error);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

app.get('/download/:fileId', async (req, res) => {
  try {

    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', '..', 'frontend', 'public', file.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Log download attempt
    res.download(filePath, file.name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
});


app.delete('/files/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '..', '..', 'frontend', 'public', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await File.findByIdAndDelete(req.params.fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});


app.post('/upload/projects/:projectId', upload.single('projectImage'), (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const filePath = `/uploads/projects/${req.params.projectId}/${namefile}`;

    return res.status(200).json({
      message: 'File uploaded successfully.',
      path: filePath
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/upload/projects', upload.single('projectImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const filePath = `/uploads/projects/${namefile}`;

    return res.status(200).json({
      message: 'File uploaded successfully.',
      path: filePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/upload/avatar', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `/uploads/avatars/${req.file.filename}`;
    const fullPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'avatars');

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    // Déplacer le fichier vers le bon dossier
    const finalPath = path.join(fullPath, req.file.filename);
    fs.renameSync(req.file.path, finalPath);

    res.json({ 
        message: 'Avatar uploaded successfully',
        path: filePath
    });
});

app.post('/upload/:projectId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!req.params.projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    // Vérifier si le projet existe
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      // Supprimer le fichier si le projet n'existe pas
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Project not found.' });
    }

    const file = new File({
      projectId: req.params.projectId,
      name: req.file.originalname,
      path: `/uploads/projects/${req.params.projectId}/${req.file.filename}`,
      type: req.file.mimetype,
      size: req.file.size
    });

    await file.save();

    // Log successful upload
    console.log(`File uploaded successfully: ${file.name} for project ${req.params.projectId}`);

    return res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size
      }
    });
  } catch (error) {
    // En cas d'erreur, supprimer le fichier uploadé
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading file:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Route pour récupérer les fichiers d'un projet
app.get('/files/:projectId', async (req, res) => {
  try {
    const files = await File.find({ projectId: req.params.projectId });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Endpoint de vérification de la santé du serveur
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Gestionnaire d'erreur pour multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send('Multer Error: ' + err.message);
  }
  if (err) {
    return res.status(500).send('Unknown Server Error');
  }
  next();
});

// Serveur
server.listen(3001, () => {
  console.log('Server is running on port 3001');
});

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github:
// https://github.com/Michaux-Technology/Geco-Kanban

// Delete meeting by roomId
app.delete('/meetings/room/:roomId', async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ roomId: req.params.roomId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: error.message });
  }
});
