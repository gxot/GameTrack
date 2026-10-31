# GameTrack

## Apresentação

GameTrack é um aplicativo mobile acadêmico desenvolvido para a disciplina **Mobile Development: Frameworks**, da **PUCPR**. Seu objetivo é oferecer um catálogo pessoal de videogames, combinando dados da RAWG com favoritos, jogos finalizados e avaliações pessoais armazenados no aparelho por usuário.

O código implementa cadastro e login locais, sessão persistente, catálogo em grade com paginação e filtros, busca por nome, detalhes consultados por ID e coleções pessoais. O projeto utiliza JavaScript e JSX com componentes funcionais.

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| React Native 0.81.5 | Interface mobile com componentes básicos, FlatList, StyleSheet e Flexbox. |
| Expo SDK 54 | Inicialização e recursos nativos do aplicativo. |
| JavaScript e JSX | Implementação dos componentes, serviços e hooks. |
| React 19.1 e Context API | Estado compartilhado de autenticação, favoritos e finalizados. |
| React Navigation Native Stack | Fluxos condicionais e navegação entre as telas. |
| Axios | Requisições à RAWG, timeout e cancelamento. |
| AsyncStorage | Perfis locais e coleções separadas por ID de usuário. |
| Expo SecureStore | Credenciais protegidas e identificador da sessão ativa. |

As dependências estão declaradas no package.json. Esta auditoria não instalou pacotes, não modificou versões e não executou o aplicativo. O uso previsto é em Android e iOS; os fluxos com SecureStore não foram preparados para execução web.

## API

O aplicativo utiliza a **RAWG Video Games Database API**, com base https://api.rawg.io/api. É necessário obter uma chave gratuita no [site da RAWG](https://rawg.io/apidocs), respeitando as condições e limites do plano disponibilizado pelo serviço.

| Recurso | Endpoint | Parâmetros utilizados |
| --- | --- | --- |
| Catálogo | GET /games | page, page_size=20, ordering=-added e genres quando selecionado. |
| Busca | GET /games | search, page=1 e page_size=20. |
| Detalhes | GET /games/{id} | ID numérico original da RAWG no caminho. |
| Gêneros | GET /genres | page_size=40. |

Todas as chamadas passam pela instância Axios de src/services/api.js, que envia a chave no parâmetro key e utiliza timeout de 15 segundos. Uma chave ausente ou com o placeholder SUA_CHAVE_RAWG_AQUI bloqueia o envio da requisição. Falhas de conexão, timeout, chave rejeitada e HTTP 429 recebem mensagens amigáveis. A consulta de detalhes trata HTTP 404 como jogo não encontrado.

Os serviços normalizam os registros e mantêm os IDs numéricos originais. A descrição prioriza description_raw; o fallback description remove tags HTML e trata entidades comuns e referências numéricas, sem WebView.

