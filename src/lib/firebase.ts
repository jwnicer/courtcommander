'use client';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDiJglQDPfqHtaXP4vsoMDZtZBtBSapAQw',
  authDomain: 'court-commander-5cpco.firebaseapp.com',
  projectId: 'court-commander-5cpco',
  storageBucket: 'court-commander-5cpco.appspot.com',
  messagingSenderId: '1069058311779',
  appId: '1:1069058311779:web:3ace110a32f6e66e565a56',
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
