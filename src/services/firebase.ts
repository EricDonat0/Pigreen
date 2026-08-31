import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Inicialização do Firebase.
 *
 * As chaves vêm de variáveis `EXPO_PUBLIC_*` (lidas em build time pelo Metro),
 * definidas em `.env` — que não é versionado. A config web do Firebase não é
 * secreta, mas mantê-la fora do repositório evita que um fork aponte para o
 * projeto de produção por acidente, e obriga a existir um `.env.example`
 * documentando o que o projeto precisa para rodar.
 *
 * A proteção real dos dados é feita pelas Security Rules do Firestore
 * (`firestore.rules`), não por esconder o `apiKey`.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (__DEV__ && !firebaseConfig.apiKey) {
  console.warn(
    '[Pigreen] Variáveis EXPO_PUBLIC_FIREBASE_* ausentes. ' +
      'Copie .env.example para .env e reinicie o bundler com `npx expo start -c`.',
  );
}

/**
 * O Fast Refresh reexecuta este módulo. `getApps()` evita recriar a app, e o
 * `try/catch` cobre o caso de `initializeAuth` ser chamado duas vezes — ele
 * lança `auth/already-initialized` em vez de devolver a instância existente.
 */
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function resolverAuth(): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

export const auth: Auth = resolverAuth();
export const db: Firestore = getFirestore(app);
export { app };
