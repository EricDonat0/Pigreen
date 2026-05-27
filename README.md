# 🐷 Pigreen

> Um aplicativo interativo e lúdico focado no cuidado e desenvolvimento, com mecânicas inspiradas no estilo Tamagotchi.

O **Pigreen** é um projeto mobile construído com foco em fluidez, persistência de dados em nuvem em tempo real e uma experiência de usuário (UX) acolhedora, minimalista e altamente interativa. 

---

## ✨ Funcionalidades (Features)

- **Animações Nativas:** Tela de splash interativa e transições suaves (Bottom Sheet) utilizando a API `Animated` do React Native.
- **Autenticação em Tempo Real:** Fluxo de Login e Cadastro robusto integrado ao **Firebase Authentication**, contando com validações dinâmicas (força de senha, consistência de dados e tratamento de exceções de rede).
- **Banco de Dados em Nuvem:** Armazenamento seguro dos dados dos responsáveis, crianças e preferências de dieta de forma estruturada e escalável através do **Cloud Firestore**.
- **Persistência de Sessão:** Integração com `AsyncStorage` para manter o usuário autenticado no dispositivo mesmo após fechar o aplicativo, evitando logins repetitivos.
- **Componentização Avançada:** Arquitetura de UI modular, isolando regras de validação e seletores customizados (Data e Rádio) da estrutura principal das telas.

---

## 🛠️ Tecnologias Utilizadas

**Front-End & Mobile:**
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

**Backend-as-a-Service (BaaS) & Nuvem:**
- [Firebase Authentication](https://firebase.google.com/products/auth) (Autenticação de Usuários)
- [Cloud Firestore Database](https://firebase.google.com/products/firestore) (Banco de Dados NoSQL em Nuvem)

**Futuras Integrações (API & IA):**
- [Python 3](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)

---

## 👨‍💻 Autores

**Desenvolvimento e Arquitetura:** [Eric Donato](https://www.linkedin.com/in/ericdonato/)  
**UI/UX Design:** [Mariana](https://www.linkedin.com/in/mariana-moraes-759437213/)