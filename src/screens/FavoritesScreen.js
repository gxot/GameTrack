import React, { useRef } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../contexts/FavoritesContext';
import GameCard from '../components/GameCard';
import RawgAttribution from '../components/RawgAttribution';

export default function FavoritesScreen({ navigation }) {
  const removing = useRef(false);
  const { favorites, isLoadingFavorites, isFavoritesReady, isSavingFavorites, isFavorite, removeFavorite, error, reloadFavorites } = useFavorites();
  function handleRemove(id) {
    if (removing.current || isSavingFavorites || !isFavoritesReady) return;
    removing.current = true;
    removeFavorite(id).catch(() => {}).finally(() => { removing.current = false; });
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">Meus favoritos</Text>
      {isFavoritesReady && !!error && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
      {isSavingFavorites && (
        <View style={styles.savingStatus} accessible accessibilityLabel="Salvando favoritos" accessibilityState={{ busy: true }}>
          <ActivityIndicator color="#a78bfa" accessible={false} />
          <Text style={styles.statusText}>Salvando alterações…</Text>
        </View>
      )}
    </View>
  );
  const empty = (
    <View style={styles.empty}>
      {isLoadingFavorites ? (
        <>
          <ActivityIndicator size="large" color="#a78bfa" accessibilityLabel="Carregando favoritos" />
          <Text style={styles.message}>Carregando seus favoritos…</Text>
        </>
      ) : !isFavoritesReady ? (
        <>
          <Text style={styles.error} accessibilityRole="alert">{error || 'Não foi possível carregar seus favoritos.'}</Text>
          <Pressable onPress={reloadFavorites} style={({ pressed }) => [styles.button, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Tentar carregar favoritos novamente">
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.message}>Você ainda não adicionou jogos aos favoritos. Explore o catálogo e toque em Favoritar nos detalhes de um jogo.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <FlatList
        style={styles.list} contentContainerStyle={styles.content}
        data={isFavoritesReady ? favorites : []} extraData={isSavingFavorites}
        keyExtractor={(game) => String(game.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <GameCard game={item} variant="list" isFavorite={isFavorite(item.id)} onPress={(game) => navigation.navigate('GameDetails', { id: game.id })} />
            <Pressable
              onPress={() => handleRemove(item.id)} disabled={isSavingFavorites}
              style={({ pressed }) => [styles.button, pressed && styles.pressed, isSavingFavorites && styles.disabled]}
              accessibilityRole="button" accessibilityLabel={'Remover ' + item.name + ' dos favoritos'}
              accessibilityState={{ disabled: isSavingFavorites, busy: isSavingFavorites }}
            >
              <Text style={styles.buttonText}>Remover dos favoritos</Text>
            </Pressable>
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
