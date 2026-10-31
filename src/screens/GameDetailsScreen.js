import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGameDetails } from '../services/gamesService';
import { isRequestCanceled, RawgError } from '../services/api';
import GameCover from '../components/GameCover';
import RawgAttribution from '../components/RawgAttribution';
import RatingStars from '../components/RatingStars';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCompleted } from '../contexts/CompletedContext';

function DetailField({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function GameCollections({ game }) {
  const {
    isFavorite, toggleFavorite, isLoadingFavorites, isFavoritesReady, isSavingFavorites,
    error: favoriteError, reloadFavorites,
  } = useFavorites();
  const {
    isCompleted, getPersonalRating, markCompleted, updateRating, removeCompleted,
    isLoadingCompleted, isCompletedReady, isSavingCompleted,
    error: completedError, reloadCompleted,
  } = useCompleted();
  const savedRating = getPersonalRating(game.id);
  // Apenas a seleção ainda não salva é local. A coleção e a nota salva vêm do Context.
  const [draft, setDraft] = useState({ baseline: savedRating, value: savedRating });
  const [validationMessage, setValidationMessage] = useState('');
  const selectedRating = draft.baseline === savedRating ? draft.value : savedRating;
  const favorited = isFavorite(game.id);
  const completed = isCompleted(game.id);
  const favoriteDisabled = !isFavoritesReady || isLoadingFavorites || isSavingFavorites;
  const completedDisabled = !isCompletedReady || isLoadingCompleted || isSavingCompleted;

  function saveCompletion() {
    if (!Number.isInteger(selectedRating) || selectedRating < 1 || selectedRating > 5) {
      setValidationMessage('Selecione de 1 a 5 estrelas antes de marcar o jogo como finalizado.');
      return;
    }
    setValidationMessage('');
    const operation = completed ? updateRating(game.id, selectedRating) : markCompleted(game, selectedRating);
    // O Context exibe o erro e conserva a última coleção confirmada em disco.
    operation.catch(() => {});
  }

  return (
    <View style={styles.collections}>
      <Pressable
        onPress={() => toggleFavorite(game).catch(() => {})} disabled={favoriteDisabled}
        style={({ pressed }) => [styles.collectionButton, favorited && styles.activeButton, pressed && styles.pressed, favoriteDisabled && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel={!isFavoritesReady ? 'Estado de favorito ainda não disponível' : favorited ? 'Jogo favoritado. Remover dos favoritos' : 'Adicionar jogo aos favoritos'}
        accessibilityState={{ selected: isFavoritesReady && favorited, disabled: favoriteDisabled, busy: isLoadingFavorites || isSavingFavorites }}
      >
        <Text style={styles.buttonText}>{isLoadingFavorites ? 'Carregando favorito…' : !isFavoritesReady ? 'Favorito indisponível' : favorited ? '♥ Remover dos favoritos' : '♡ Favoritar'}</Text>
      </Pressable>
      {isSavingFavorites && <ActivityIndicator color="#a78bfa" accessibilityLabel="Salvando favorito" />}
      {!!favoriteError && <Text style={styles.collectionError} accessibilityRole="alert" accessibilityLiveRegion="polite">{favoriteError}</Text>}
      {!isLoadingFavorites && !isFavoritesReady && (
        <Pressable onPress={reloadFavorites} style={styles.collectionButton} accessibilityRole="button" accessibilityLabel="Tentar carregar favoritos novamente">
          <Text style={styles.buttonText}>Tentar carregar favoritos</Text>
        </Pressable>
      )}

      <Text style={styles.sectionTitle} accessibilityRole="header">Minha avaliação</Text>
      {isLoadingCompleted ? (
        <View accessibilityLabel="Carregando minha avaliação" accessibilityState={{ busy: true }}>
          <ActivityIndicator color="#a78bfa" />
          <Text style={styles.value}>Carregando sua avaliação…</Text>
        </View>
      ) : !isCompletedReady ? (
        <Pressable onPress={reloadCompleted} style={styles.collectionButton} accessibilityRole="button" accessibilityLabel="Tentar carregar jogos finalizados novamente">
          <Text style={styles.buttonText}>Tentar carregar minha avaliação</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.completionStatus} accessibilityLiveRegion="polite">{completed ? '✓ Jogo finalizado. Sua nota salva: ' + savedRating + '/5.' : 'Selecione sua nota e marque o jogo como finalizado.'}</Text>
          <RatingStars
            value={selectedRating} disabled={completedDisabled}
            onChange={(value) => { setDraft({ baseline: savedRating, value }); setValidationMessage(''); }}
          />
          <Text style={styles.ratingHint}>{selectedRating ? 'Nota selecionada: ' + selectedRating + '/5.' : 'Escolha de 1 a 5 estrelas.'}</Text>
          {!!validationMessage && <Text style={styles.collectionError} accessibilityRole="alert">{validationMessage}</Text>}
          <Pressable
            onPress={saveCompletion} disabled={completedDisabled}
            style={({ pressed }) => [styles.collectionButton, styles.activeButton, pressed && styles.pressed, completedDisabled && styles.disabled]}
            accessibilityRole="button" accessibilityLabel={completed ? 'Salvar minha avaliação pessoal' : 'Marcar jogo como finalizado com a nota selecionada'}
            accessibilityState={{ disabled: completedDisabled, busy: isSavingCompleted }}
          >
            <Text style={styles.buttonText}>{completed ? 'Salvar avaliação' : 'Marcar como finalizado'}</Text>
          </Pressable>
          {completed && (
            <Pressable
              onPress={() => { setValidationMessage(''); removeCompleted(game.id).catch(() => {}); }} disabled={completedDisabled}
              style={({ pressed }) => [styles.collectionButton, pressed && styles.pressed, completedDisabled && styles.disabled]}
              accessibilityRole="button" accessibilityLabel="Jogo finalizado. Remover dos jogos finalizados"
              accessibilityState={{ disabled: completedDisabled, busy: isSavingCompleted }}
            >
              <Text style={styles.buttonText}>Remover dos finalizados</Text>
            </Pressable>
          )}
        </>
      )}
      {isSavingCompleted && <ActivityIndicator color="#a78bfa" accessibilityLabel="Salvando minha avaliação" />}
      {!!completedError && <Text style={styles.collectionError} accessibilityRole="alert" accessibilityLiveRegion="polite">{completedError}</Text>}
    </View>
  );
}

export default function GameDetailsScreen({ route, navigation }) {
  const id = route.params?.id;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ id: null, game: null, isLoading: true, error: null });

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    setState({ id, game: null, isLoading: true, error: null });
    navigation.setOptions({ title: 'Detalhes do jogo' });

    async function loadDetails() {
      try {
        // O ID recebido pela rota origina uma segunda consulta, independente da lista.
        const game = await getGameDetails(id, { signal: controller.signal });
        if (!isActive) return;
        setState({ id, game, isLoading: false, error: null });
        navigation.setOptions({ title: game.name });
      } catch (failure) {
        if (!isActive || isRequestCanceled(failure)) return;
        setState({
          id, game: null, isLoading: false,
          error: {
            code: failure instanceof RawgError ? failure.code : 'REQUEST_FAILED',
            message: failure instanceof RawgError ? failure.message : 'Não foi possível carregar os detalhes. Tente novamente.',
          },
        });
      }
    }

    loadDetails();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [id, attempt, navigation]);

  // O ID também protege a renderização antes do efeito de uma nova rota executar.
  const game = state.id === id ? state.game : null;
  const isLoading = state.id !== id || state.isLoading;
  const error = state.id === id ? state.error : null;
  let content;

  if (isLoading) {
    content = (
      <View style={styles.center} accessibilityLabel="Carregando detalhes do jogo" accessibilityState={{ busy: true }}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.message}>Carregando detalhes…</Text>
      </View>
    );
  } else if (error) {
    const unavailable = error.code === 'GAME_NOT_FOUND' || error.code === 'INVALID_GAME_ID';
    content = (
      <ScrollView contentContainerStyle={styles.errorContent}>
        <Text style={styles.errorTitle} accessibilityRole="header">{unavailable ? 'Jogo indisponível' : 'Não foi possível carregar os detalhes'}</Text>
        <Text style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">{error.message}</Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={() => setAttempt((previous) => previous + 1)}
          accessibilityRole="button" accessibilityLabel="Tentar carregar os detalhes novamente"
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      </ScrollView>
    );
  } else if (game) {
    const released = game.released ? game.released.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1') : 'Não informada';
    content = (
      <ScrollView contentContainerStyle={styles.content}>
        <View accessible accessibilityRole="image" accessibilityLabel={'Capa de ' + game.name}>
          <GameCover key={game.id} uri={game.background_image} name={game.name} />
        </View>
        <Text style={styles.title} accessibilityRole="header">{game.name}</Text>
        <GameCollections key={game.id} game={game} />
        <DetailField label="Data de lançamento" value={released} />
        <DetailField label="Gêneros" value={game.genres.map((genre) => genre.name).join(', ') || 'Não informados'} />
        <DetailField label="Plataformas" value={game.platforms.join(', ') || 'Não informadas'} />
        {game.developers.length > 0 && <DetailField label="Desenvolvedores" value={game.developers.join(', ')} />}
        <DetailField label="Nota pública RAWG" value={game.rating !== null ? game.rating.toFixed(1).replace('.', ',') + ' / 5' : 'Não informada'} />
        {game.playtime !== null && <DetailField label="Tempo médio de jogo" value={game.playtime + (game.playtime === 1 ? ' hora' : ' horas')} />}
        <Text style={styles.sectionTitle} accessibilityRole="header">Sobre o jogo</Text>
        <Text style={styles.description} selectable>{game.description || 'Descrição não disponível para este jogo.'}</Text>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      {content}
      <RawgAttribution />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101018' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { padding: 24 },
  title: { color: '#fafafa', fontSize: 28, fontWeight: '800', marginTop: 24, marginBottom: 24 },
  collections: { borderWidth: 1, borderColor: '#35304c', borderRadius: 14, padding: 16, marginBottom: 24 },
  collectionButton: { borderWidth: 1, borderColor: '#81719f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12 },
  activeButton: { backgroundColor: '#7c3aed' },
  disabled: { opacity: 0.6 },
  collectionError: { color: '#fda4af', fontSize: 16, marginBottom: 16 },
  completionStatus: { color: '#c4b5fd', fontSize: 16, marginBottom: 12 },
  ratingHint: { color: '#c4c4d8', fontSize: 15, marginVertical: 12 },
  field: { marginBottom: 20 },
  label: { color: '#c4b5fd', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  value: { color: '#e5e5ef', fontSize: 17 },
  sectionTitle: { color: '#c4b5fd', fontSize: 22, fontWeight: '700', marginTop: 8, marginBottom: 16 },
  description: { color: '#e5e5ef', fontSize: 17 },
  errorTitle: { color: '#fafafa', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  message: { color: '#c4c4d8', fontSize: 16, textAlign: 'center', marginVertical: 20 },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.8 },
});
