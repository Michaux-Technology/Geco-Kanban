// backend/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Utilisation de la configuration CORS avec socket.io
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // URL de votre frontend
    methods: ['GET', 'POST', 'PUT'],
  },
});

mongoose.connect('mongodb://192.168.1.104:27017/kanban', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// -------- Schemas ------------------------

const TaskSchema = new mongoose.Schema({
  title: String,
  status: String, // 'todo', 'inProgress', 'done'
  order: Number,
  color: String,
  description: String,
  begindate: Date,
  enddate: Date,
  priority: String,
  projectId: String
});

const Task = mongoose.model('Task', TaskSchema);

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  rating: Number,
  enddate: Date,
  image: String

});

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

// -------- Fin de Schemas ------------------------



let namefile = '';

//io.socket
io.on('connection', socket => {
  //console.log('A user connected');

  socket.on('updateTask', async ({ taskId, status, order }) => {
    try {

      // Mettre à jour la tâche dans la base de données
      await Task.findByIdAndUpdate(taskId, { status, order });

      // Diffuser la mise à jour à tous les clients connectés
      io.emit('taskUpdated', { taskId, status, order });

    } catch (error) {
      console.error('Error updating task:', error);
    }
  });


  socket.on('disconnect', () => {
    //console.log('User disconnected');
  });
});


// io.socket pour les projets (au lieu de socketIo)
io.on('connection', (socket) => {
  socket.on('taskUpdated', (task) => {
    socket.broadcast.emit('taskUpdated', task);
  });
  socket.on('disconnect', () => {
    //console.log('User disconnected from projects');
  });

  // Gérez les événements pour les projets ici
  socket.on('addProject', async (projectData) => {
    try {
      const project = new Project({
        title: projectData.title,
        description: projectData.description,
        enddate: projectData.enddate,
        image: namefile
      });

      await project.save();
      io.emit('projectAdded', project);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  });

  socket.on('updateProject', async (projectData) => {
    try {
      const { _id, title, description, enddate } = projectData;

      await Project.findByIdAndUpdate(_id, { title: title, description: description, enddate: enddate });
      io.emit('projectUpdated', projectData);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  });

  socket.on('deleteProject', async (projectId) => {

    try {
      const validProjectId = new mongoose.Types.ObjectId(projectId);
      await Project.findByIdAndDelete(validProjectId);
      io.emit('projectDeleted', projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  });

  socket.on('addCollab', async (collabData) => {
    try {

      const collaborator = new User({
        email: collabData.email,
        lastName: collabData.lastname,
        firstName: collabData.firstname,
        position: collabData.position,
        company: collabData.company,
        password: collabData.password,
        avatar: namefile
      });
      await collaborator.save();
      io.emit('CollaboratorAdded', collaborator);
    } catch (error) {
      console.error('Error adding Collaborator:', error);
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

app.get('/user', async (req, res) => {
  const emailUser = req.params.email;

  try {
    const user = await User.findOne(emailUser);
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

app.put('/tasks/reorder', async (req, res) => {
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
  const { title, status, order, color, description, priority, begindate, enddate, projectId } = req.body;

  try {
    // Étape 1 : Trouvez toutes les tâches du même projet et du même statut
    const tasksToUpdate = await Task.find({ projectId, status, description, priority, begindate, enddate });

    // Étape 2 : Mettez à jour l'ordre de toutes les tâches existantes, en les incrémentant de 1
    const updatePromises = tasksToUpdate.map(task => {
      return Task.findByIdAndUpdate(task._id, { order: task.order + 1 });
    });

    await Promise.all(updatePromises);

    // Étape 3 : Créez la nouvelle tâche avec un ordre de 0
    const task = new Task({ title, status, order: 0, color, projectId, description, priority, begindate, enddate });
    await task.save();

    // Informer le frontend de la création de la nouvelle tâche
    io.emit('taskCreated', task);

    // Envoyez la nouvelle tâche dans la réponse
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

  const { title, description, enddate } = req.body;

  try {
    const project = new Project({ title, description, enddate });
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

    console.log(projectUsers);
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
    //console.log('/projects/:projectId/users/:personId ')

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
  //console.log("testBackend")
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

app.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Trouver le projet avec l'ID donné
    const project = await Project.findById(id);

    // Si le projet n'est pas trouvé, renvoyer une erreur 404
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Supprimer le projet
    await Project.findByIdAndDelete(id);

    // Supprimer toutes les tâches associées au projet, s'il y en a
    if (project.tasks && project.tasks.length > 0) {
      await Task.deleteMany({ projectId: id });
    }

    // Envoyer une notification que le projet a été supprimé
    io.emit('projectDeleted', { projectId: id });

    // Renvoyer une réponse indiquant que la suppression a réussi
    res.json({ message: 'Project and associated tasks deleted successfully' });

  } catch (error) {
    console.error('Error deleting project:', error);
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
    cb(null, '../frontend/public/uploads/'); // le dossier où le fichier sera stocké
  },
  filename: function (req, file, cb) {
    namefile = path.join(Date.now() + '-' + file.originalname);
    cb(null, namefile); // le nom du fichier sur le serveur
  }
}
);


const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    return res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error('Erreur lors de l’upload du fichier :', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
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
  //console.log('Server is running on port 3001');
});
