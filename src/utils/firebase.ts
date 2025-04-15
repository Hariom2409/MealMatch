import { initializeApp, getApps } from 'firebase/app';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5HR7kfWqKyWe_s_t47q0197wTlZArymg",
  authDomain: "mealmatch-ee54c.firebaseapp.com",
  projectId: "mealmatch-ee54c",
  storageBucket: "mealmatch-ee54c.firebasestorage.app",
  messagingSenderId: "824081632987",
  appId: "1:824081632987:web:1d6ae6fec63a7f96cb06fe",
  measurementId: "G-L54R5QQ9MJ"
};

console.log('Initializing Firebase with config');

// Initialize Firebase - prevent duplicate initialization
let app;
let analytics;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  // Only initialize analytics on client side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);

// Set custom settings for verification emails
const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
  handleCodeInApp: false,
};

// Override the default sendEmailVerification to use our custom settings
export const sendVerificationEmail = (user: import('firebase/auth').User) => {
  return sendEmailVerification(user, actionCodeSettings);
};

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 