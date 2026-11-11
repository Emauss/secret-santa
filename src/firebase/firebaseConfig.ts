import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Values come from .env.<family> – run with `--mode gorczynscy` or `--mode okroj`.
if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  throw new Error(
    'Missing family config. Use the family scripts, e.g. `pnpm dev:gorczynscy` or `pnpm dev:okroj`.'
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Polish password-reset emails and Firebase action pages
auth.languageCode = 'pl';
export const db = getFirestore(app);
