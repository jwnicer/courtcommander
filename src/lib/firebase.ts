'use client';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDiJglQDPfqHtaXP4vsoMDZtZBtBSapAQw',
  authDomain: 'court-commander-5cpco.firebaseapp.com',
  projectId: 'court-commander-5cpco',
  storageBucket: 'court-commander-5cpco.appspot.com',
  messagingSenderId: '1069058311779',
  appId: '1:1069058311779:web:3ace110a32f6e66e565a56',
};

let app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

export function signInAnonymouslyIfNeeded() {
  return new Promise<User>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then(userCredential => resolve(userCredential.user))
          .catch(error => {
            console.error('[Auth] Anonymous sign-in failed:', error?.code, error?.message);
            if (error?.code === 'auth/configuration-not-found') {
              console.error('→ Enable Authentication and Anonymous provider in Firebase Console, and verify the Web App config matches the project.');
            }
            reject(error)
          });
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