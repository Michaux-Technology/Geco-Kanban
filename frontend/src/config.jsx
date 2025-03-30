// Déterminer l'URL de l'API en fonction de l'environnement
const isLocalhost = window.location.hostname === 'localhost';
const API_URL = isLocalhost 
  ? 'https://localhost:3001' 
  : 'https://192.168.1.101:3001';

const API_URL_VISIO = isLocalhost 
  ? 'https://localhost:3002' 
  : 'https://192.168.1.101:3002';

const API_URL_FRONT = isLocalhost 
  ? 'https://localhost:3000' 
  : 'https://192.168.1.101:3000';

export { API_URL, API_URL_VISIO, API_URL_FRONT };

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban