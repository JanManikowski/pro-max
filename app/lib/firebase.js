// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyASlWizXUwn2uYqzKbXLZnBDDeNRa3H0KE",
  authDomain: "promaxkozijnen-a30c3.firebaseapp.com",
  projectId: "promaxkozijnen-a30c3",
  storageBucket: "promaxkozijnen-a30c3.firebasestorage.app",
  messagingSenderId: "745736028350",
  appId: "1:745736028350:web:762274895abb917b979eef",
  measurementId: "G-4T17MK865P"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
