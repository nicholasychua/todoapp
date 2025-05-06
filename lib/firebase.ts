import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBNG9y5tg-LN24zNO3XP4Buq53W2BRBF9w",
    authDomain: "todolistproject-121c0.firebaseapp.com",
    projectId: "todolistproject-121c0",
    storageBucket: "todolistproject-121c0.firebasestorage.app",
    messagingSenderId: "814468920886",
    appId: "1:814468920886:web:1d04dc7aa93c4b66b00a97",
    measurementId: "G-LHBJ83RN4W"
  };
  
// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 