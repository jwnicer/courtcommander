
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace with your actual Firebase configuration in .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1'); // Specify region if not default

// Auth helpers
export const signInAnonymouslyIfNeeded = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then(userCredential => resolve(userCredential.user))
          .catch(error => reject(error));
      }
    });
  });
};


// Callable Functions as defined in the proposal
export const api = {
  registerParticipant: httpsCallable(functions, 'registerParticipant'),
  createCheckoutSession: httpsCallable(functions, 'createCheckoutSession'),
  enqueue: httpsCallable(functions, 'enqueue'),
  coachOverrideAssign: httpsCallable(functions, 'coachOverrideAssign'),
  completeMatch: httpsCallable(functions, 'completeMatch'),
};
