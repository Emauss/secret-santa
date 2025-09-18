import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAAIRr0AEwT348bux8hWKFPm_bJiXc8Zns',
  authDomain: 'secretsanta-c32f4.firebaseapp.com',
  projectId: 'secretsanta-c32f4',
  storageBucket: 'secretsanta-c32f4.firebasestorage.app',
  messagingSenderId: '1023415231199',
  appId: '1:1023415231199:web:7c675aabc8bb90f2a97f6a',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
