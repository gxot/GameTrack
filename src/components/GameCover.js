import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function GameCover({ uri, name, accessible = false }) {
  const [failedUri, setFailedUri] = useState(null);
  const canShowImage = typeof uri === 'string' && /^https?:\/\//.test(uri) && failedUri !== uri;
  return (
    <View
      style={[styles.cover, !canShowImage && styles.missingCover]}
      accessible={accessible} accessibilityRole={accessible ? 'image' : undefined}
      accessibilityLabel={accessible ? (canShowImage ? 'Capa do jogo ' : 'Capa indisponível para ') + name : undefined}
      importantForAccessibility={accessible ? 'yes' : 'no-hide-descendants'}
    >
      {canShowImage ? (
        <Image
          source={{ uri }} style={styles.image} resizeMode="cover"
          accessible={false} importantForAccessibility="no"
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText} accessible={false}>Sem imagem</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', aspectRatio: 1.5, backgroundColor: '#1c1c2c', borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: 'hidden' },
  missingCover: { aspectRatio: undefined, minHeight: 100 },
  image: { width: '100%', height: '100%' },
  placeholder: { padding: 16, minHeight: 100, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#c4c4d8', fontSize: 14, textAlign: 'center' },
});
