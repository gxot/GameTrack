import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CatalogScreen from '../screens/CatalogScreen';
import SearchScreen from '../screens/SearchScreen';
import GameDetailsScreen from '../screens/GameDetailsScreen';

const Stack = createNativeStackNavigator();
const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: '#a78bfa', background: '#101018', card: '#1c1c2c' },
};

export default function AppNavigator() {
  const { user, isInitializing } = useAuth();
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.loading} accessibilityLabel="Restaurando sessão" accessibilityState={{ busy: true }}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.text}>Preparando seu GameTrack…</Text>
      </SafeAreaView>
    );
  }
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#1c1c2c' },
        headerTintColor: '#c4b5fd',
        headerTitleStyle: { color: '#fafafa' },
        headerBackTitle: 'Voltar',
        contentStyle: { backgroundColor: '#101018' },
      }}>
        {user ? (
          <>
            <Stack.Screen name="Catalog" component={CatalogScreen} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: true, title: 'Buscar jogos' }} />
            <Stack.Screen name="GameDetails" component={GameDetailsScreen} options={{ headerShown: true, title: 'Detalhes do jogo' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#101018' },
  text: { color: '#d4d4e4', fontSize: 16, textAlign: 'center', marginTop: 16 },
});
