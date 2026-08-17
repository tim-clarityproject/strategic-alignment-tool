import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCItkU3LJZmQ7S3YLvv34ylH1xSA4yYdQA",
  authDomain: "strategic-alignment-tool.firebaseapp.com",
  projectId: "strategic-alignment-tool",
  storageBucket: "strategic-alignment-tool.firebasestorage.app",
  messagingSenderId: "478439864199",
  appId: "1:478439864199:web:f13f7d39c66455f90e8522",
  measurementId: "G-JZVVBHLYVY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
