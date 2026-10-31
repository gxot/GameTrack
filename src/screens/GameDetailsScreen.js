import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getGameDetails } from '../services/gamesService';
import { isRequestCanceled, RawgError } from '../services/api';
import GameCover from '../components/GameCover';
import RawgAttribution from '../components/RawgAttribution';

function DetailField({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
