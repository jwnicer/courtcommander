
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: This is a public configuration and is safe to be exposed client-side.
const firebaseConfig = {
  apiKey: "AIzaSyDiJglQDPfqHtaXP4vsoMDZtZBtBSapAQw",
  authDomain: "court-commander-5cpco.firebaseapp.com",
  projectId: "court-commander-5cpco",
  storageBucket: "court-commander-5cpco.firebasestorage.app",
  messagingSenderId: "1069058311779",
  appId: "1:1069058311779:web:3ace110a32f6e66e565a56",
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
  return new Promise<User>((resolve, reject) => {
    const authInstance = getAuth(app);
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(authInstance)
          .then(userCredential => resolve(userCredential.user))
          .catch(error => reject(error));
      }
    }, (error) => {
        console.error("onAuthStateChanged error:", error);
        reject(error);
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
