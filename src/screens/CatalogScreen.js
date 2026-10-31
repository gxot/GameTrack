import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import useGames from '../hooks/useGames';
import GameCard from '../components/GameCard';
import RawgAttribution from '../components/RawgAttribution';

export default function CatalogScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { favorites, isFavorite, isFavoritesReady } = useFavorites();
  const {
    games, hasNextPage, isLoading, isLoadingMore, isRefreshing, error,
    genres, isLoadingGenres, genresError, selectedGenre, selectGenre,
    loadMore, refresh, retry, retryGenres,
  } = useGames();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const mounted = useRef(true);
  const logoutPending = useRef(false);
  const list = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function handleLogout() {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setLogoutError('');
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (failure) {
      if (mounted.current) setLogoutError(failure.message);
    } finally {
      logoutPending.current = false;
      if (mounted.current) setIsLoggingOut(false);
    }
  }

  function handleGenre(slug) {
    if (slug === selectedGenre) return;
    list.current?.scrollToOffset({ offset: 0, animated: false });
    selectGenre(slug);
  }

  function handleRetry() {
    retry();
    if (genresError) retryGenres();
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.brand} accessibilityRole="header">GameTrack</Text>
          <Text style={styles.greeting}>Olá, {user.name}!</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.logout, pressed && styles.pressed, isLoggingOut && styles.disabled]}
          onPress={handleLogout} disabled={isLoggingOut}
          accessibilityRole="button" accessibilityLabel={isLoggingOut ? 'Encerrando sessão' : 'Logout, sair da conta'}
          accessibilityState={{ disabled: isLoggingOut, busy: isLoggingOut }}
        >
          {isLoggingOut ? <ActivityIndicator color="#c4b5fd" /> : <Text style={styles.logoutText}>Logout</Text>}
        </Pressable>
      </View>
      {!!logoutError && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{logoutError}</Text>}
      <Pressable
        onPress={() => navigation.navigate('Search')}
        style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
        accessibilityRole="button" accessibilityLabel="Buscar jogos"
      >
        <Text style={styles.buttonText}>Buscar jogos</Text>
      </Pressable>
      <View style={styles.collectionLinks}>
        <Pressable onPress={() => navigation.navigate('Favorites')} style={styles.collectionButton} accessibilityRole="button" accessibilityLabel="Meus favoritos">
          <Text style={styles.collectionText}>Meus favoritos</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Completed')} style={styles.collectionButton} accessibilityRole="button" accessibilityLabel="Jogos finalizados">
          <Text style={styles.collectionText}>Jogos finalizados</Text>
        </Pressable>
      </View>
      <Text style={styles.title} accessibilityRole="header">Explore os jogos</Text>
      <Text style={styles.subtitle}>Descubra seu próximo jogo por gênero.</Text>
      {isLoadingGenres && (
        <View style={styles.genreLoading} accessibilityLabel="Carregando gêneros" accessibilityState={{ busy: true }}>
          <ActivityIndicator size="small" color="#a78bfa" />
          <Text style={styles.notice}>Carregando gêneros…</Text>
        </View>
      )}
      {!!genresError && genresError.code !== 'API_KEY_MISSING' && (
        <View style={styles.genreWarning}>
          <Text style={styles.notice} accessibilityLiveRegion="polite">Os filtros não puderam ser carregados. O catálogo continua disponível.</Text>
          <Pressable onPress={retryGenres} style={styles.retryLink} accessibilityRole="button" accessibilityLabel="Tentar carregar gêneros novamente">
            <Text style={styles.linkText}>Tentar carregar gêneros</Text>
          </Pressable>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Pressable
          onPress={() => handleGenre(null)} accessibilityRole="button" accessibilityLabel="Filtrar por todos os gêneros"
          accessibilityState={{ selected: selectedGenre === null }}
          style={({ pressed }) => [styles.filter, selectedGenre === null && styles.selectedFilter, pressed && styles.pressed]}
        >
          <Text style={[styles.filterText, selectedGenre === null && styles.selectedFilterText]}>Todos</Text>
        </Pressable>
        {genres.map((genre) => (
          <Pressable
            key={genre.id} onPress={() => handleGenre(genre.slug)} accessibilityRole="button"
            accessibilityLabel={'Filtrar por ' + genre.name} accessibilityState={{ selected: selectedGenre === genre.slug }}
            style={({ pressed }) => [styles.filter, selectedGenre === genre.slug && styles.selectedFilter, pressed && styles.pressed]}
          >
            <Text style={[styles.filterText, selectedGenre === genre.slug && styles.selectedFilterText]}>{genre.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      {isLoading || isRefreshing ? (
        <View accessibilityLabel="Carregando jogos" accessibilityState={{ busy: true }}>
          {isLoading && <ActivityIndicator size="large" color="#a78bfa" />}
          <Text style={styles.emptyText}>{isRefreshing ? 'Atualizando jogos…' : 'Carregando jogos…'}</Text>
        </View>
      ) : error ? (
        <>
          <Text style={styles.emptyTitle} accessibilityRole="header">{error.code === 'API_KEY_MISSING' ? 'Configure sua chave RAWG' : 'Não foi possível carregar os jogos'}</Text>
          <Text style={styles.emptyText} accessibilityRole="alert" accessibilityLiveRegion="polite">{error.message}</Text>
          <Pressable onPress={handleRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Tentar carregar jogos novamente">
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.emptyTitle}>Nenhum jogo encontrado</Text>
          <Text style={styles.emptyText}>Tente outro gênero ou puxe para atualizar.</Text>
        </>
      )}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {isLoadingMore && <ActivityIndicator size="small" color="#a78bfa" accessibilityLabel="Carregando mais jogos" />}
      {!!error && games.length > 0 && (
        <>
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error.message}</Text>
          <Pressable onPress={handleRetry} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={error.operation === 'more' ? 'Tentar carregar a próxima página novamente' : 'Tentar atualizar os jogos novamente'}>
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </>
      )}
      {!hasNextPage && games.length > 0 && !isLoadingMore && !error && <Text style={styles.endText}>Você chegou ao fim dos jogos deste filtro.</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ref={list} style={styles.list} contentContainerStyle={styles.listContent}
        data={games} extraData={favorites} renderItem={({ item }) => <View style={styles.cell}><GameCard game={item} isFavorite={isFavoritesReady ? isFavorite(item.id) : null} onPress={(game) => navigation.navigate('GameDetails', { id: game.id })} /></View>}
        keyExtractor={(item) => String(item.id)} numColumns={2}
        onEndReached={loadMore} onEndReachedThreshold={0.4}
        refreshing={isRefreshing} onRefresh={refresh}
        ListHeaderComponent={header} ListFooterComponent={footer} ListEmptyComponent={empty}
      />
      <RawgAttribution />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101018' },
  list: { flex: 1 },
  listContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12 },
  collectionLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  collectionButton: { borderWidth: 1, borderColor: '#81719f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexGrow: 1 },
  collectionText: { color: '#c4b5fd', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  header: { paddingHorizontal: 6, marginBottom: 20 },
  topRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28 },
  identity: { flexGrow: 1, flexShrink: 1 },
  brand: { color: '#a78bfa', fontSize: 30, fontWeight: '800', marginBottom: 6 },
  greeting: { color: '#e5e5ef', fontSize: 16 },
  logout: { borderWidth: 1, borderColor: '#81719f', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  logoutText: { color: '#c4b5fd', fontSize: 15, fontWeight: '600' },
  searchButton: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, marginBottom: 24 },
  title: { color: '#fafafa', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#c4c4d8', fontSize: 16, marginBottom: 20 },
  genreLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  genreWarning: { marginBottom: 12 },
  notice: { color: '#c4c4d8', fontSize: 14, flexShrink: 1 },
  retryLink: { paddingVertical: 12, alignSelf: 'flex-start' },
  linkText: { color: '#c4b5fd', fontSize: 14, fontWeight: '600' },
  filters: { gap: 8, paddingVertical: 4 },
  filter: { paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#81719f', borderRadius: 24, backgroundColor: '#1c1c2c', justifyContent: 'center' },
  selectedFilter: { backgroundColor: '#7c3aed', borderColor: '#a78bfa' },
  filterText: { color: '#d4d4e4', fontSize: 14, fontWeight: '600' },
  selectedFilterText: { color: '#ffffff' },
  cell: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 32 },
  emptyTitle: { color: '#fafafa', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  emptyText: { color: '#c4c4d8', fontSize: 16, textAlign: 'center', marginVertical: 16 },
  error: { color: '#fda4af', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  retryButton: { alignSelf: 'center', backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  footer: { paddingHorizontal: 6, paddingVertical: 16 },
  endText: { color: '#c4c4d8', fontSize: 14, textAlign: 'center' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.6 },
});
