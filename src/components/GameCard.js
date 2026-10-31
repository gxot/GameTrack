import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GameCover from './GameCover';

export default function GameCard({ game, onPress, variant = 'grid', isFavorite = null }) {
  const year = typeof game.released === 'string' && /^\d{4}-/.test(game.released)
    ? game.released.slice(0, 4) : null;
  const rating = Number.isFinite(game.rating) ? game.rating.toFixed(1).replace('.', ',') : null;
  const label = [game.name, rating ? 'Nota pública RAWG: ' + rating + ' de 5' : null, year ? 'Lançamento: ' + year : null]
    .filter(Boolean).join('. ');
  const favoriteLabel = isFavorite === null ? '' : (isFavorite ? '. Favoritado' : '. Não favoritado');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, variant === 'list' && styles.listCard, pressed && onPress && styles.pressed]}
      onPress={onPress ? () => onPress(game) : undefined}
      disabled={!onPress} accessible accessibilityRole="button" accessibilityLabel={label + favoriteLabel}
      accessibilityState={{ disabled: !onPress }}
      accessibilityHint={onPress ? 'Abrir detalhes do jogo' : undefined}
    >
      <View style={variant === 'list' ? styles.listCover : undefined}>
        <GameCover uri={game.background_image} name={game.name} />
      </View>
      <View style={[styles.content, variant === 'list' && styles.listContent]}>
        <Text style={styles.title}>{game.name}</Text>
        {isFavorite !== null && <Text style={styles.favorite} accessible={false}>{isFavorite ? '♥ Favorito' : '♡ Não favoritado'}</Text>}
        <View style={styles.metadata}>
          {rating !== null && <Text style={styles.rating}>RAWG {rating}/5</Text>}
          {year && <Text style={styles.year}>{year}</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 48, minWidth: 44, flex: 1, backgroundColor: '#1c1c2c', borderWidth: 1, borderColor: '#35304c', borderRadius: 14 },
  content: { padding: 12, minWidth: 0 },
  favorite: { color: '#c4b5fd', fontSize: 16, marginBottom: 10 },
  listCard: { flex: 0, flexDirection: 'row', alignItems: 'flex-start' },
  listCover: { width: '34%' },
  listContent: { flex: 1, minWidth: 0 },
  title: { color: '#fafafa', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  metadata: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  rating: { color: '#c4b5fd', fontSize: 13, fontWeight: '600', flexShrink: 1 },
  year: { color: '#c4c4d8', fontSize: 13 },
  pressed: { opacity: 0.8 },
});
