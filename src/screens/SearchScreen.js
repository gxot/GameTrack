import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useGameSearch from '../hooks/useGameSearch';
import { useFavorites } from '../contexts/FavoritesContext';
import GameCard from '../components/GameCard';
import RawgAttribution from '../components/RawgAttribution';

export default function SearchScreen({ navigation }) {
  const { favorites, isFavorite, isFavoritesReady } = useFavorites();
  const [input, setInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const { term, games, isLoading, error, hasSearched, search, retry } = useGameSearch();
  const isSameSearchLoading = isLoading && input.trim() === term;

  function handleSearch() {
    const value = input.trim();
    if (!value) {
      setValidationError('Digite o nome de um jogo para pesquisar.');
      return;
    }
    setValidationError('');
    Keyboard.dismiss();
    search(value);
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">Buscar jogos</Text>
      <Text style={styles.subtitle}>Pesquise pelo nome para encontrar um jogo.</Text>
      <TextInput
        style={styles.input} value={input}
        onChangeText={(value) => { setInput(value); setValidationError(''); }}
        placeholder="Digite o nome de um jogo" placeholderTextColor="#a1a1b8"
        accessibilityLabel="Nome do jogo" autoCapitalize="none" autoCorrect={false}
        returnKeyType="search" onSubmitEditing={handleSearch}
      />
      {!!validationError && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{validationError}</Text>}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed, isSameSearchLoading && styles.disabled]}
        onPress={handleSearch} disabled={isSameSearchLoading}
        accessibilityRole="button" accessibilityLabel="Buscar jogos pelo nome"
        accessibilityState={{ disabled: isSameSearchLoading, busy: isLoading }}
      >
        <Text style={styles.buttonText}>Buscar</Text>
      </Pressable>
      {hasSearched && !isLoading && !error && (
        <Text style={styles.resultText} accessibilityLiveRegion="polite">Resultados para “{term}” ({games.length})</Text>
      )}
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      {isLoading ? (
        <View accessibilityLabel="Pesquisando jogos" accessibilityState={{ busy: true }}>
          <ActivityIndicator size="large" color="#a78bfa" />
          <Text style={styles.message}>Buscando “{term}”…</Text>
        </View>
      ) : error ? (
        <>
          <Text style={styles.emptyTitle}>Não foi possível concluir a busca</Text>
          <Text style={styles.message} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>
          <Pressable
            onPress={retry} style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            accessibilityRole="button" accessibilityLabel={'Tentar pesquisar novamente por ' + term}
          >
            <Text style={styles.buttonText}>Tentar novamente</Text>
          </Pressable>
        </>
      ) : hasSearched ? (
        <>
          <Text style={styles.emptyTitle}>Nenhum jogo encontrado</Text>
          <Text style={styles.message}>Não encontramos jogos para “{term}”. Tente outro nome.</Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyTitle}>Qual jogo você procura?</Text>
          <Text style={styles.message}>Digite um nome e toque em Buscar para começar.</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          style={styles.list} contentContainerStyle={styles.listContent}
          data={games} extraData={favorites} numColumns={1} keyExtractor={(game) => String(game.id)}
          renderItem={({ item }) => (
            <View style={styles.result}>
              <GameCard game={item} variant="list" isFavorite={isFavoritesReady ? isFavorite(item.id) : null} onPress={(game) => navigation.navigate('GameDetails', { id: game.id })} />
            </View>
          )}
          ListHeaderComponent={header} ListEmptyComponent={empty}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        />
      </KeyboardAvoidingView>
      <RawgAttribution />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101018' },
  keyboard: { flex: 1 },
  list: { flex: 1 },
  listContent: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 24 },
  title: { color: '#fafafa', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#c4c4d8', fontSize: 16, marginBottom: 20 },
  input: { color: '#fafafa', backgroundColor: '#1c1c2c', borderColor: '#81719f', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  resultText: { color: '#c4c4d8', fontSize: 16, marginTop: 24 },
  result: { marginBottom: 16 },
  empty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { color: '#fafafa', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  message: { color: '#c4c4d8', fontSize: 16, textAlign: 'center', marginVertical: 20 },
  error: { color: '#fda4af', fontSize: 16, marginBottom: 16 },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.6 },
});
