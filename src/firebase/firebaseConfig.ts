import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD4JbmdrsNYQGBTsXzmHJ84-SiTb4WIKJ0',
  authDomain: 'secret-santa-okroj.firebaseapp.com',
  projectId: 'secret-santa-okroj',
  storageBucket: 'secret-santa-okroj.firebasestorage.app',
  messagingSenderId: '401076994229',
  appId: '1:401076994229:web:9cbaaa49a5e01a9c4b3efc',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
