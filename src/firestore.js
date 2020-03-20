import * as firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjYmq877djirxanq9B6MYE2aYJVKfTrQE",
  authDomain: "gyelanmal-i.firebaseapp.com",
  projectId: "gyelanmal-i",
};

firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

export default db;