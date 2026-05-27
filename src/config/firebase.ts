import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// As suas chaves reais do projeto Pigreen
const firebaseConfig = {
    apiKey: "AIzaSyAmnT05MXV_wpSS3f38Q8lIRcQ2aCK7JJ8",
    authDomain: "pigreen-3008.firebaseapp.com",
    projectId: "pigreen-3008",
    storageBucket: "pigreen-3008.firebasestorage.app",
    messagingSenderId: "131855174349",
    appId: "1:131855174349:web:37749f21d8102f3cfcf784",
    measurementId: "G-Y93YKS1HG0"
};

// Inicializa o Firebase garantindo que não cria instâncias duplicadas
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps();
}

// Inicializa a Autenticação configurando a persistência correta para o celular
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializa o Banco de Dados (Firestore)
const db = getFirestore(app);

export { auth, db };