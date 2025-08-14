'use client';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
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

let app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

export const getMockUser = (): User => {
    return {
        uid: 'user_123',
        isAnonymous: true,
        // Add other properties of User if needed, with mock values
        email: null,
        emailVerified: false,
        phoneNumber: null,
        photoURL: null,
        displayName: 'Guest',
        providerData: [],
        toJSON: () => ({}),
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        delete: async () => {},
    } as User;
}

// Callable Functions as defined in the proposal
export const api = {
  registerParticipant: httpsCallable(functions, 'registerParticipant'),
  createCheckoutSession: httpsCallable(functions, 'createCheckoutSession'),
  enqueue: httpsCallable(functions, 'enqueue'),
  coachOverrideAssign: httpsCallable(functions, 'coachOverrideAssign'),
  completeMatch: httpsCallable(functions, 'completeMatch'),
};
