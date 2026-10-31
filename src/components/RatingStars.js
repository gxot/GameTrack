import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function RatingStars({ value = null, onChange, disabled = false }) {
  const rating = Number.isInteger(value) && value >= 1 && value <= 5 ? value : 0;
  const interactive = typeof onChange === 'function';
  return (
    <View style={styles.stars} accessible={!interactive} accessibilityLabel={interactive ? undefined : (rating ? 'Minha avaliação: ' + rating + ' de 5 estrelas' : 'Nenhuma avaliação selecionada')}>
      {[1, 2, 3, 4, 5].map((star) => interactive ? (
        <Pressable
          key={star} onPress={() => onChange(star)} disabled={disabled}
          style={({ pressed }) => [styles.touch, pressed && styles.pressed, disabled && styles.disabled]}
          accessibilityRole="button" accessibilityLabel={'Avaliar com ' + star + (star === 1 ? ' estrela' : ' estrelas')}
          accessibilityState={{ selected: rating === star, disabled }}
          accessibilityHint={rating === star ? 'Esta é a nota selecionada.' : 'Selecionar esta nota pessoal.'}
        >
          <Text style={[styles.star, star <= rating && styles.selected]}>{star <= rating ? '★' : '☆'}</Text>
        </Pressable>
      ) : (
        <Text key={star} accessible={false} style={[styles.star, star <= rating && styles.selected]}>{star <= rating ? '★' : '☆'}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stars: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  touch: { minWidth: 48, minHeight: 48, padding: 6, alignItems: 'center', justifyContent: 'center' },
  star: { fontSize: 28, color: '#c4c4d8' },
  selected: { color: '#c4b5fd' },
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: '#1c1c2c' },
});
