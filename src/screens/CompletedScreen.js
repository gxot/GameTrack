import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompleted } from '../contexts/CompletedContext';
import { useFavorites } from '../contexts/FavoritesContext';
import GameCard from '../components/GameCard';
import RatingStars from '../components/RatingStars';
import RawgAttribution from '../components/RawgAttribution';

export default function CompletedScreen({ navigation }) {
  const { completedGames, isLoadingCompleted, isCompletedReady, isSavingCompleted, error, reloadCompleted } = useCompleted();
  const { favorites, isFavoritesReady, isFavorite } = useFavorites();
  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">Jogos finalizados</Text>
      {isCompletedReady && !!error && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
      {isSavingCompleted && (
        <View style={styles.savingStatus} accessible accessibilityLabel="Salvando jogos finalizados" accessibilityState={{ busy: true }}>
          <ActivityIndicator color="#a78bfa" accessible={false} />
          <Text style={styles.statusText}>Salvando alterações…</Text>
        </View>
      )}
    </View>
  );
  const empty = (
    <View style={styles.empty}>
      {isLoadingCompleted ? (
        <>
          <ActivityIndicator size="large" color="#a78bfa" accessibilityLabel="Carregando jogos finalizados" />
          <Text style={styles.message}>Carregando seus jogos finalizados…</Text>
        </>
      ) : !isCompletedReady ? (
        <>
          <Text style={styles.error} accessibilityRole="alert">{error || 'Não foi possível carregar seus jogos finalizados.'}</Text>
          <Pressable onPress={reloadCompleted} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Tentar carregar jogos finalizados novamente">
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.message}>Você ainda não marcou nenhum jogo como finalizado. Abra os detalhes de um jogo e registre sua avaliação.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <FlatList
        style={styles.list} contentContainerStyle={styles.content}
        data={isCompletedReady ? completedGames : []} extraData={favorites}
        keyExtractor={(game) => String(game.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <GameCard game={item} variant="list" isFavorite={isFavoritesReady ? isFavorite(item.id) : null} onPress={(game) => navigation.navigate('GameDetails', { id: game.id })} />
            <Text style={styles.rating} accessible={false} importantForAccessibility="no">Minha avaliação: {item.personalRating}/5</Text>
            <RatingStars value={item.personalRating} />
          </View>
        )}
        ListHeaderComponent={header} ListEmptyComponent={empty}
      />
      <RawgAttribution />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101018' },
  list: { flex: 1 },
  content: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 20 },
  savingStatus: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  statusText: { color: '#c4c4d8', fontSize: 16, flexShrink: 1 },
  title: { color: '#fafafa', fontSize: 26, fontWeight: '700', marginBottom: 12 },
  message: { color: '#c4c4d8', fontSize: 16, textAlign: 'center', marginVertical: 16 },
  error: { color: '#fda4af', fontSize: 16, marginVertical: 16 },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  item: { marginBottom: 24 },
  button: { minWidth: 48, minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: '#81719f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginTop: 12 },
  buttonText: { color: '#c4b5fd', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  rating: { color: '#c4b5fd', fontSize: 16, marginTop: 12, marginBottom: 6 },
  disabled: { backgroundColor: '#35304c' },
  pressed: { opacity: 0.8 },
});
