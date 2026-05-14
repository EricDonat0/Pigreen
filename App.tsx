import React, { useState } from 'react';
import AnimacaoIntro from './src/components/AnimacaoIntro';
import Cadastro from './src/screens/Cadastro';
import Login from './src/screens/Login';

export default function App() {
  const [telaAtual, setTelaAtual] = useState<'splash' | 'login' | 'cadastro'>('splash');

  if (telaAtual === 'splash') {
    return <AnimacaoIntro onFinish={() => setTelaAtual('login')} />;
  }

  if (telaAtual === 'login') {
    return <Login onIrParaCadastro={() => setTelaAtual('cadastro')} />;
  }

  if (telaAtual === 'cadastro') {
    return <Cadastro onVoltarLogin={() => setTelaAtual('login')} />;
  }

  return null;
}