import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

/**
 * Firebase web client config is safe to ship in the browser.
 * Security is enforced by Firebase Auth + Firestore security rules.
 *
 * Setup for clones:
 *   cp firebase-applet-config.example.json firebase-applet-config.json
 * (This repo ships a working demo config; replace with your project for production.)
 */
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export { app as firebaseApp };
