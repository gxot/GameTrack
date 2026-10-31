# GameTrack

Aplicativo mobile acadêmico para a disciplina Mobile Development: Frameworks da PUCPR. O projeto será um catálogo pessoal de videogames com dados da RAWG Video Games Database API.

## Etapa atual

A etapa 6 refina a UI/UX, o feedback visual (RF09) e a acessibilidade (RF10) do aplicativo existente, sem adicionar funcionalidades ou dependências. Autenticação, catálogo, busca, detalhes, favoritos, finalizados, avaliações pessoais e persistência por usuário foram preservados. As consultas à RAWG continuam dependendo de uma chave válida e das dependências já declaradas.

As dependências foram apenas declaradas no package.json, sem instalação. Nenhum comando, teste, lint, build, servidor ou validação automatizada foi executado nesta etapa. As versões de Expo, React e React Native seguem o [template blank oficial do Expo SDK 54](https://github.com/expo/expo/blob/sdk-54/templates/expo-template-blank/package.json).

## Tecnologias planejadas

- React Native, Expo e JavaScript: base do aplicativo, declarada nesta etapa.
- React Navigation com Native Stack: navegação entre telas.
- Axios: requisições HTTP.
- Context API: gerenciamento de estado compartilhado.
- AsyncStorage: persistência local de dados por usuário.
- Expo SecureStore: armazenamento local seguro de dados de sessão.

React Navigation Native Stack, Context API, AsyncStorage e Expo SecureStore são utilizados na autenticação local. Axios é utilizado na integração RAWG do catálogo. O projeto utiliza JavaScript e JSX, com `App.js` como componente principal.

## Estrutura de pastas

```text
.
├── App.js
├── index.js
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── CatalogScreen.js
│   │   ├── SearchScreen.js
│   │   ├── GameDetailsScreen.js
│   │   ├── FavoritesScreen.js
│   │   └── CompletedScreen.js
│   ├── components/
│   │   ├── GameCard.js
│   │   ├── GameCover.js
│   │   ├── RawgAttribution.js
│   │   └── RatingStars.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   ├── FavoritesContext.js
│   │   └── CompletedContext.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── services/
│   │   ├── authStorage.js
│   │   ├── api.js
│   │   ├── gamesService.js
│   │   └── userStorage.js
│   └── hooks/
│       ├── useGames.js
│       └── useGameSearch.js
├── .env
├── .env.example
├── .gitignore
├── app.json
├── package.json
└── README.md
```

Os diretórios ainda reservados para funcionalidades futuras permanecem com seus arquivos `.gitkeep`.

| Diretório | Responsabilidade futura |
| --- | --- |
| `src/screens/` | Telas de login, cadastro, catálogo, busca, detalhes, favoritos e finalizados. |
| `src/components/` | Componentes visuais reutilizáveis, como cards e indicadores de avaliação. |
| `src/contexts/` | Estado compartilhado de autenticação, favoritos e jogos finalizados. |
| `src/navigation/` | Definição da navegação com React Navigation Native Stack. |
| `src/services/` | Integração com RAWG e serviços de persistência local. |
| `src/hooks/` | Hooks customizados para reutilização de lógica. |

`index.js` registra o componente principal `App.js` no Expo. `app.json` define o nome GameTrack e o slug `gametrack`.

## Autenticação local e navegação

- AuthProvider expõe user, isInitializing, login, register e logout pelo hook useAuth.
- A sessão é restaurada no início, com ActivityIndicator antes da escolha do fluxo.
- AppNavigator utiliza NavigationContainer e Native Stack. O estado user escolhe Login/Cadastro ou o fluxo autenticado (Catálogo, Busca, Detalhes, Favoritos e Finalizados); logout muda esse estado sem navegação manual.
- AsyncStorage mantém somente perfis com ID estável, nome e e-mail normalizado. As senhas e o identificador da sessão ficam exclusivamente no SecureStore.
- O cadastro valida campos, formato do e-mail, senha de pelo menos 6 caracteres, confirmação e e-mails duplicados; em caso de sucesso, inicia a sessão automaticamente.
- Logout remove somente a sessão. Perfis e credenciais permanecem para os próximos acessos.
- A autenticação ocorre neste dispositivo, sem backend, JWT ou recuperação por e-mail.

As versões nativas declaradas seguem a [lista de módulos do Expo SDK 54](https://github.com/expo/expo/blob/sdk-54/packages/expo/bundledNativeModules.json). A navegação segue o [fluxo condicional de autenticação do React Navigation](https://reactnavigation.org/docs/auth-flow/).

## API e configuração de ambiente

A integração utiliza a [RAWG Video Games Database API](https://rawg.io/apidocs), com base https://api.rawg.io/api. A instância em src/services/api.js envia a chave no parâmetro key em todas as requisições e aplica timeout de 15 segundos. Falhas de conexão, tempo limite, chave rejeitada, limite de consultas e respostas inválidas são apresentadas sem expor a chave ou erros brutos do Axios.

O arquivo `.env` e o modelo versionável `.env.example` contêm:

```dotenv
EXPO_PUBLIC_RAWG_API_KEY=SUA_CHAVE_RAWG_AQUI
```

Para utilizar o catálogo, o desenvolvedor deverá substituir manualmente `SUA_CHAVE_RAWG_AQUI` pela chave real no `.env` e reiniciar o aplicativo. Enquanto a variável estiver ausente ou mantiver o placeholder, nenhuma requisição será enviada; a tela orienta a configuração e oferece Tentar novamente. O arquivo `.env` não foi alterado nesta etapa. A chave não deve ser colocada diretamente em arquivos JavaScript. O `.gitignore` exclui `.env`, dependências, arquivos temporários e diretórios de build; `.env.example` permanece versionável.

## Catálogo, paginação e filtros

- gamesService.js consulta GET /games com page_size=20 e ordering=-added, adicionando genres quando um filtro é selecionado. O serviço mantém o ID numérico original e normaliza nome, imagem, lançamento, nota pública e gêneros.
- GET /genres fornece id, name e slug para a barra horizontal, junto à opção Todos. Uma falha nos gêneros não bloqueia a consulta de jogos, e há uma ação independente para tentar carregá-los novamente.
- useGames centraliza lista, página, próxima página, filtro, carregamentos e erros. A página só avança após sucesso, os jogos são deduplicados por ID e next=null encerra a paginação.
- O bloqueio por referência evita requisições simultâneas de paginação. AbortController cancela requisições substituídas; uma verificação de identidade descarta respostas antigas e evita atualizações após desmontagem.
- Pull-to-refresh preserva a lista visível até receber a primeira página e então substitui os resultados. Trocar o gênero limpa a lista e reinicia a paginação.
- Uma falha adicional preserva os jogos existentes e permite repetir a página. A lista também apresenta carregamento inicial, estado vazio e erro inicial com nova tentativa.
- CatalogScreen utiliza FlatList com duas colunas. GameCard recebe o jogo por props e exibe a nota pública da RAWG, sem avaliações pessoais. GameCover apresenta um placeholder para capas ausentes ou com falha.
- GameCard aceita onPress(game) e variant="list" para os resultados verticais da busca, mantendo a grade do catálogo como padrão. Os dois fluxos abrem detalhes passando somente o ID.
- RawgAttribution permanece visível no catálogo e abre https://rawg.io/ com Linking.

## Dependências

Nenhuma nova dependência foi introduzida nas Etapas 4, 5 e 6. Axios ^1.13.2 já estava declarado no package.json desde a Etapa 3, sem instalação ou arquivo de lock. A integração utiliza a [instância Axios](https://axios-http.com/docs/instance) e [cancelamento com AbortController](https://axios-http.com/docs/cancellation). As dependências de Expo SDK 54, autenticação e navegação foram preservadas.

## Busca por nome — RF08

- SearchScreen oferece campo controlado e botão Buscar. A requisição acontece somente ao tocar no botão ou confirmar pelo teclado, nunca ao digitar cada caractere.
- searchGames(term, { signal }) remove espaços nas extremidades e consulta GET /games com search, page=1 e page_size=20. Reutiliza readPage e normalizeGame do catálogo.
- Termos vazios ou compostos apenas por espaços são recusados sem chamada HTTP. Não há paginação da pesquisa nesta etapa.
- useGameSearch separa termo pesquisado, resultados, carregamento, erro e indicação de pesquisa realizada. Uma nova busca substitui os resultados; repetir em caso de erro utiliza o último termo efetivamente pesquisado, mesmo que o campo tenha sido editado.
- Requisições repetidas do mesmo termo em andamento são ignoradas. Uma busca diferente cancela a anterior e invalida respostas antigas. A desmontagem cancela o trabalho pendente e bloqueia atualizações de estado.
- A FlatList apresenta uma coluna com GameCard em modo lista, distinguindo estado inicial, carregamento, resultados, busca sem resultados e erro com nova tentativa. A atribuição RAWG permanece visível.

## Navegação e detalhes — RF02 e RF03

- O catálogo abre SearchScreen pelo botão Buscar jogos. Catálogo, Busca e GameDetails estão registrados somente no Stack autenticado, dentro do NavigationContainer existente.
- Cards do catálogo e da busca chamam navigation.navigate('GameDetails', { id: game.id }). O objeto completo do jogo não é transmitido pela rota.
- GameDetailsScreen lê route.params.id e chama getGameDetails(id, { signal }), realizando uma nova requisição GET /games/{id} pela mesma instância Axios.
- O serviço valida IDs numéricos positivos, trata HTTP 404 como jogo não encontrado e normaliza os dados básicos junto de plataformas, desenvolvedores, descrição e tempo médio de jogo. Campos opcionais ausentes usam alternativas textuais ou são omitidos.
- A descrição prioriza description_raw. O fallback description remove tags, preserva quebras de parágrafo e trata entidades HTML comuns e referências numéricas, sem WebView ou novas bibliotecas.
- A tela utiliza ScrollView, capa maior com GameCover, nota pública RAWG e atribuição. Possui carregamento e mensagens amigáveis; falhas recuperáveis oferecem Tentar novamente, enquanto IDs inválidos ou jogos inexistentes oferecem Voltar.
- Ao receber os dados, navigation.setOptions({ title: game.name }) atualiza o cabeçalho nativo, que mantém o botão de voltar. A troca de ID limpa o conteúdo anterior; cancelamento e invalidação impedem respostas obsoletas e atualizações após desmontagem.
- O catálogo continua montado no Stack ao abrir Busca ou Detalhes, preservando seu estado. A lógica de useGames e a autenticação não foram alteradas.
- A proteção da chave ausente ou placeholder permanece na instância Axios e também se aplica a busca e detalhes.

## Favoritos, finalizados e avaliações pessoais — RF04 a RF07

- FavoritesProvider expõe favorites, isLoadingFavorites, isFavorite, addFavorite, removeFavorite, toggleFavorite e error por useFavorites().
- CompletedProvider expõe completedGames, isLoadingCompleted, isCompleted, getPersonalRating, markCompleted, updateRating, removeCompleted e error por useCompleted().
- Ambos também oferecem indicadores de coleção pronta e gravação em andamento, além de reloadFavorites ou reloadCompleted para recuperar falhas de leitura.
- Os detalhes permitem favoritar/desfavoritar, selecionar estrelas, marcar como finalizado, salvar outra nota e remover dos finalizados. Nenhuma dessas ações faz outra requisição RAWG: elas utilizam o jogo que já foi carregado.
- RatingStars aceita value, onChange e disabled. Sem onChange, mostra somente a avaliação pessoal. A nota pública RAWG continua sendo exibida separadamente.
- GameCard recebe isFavorite por props. Catálogo, Busca e as coleções fornecem esse estado a partir de FavoritesContext, sem criar uma cópia local do estado de favoritos.
- FavoritesScreen usa os resumos locais em FlatList, abre detalhes pelo ID e permite remover favoritos. CompletedScreen exibe os jogos finalizados e as notas pessoais. As listas distinguem carregamento, falha de leitura, coleção vazia e dados disponíveis.
- O catálogo possui acessos para Meus favoritos e Jogos finalizados, mantendo busca, filtros, paginação e logout. As novas telas pertencem somente ao Stack autenticado e possuem retorno pelo cabeçalho nativo.

## Estrutura e isolamento no AsyncStorage

userStorage.js centraliza as chaves, a normalização e as filas de acesso:

- @gametrack/user/<userId>/favorites
- @gametrack/user/<userId>/completed

O identificador utilizado é o ID estável do AuthContext; o e-mail não é usado como chave. Cada favorito armazena somente id, name, background_image e released. Cada finalizado armazena esses campos e personalRating, obrigatoriamente um inteiro entre 1 e 5. Dados completos da RAWG, descrições e notas públicas não são persistidos nessas coleções. Um jogo pode pertencer às duas coleções simultaneamente.

A leitura utiliza getItem e JSON.parse; a gravação utiliza setItem e JSON.stringify. Chaves ausentes retornam listas vazias, IDs e notas são validados e registros repetidos são deduplicados por ID. Uma falha de leitura ou estrutura inválida produz erro sem apagar ou substituir os dados persistidos. Não há AsyncStorage.clear nem gravação automática de listas vazias durante a hidratação.

FavoritesProvider e CompletedProvider são montados somente com um usuário autenticado. A árvore recebe key=user.id, sendo desmontada no logout e reiniciada em outra conta. O AuthContext e authStorage.js permanecem inalterados.

Cada Provider serializa suas alterações usando a coleção mais recente confirmada. O estado só muda após a gravação concluir; se falhar, a coleção anterior permanece e o erro é apresentado. Operações consecutivas não sobrescrevem alterações anteriores. O serviço também enfileira acessos por chave, coordenando uma gravação ainda em andamento com a leitura de uma nova montagem da mesma conta.

As operações capturam o ID da conta antes de entrar na fila. Operações ainda não iniciadas são invalidadas após desmontagem; as que já foram enviadas ao armazenamento concluem somente na chave capturada e não atualizam telas desmontadas. Uma conta posterior usa suas próprias chaves. Remover finalizados não remove favoritos, e logout não apaga nenhuma coleção.

Falhas de leitura bloqueiam a edição até uma nova tentativa bem-sucedida. As telas de coleções e os controles dos detalhes oferecem recuperação dessa leitura. Falhas de gravação aparecem no Context e nas telas, permitindo repetir a ação com a última coleção confirmada preservada.

## Refinamentos de UI/UX e acessibilidade — Etapa 6

- Login e Cadastro mantêm os formulários roláveis com KeyboardAvoidingView, avançam entre campos pelo teclado e apresentam texto junto ao indicador de envio. Bloqueios imediatos evitam submissões repetidas antes do próximo render, e respostas após desmontagem não atualizam o formulário.
- Botões, links e filtros receberam dimensões mínimas de toque de 48 pontos, sem alturas fixas que limitem textos. A escala de fonte do sistema permanece habilitada.
- A identidade escura e roxa foi preservada. Estados desabilitados usam superfícies escuras legíveis, com estados acessíveis explícitos. As áreas tocáveis mantêm feedback visual ao pressionar.
- Filtros selecionados exibem uma marca de seleção além da cor. Cards comunicam Favorito ou Não favoritado por texto e pelo label acessível, mantendo as duas colunas do catálogo e a lista da busca.
- Detalhes seguem a ordem capa/nome, informações gerais, descrição e controles de favoritos/avaliação; a atribuição RAWG continua visível. O botão de nova tentativa possui bloqueio contra repetições simultâneas.
- A recuperação de jogos no catálogo repete somente a operação de jogos que falhou. Os gêneros mantêm sua recuperação independente, sem disparar consultas adicionais pelo botão de jogos.
- Estados vazios de catálogo, busca, favoritos e finalizados receberam mensagens e orientações consistentes. As coleções continuam distinguindo leitura inicial, falha e coleção vazia.
- Gravações de favoritos e avaliações apresentam texto e indicador. Toques repetidos nos controles dos detalhes e na remoção de favoritos são bloqueados enquanto a ação está pendente, sem alterar as filas de persistência.
- GameCover trata a capa dos detalhes como imagem informativa, anunciando também sua indisponibilidade. Capas decorativas nos cards não repetem o nome já anunciado pelo card; placeholders permitem crescimento do texto.
- RatingStars mantém labels descritivos por nota, informa a seleção e conserva áreas de toque amplas. Na lista de finalizados, a avaliação é anunciada uma vez pelo componente, evitando repetir o mesmo valor pelo texto associado.
- RawgAttribution mantém o texto e o destino originais, apresenta feedback de abertura e impede ativações simultâneas. Uma falha orienta tocar novamente no link.

Os Contexts, os hooks de catálogo/busca, o modelo de autenticação, as chaves de armazenamento, a navegação e o contrato RAWG não foram alterados nesta etapa. Nenhum arquivo de configuração ou dependência foi modificado.

## Pendências para a Etapa 7 e revisão manual

O aplicativo não foi executado nem testado nesta etapa. Ainda dependem de observação manual em dispositivos Android/iOS: comportamento do teclado e foco; textos com fontes aumentadas em telas pequenas; anúncios e ordem de leitura com TalkBack/VoiceOver; contraste final e navegação por toque; recuperação de falhas reais de rede e armazenamento; persistência após reabrir o aplicativo e isolamento entre contas. Não foi realizada medição automatizada de contraste ou certificação WCAG AA.

A instalação posterior das dependências já declaradas e a configuração manual da chave RAWG continuam necessárias para utilizar as consultas. O .env e seu placeholder foram preservados. O trabalho seguinte deve seguir o escopo do enunciado da Etapa 7.

Nenhum comando de terminal ou Git, instalação, teste, lint, build, servidor, execução do Expo, pesquisa web ou validação automatizada foi realizado nesta etapa. O aplicativo não foi executado e nenhuma consulta à RAWG foi enviada durante a implementação.
