import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNIujkPNDNXHtFVO3BfUgHZb1A4eT8GFM",
    authDomain: "kanbanapp-d8233.firebaseapp.com",
    projectId: "kanbanapp-d8233",
    storageBucket: "kanbanapp-d8233.firebasestorage.app",
    messagingSenderId: "1021500944585",
    appId: "1:1021500944585:web:a6af787baedb00cddf5d18",
    databaseURL: "https://kanbanapp-d8233-default-rtdb.firebaseio.com"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Database
const database = getDatabase(app);

export { app, auth, database };
 