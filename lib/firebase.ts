// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCYXs5g4Yk5O_B8p-YpKuwoXolRixYNlhM",
  authDomain: "dynamic-login-system.firebaseapp.com",
  projectId: "dynamic-login-system",
  storageBucket: "dynamic-login-system.firebasestorage.app",
  messagingSenderId: "798318946913",
  appId: "1:798318946913:web:d6dad2e79985e0fe5bd820",
  measurementId: "G-DSKVE0SJ78"
};

// Prevent initializing more than once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
