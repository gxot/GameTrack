import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RawgAttribution() {
  const [error, setError] = useState('');

  async function openRawg() {
    setError('');
    try {
      await Linking.openURL('https://rawg.io/');
    } catch {
      setError('Não foi possível abrir a RAWG. Tente novamente.');
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={openRawg} style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        accessibilityRole="link" accessibilityLabel="Dados de jogos fornecidos por RAWG. Abrir site da RAWG"
      >
        <Text style={styles.text}>Dados de jogos fornecidos por RAWG</Text>
      </Pressable>
      {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, borderTopColor: '#35304c', backgroundColor: '#101018', paddingHorizontal: 24 },
  link: { paddingVertical: 14, alignItems: 'center' },
  text: { color: '#c4b5fd', textAlign: 'center', fontSize: 13, textDecorationLine: 'underline' },
  error: { color: '#fda4af', textAlign: 'center', fontSize: 13, paddingBottom: 12 },
  pressed: { opacity: 0.8 },
});