As telas que exibem dados de jogos incluem **Dados de jogos fornecidos por RAWG**, com link para [RAWG](https://rawg.io/) aberto por Linking.

## Como executar

As instruções abaixo são para execução manual pelo desenvolvedor. Nenhum desses comandos foi executado durante a implementação ou a auditoria.

1. Prepare Node.js e npm e um dispositivo ou emulador Android/iOS com um cliente Expo compatível com o SDK 54. A compatibilidade do ambiente e do cliente instalado permanece pendente de validação manual.
2. Na raiz do projeto, instale as dependências:

   ~~~sh
   npm install
   ~~~

3. Utilize .env.example como modelo para o arquivo .env. Se o .env já existir, edite somente o valor da variável. O modelo contém:

   ~~~dotenv
   EXPO_PUBLIC_RAWG_API_KEY=SUA_CHAVE_RAWG_AQUI
   ~~~

   Substitua manualmente SUA_CHAVE_RAWG_AQUI pela sua chave RAWG. Não coloque a chave diretamente nos arquivos JavaScript. O .gitignore exclui .env, node_modules e diretórios de build; .env.example permanece versionável.

4. Inicie o projeto manualmente:

   ~~~sh
   npx expo start
   ~~~

5. Abra o aplicativo no dispositivo ou emulador compatível e crie uma conta local. Caso altere a chave com o projeto aberto, reinicie o Expo e recarregue o aplicativo antes de tentar novamente.

A chave EXPO_PUBLIC_ é incluída no aplicativo pelo Expo e não equivale à proteção de um segredo em backend. Excluir o .env do Git evita versionar o arquivo local, mas não torna o valor secreto dentro do aplicativo distribuído.

## Estrutura do projeto

~~~text
.
├── App.js
├── index.js
├── app.json
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── RegisterScreen.js
    │   ├── CatalogScreen.js
    │   ├── SearchScreen.js
    │   ├── GameDetailsScreen.js
    │   ├── FavoritesScreen.js
    │   └── CompletedScreen.js
    ├── components/
    │   ├── GameCard.js
    │   ├── GameCover.js
    │   ├── RatingStars.js
    │   └── RawgAttribution.js
    ├── contexts/
    │   ├── AuthContext.js
    │   ├── FavoritesContext.js
    │   └── CompletedContext.js
    ├── navigation/
    │   └── AppNavigator.js
    ├── services/
    │   ├── api.js
    │   ├── gamesService.js
    │   ├── authStorage.js
    │   └── userStorage.js
    └── hooks/
        ├── useGames.js
        └── useGameSearch.js
~~~

- index.js registra App.js no Expo. App.js configura SafeAreaProvider, StatusBar, AuthProvider e a navegação.
- screens contém as sete telas. components reúne cards, capas com fallback, estrelas e atribuição.
- contexts concentra o estado compartilhado, consumido pelos hooks useAuth, useFavorites e useCompleted.
- navigation define um único NavigationContainer e as rotas do Native Stack.
- services separa consultas RAWG, autenticação e acesso ao armazenamento de coleções.
- hooks contém a lógica de paginação e busca, com cancelamento e descarte de respostas antigas.

O nome configurado em app.json é GameTrack e o slug é gametrack. A entrada do package.json é index.js, que registra o componente principal App.js.

## Armazenamento

### Autenticação local

O cadastro gera um ID local estável, valida o e-mail normalizado e impede e-mails duplicados. A senha exige pelo menos seis caracteres, com confirmação no formulário de cadastro. Após cadastro bem-sucedido, o usuário é autenticado automaticamente.

| Armazenamento | Chave | Conteúdo |
| --- | --- | --- |
| AsyncStorage | @gametrack/profiles | Lista de perfis com id, name e email. |
| SecureStore | gametrack.credential.<userId> | Senha protegida pelo armazenamento nativo do dispositivo. |
| SecureStore | gametrack.activeUserId | ID do usuário com sessão ativa. |

Senhas não são armazenadas no AsyncStorage nem exibidas em logs ou mensagens. A autenticação é exclusivamente local, sem backend, JWT, sincronização ou recuperação por e-mail.

AuthProvider restaura a sessão em useEffect, mantendo um indicador de inicialização antes de escolher o fluxo de navegação. Sessões inválidas ou sem perfil correspondente retornam ao Login. Falhas de leitura da sessão apresentam uma orientação para entrar novamente; o login existente permite uma nova tentativa de acesso local. Logout remove somente o identificador da sessão.

### Coleções por usuário

userStorage.js centraliza as chaves:

~~~text
@gametrack/user/<userId>/favorites
@gametrack/user/<userId>/completed
~~~

O userId vem do AuthContext; o e-mail não é utilizado como identificador das coleções. Favoritos armazenam somente id, name, background_image e released. Finalizados armazenam os mesmos campos e personalRating, um inteiro obrigatório entre 1 e 5. As respostas completas da RAWG e a nota pública não são persistidas nessas coleções.

Um mesmo jogo pode estar nas duas coleções. Remover um finalizado não remove seu favorito. O logout mantém os perfis e as coleções locais disponíveis para o próximo acesso.

FavoritesProvider e CompletedProvider existem somente no fluxo autenticado, dentro de uma árvore com key=user.id. A troca de conta ou logout desmonta essa árvore. Cada operação captura o ID da conta antes da execução, e respostas após desmontagem não atualizam o estado de outra conta.

As leituras usam getItem e JSON.parse, e as gravações usam setItem e JSON.stringify. Chaves ausentes retornam listas vazias. Registros são normalizados, validados e deduplicados por ID. Há filas de alterações nos Contexts e de acessos por chave no serviço.

O estado de uma coleção muda após confirmação da gravação. Falhas mantêm a última coleção confirmada e apresentam erro. Uma leitura inválida não apaga os dados persistidos, não provoca gravação automática de lista vazia e bloqueia a edição até uma leitura bem-sucedida. Não é utilizado AsyncStorage.clear().

## Funcionalidades

- Cadastro, login e logout locais, com sessão persistente.
- Catálogo com vinte jogos por página, grade de duas colunas e ordenação por popularidade de adição na RAWG.
- Paginação infinita, bloqueio de solicitações simultâneas da próxima página, deduplicação e encerramento quando next é null.
- Pull-to-refresh que mantém a lista enquanto consulta novamente a primeira página.
- Filtros horizontais por gênero, incluindo Todos; a troca reinicia a paginação.
- Busca por nome acionada somente por botão ou teclado, com uma página de até vinte resultados em lista vertical.
- Navegação para detalhes passando somente { id: game.id }, seguida de uma nova requisição individual e atualização dinâmica do título.
- Detalhes com capa, lançamento, gêneros, plataformas, desenvolvedores, nota pública, descrição e tempo médio de jogo quando disponíveis.
- Favoritar/desfavoritar, com indicadores compartilhados entre catálogo, busca e coleções.
- Lista de favoritos com remoção e acesso aos detalhes sem consultar a API para montar cada item.
- Marcação de jogos finalizados, avaliação pessoal de uma a cinco estrelas, alteração de nota e remoção da marcação.
- Tela de finalizados com as avaliações pessoais, separadas da nota pública da RAWG.
- Indicadores para autenticação, sessão, catálogo, paginação, refresh, busca, detalhes, hidratação e gravação de coleções.
- Mensagens para falhas e estados vazios, nova tentativa quando recuperável e retorno para jogos inexistentes ou IDs inválidos, sem loops automáticos de consultas.
- Interface escura com roxo, controles com labels e estados acessíveis, textos que permitem múltiplas linhas, fontes do sistema e áreas de toque mínimas declaradas de aproximadamente 44 a 48 pontos.

## Auditoria estática dos requisitos

Os status abaixo descrevem a presença da implementação no código. Não significam comprovação do funcionamento no aparelho.

| RF | Status no código | Arquivos responsáveis | Observações |
| --- | --- | --- | --- |
| RF01 | Implementado no código | CatalogScreen.js, useGames.js, gamesService.js, GameCard.js e GameCover.js | Grade, paginação, deduplicação, refresh e descarte de respostas antigas. |
| RF02 | Implementado no código | AppNavigator.js, CatalogScreen.js, SearchScreen.js, FavoritesScreen.js, CompletedScreen.js e GameDetailsScreen.js | Container único, Stack, ID na rota, cabeçalho dinâmico e retorno nativo. |
| RF03 | Implementado no código | gamesService.js, GameDetailsScreen.js e GameCover.js | Segunda consulta por ID, dados opcionais, descrição e estados de erro. |
| RF04 | Implementado no código | FavoritesContext.js, GameDetailsScreen.js, CatalogScreen.js, SearchScreen.js e GameCard.js | Favoritos centralizados no Context e fornecidos aos cards por props. |
| RF05 | Implementado no código | FavoritesScreen.js, FavoritesContext.js e AppNavigator.js | Lista local, remoção, estado vazio e abertura de detalhes. |
| RF06 | Implementado no código | userStorage.js, FavoritesContext.js, CompletedContext.js e AppNavigator.js | Hidratação, filas, isolamento pelo ID e preservação após falhas. |
| RF07 | Implementado no código | AuthContext.js, authStorage.js, LoginScreen.js, RegisterScreen.js, CompletedContext.js, CompletedScreen.js, RatingStars.js e GameDetailsScreen.js | Credenciais no SecureStore, sessão local e nota pessoal inteira obrigatória. |
| RF08 | Implementado no código | SearchScreen.js, useGameSearch.js, gamesService.js e GameCard.js | Busca explícita, resultados em lista e cancelamento de pesquisas anteriores. |
| RF09 | Implementado no código | Telas, AuthContext.js, Contexts de coleções, hooks e api.js | Loading, mensagens amigáveis e recuperação; falhas reais ainda exigem observação manual. |
| RF10 | Implementado no código | Telas, GameCard.js, GameCover.js, RatingStars.js e RawgAttribution.js | Propriedades acessíveis e estilos presentes; conformidade efetiva com leitores, fontes e contraste depende de validação manual. |

Nesta auditoria foram corrigidos dois pontos de feedback: o cancelamento de detalhes com a tela ainda ativa agora encerra o loading e oferece nova tentativa; falhas ao restaurar a sessão deixam de ser silenciosas e são informadas no Login. As interfaces usadas pelos componentes existentes foram preservadas, com apenas um campo opcional de erro acrescentado ao AuthContext.

Pela leitura dos arquivos, imports locais possuem arquivos correspondentes, nomes de rotas e props utilizados são coerentes, e não foram encontradas referências ao antigo nome do aplicativo nos arquivos inspecionados. Não foi encontrada chave RAWG real nos arquivos de código e no .env.example lidos. O .env não foi lido nem alterado nesta auditoria; o índice e o histórico Git não foram consultados.

## Limitações

- Os dados da RAWG e as imagens remotas dependem de conexão com a internet, disponibilidade do serviço e uma chave aceita. Não há cache local do catálogo completo.
- A busca exibe somente a primeira página de até vinte resultados. A paginação infinita está implementada no catálogo.
- A autenticação é local e não oferece sincronização entre dispositivos, recuperação remota de senha ou um serviço de identidade em backend.
- Favoritos, avaliações e perfis são armazenados no aparelho. Limpeza de dados ou desinstalação pode removê-los; não há backup em nuvem implementado.
- Coleções locais preservam resumos, mas abrir seus detalhes continua exigindo acesso à RAWG. Não há download permanente das capas.
- A variável EXPO_PUBLIC_ integra o aplicativo distribuído e não protege um segredo como um backend faria.
- Nenhuma instalação, execução, medição de contraste ou comprovação de funcionamento nativo foi realizada nesta auditoria. A compatibilidade efetiva do ambiente e das dependências ainda requer execução manual.
- As regras de .gitignore não comprovam que arquivos sensíveis nunca foram versionados anteriormente; o histórico Git não foi inspecionado.

## Pendente de validação manual

- Instalação das dependências e inicialização em Android/iOS com cliente compatível com Expo SDK 54.
- Cadastro, login correto/incorreto, restauração após reabrir o aplicativo, aviso de falha e logout.
- Catálogo com uma chave válida: filtros, imagens, páginas sem duplicatas, fim da lista e pull-to-refresh.
- Busca vazia, busca sem resultados, pesquisas consecutivas e abertura/retorno dos detalhes.
- Falhas de rede, timeout, HTTP 404/429 e cancelamento durante troca de tela ou consulta, observando o encerramento dos indicadores.
- Gravação e recuperação das coleções após reiniciar; cenário usuário A, logout, usuário B e retorno ao A; operações pendentes e falhas reais do armazenamento.
- Favoritos e avaliações atualizados entre telas, alteração da nota e remoções independentes das coleções.
- TalkBack e VoiceOver: ordem de foco, anúncios de loading/erros, seleção das estrelas e estados de favorito/finalizado.
- Teclado aberto, fontes ampliadas, nomes e descrições longos e áreas de toque em telas pequenas.
- Contraste WCAG AA, incluindo estados pressionados/desabilitados, e abertura do link de atribuição.

Não foram executados comandos de terminal, npm, npx, Expo, Git, testes, builds, lint, typecheck, servidores, pesquisas web, consultas HTTP ou validações automatizadas. Os comandos da seção Como executar são apenas instruções para o desenvolvedor.
