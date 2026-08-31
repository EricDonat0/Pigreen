import * as Crypto from 'expo-crypto';

/**
 * PIN de 4 dígitos da área do responsável.
 *
 * O PIN é guardado como SHA-256 com um sal aleatório por conta. Vale dizer com
 * clareza o que isso protege e o que não protege: quatro dígitos têm apenas
 * 10.000 combinações, então o hash **não** resiste a força bruta offline. Ele
 * existe para que o PIN não apareça em texto puro para quem abrir o console do
 * Firestore, e a barreira real é contra a criança — que é exatamente a ameaça
 * que esta tela precisa deter.
 *
 * Se um dia a área do responsável guardar algo sensível de verdade, a proteção
 * certa é reautenticação com a senha da conta, não um PIN.
 */

const SEPARADOR = ':';

async function digerir(pin: string, sal: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${sal}${SEPARADOR}${pin}`);
}

export function pinValido(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Gera o registro `sal:hash` para persistir. */
export async function gerarHashPin(pin: string): Promise<string> {
  const sal = Array.from(Crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${sal}${SEPARADOR}${await digerir(pin, sal)}`;
}

export async function conferirPin(pin: string, registro: string | undefined): Promise<boolean> {
  if (!registro) return false;

  const separador = registro.indexOf(SEPARADOR);
  if (separador < 0) return false;

  const sal = registro.slice(0, separador);
  const hash = registro.slice(separador + 1);
  return (await digerir(pin, sal)) === hash;
}
