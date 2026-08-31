import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Relógio reativo: devolve o instante atual e re-renderiza a cada `intervaloMs`.
 *
 * Existe porque as necessidades do pet são *derivadas* do tempo decorrido, não
 * armazenadas tick a tick. A UI precisa de um pretexto para recalcular; este
 * hook é esse pretexto, e nada mais — ele não escreve no banco.
 *
 * Ao voltar do segundo plano o relógio é acertado na hora: o `setInterval` do
 * JS não roda com o app suspenso, então sem isso as barras ficariam congeladas
 * no valor de quando o usuário saiu.
 */
export function useRelogio(intervaloMs = 30_000): number {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), intervaloMs);

    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') setAgora(Date.now());
    });

    return () => {
      clearInterval(timer);
      inscricao.remove();
    };
  }, [intervaloMs]);

  return agora;
}
