// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth} from 'firebase/auth';
import  { getFirestore} from 'firebase/firestore';
const firebaseConfig = {
  apiKey: 'AIzaSyDpiNgnC6zVr9BAUFhNrpW8nsnYMu_0UgA',
  authDomain: 'kindhopemart.firebaseapp.com',
  projectId: 'kindhopemart',
  storageBucket: 'kindhopemart.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: '1:582081899687:android:136c059e591b528bb93f82',
};

const app = initializeApp(firebaseConfig);

// Initialize auth with persistence
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
