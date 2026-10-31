# GameTrack

Aplicativo mobile acadêmico para a disciplina Mobile Development: Frameworks da PUCPR. O projeto será um catálogo pessoal de videogames com dados da RAWG Video Games Database API.

## Etapa atual

A etapa 2 implementa autenticação exclusivamente local e navegação condicional. Há telas de login, cadastro e uma tela provisória após a autenticação. O catálogo real e as demais funcionalidades serão desenvolvidos nas próximas etapas.

As dependências foram apenas declaradas no package.json, sem instalação. Nenhum comando, teste, lint, build, servidor ou validação automatizada foi executado nesta etapa. As versões de Expo, React e React Native seguem o [template blank oficial do Expo SDK 54](https://github.com/expo/expo/blob/sdk-54/templates/expo-template-blank/package.json).

## Tecnologias planejadas

- React Native, Expo e JavaScript: base do aplicativo, declarada nesta etapa.
- React Navigation com Native Stack: navegação entre telas.
- Axios: requisições HTTP.
- Context API: gerenciamento de estado compartilhado.
- AsyncStorage: persistência local de dados por usuário.
- Expo SecureStore: armazenamento local seguro de dados de sessão.

React Navigation Native Stack, Context API, AsyncStorage e Expo SecureStore são utilizados na autenticação local. Axios e a integração RAWG ficam para as próximas etapas. O projeto utiliza JavaScript e JSX, com `App.js` como componente principal.

## Estrutura de pastas

```text
.
├── App.js
├── index.js
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── CatalogScreen.js
│   ├── components/
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── services/
│   │   └── authStorage.js
│   └── hooks/
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
- AppNavigator utiliza NavigationContainer e Native Stack. O estado user escolhe Login/Cadastro ou Catálogo provisório; logout muda esse estado sem navegação manual.
- AsyncStorage mantém somente perfis com ID estável, nome e e-mail normalizado. As senhas e o identificador da sessão ficam exclusivamente no SecureStore.
- O cadastro valida campos, formato do e-mail, senha de pelo menos 6 caracteres, confirmação e e-mails duplicados; em caso de sucesso, inicia a sessão automaticamente.
- Logout remove somente a sessão. Perfis e credenciais permanecem para os próximos acessos.
- A autenticação ocorre neste dispositivo, sem backend, JWT ou recuperação por e-mail.

As versões nativas declaradas seguem a [lista de módulos do Expo SDK 54](https://github.com/expo/expo/blob/sdk-54/packages/expo/bundledNativeModules.json). A navegação segue o [fluxo condicional de autenticação do React Navigation](https://reactnavigation.org/docs/auth-flow/).

## API e configuração de ambiente

A API planejada é a [RAWG Video Games Database API](https://rawg.io/apidocs). Nenhuma requisição ou integração HTTP foi implementada nesta etapa.

O arquivo `.env` e o modelo versionável `.env.example` contêm:

```dotenv
EXPO_PUBLIC_RAWG_API_KEY=SUA_CHAVE_RAWG_AQUI
```

O desenvolvedor deverá substituir manualmente `SUA_CHAVE_RAWG_AQUI` pela chave real no `.env` após a implementação das etapas. A chave não deve ser colocada diretamente em arquivos JavaScript. O `.gitignore` exclui `.env`, dependências, arquivos temporários e diretórios de build; `.env.example` permanece versionável.

## Próximas etapas

Ficam pendentes a instalação das dependências declaradas e, nas próximas etapas, a integração RAWG, o catálogo paginado, busca, detalhes, favoritos, jogos finalizados, avaliações de 1 a 5 estrelas e a persistência desses dados por usuário. Essas funcionalidades ainda não estão implementadas. O catálogo atual contém somente uma mensagem de boas-vindas, um aviso sobre a próxima etapa e logout.
