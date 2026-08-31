# 🐷 Pigreen

> Um aplicativo educativo gamificado que ajuda crianças e responsáveis a entender o veganismo de forma lúdica, com mecânicas inspiradas no estilo Tamagotchi.

O **Pigreen** nasceu da pesquisa *"Um app para uma infância sem crueldade animal"*, que investiga como o design gráfico e digital pode influenciar a percepção do veganismo na infância. A criança cuida de um porquinho virtual oferecendo alimentos de origem vegetal; o responsável acompanha o histórico alimentar do dia.

---

## 🧭 Como o projeto está organizado

```
src/
├── domain/       Regras do jogo, catálogos e validações — TypeScript puro, sem React
├── i18n/         Dicionários pt/en/es e o tradutor
├── types/        Modelos de dados compartilhados
├── services/     Firebase: inicialização, repositórios, PIN e tradução de erros
├── contexts/     Preferências (tema e idioma), sessão e estado do jogo
├── hooks/        Utilitários reativos (relógio, valores animados)
├── theme/        Paletas clara e escura, tipografia, espaçamento e fontes
├── components/   UI reutilizável (base + componentes de jogo)
├── navigation/   Rotas tipadas e a barra de abas customizada
├── screens/      auth · crianca · ajustes · responsavel · online
└── assets/       Registro central de imagens
```

Três decisões estruturam o resto.

**Domínio separado da apresentação.** Todo o comportamento do pet — decaimento de fome, ganho e perda de saúde, XP, nível, desbloqueio de alimentos e acessórios — vive em funções puras em `src/domain`, que recebem o estado e um instante e devolvem um estado novo. Elas não conhecem React, Firebase nem o relógio do sistema. A regra do jogo é testável em milissegundos, sem emulador e sem mock.

**Progressão offline.** As necessidades do pet **não** são atualizadas por um timer. O que fica persistido é o último estado conhecido mais o instante em que ele foi calculado; ao abrir o app, `projetar(pet, agora)` deriva o valor atual. Fechar o app por dois dias produz exatamente o mesmo resultado que deixá-lo aberto por dois dias — e um jogador com o app aberto por uma hora gera **zero** gravações no banco. A escrita acontece quando algo de fato acontece: uma refeição, o bônus diário, ou o app indo para segundo plano.

**Nenhum texto no código de tela.** Todas as frases moram em `src/i18n`. O português é a fonte da verdade: o tipo `ChaveTraducao` sai dele, e inglês e espanhol são `Record<ChaveTraducao, string>` — esquecer uma tradução vira erro de compilação. Um teste confere ainda que nenhum `{marcador}` de interpolação se perdeu na tradução.

---

## 🚀 Rodando o projeto

```bash
npm install

cp .env.example .env      # preencha com as chaves do seu projeto Firebase
npx expo start -c
```

O prefixo `EXPO_PUBLIC_` é obrigatório nas variáveis: sem ele o Metro não as injeta no bundle. Essas chaves não são segredos — quem protege os dados são as Security Rules.

### Scripts

| Comando                 | O que faz                                     |
| ----------------------- | --------------------------------------------- |
| `npm start`             | Inicia o bundler do Expo                       |
| `npm run typecheck`     | `tsc --noEmit` em modo estrito                 |
| `npm run lint`          | ESLint com a configuração do Expo              |
| `npm test`              | Suíte do domínio e dos dicionários (Vitest)    |
| `npm run test:coverage` | Cobertura das regras de jogo e tradução        |
| `npm run verify`        | Os três acima, em sequência                    |

### Segurança do banco

As regras ficam em `firestore.rules` e restringem cada documento ao seu dono, impedem que o nível regrida, limitam as barras de status à faixa 0–100 e tornam o histórico de refeições *append-only*. **Sem publicá-las o app não carrega o pet** — o Firestore recusa a leitura e a tela mostra o motivo:

```bash
npx firebase-tools deploy --only firestore:rules
```

---

## ✨ O que já funciona

**Entrada.** Splash animada, cadastro, login, recuperação de senha e sessão persistida. A recuperação confirma o envio mesmo para e-mails inexistentes, para não virar um verificador de contas. A validação do formulário é pura e testada, com força de senha e checagem de data de nascimento plausível.

**Aba infantil.** Cenário desenhado em código (nítido em qualquer densidade e sensível ao tema), porquinho com estados emocionais animados — feliz, faminto, tristinho, dorminhoco —, barras de Saúde, Fome e Felicidade com cards de explicação, carrossel de alimentos com itens bloqueados por nível, soneca pós-refeição com contagem regressiva e celebração de novo nível.

**Ajustes.** Editar nomes, nascimento e perfil alimentar; alterar a senha com reautenticação; renomear o porquinho; escolher tema (claro, escuro ou o do sistema) e idioma (pt/en/es); ligar e desligar lembretes.

**Customização.** Cinco acessórios desbloqueáveis por nível, aplicados sobre o sprite e aplicados na hora, sem botão de salvar.

**Área do responsável.** Protegida por PIN de 4 dígitos (guardado como SHA-256 com sal, redefinível pela senha da conta), com o nível da criança e o histórico alimentar dos últimos sete dias agrupado por refeição.

**Acessibilidade.** Alvos de toque de 48 px, rótulos e papéis para leitores de tela em todos os controles, barras com valor anunciado, e animações que se desligam quando o sistema pede "reduzir movimento".

## 🚧 Próximos passos

- **Área online** — é o único módulo do Figma ainda por fazer, e depende de duas decisões externas: o provedor Google precisa ser configurado no console do Firebase, e visitar o pet de um amigo exige regras de leitura entre contas. O fluxo previsto é autorização do responsável com prazo de 24h, lista de amigos, visita e envio de presentes com três toques.
- **Lembretes de verdade** — o interruptor já persiste a preferência; falta agendar as notificações locais.
- **Assets** — exportar do Figma as fotos dos alimentos (`assets/alimentos/`) e as variantes do porquinho por estado; os pontos de troca já estão prontos em `src/assets/registro.ts`.
- **Fonte de títulos** — adicionar `NeulisCursive-Bold.ttf` em `assets/fonts` e habilitá-la em `src/theme/fontes.ts`.

---

## 🛠️ Tecnologias

**Mobile:** React Native · Expo SDK 54 · TypeScript (strict) · React Navigation 7 · AsyncStorage

**Nuvem:** Firebase Authentication · Cloud Firestore

**Qualidade:** Vitest · ESLint (config Expo) · `tsc --noEmit`

**Futuras integrações:** Python 3 · FastAPI

---

## 👨‍💻 Autores

**Desenvolvimento e Arquitetura:** [Eric Donato](https://www.linkedin.com/in/ericdonato/)
**UI/UX Design e pesquisa:** [Mariana Moraes](https://www.linkedin.com/in/mariana-moraes-759437213/)
