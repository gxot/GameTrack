import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function CatalogScreen() {
  const { user, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await logout();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.title} accessibilityRole="header">Boas-vindas, {user.name}!</Text>
          <Text style={styles.subtitle}>O catálogo de jogos será implementado na próxima etapa.</Text>
          {!!error && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed, isSubmitting && styles.disabled]}
            onPress={handleLogout} disabled={isSubmitting} accessibilityRole="button"
            accessibilityLabel={isSubmitting ? 'Encerrando sessão' : 'Logout, sair da conta'}
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
          >
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Logout</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101018' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 440 },
  title: { color: '#c4b5fd', fontSize: 28, fontWeight: '700', marginBottom: 16 },
  subtitle: { color: '#c4c4d8', fontSize: 18, marginBottom: 28 },
  error: { color: '#fda4af', fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.6 },
});
