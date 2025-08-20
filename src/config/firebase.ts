import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase basée sur votre clé de service
const firebaseConfig = {
  apiKey: "AIzaSyC5rfYcE3j_LYLaa5kIxUEjsXikrduf2o8", // Vous devrez obtenir cette clé depuis la console Firebase
  authDomain: "autofast-24766.firebaseapp.com",
  projectId: "autofast-24766",
  storageBucket: "autofast-24766.appspot.com",
  messagingSenderId: "100404961330605845376",
  appId: "1:1053322125773:web:43caa684b06819f2eba484" // Vous devrez obtenir cet ID depuis la console Firebase
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore
export const db = getFirestore(app);

export default app;