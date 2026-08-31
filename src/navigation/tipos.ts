import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Mapas de rotas do app.
 *
 * Declarar os parâmetros aqui é o que faz `navigation.navigate` ser verificado
 * pelo TypeScript: errar o nome de uma tela ou esquecer um parâmetro vira erro
 * de compilação em vez de tela branca em produção.
 */

export type RotasAutenticacao = {
  Login: undefined;
  Cadastro: undefined;
  EsqueciSenha: { email?: string } | undefined;
};

export type RotasAjustes = {
  Ajustes: undefined;
  EditarPerfil: undefined;
  AlterarSenha: undefined;
  Aparencia: undefined;
  Idioma: undefined;
  NomePet: undefined;
  Customizacao: undefined;
  AreaResponsavel: undefined;
};

export type RotasCrianca = {
  Amigos: undefined;
  Porquinho: undefined;
  Perfil: NavigatorScreenParams<RotasAjustes>;
};

export type RotasRaiz = {
  Autenticacao: NavigatorScreenParams<RotasAutenticacao>;
  Crianca: NavigatorScreenParams<RotasCrianca>;
};

declare global {
  namespace ReactNavigation {
    // A interface precisa ser vazia: o que importa é a *fusão de declarações*
    // com a definição do React Navigation, que só acontece com `interface`.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RotasRaiz {}
  }
}
