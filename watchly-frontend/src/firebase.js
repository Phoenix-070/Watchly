// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDO6LCZiRaVNl8nkd8e5-jWQXgeaMxYiyQ",
  authDomain: "watchly-742c3.firebaseapp.com",
  projectId: "watchly-742c3",
  storageBucket: "watchly-742c3.firebasestorage.app",
  messagingSenderId: "445857303234",
  appId: "1:445857303234:web:ab0eba2c45716c875c895b",
  measurementId: "G-6BVJ8SW9FC"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 