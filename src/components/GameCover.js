import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function GameCover({ uri, name }) {
  const [failedUri, setFailedUri] = useState(null);
  const canShowImage = typeof uri === 'string' && /^https?:\/\//.test(uri) && failedUri !== uri;

  return (
    <View style={styles.cover}>
      {canShowImage ? (
        <Image
          source={{ uri }} style={styles.image} resizeMode="cover"
          accessibilityLabel={'Capa de ' + name} accessible={false}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Sem imagem</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', aspectRatio: 1.5, backgroundColor: '#28243e', borderTopLeftRadius: 14, borderTopRightRadius: 14, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 8 },
  placeholderText: { color: '#c4b5fd', fontSize: 14, textAlign: 'center' },
});
