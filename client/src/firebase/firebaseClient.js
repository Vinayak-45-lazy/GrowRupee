import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "paypilot-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "paypilot-ai",
};

let app = null;
let auth = null;
let isRealFirebase = false;

if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key') {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    isRealFirebase = true;
  } catch (err) {
    console.warn('[Firebase Client] Init error, using demo auth mode:', err);
  }
}

export const merchantLogin = async (email, password) => {
  if (isRealFirebase && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Demo / Mock Mode Authentication Fallback
  if (email === 'merchant@paypilot.ai' || email.includes('@')) {
    const mockUser = {
      uid: 'merchant_default_uid',
      email,
      displayName: 'Alex Rivera (Urban Bites)',
    };
    localStorage.setItem('paypilot_merchant_user', JSON.stringify(mockUser));
    return mockUser;
  }

  throw new Error('Invalid email or password');
};

export const getCurrentMerchant = () => {
  if (isRealFirebase && auth && auth.currentUser) {
    return auth.currentUser;
  }
  const stored = localStorage.getItem('paypilot_merchant_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const logoutMerchant = async () => {
  if (isRealFirebase && auth) {
    await firebaseSignOut(auth);
  }
  localStorage.removeItem('paypilot_merchant_user');
};

export { auth };
