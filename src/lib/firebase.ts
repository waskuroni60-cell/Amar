import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYnD7PrCZMCgirJ-LOtsQrTqczZ2qcJzU",
  authDomain: "amarshadon-664b5.firebaseapp.com",
  projectId: "amarshadon-664b5",
  storageBucket: "amarshadon-664b5.firebasestorage.app",
  messagingSenderId: "400896584049",
  appId: "1:400896584049:web:c8655ceec7ed8364172ed0",
  measurementId: "G-7DGQCFDDDJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
