const firebase = require('firebase');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDE2R0xYeb55QBdFcHpNuHY2J6T8OazC_A',
  authDomain: 'lol-challenged.firebaseapp.com',
  projectId: 'lol-challenged',
  storageBucket: 'lol-challenged.appspot.com',
  messagingSenderId: '443163798175',
  appId: '1:443163798175:web:5d32f6bc80b4e7f217d0aa',
  measurementId: 'G-BVEMEH35CZ'
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

module.exports = { app, db };
