import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import axios from 'axios';
import { API_URL, API_URL_VISIO, API_URL_FRONT } from './config';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ContrastIcon from '@mui/icons-material/Contrast';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// Intercepter toutes les erreurs possibles liées à _readableState
const ignoreReadableStateError = (error) => {
  return error.message?.includes('_readableState') ||
         error.stack?.includes('_readableState') ||
         error.toString().includes('_readableState');
};

// Remplacer la fonction Error native
const originalErrorConstructor = Error;
window.Error = function(message) {
  if (typeof message === 'string' && message.includes('_readableState')) {
    return { message, suppressed: true };
  }
  return new originalErrorConstructor(message);
};

// Intercepter console.error
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.some(arg => 
    (arg instanceof Error && ignoreReadableStateError(arg)) ||
    (typeof arg === 'string' && arg.includes('_readableState'))
  )) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Intercepter les erreurs non capturées
window.addEventListener('error', (event) => {
  if (event.error && ignoreReadableStateError(event.error)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && ignoreReadableStateError(event.reason)) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

// ErrorBoundary pour React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    if (ignoreReadableStateError(error)) {
      return { hasError: false };
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (!ignoreReadableStateError(error)) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Configuration pour simple-peer
const peerConfig = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  },
  objectMode: false,
  trickle: false
};

const VideoConferenceWrapper = () => {
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const hasCheckedRef = useRef(false);

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const storedUserId = localStorage.getItem('id');
    if (!storedUserId) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    // Ne vérifier qu'une seule fois au chargement initial
    if (hasCheckedRef.current && serverStatus === 'online') {
      return;
    }

    const checkServerStatus = async () => {
      try {
        // Tentative de connexion au serveur de visioconférence
        // Utilisation d'une requête HEAD pour vérifier si le serveur répond
        // sans nécessiter d'endpoint spécifique
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(API_URL_VISIO, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 200 || response.status === 404) {
          // Si le serveur répond avec n'importe quel code HTTP, il est en ligne
          // Même un 404 signifie que le serveur fonctionne mais que l'endpoint n'existe pas
          setServerStatus('online');
          hasCheckedRef.current = true;
        } else {
          setServerStatus('offline');
          hasCheckedRef.current = true;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du serveur de visioconférence:', error);
        setServerStatus('offline');
        hasCheckedRef.current = true;
      }
    };

    checkServerStatus();
  }, [retryCount]);

  const handleRetry = () => {
    setServerStatus('checking');
    setRetryCount(prev => prev + 1);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getErrorMessage = () => {
    return `Unable to connect to videoconferencing server (${API_URL_VISIO}). The server seems to be offline.`;
  };

  if (serverStatus === 'checking') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginTop: 20, textAlign: 'center' }}>
        Checking the connection to the videoconferencing server...
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 10, textAlign: 'center' }}>
        Connect to {API_URL_VISIO}
        </Typography>
      </div>
    );
  }

  if (serverStatus === 'offline') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <ErrorOutlineIcon style={{ fontSize: 80, color: '#f44336', marginBottom: 20 }} />
        <Typography variant="h4" gutterBottom>
        Video conferencing server unavailable
        </Typography>
        <Typography variant="body1" paragraph>
          {getErrorMessage()}
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 20 }}>
        Server address: {API_URL_VISIO}
        </Typography>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button variant="contained" color="primary" onClick={handleRetry}>
          Retry
          </Button>
          <Button variant="outlined" onClick={handleGoBack}>
          Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <VideoConference />
    </ErrorBoundary>
  );
};

