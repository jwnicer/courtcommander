import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const CLIENT_ID_KEY = 'courtCommanderClientId';

function createUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getClientId(): string {
  if (typeof window === 'undefined') {
    return 'server-side-user';
  }
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = createUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

export async function createIntent(basePath: string, type: string, clientId: string, payload: any) {
  const intentId = createUUID();
  const intentRef = doc(db, `${basePath}/intents/${intentId}`);
  await setDoc(intentRef, {
    clientId,
    type,
    payload,
    status: 'new',
    createdAt: serverTimestamp(),
  });
}
