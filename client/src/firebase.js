// src/firebase.js
// —————————————————————————————————————————————————————————————
// 1️⃣ Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


import {
  initializeAppCheck,
  ReCaptchaV3Provider
} from "firebase/app-check";


const firebaseConfig = {
  apiKey: "AIzaSyChVmfSc3jChRTLSjHzqTq5-YdRguxGk-U",
  authDomain: "streak-master-e539f.firebaseapp.com",
  projectId: "streak-master-e539f",
  storageBucket: "streak-master-e539f.appspot.com",
  messagingSenderId: "1024477080343",
  appId: "1:1024477080343:web:97a98bef715b5f24026552"
};


const app = initializeApp(firebaseConfig);


initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Le76T0rAAAAAP-9UvFctKnoe3Hw-YO3E4JgQxJy"),
  isTokenAutoRefreshEnabled: true,
});


export const auth = getAuth(app);
export const db   = getFirestore(app);
