import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDTmflnt0l96mPOnEiVSHAqqfa9nVwYMok",
  authDomain: "memory-map-be19c.firebaseapp.com",
  projectId: "memory-map-be19c",
  storageBucket: "gs://memory-map-be19c.firebasestorage.app",
  messagingSenderId: "583108810526",
  appId: "1:583108810526:web:2ff169e51920d954931b0f",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const firebaseExports = { auth, db, storage };

export default firebaseExports;