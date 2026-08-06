/* ==========================================================================
   firebase.js
   Initializes Firebase and exports the pieces script.js needs
   (Firestore for product data, Storage for product images).

   SETUP — replace firebaseConfig below with your own project's config.
   Firebase Console → Project settings → General → "Your apps" → SDK setup.

   You will also need to create:
     1. A Firestore database (Start in production mode is fine).
     2. A Storage bucket.
     3. Security rules that allow public read + write on "products"
        (write is client-only gated by the admin password in script.js —
        for stronger protection, pair this with Firebase App Check or
        move writes behind a Cloud Function that checks a server-side secret).

   Example Firestore rules for this project:
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /products/{productId} {
           allow read: if true;
           allow write: if true; // gated client-side by password popup
         }
       }
     }

   Example Storage rules:
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /products/{allPaths=**} {
           allow read: if true;
           allow write: if true; // gated client-side by password popup
         }
       }
     }
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ---- Replace with your own Firebase project credentials ----
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const productsCol = collection(db, "products");

// Everything script.js needs, in one place.
export {
  db,
  storage,
  productsCol,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
};