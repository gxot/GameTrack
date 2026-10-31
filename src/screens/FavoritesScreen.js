import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../contexts/FavoritesContext';
import GameCard from '../components/GameCard';
import RawgAttribution from '../components/RawgAttribution';

export default function FavoritesScreen({ navigation }) {
  const { favorites, isLoadingFavorites, isFavoritesReady, isSavingFavorites, isFavorite, removeFavorite, error, reloadFavorites } = useFavorites();
  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">Meus favoritos</Text>
      {isFavoritesReady && !!error && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
      {isSavingFavorites && <ActivityIndicator color="#a78bfa" accessibilityLabel="Salvando favoritos" />}
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
          <Pressable onPress={reloadFavorites} style={styles.button} accessibilityRole="button" accessibilityLabel="Tentar carregar favoritos novamente">
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.message}>Você ainda não tem favoritos. Abra um jogo e toque em Favoritar para começar.</Text>
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
              onPress={() => removeFavorite(item.id).catch(() => {})} disabled={isSavingFavorites}
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
  title: { color: '#fafafa', fontSize: 26, fontWeight: '700', marginBottom: 12 },
  message: { color: '#c4c4d8', fontSize: 16, textAlign: 'center', marginVertical: 16 },
  error: { color: '#fda4af', fontSize: 16, marginVertical: 16 },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  item: { marginBottom: 24 },
  button: { borderWidth: 1, borderColor: '#81719f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginTop: 12 },
  buttonText: { color: '#c4b5fd', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  rating: { color: '#c4b5fd', fontSize: 16, marginTop: 12, marginBottom: 6 },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
});
