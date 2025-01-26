import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6y8XM4Zy0B7l4BxHeyfH4EUAGpRyCV1E",
  authDomain: "test-3a9b1.firebaseapp.com",
  projectId: "test-3a9b1",
  storageBucket: "test-3a9b1.appspot.com", // Fixed this value
  messagingSenderId: "303585516916",
  appId: "1:303585516916:web:48bd53a468ea84872ce021",
  measurementId: "G-Z0GE5HXV5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { auth, db, storage};