const VideoConference = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userId] = useState(localStorage.getItem('id') || '');
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLocalActive, setIsLocalActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [streamOrder, setStreamOrder] = useState(['local']);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(null);
  const [showAudioDevices, setShowAudioDevices] = useState(false);
  const [userNames, setUserNames] = useState({ local: 'You' });
  const [serverError, setServerError] = useState(false);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef({});
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const animationFrameRef = useRef();
  const streamRef = useRef();
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [videoResolutions] = useState([
    { label: '1080p', width: 1920, height: 1080 },
    { label: '720p', width: 1280, height: 720 },
    { label: '480p', width: 854, height: 480 },
    { label: '360p', width: 640, height: 360 },
    { label: '240p', width: 426, height: 240 }
  ]);
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(1); // 480p par défaut
  const [videoLongPressTimer, setVideoLongPressTimer] = useState(null);
  const [showDeleteTooltip, setShowDeleteTooltip] = useState(false);

  const checkLocalAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Améliorer la détection du son
    const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
    const isActive = average > 5; // Réduire le seuil pour une meilleure sensibilité
    setIsLocalActive(isActive);
    
    animationFrameRef.current = requestAnimationFrame(checkLocalAudioLevel);
  };

  // Configurer l'analyse audio
  const setupAudioAnalysis = (currentStream) => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; // Réduire la taille FFT pour une analyse plus rapide
      analyserRef.current.smoothingTimeConstant = 0.4; // Ajuster le lissage

      const source = audioContextRef.current.createMediaStreamSource(currentStream);
      source.connect(analyserRef.current);
      
      checkLocalAudioLevel();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  // Améliorer la fonction fetchUserInfo avec gestion d'erreur robuste
  const fetchUserInfo = async (socketId) => {
    try {
      // Pour l'utilisateur local, utiliser l'ID du localStorage
      if (socketId === 'local') {
        try {
          const response = await axios.get(`${API_URL}/users/${userId}`);
          
          if (response.data) {
            return response.data.firstName + " " + response.data.lastName;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des infos utilisateur local:', error);
          return "Vous";
        }
        return "Vous";
      } 
      
      // Pour les utilisateurs distants
      try {
        // Utiliser un événement unique pour chaque socket
        const responseEventName = `user_id_response_${socketId}`;
        
        // Créer une promesse pour attendre la réponse
        const userPromise = new Promise((resolve, reject) => {
          // Fonction de gestion de la réponse
          const handleResponse = (data) => {
            // Nettoyer l'écouteur après réception
            socketRef.current.off(responseEventName, handleResponse);
            
            if (data && data.userId) {
              axios.get(`${API_URL}/users/${data.userId}`)
                .then(response => {
                  if (response.data) {
                    const fullName = `${response.data.firstName} ${response.data.lastName}`;
                    resolve(fullName);
                  } else {
                    resolve(`Utilisateur ${socketId.slice(0, 4)}`);
                  }
                })
                .catch(error => {
                  console.error(`Erreur API pour ${socketId}:`, error);
                  resolve(`Utilisateur ${socketId.slice(0, 4)}`);
                });
            } else {
              resolve(`Utilisateur ${socketId.slice(0, 4)}`);
            }
          };
          
          // Ajouter un écouteur d'événement pour la réponse
          socketRef.current.on(responseEventName, handleResponse);
          
          // Définir un timeout pour éviter de bloquer indéfiniment
          setTimeout(() => {
            // Nettoyer l'écouteur si le timeout est atteint
            socketRef.current.off(responseEventName, handleResponse);
            resolve(`Utilisateur ${socketId.slice(0, 4)}`);
          }, 5000);
        });
        
        // Émettre la requête APRÈS avoir configuré l'écouteur
        socketRef.current.emit('get_user_id', { 
          targetSocketId: socketId, 
          responseEvent: responseEventName 
        });
        
        // Attendre la réponse avec un timeout global
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => resolve(`Utilisateur ${socketId.slice(0, 4)}`), 6000);
        });
        
        // Utiliser Promise.race pour éviter de bloquer indéfiniment
        return await Promise.race([userPromise, timeoutPromise]);
      } catch (error) {
        console.error(`Erreur générale pour ${socketId}:`, error);
        return `Utilisateur ${socketId.slice(0, 4)}`;
      }
    } catch (error) {
      console.error('Erreur critique dans fetchUserInfo:', error);
      return `Utilisateur ${socketId ? socketId.slice(0, 4) : 'inconnu'}`;
    }
  };

  useEffect(() => {
    function createPeer(userToSignal, callerID, currentStream) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        },
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        }
      });
  
      peer.on("signal", signal => {
        socketRef.current.emit("sending signal", { userToSignal, callerID, signal });
      });
  
      peer.on("error", error => {
        console.error("Peer error:", error);
      });
  
      return peer;
    }
  
    function addPeer(incomingSignal, callerID, currentStream) {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currentStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        },
        answerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        }
      });
  
      peer.on("signal", signal => {
        socketRef.current.emit("returning signal", { signal, callerID });
      });
  
      peer.on("error", error => {
        console.error("Peer error with:", callerID, error);
      });
  
      peer.signal(incomingSignal);
      return peer;
    }

    socketRef.current = io(API_URL_VISIO, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });
    
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }).then(currentStream => {
      setStream(currentStream);
      streamRef.current = currentStream;
      
      // Stocker l'ID du microphone actif initial
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const currentAudioTrack = currentStream.getAudioTracks()[0];
        if (currentAudioTrack) {
          const currentDevice = audioInputs.find(device => device.label === currentAudioTrack.label);
          if (currentDevice) {
            setSelectedAudioDevice(currentDevice.deviceId);
          }
        }
      });

      // Appliquer le stream aux deux références vidéo
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }

      // Utiliser la nouvelle fonction setupAudioAnalysis
      setupAudioAnalysis(currentStream);

      // Modifier l'émission de join room pour inclure l'ID utilisateur
      socketRef.current.emit("join room", { userId });

      socketRef.current.on("all users", async users => {
        const newPeers = {};
        
        try {
          // Récupérer les noms de tous les utilisateurs existants
          for (const userID of users) {
            try {
              // Créer le peer
              const peer = createPeer(userID, socketRef.current.id, currentStream);
              peersRef.current[userID] = { peerID: userID, peer };
              newPeers[userID] = peer;
              
              // Obtenir le nom
              const userName = await fetchUserInfo(userID);
              
              // Mettre à jour l'état des noms d'utilisateurs
              setUserNames(prev => ({...prev, [userID]: userName}));
            } catch (peerError) {
              console.error(`Erreur avec le peer ${userID}:`, peerError);
            }
          }
          
          // Mettre à jour les peers et l'ordre
          setPeers(newPeers);
          setStreamOrder(prev => [...prev, ...users]);
        } catch (error) {
          console.error("Erreur lors du traitement des utilisateurs existants:", error);
        }
      });

      socketRef.current.on("user joined", async payload => {
        try {
          // Créer le peer
          const peer = addPeer(payload.signal, payload.callerID, currentStream);
          peersRef.current[payload.callerID] = { peerID: payload.callerID, peer };
          
          // Mettre à jour l'état des peers
          setPeers(prevPeers => ({...prevPeers, [payload.callerID]: peer}));
          setStreamOrder(prev => [...prev, payload.callerID]);
          
          // Récupérer le nom de l'utilisateur qui vient de rejoindre
          const userName = await fetchUserInfo(payload.callerID);
          
          // Mettre à jour l'état des noms d'utilisateurs
          setUserNames(prev => ({...prev, [payload.callerID]: userName}));
        } catch (error) {
          console.error(`Erreur lors de la gestion de l'utilisateur ${payload.callerID}:`, error);
        }
      });

      socketRef.current.on("receiving returned signal", payload => {
        const item = peersRef.current[payload.id];
        if (item) {
          item.peer.signal(payload.signal);
        }
      });

      socketRef.current.on("user left", id => {
        if (peersRef.current[id]) {
          peersRef.current[id].peer.destroy();
          setPeers(prevPeers => {
            const newPeers = { ...prevPeers };
            delete newPeers[id];
            return newPeers;
          });
          delete peersRef.current[id];
          setStreamOrder(prev => prev.filter(peerId => peerId !== id));
        }
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (stream) {
        stream.getTracks().map(track => {
          track.stop();
          return track;
        });
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      Object.values(peersRef.current).map(({ peer }) => {
        if (peer && typeof peer.destroy === 'function') {
          peer.destroy();
        }
        return peer;
      });
    };
  }, []);

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOn(!isCameraOn);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
    setIsMicOn(!isMicOn);
        console.log('Microphone state:', audioTrack.enabled ? 'enabled' : 'disabled');
      }
    }
  };

  const hangUp = () => {
    try {
      // Déconnecter le socket en premier
      if (socketRef.current?.connected) {
        socketRef.current.emit('user-disconnecting');
        socketRef.current.disconnect();
      }

      // Nettoyer les pairs sans toucher aux streams
      if (peersRef.current) {
        Object.values(peersRef.current).forEach(({ peer }) => {
          if (peer && !peer.destroyed) {
            peer.removeAllListeners();
            peer.destroy();
          }
        });
        peersRef.current = {};
        setPeers({});
      }

      // Arrêter les tracks locaux en dernier
      if (stream) {
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop();
        });
        setStream(null);
      }

      // Nettoyer la vidéo locale
      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }

      // Revenir à la page précédente
      navigate(-1);
    } catch (error) {
      console.error('Error during hangup:', error);
      navigate(-1);
    }
  };

  // Ajouter un gestionnaire d'événement beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      hangUp();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Effet pour gérer le stream lors des changements de sélection
  useEffect(() => {
    if (userVideo.current && streamRef.current) {
      userVideo.current.srcObject = streamRef.current;
    }
  }, [selectedStream]);

  // Ajouter cette fonction pour gérer le drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    console.log('Drag result:', result);
    
    const items = Array.from(streamOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    console.log('New order:', items);
    setStreamOrder(items);
  };

  // Ajouter cette fonction pour obtenir la liste des périphériques audio
  const getAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
    } catch (error) {
      console.error('Error getting audio devices:', error);
    }
  };

  // Ajouter cette fonction pour changer de microphone
  const switchAudioDevice = async (deviceId) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false
      });

      const videoTrack = stream.getVideoTracks()[0];
      const newAudioTrack = newStream.getAudioTracks()[0];

      // Créer un nouveau MediaStream avec la piste vidéo existante et la nouvelle piste audio
      const combinedStream = new MediaStream();
      if (videoTrack) {
        combinedStream.addTrack(videoTrack);
      }
      if (newAudioTrack) {
        combinedStream.addTrack(newAudioTrack);
      }

      // Mettre à jour le stream principal
      setStream(combinedStream);
      streamRef.current = combinedStream;

      // Mettre à jour les connexions peer
      Object.values(peersRef.current).forEach(({ peer }) => {
        // Remplacer le stream entier pour chaque peer
        peer.replaceTrack(
          peer.streams[0].getAudioTracks()[0],
          newAudioTrack,
          peer.streams[0]
        );
      });

      // Mettre à jour l'analyseur audio avec le nouveau stream
      setupAudioAnalysis(combinedStream);

      setSelectedAudioDevice(deviceId);
      setShowAudioDevices(false);
    } catch (error) {
      console.error('Error switching audio device:', error);
    }
  };

  // Ajouter un effet pour obtenir la liste des périphériques au chargement
  useEffect(() => {
    getAudioDevices();
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
    };
  }, []);

  const handleMicMouseDown = () => {
    const timer = setTimeout(() => {
      setShowAudioDevices(true);
    }, 500); // 500ms pour un clic long
    setLongPressTimer(timer);
  };

  const handleMicMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    // Si le timer n'a pas été déclenché (clic court), on toggle le micro
    if (!showAudioDevices) {
      toggleMic();
    }
  };

  const handleMicMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCameraMouseDown = () => {
    const timer = setTimeout(() => {
      setShowVideoOptions(true);
    }, 500);
    setVideoLongPressTimer(timer);
  };

  const handleCameraMouseUp = () => {
    if (videoLongPressTimer) {
      clearTimeout(videoLongPressTimer);
      setVideoLongPressTimer(null);
    }
    if (!showVideoOptions) {
      toggleCamera();
    }
  };

  const handleCameraMouseLeave = () => {
    if (videoLongPressTimer) {
      clearTimeout(videoLongPressTimer);
      setVideoLongPressTimer(null);
    }
  };

  const switchVideoResolution = async (index) => {
    try {
      const resolution = videoResolutions[index];

      // Garder la piste audio existante
      const currentAudioTrack = stream.getAudioTracks()[0];

      // Demander un nouveau stream avec uniquement la nouvelle résolution vidéo
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      const newVideoTrack = newVideoStream.getVideoTracks()[0];

      // Créer un nouveau MediaStream avec la piste vidéo et la piste audio existante
      const combinedStream = new MediaStream();
      combinedStream.addTrack(newVideoTrack);
      if (currentAudioTrack) {
        combinedStream.addTrack(currentAudioTrack);
      }

      // Arrêter uniquement l'ancienne piste vidéo
      stream.getVideoTracks().forEach(track => track.stop());

      // Mettre à jour le stream principal
      setStream(combinedStream);
      streamRef.current = combinedStream;

      // Mettre à jour la vidéo locale
      if (userVideo.current) {
        userVideo.current.srcObject = combinedStream;
      }

      // Mettre à jour les connexions peer
      Object.values(peersRef.current).forEach(({ peer }) => {
        peer.replaceTrack(
          peer.streams[0].getVideoTracks()[0],
          newVideoTrack,
          peer.streams[0]
        );
      });

      setSelectedResolution(index);
      setShowVideoOptions(false);
    } catch (error) {
      console.error('Error switching video resolution:', error);
      alert('Unable to change resolution. This resolution may not be supported by your camera.');
    }
  };

  const deleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room? All participants will be disconnected.')) {
      try {
        // Récupérer l'ID de la réunion depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get('room');

        if (!roomId) {
          console.error('Room ID not found in URL');
          alert('Error: Room ID not found');
          return;
        }

        // Supprimer la réunion de la base de données en utilisant le roomId
        const response = await axios.delete(`${API_URL}/meetings/room/${roomId}`);

        if (response.status === 200) {
          // Émettre l'événement de suppression de la salle
          socketRef.current.emit('delete_room');
          
          // Nettoyer les connexions peer
          Object.values(peersRef.current).forEach(({ peer }) => {
            if (peer && !peer.destroyed) {
              peer.destroy();
            }
          });
          
          // Nettoyer les ressources
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
            });
          }
          
          // Déconnecter le socket
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          
          // Rediriger vers la page précédente seulement après la suppression réussie
          navigate(-1);
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('An error occurred while deleting the room: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f2f5',
      padding: '20px',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <button
        onClick={deleteRoom}
        onMouseEnter={() => setShowDeleteTooltip(true)}
        onMouseLeave={() => setShowDeleteTooltip(false)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#d32f2f',
          border: 'none',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        <DeleteIcon style={{ fontSize: '20px' }} />
      </button>
      {showDeleteTooltip && (
        <div style={{
          position: 'absolute',
          top: '70px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          zIndex: 1000
        }}>
          Delete videoconferencing room
        </div>
      )}
      <h1 style={{
        textAlign: 'center',
        color: isDarkMode ? '#ffffff' : '#1a73e8',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        transition: 'color 0.3s ease'
      }}>
        Video conference
      </h1>
      <h2 style={{
        textAlign: 'center',
        color: isDarkMode ? '#cccccc' : '#666666',
        fontSize: '1.2rem',
        fontWeight: 'normal',
        marginTop: '0',
        marginBottom: '20px',
        lineHeight: '1.2',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        transition: 'color 0.3s ease'
      }}>
        Project Management
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: '90px'
      }}>
        {/* Conteneur pour la vidéo sélectionnée */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '10px',
          flex: selectedStream ? '1 0 auto' : '0 0 auto',
          maxHeight: selectedStream ? 'calc(60vh - 120px)' : '0',
          position: 'relative'
        }}>
          {selectedStream === 'local' && (
            <div style={{
              width: '100%',
              maxWidth: '640px',
              height: '100%',
              padding: '5px',
              transition: 'all 0.3s ease'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <video
              ref={userVideo}
            autoPlay
            playsInline
            muted
              onClick={() => setSelectedStream(null)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                backgroundColor: '#000',
                outline: 'none',
                boxShadow: isLocalActive ? '0 0 0 3px #4CAF50' : 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                objectFit: 'cover',
                opacity: selectedStream === 'local' ? 1 : 0.7
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-25px',
              left: '10px',
              transform: 'none',
              color: isDarkMode ? '#fff' : '#000',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              width: '100%',
              padding: '5px'
            }}>
              {userNames.local}
            </div>
          </div>
        </div>
          )}
          {selectedStream !== null && selectedStream !== 'local' && (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Video 
                key={selectedStream}
                peer={peers[selectedStream]}
                isSelected={true}
                onClick={() => setSelectedStream(null)}
                style={{
                  width: '100%',
                  height: '100%',
                  opacity: selectedStream === selectedStream ? 1 : 0.7
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '-25px',
                left: '10px',
                transform: 'none',
                color: isDarkMode ? '#fff' : '#000',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left',
                width: '100%',
                padding: '5px'
              }}>
                {userNames[selectedStream] || `Utilisateur ${selectedStream.slice(0, 4)}`}
              </div>
            </div>
          )}
        </div>
        {/* Conteneur pour les vidéos non sélectionnées avec drag and drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: selectedStream 
                    ? 'repeat(auto-fill, minmax(200px, 1fr))'
                    : 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px',
                  width: '100%',
                  flex: '1 1 auto',
                  overflow: 'auto',
                  alignItems: 'start',
                  justifyItems: 'stretch',
                  maxWidth: '100%',
                  padding: '10px',
                  backgroundColor: snapshot.isDraggingOver ? (isDarkMode ? '#2a2a2a' : '#e0e0e0') : 'transparent',
                  transition: 'background-color 0.3s ease',
                  overflowX: 'hidden',
                  maxHeight: selectedStream ? 'calc(40vh - 100px)' : 'calc(100vh - 220px)'
                }}
              >
                {streamOrder.map((streamId, index) => (
                  selectedStream !== streamId && (
                    <Draggable 
                      key={streamId} 
                      draggableId={streamId.toString()} 
                      index={index}
                      disableInteractiveElementBlocking={true}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            width: '100%',
                            maxWidth: '100%',
                            aspectRatio: '16/9',
                            position: 'relative',
                            cursor: 'grab',
                            backgroundColor: snapshot.isDragging ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            padding: '5px',
                            ...provided.draggableProps.style
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            right: '5px',
                            height: '30px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '8px 8px 0 0',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                          }}>
                            <div style={{
                              color: 'white',
                              fontSize: '12px',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                            }}>
                              ⋮⋮
                            </div>
                          </div>
                          {streamId === 'local' && selectedStream !== 'local' ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <video
                                ref={userVideo}
      autoPlay
      playsInline
                                muted
                                onClick={() => setSelectedStream('local')}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '8px',
                                  backgroundColor: '#000',
                                  outline: 'none',
                                  boxShadow: isLocalActive ? '0 0 0 3px #4CAF50' : 'none',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                  objectFit: 'cover',
                                  opacity: snapshot.isDragging ? 0.7 : 1
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '-25px',
                                left: '10px',
                                transform: 'none',
                                color: isDarkMode ? '#fff' : '#000',
                                fontSize: '14px',
                                fontWeight: '500',
                                textAlign: 'left',
                                width: '100%',
                                padding: '5px'
                              }}>
                                {userNames.local}
                              </div>
                            </div>
                          ) : (
                            streamId !== 'local' && selectedStream !== streamId && (
                              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Video 
                                  key={streamId}
                                  peer={peers[streamId]}
                                  isSelected={false}
                                  onClick={() => setSelectedStream(streamId)}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    opacity: snapshot.isDragging ? 0.7 : 1
                                  }}
                                />
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-25px',
                                  left: '10px',
                                  transform: 'none',
                                  color: isDarkMode ? '#fff' : '#000',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  textAlign: 'left',
                                  width: '100%',
                                  padding: '5px'
                                }}>
                                  {userNames[streamId] || `Utilisateur ${streamId.slice(0, 4)}`}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </Draggable>
                  )
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        </div>

        <div style={{
          position: 'fixed',
        bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
        padding: '15px',
          borderRadius: '50px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}>
          <button
          onMouseDown={handleCameraMouseDown}
          onMouseUp={handleCameraMouseUp}
          onMouseLeave={handleCameraMouseLeave}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isCameraOn ? '#4CAF50' : '#f44336',
              color: 'white'
            }}
          >
            {isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </button>
        {showVideoOptions && (
          <div style={{
            position: 'absolute',
            bottom: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: isDarkMode ? '#2a2a2a' : 'white',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            minWidth: '150px',
            maxWidth: '200px'
          }}>
            {videoResolutions.map((resolution, index) => (
              <button
                key={resolution.label}
                onClick={() => switchVideoResolution(index)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  margin: '4px 0',
                  border: 'none',
                  backgroundColor: selectedResolution === index ? '#4CAF50' : 'transparent',
                  color: selectedResolution === index ? 'white' : (isDarkMode ? 'white' : 'black'),
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: selectedResolution === index ? '#fff' : 'transparent',
                  border: `2px solid ${selectedResolution === index ? '#fff' : '#aaa'}`
                }} />
                {resolution.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <button
            onMouseDown={handleMicMouseDown}
            onMouseUp={handleMicMouseUp}
            onMouseLeave={handleMicMouseLeave}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isMicOn ? '#4CAF50' : '#f44336',
              color: 'white',
              position: 'relative'
            }}
          >
            {isMicOn ? <MicIcon /> : <MicOffIcon />}
          </button>
          {showAudioDevices && (
            <div style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translate(-50%, 0)',
              backgroundColor: isDarkMode ? '#2a2a2a' : 'white',
              borderRadius: '8px',
              padding: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              minWidth: '200px',
              maxWidth: '300px',
              marginBottom: '10px'
            }}>
              {audioDevices.map(device => (
          <button
                  key={device.deviceId}
                  onClick={() => switchAudioDevice(device.deviceId)}
            style={{
                    width: '100%',
                    padding: '8px 12px',
                    margin: '4px 0',
                    border: 'none',
                    backgroundColor: selectedAudioDevice === device.deviceId ? '#4CAF50' : 'transparent',
                    color: selectedAudioDevice === device.deviceId ? 'white' : (isDarkMode ? 'white' : 'black'),
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: selectedAudioDevice === device.deviceId ? '#45a049' : (isDarkMode ? '#3a3a3a' : '#f0f0f0')
                    }
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: selectedAudioDevice === device.deviceId ? '#fff' : 'transparent',
                    border: `2px solid ${selectedAudioDevice === device.deviceId ? '#fff' : '#aaa'}`
                  }} />
                  {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isDarkMode ? '#4CAF50' : '#757575',
          color: 'white',
          transition: 'background-color 0.3s ease'
        }}>
          <ContrastIcon />
        </button>
        <button onClick={hangUp} style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f44336',
              color: 'white'
        }}>
            <CallEndIcon />
          </button>
      </div>
    </div>
  );
};

const Video = ({ peer, isSelected, onClick, style }) => {
  const ref = useRef();
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef();
  const analyserRef = useRef();
  const animationFrameRef = useRef();
  const streamRef = useRef();
  const [hasStream, setHasStream] = useState(false);

  const checkAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
    setIsActive(average > 10);
    
    animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
  };

  useEffect(() => {
    const handleStream = stream => {
      if (stream) {
        streamRef.current = stream;
        if (ref.current) {
          ref.current.srcObject = stream;
          setHasStream(true);
          
          try {
            if (audioContextRef.current) {
              audioContextRef.current.close();
            }
            
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            
            checkAudioLevel();
          } catch (error) {
            console.error('Error setting up audio analysis:', error);
          }
        }
      }
    };

    if (peer) {
      // Vérifier si le peer a déjà des streams
      if (peer._remoteStreams && peer._remoteStreams.length > 0) {
        handleStream(peer._remoteStreams[0]);
      } else if (peer.streams && peer.streams.length > 0) {
        handleStream(peer.streams[0]);
      }
      
      // Écouter l'événement stream
      peer.on("stream", stream => {
        handleStream(stream);
      });
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [peer]);

  // Effet pour maintenir le stream lors des changements de sélection
  useEffect(() => {
    if (ref.current && streamRef.current) {
      ref.current.srcObject = streamRef.current;
    }
  }, [isSelected]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      aspectRatio: '16/9',
      transition: 'all 0.3s ease',
      position: 'relative'
    }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        onClick={onClick}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          backgroundColor: '#000',
          outline: 'none',
          boxShadow: isActive ? '0 0 0 3px #4CAF50' : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          objectFit: 'cover',
          ...style
        }}
      />
      {!hasStream && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: '8px'
        }}>
          Connexion en cours...
        </div>
      )}
    </div>
  );
};

export default VideoConferenceWrapper;




