# GameTrack

Aplicativo mobile acadêmico para a disciplina Mobile Development: Frameworks da PUCPR. O projeto será um catálogo pessoal de videogames com dados da RAWG Video Games Database API.

## Etapa atual

A etapa 1 prepara a estrutura do projeto e uma tela inicial estática com o nome GameTrack e o subtítulo “Seu catálogo pessoal de jogos”. As demais funcionalidades serão desenvolvidas progressivamente nas próximas etapas.

As dependências básicas foram apenas declaradas, sem instalação. As versões de Expo, React e React Native seguem o [template blank oficial do Expo SDK 54](https://github.com/expo/expo/blob/sdk-54/templates/expo-template-blank/package.json).

## Tecnologias planejadas

- React Native, Expo e JavaScript: base do aplicativo, declarada nesta etapa.
- React Navigation com Native Stack: navegação entre telas.
- Axios: requisições HTTP.
- Context API: gerenciamento de estado compartilhado.
- AsyncStorage: persistência local de dados por usuário.
- Expo SecureStore: armazenamento local seguro de dados de sessão.

React Navigation, Axios, Context API, AsyncStorage e Expo SecureStore serão introduzidos nas próximas etapas. O projeto utiliza JavaScript e JSX, com `App.js` como componente principal.

## Estrutura de pastas

```text
.
├── App.js
├── index.js
├── src/
│   ├── screens/
│   ├── components/
│   ├── contexts/
│   ├── navigation/
│   ├── services/
│   └── hooks/
├── .env
├── .env.example
├── .gitignore
├── app.json
├── package.json
└── README.md
```

Os diretórios de `src/` contêm somente arquivos `.gitkeep` para que possam ser versionados enquanto estiverem vazios.

| Diretório | Responsabilidade futura |
| --- | --- |
| `src/screens/` | Telas de login, cadastro, catálogo, busca, detalhes, favoritos e finalizados. |
| `src/components/` | Componentes visuais reutilizáveis, como cards e indicadores de avaliação. |
| `src/contexts/` | Estado compartilhado de autenticação, favoritos e jogos finalizados. |
| `src/navigation/` | Definição da navegação com React Navigation Native Stack. |
| `src/services/` | Integração com RAWG e serviços de persistência local. |
| `src/hooks/` | Hooks customizados para reutilização de lógica. |

`index.js` registra o componente principal `App.js` no Expo. `app.json` define o nome GameTrack e o slug `gametrack`.

## API e configuração de ambiente

A API planejada é a [RAWG Video Games Database API](https://rawg.io/apidocs). Nenhuma requisição ou integração HTTP foi implementada nesta etapa.

O arquivo `.env` e o modelo versionável `.env.example` contêm:

```dotenv
EXPO_PUBLIC_RAWG_API_KEY=SUA_CHAVE_RAWG_AQUI
```

O desenvolvedor deverá substituir manualmente `SUA_CHAVE_RAWG_AQUI` pela chave real no `.env` após a implementação das etapas. A chave não deve ser colocada diretamente em arquivos JavaScript. O `.gitignore` exclui `.env`, dependências, arquivos temporários e diretórios de build; `.env.example` permanece versionável.

## Próximas etapas

Ficam pendentes a instalação das dependências e a implementação progressiva de autenticação local, navegação, catálogo paginado, busca, detalhes, favoritos, jogos finalizados, avaliações de 1 a 5 estrelas e persistência local por usuário. Essas funcionalidades ainda não estão implementadas.
