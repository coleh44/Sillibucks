import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxzwN_KlzXIpulpdJxOvFNHmKGQb8XtkE",
  authDomain: "sillibucks.firebaseapp.com",
  projectId: "sillibucks",
  storageBucket: "sillibucks.firebasestorage.app",
  messagingSenderId: "840765622038",
  appId: "1:840765622038:web:1c845b5b0a473f2fe53237",
  measurementId: "G-H82FKHSJLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
