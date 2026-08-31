import {
  useFonts,
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  OpenSans_800ExtraBold,
} from '@expo-google-fonts/open-sans';

/**
 * Ponto único de carregamento das fontes do app.
 *
 * Para habilitar a Neulis Cursive (fonte de títulos da identidade visual),
 * coloque o arquivo em `assets/fonts/NeulisCursive-Bold.ttf`, acrescente
 *
 *   'NeulisCursive': require('../../assets/fonts/NeulisCursive-Bold.ttf'),
 *
 * ao mapa abaixo e troque `familias.display` em `tipografia.ts`. Nenhum outro
 * arquivo precisa mudar.
 */
export function useFontesPigreen(): { fontesCarregadas: boolean; erroFontes: Error | null } {
  const [carregadas, erro] = useFonts({
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    OpenSans_800ExtraBold,
  });

  // Se as fontes falharem (offline no primeiro boot, arquivo corrompido), o app
  // segue com a fonte do sistema em vez de travar numa splash infinita.
  return { fontesCarregadas: carregadas || erro != null, erroFontes: erro };
}
