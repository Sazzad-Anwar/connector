// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBA5h56Tt9NcKfqYGuHhTkeEUXHOoqKFOM",
  authDomain: "connector-61119.firebaseapp.com",
  projectId: "connector-61119",
  storageBucket: "connector-61119.appspot.com",
  messagingSenderId: "931437116207",
  appId: "1:931437116207:web:3155e797656e5e8dcdffda",
  measurementId: "G-01WCPN25K1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default app;
