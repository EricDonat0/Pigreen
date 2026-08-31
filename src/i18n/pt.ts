/**
 * Português — dicionário de referência.
 *
 * Este arquivo é a fonte da verdade: o tipo `ChaveTraducao` sai daqui, e os
 * outros idiomas são `Record<ChaveTraducao, string>`. Esquecer de traduzir uma
 * chave vira erro de compilação, não texto faltando em produção.
 *
 * Convenção das chaves: `area.elemento`. Interpolação com `{nome}`.
 */
export const pt = {
  'comum.fechar': 'Fechar',
  'comum.voltar': 'Voltar',
  'comum.cancelar': 'Cancelar',
  'comum.salvar': 'Salvar',
  'comum.continuar': 'Continuar',
  'comum.confirmar': 'Confirmar',
  'comum.tentarNovamente': 'Tentar de novo',
  'comum.sim': 'Sim',
  'comum.nao': 'Não',
  'comum.carregando': 'Carregando…',
  'comum.salvo': 'Tudo salvo!',

  'login.titulo': 'Seja bem-vindo',
  'login.email': 'E-mail',
  'login.senha': 'Senha',
  'login.esqueci': 'Esqueci a senha',
  'login.entrar': 'Entrar no App',
  'login.semCadastro': 'Ainda não possuo cadastro',
  'login.emailInvalido': 'Digite um e-mail válido.',
  'login.senhaVazia': 'Digite sua senha.',

  'cadastro.titulo': 'Vamos iniciar seu cadastro.\nÉ rapidinho!',
  'cadastro.nomeResponsavel': 'Nome completo do responsável',
  'cadastro.nomeCrianca': 'Nome completo da criança',
  'cadastro.email': 'E-mail',
  'cadastro.confirmacaoEmail': 'Confirmação de e-mail',
  'cadastro.senha': 'Senha',
  'cadastro.confirmacaoSenha': 'Confirmação de senha',
  'cadastro.nascimento': 'Data de nascimento da criança',
  'cadastro.assinaleUm': 'Assinale apenas um:',
  'cadastro.vegano': 'O responsável é vegano',
  'cadastro.vegetariano': 'O responsável é vegetariano',
  'cadastro.transicao': 'O responsável está em transição',
  'cadastro.enviar': 'Cadastrar',
  'cadastro.perfilAlimentar': 'Perfil alimentar do responsável',

  'validacao.nomeResponsavel': 'Escreva o nome completo do responsável.',
  'validacao.nomeCrianca': 'Escreva o nome da criança.',
  'validacao.email': 'Esse e-mail não parece válido.',
  'validacao.emailDiferente': 'Os e-mails não coincidem.',
  'validacao.senhaDiferente': 'As senhas não coincidem.',
  'validacao.nascimentoVazio': 'Escolha a data de nascimento da criança.',
  'validacao.nascimentoFuturo': 'A data não pode estar no futuro.',
  'validacao.nascimentoAntigo': 'Confira o ano de nascimento.',
  'validacao.dieta': 'Assinale uma das opções.',
  'validacao.senhaCurta': 'Fraca — use ao menos 6 caracteres',
  'validacao.senhaFraca': 'Fraca — misture letras e números',
  'validacao.senhaMedia': 'Média — misture letras, números e símbolos',
  'validacao.senhaForte': 'Forte',

  'recuperacao.titulo': 'Esqueci a senha',
  'recuperacao.descricao': 'Enviaremos um link de segurança para o e-mail cadastrado.',
  'recuperacao.avancar': 'Avançar',
  'recuperacao.enviadoTitulo': 'E-mail enviado',
  'recuperacao.enviadoTexto':
    'Se existir uma conta com {email}, o link para criar uma nova senha chega em instantes. Dica: se não encontrar, verifique a caixa de spam.',
  'recuperacao.voltarLogin': 'Voltar para o login',

  'tudoPronto.titulo': 'Tudo pronto',
  'tudoPronto.acessivel': 'Tudo pronto. Entrando no app.',
  'intro.acessivel': 'Pigreen, carregando',

  'data.escolher': 'Escolher data',
  'data.vazia': 'Nenhuma data escolhida',
  'data.dia': 'Dia',
  'data.mes': 'Mês',
  'data.ano': 'Ano',

  'abas.amigos': 'Área online',
  'abas.porquinho': 'Meu porquinho',
  'abas.ajustes': 'Perfil e ajustes',

  'jogo.alimentar': 'Alimentar',
  'jogo.acordaEm': 'Acorda em {tempo}',
  'jogo.dorminhocoTitulo': 'Dorminhoco',
  'jogo.dorminhocoTexto': '{nome} comeu bastante, agora ele está dormindo. Volte daqui:',
  'jogo.parabens': 'Parabéns!',
  'jogo.subiuNivel': '{nome} chegou ao nível {nivel}!',
  'jogo.desbloqueouComidas': ' Você desbloqueou comidinhas novas para ele experimentar.',
  'jogo.semPet': 'Não encontramos seu porquinho.',
  'jogo.erroRede': 'Não consegui falar com o servidor. Verifique sua conexão e tente de novo.',
  'jogo.erroPermissao':
    'O banco de dados recusou o acesso. As regras de segurança do Firestore precisam ser publicadas.',
  'jogo.erroSalvar': 'Não consegui salvar a refeição. Tente de novo.',
  'jogo.criandoPet': 'Preparando seu porquinho…',
  'jogo.oferecer': 'Oferecer {nome}',
  'jogo.bloqueado': '{nome}, bloqueado. Chegue ao nível {nivel} para liberar.',
  'jogo.nivelCurto': 'Nível {nivel}',
  'jogo.hudNivel': '{nome} está no nível {nivel}. {porcentagem}% para o próximo nível.',
  'jogo.comoFunciona': 'Como funciona {nome}',

  'pet.feliz': 'está muito feliz',
  'pet.normal': 'está tranquilo',
  'pet.faminto': 'está com fome',
  'pet.triste': 'está tristinho',
  'pet.dormindo': 'está dormindo',

  'necessidade.saude': 'Saúde',
  'necessidade.saude.explicacao':
    'A saúde do seu porquinho pode subir ou descer dependendo da comidinha que você dá pra ele. Se você alimentar ele direitinho e com frequência, ele fica mais forte e saudável!',
  'necessidade.saciedade': 'Fome',
  'necessidade.saciedade.explicacao':
    'Seu porquinho sente fome várias vezes ao dia, mais ou menos 3 vezes. Fique de olho nisso! Se ele ficar com muita fome, pode perder saúde. Alimente ele direitinho para ele ficar forte e não adoecer.',
  'necessidade.felicidade': 'Felicidade',
  'necessidade.felicidade.explicacao':
    'Seu porquinho fica cada vez mais feliz conforme você entra no app, ele sente muita saudade e quer te ver todos os dias.',

  'alimento.arroz.nome': 'Arroz',
  'alimento.arroz.descricao':
    'O arroz é um grão pequenininho que fica branquinho quando cozinha. Ele é macio, gostoso e combina com muitos alimentos.',
  'alimento.feijao.nome': 'Feijão',
  'alimento.feijao.descricao':
    'O feijão é um grão pequeno que fica macio quando cozido. Ele é bem gostoso e tem um caldinho saboroso.',
  'alimento.pure_de_batata.nome': 'Purê de batatas',
  'alimento.pure_de_batata.descricao':
    'O purê de batatas é feito com batata bem amassadinha, ficando bem macio e cremoso.',
  'alimento.abobora.nome': 'Abóbora',
  'alimento.abobora.descricao':
    'A abóbora é laranjinha e muito saudável, pode ser macia e muito saborosa.',
  'alimento.batata.nome': 'Batata',
  'alimento.batata.descricao':
    'A batata cresce debaixo da terra e fica bem molinha quando cozida. Dá energia pro dia inteiro.',
  'alimento.inhame.nome': 'Inhame',
  'alimento.inhame.descricao':
    'O inhame parece uma batatinha peluda por fora e é bem cremoso por dentro. Deixa o porquinho fortinho.',
  'alimento.pepino.nome': 'Pepino',
  'alimento.pepino.descricao':
    'O pepino é verdinho, crocante e cheio de água. Refresca num dia quente!',
  'alimento.alface.nome': 'Alface',
  'alimento.alface.descricao':
    'A alface tem folhas verdes e macias. Faz barulhinho quando o porquinho mastiga.',
  'alimento.chuchu.nome': 'Chuchu',
  'alimento.chuchu.descricao':
    'O chuchu é clarinho e bem leve. Fica macio rapidinho e é ótimo pra acompanhar o arroz.',
  'alimento.bolinho_de_soja.nome': 'Bolinho de soja',
  'alimento.bolinho_de_soja.descricao':
    'O bolinho de soja é douradinho por fora e macio por dentro. É a comida favorita do porquinho!',

  'refeicao.cafe_da_manha': 'Café da manhã',
  'refeicao.lanche_da_manha': 'Lanche da manhã',
  'refeicao.almoco': 'Almoço',
  'refeicao.lanche_da_tarde': 'Lanche da tarde',
  'refeicao.jantar': 'Jantar',

  'ajustes.titulo': 'Perfil e ajustes',
  'ajustes.secaoConta': 'Conta',
  'ajustes.editarPerfil': 'Meus dados',
  'ajustes.editarPerfilDica': 'Nomes, nascimento e perfil alimentar',
  'ajustes.alterarSenha': 'Alterar senha',
  'ajustes.alterarSenhaDica': 'Trocar a senha de acesso',
  'ajustes.secaoApp': 'Aplicativo',
  'ajustes.aparencia': 'Aparência',
  'ajustes.idioma': 'Idioma',
  'ajustes.notificacoes': 'Lembretes',
  'ajustes.notificacoesDica': 'Avisar quando o porquinho estiver com fome',
  'ajustes.secaoJogo': 'Porquinho',
  'ajustes.nomePet': 'Nome do porquinho',
  'ajustes.customizacao': 'Customização',
  'ajustes.customizacaoDica': 'Acessórios desbloqueados por nível',
  'ajustes.areaResponsavel': 'Área do responsável',
  'ajustes.areaResponsavelDica': 'Histórico alimentar, protegido por PIN',
  'ajustes.secaoSessao': 'Sessão',
  'ajustes.sair': 'Sair do aplicativo',
  'ajustes.sairPergunta': 'Deseja realmente sair do aplicativo?',

  'perfil.titulo': 'Meus dados',
  'perfil.emailFixo': 'O e-mail de acesso não pode ser alterado por aqui.',

  'senha.titulo': 'Alterar senha',
  'senha.atual': 'Senha atual',
  'senha.nova': 'Nova senha',
  'senha.confirmar': 'Confirmar nova senha',
  'senha.enviar': 'Alterar senha',
  'senha.sucesso': 'Senha alterada com sucesso.',
  'senha.igualAtual': 'A nova senha precisa ser diferente da atual.',

  'aparencia.titulo': 'Aparência',
  'aparencia.claro': 'Claro',
  'aparencia.escuro': 'Escuro',
  'aparencia.sistema': 'Seguir o sistema',
  'aparencia.dica': 'O tema escuro deixa o app mais confortável à noite.',

  'idioma.titulo': 'Idioma',
  'idioma.pt': 'Português',
  'idioma.en': 'English',
  'idioma.es': 'Español',

  'nomePet.titulo': 'Nome do porquinho',
  'nomePet.campo': 'Como ele se chama?',
  'nomePet.vazio': 'Dê um nome pro porquinho.',

  'customizacao.titulo': 'Customização',
  'customizacao.vestir': 'Vestir',
  'customizacao.tirar': 'Tirar',
  'customizacao.bloqueado': 'Chegue ao nível {nivel}',
  'customizacao.vazio': 'Suba de nível para desbloquear acessórios.',
  'item.laco.nome': 'Laço',
  'item.bone.nome': 'Boné',
  'item.oculos.nome': 'Óculos',
  'item.cachecol.nome': 'Cachecol',
  'item.coroa.nome': 'Coroa',

  'pin.criarTitulo': 'Crie um PIN de responsável',
  'pin.criarTexto': 'Quatro números que só o adulto sabe. Ele protege esta área.',
  'pin.confirmarTitulo': 'Repita o PIN',
  'pin.entrarTitulo': 'Insira seu PIN',
  'pin.errado': 'PIN incorreto. Tente de novo.',
  'pin.diferente': 'Os PINs não coincidem.',
  'pin.esqueci': 'Esqueci meu PIN',
  'pin.redefinirTexto':
    'Para redefinir o PIN, confirme a senha da conta.',

  'responsavel.titulo': 'Área do responsável',
  'responsavel.nivelDe': 'Nível de {nome} no Pigreen',
  'responsavel.historico': 'Histórico de alimentos',
  'responsavel.semRegistros': 'Nenhuma refeição registrada neste dia.',
  'responsavel.hoje': 'Hoje',
  'responsavel.resumo': '{total} refeições registradas',

  'online.titulo': 'Área online',
  'online.descricao':
    'Aqui a criança vai visitar o pigreen dos amigos e mandar presentes, com autorização do responsável.',

  'erro.auth/invalid-email': 'Esse e-mail não parece válido.',
  'erro.auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
  'erro.auth/wrong-password': 'E-mail ou senha incorretos.',
  'erro.auth/invalid-credential': 'E-mail ou senha incorretos.',
  'erro.auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
  'erro.auth/weak-password': 'A senha precisa de pelo menos 6 caracteres.',
  'erro.auth/too-many-requests': 'Muitas tentativas seguidas. Espere um pouco e tente de novo.',
  'erro.auth/network-request-failed': 'Sem conexão. Verifique a internet e tente de novo.',
  'erro.auth/missing-password': 'Digite sua senha.',
  'erro.auth/requires-recent-login': 'Por segurança, entre de novo antes de alterar a senha.',
  'erro.permission-denied':
    'O banco de dados recusou o acesso. As regras de segurança do Firestore precisam ser publicadas.',
  'erro.unavailable': 'O servidor está fora do ar no momento. Tente de novo em instantes.',
  'erro.padrao': 'Algo deu errado por aqui. Tente de novo em instantes.',
} as const;

export type ChaveTraducao = keyof typeof pt;
