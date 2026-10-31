import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RawgAttribution() {
  const [error, setError] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function openRawg() {
    if (pending.current || !mounted.current) return;
    pending.current = true;
    setIsOpening(true);
    setError('');
    try {
      await Linking.openURL('https://rawg.io/');
    } catch {
      if (mounted.current) setError('Não foi possível abrir a RAWG. Toque no link para tentar novamente.');
    } finally {
      pending.current = false;
      if (mounted.current) setIsOpening(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={openRawg} disabled={isOpening}
        style={({ pressed }) => [styles.link, pressed && styles.pressed]}
        accessibilityRole="link" accessibilityLabel="Dados de jogos fornecidos por RAWG. Abrir site da RAWG"
        accessibilityHint="Abre o site no navegador."
        accessibilityState={{ disabled: isOpening, busy: isOpening }}
      >
        <Text style={styles.text}>Dados de jogos fornecidos por RAWG</Text>
        {isOpening && <ActivityIndicator color="#a78bfa" accessible={false} />}
      </Pressable>
      {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, borderTopColor: '#35304c', backgroundColor: '#101018', paddingHorizontal: 24 },
  link: { minWidth: 48, minHeight: 48, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { color: '#c4b5fd', textAlign: 'center', fontSize: 14, textDecorationLine: 'underline' },
  error: { color: '#fda4af', textAlign: 'center', fontSize: 14, paddingBottom: 12 },
  pressed: { opacity: 0.8 },
});
