import React, { useState } from 'react';
import AnimacaoIntro from './src/components/AnimacaoIntro';
import Cadastro from './src/screens/Cadastro';
import Login from './src/screens/Login';
import Home from './src/screens/Home'; // <-- Importamos a Home

export default function App() {
  // Adicionamos 'home' na lista de telas
  const [telaAtual, setTelaAtual] = useState<'splash' | 'login' | 'cadastro' | 'home'>('splash');

  if (telaAtual === 'splash') {
    return <AnimacaoIntro onFinish={() => setTelaAtual('login')} />;
  }

  if (telaAtual === 'login') {
    // Passamos a instrução de ir para a home se o login der certo
    return (
      <Login
        onIrParaCadastro={() => setTelaAtual('cadastro')}
        onLoginSucesso={() => setTelaAtual('home')}
      />
    );
  }

  if (telaAtual === 'cadastro') {
    return <Cadastro onVoltarLogin={() => setTelaAtual('login')} />;
  }

  if (telaAtual === 'home') {
    return <Home />;
  }

  return null;
}