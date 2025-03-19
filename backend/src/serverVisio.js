const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Ajouter CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
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

const port = 3002;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 