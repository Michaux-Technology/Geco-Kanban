const express = require('express');
const https = require('https');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuration SSL
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', '..', 'certificates', 'private.key')),
  cert: fs.readFileSync(path.join(__dirname, '..', '..', 'certificates', 'certificate.crt'))
};

// Configuration CORS plus permissive
app.use(cors({
  origin: ['https://localhost:3000', 'https://192.168.1.101:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Access-Control-Allow-Origin'],
  credentials: true,
  preflightContinue: false
}));

// Middleware pour gérer les requêtes OPTIONS
app.options('*', cors());

app.use(express.json());

// Créer le serveur HTTPS
const server = https.createServer(sslOptions, app);

// Configuration de Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ['https://localhost:3000', 'https://192.168.1.101:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Ajouter l'endpoint health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const users = {};
const socketToRoom = {};
const userIdMap = new Map(); // Pour stocker la correspondance socket.id -> userId

io.on('connection', socket => {
  socket.on("join room", (data) => {
    // Stocker l'ID utilisateur
    if (data && data.userId) {
      userIdMap.set(socket.id, data.userId);
    }
    
    // Ajouter l'utilisateur à la salle
    const roomID = "main-room"; // Une seule salle pour l'instant
    if (users[roomID]) {
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    
    // Envoyer la liste des utilisateurs existants au nouvel utilisateur
    const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
    socket.emit("all users", usersInThisRoom);
  });

  // Gestionnaire amélioré pour les demandes d'ID utilisateur
  socket.on("get_user_id", (data) => {
    try {
      // Gérer les deux formats possibles (ancien et nouveau)
      if (typeof data === 'string') {
        // Ancien format (juste le socketId)
        const socketId = data;
        const userId = userIdMap.get(socketId);
        socket.emit("user_id_response", { socketId, userId });
      } else if (typeof data === 'object') {
        // Nouveau format avec targetSocketId et responseEvent
        const { targetSocketId, responseEvent } = data;
        
        // Vérifier que les données nécessaires sont présentes
        if (!targetSocketId || !responseEvent) {
          console.error("Données invalides dans la demande d'ID utilisateur :", data);
          return;
        }
        
        const userId = userIdMap.get(targetSocketId);
        // Répondre sur l'événement spécifié
        socket.emit(responseEvent, { userId });
      } else {
        console.error("Format de données non reconnu :", data);
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la demande d'ID utilisateur :", error);
    }
  });

  socket.on("sending signal", payload => {
    io.to(payload.userToSignal).emit('user joined', { 
      signal: payload.signal, 
      callerID: payload.callerID 
    });
  });

  socket.on("returning signal", payload => {
    io.to(payload.callerID).emit('receiving returned signal', { 
      signal: payload.signal, 
      id: socket.id 
    });
  });

  socket.on('disconnect', () => {
    // Nettoyer les références de l'utilisateur déconnecté
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter(id => id !== socket.id);
      users[roomID] = room;
      // Informer les autres utilisateurs
      socket.broadcast.emit("user left", socket.id);
    }
    // Nettoyer la correspondance userId
    userIdMap.delete(socket.id);
    delete socketToRoom[socket.id];
  });
});

// Démarrer le serveur HTTPS
server.listen(3002, () => {
  console.log('HTTPS Visio Server is running on port 3002');
}); 