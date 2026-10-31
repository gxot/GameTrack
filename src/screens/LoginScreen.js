import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const mounted = useRef(false);
  const passwordInput = useRef(null);
  const emailInput = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function handleLogin() {
    if (pending.current || !mounted.current) return;
    setError('');
    pending.current = true;
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (failure) {
      if (mounted.current) setError(failure.message);
    } finally {
      pending.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View style={styles.content}>
            <Text style={styles.brand} accessibilityRole="header">GameTrack</Text>
            <Text style={styles.subtitle}>Seu catálogo pessoal de jogos</Text>
            <Text style={styles.title} accessibilityRole="header">Entre na sua conta</Text>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              ref={emailInput} style={styles.input} value={email} onChangeText={setEmail}
              accessibilityLabel="E-mail" placeholder="seuemail@exemplo.com" placeholderTextColor="#a1a1b8"
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              autoComplete="email" textContentType="emailAddress" editable={!isSubmitting}
              accessibilityState={{ disabled: isSubmitting }} returnKeyType="next" blurOnSubmit={false}
              onSubmitEditing={() => passwordInput.current?.focus()}
            />
            <Text style={styles.label}>Senha</Text>
            <TextInput
              ref={passwordInput} style={styles.input} value={password} onChangeText={setPassword}
              accessibilityLabel="Senha" placeholder="Sua senha" placeholderTextColor="#a1a1b8"
              secureTextEntry autoCapitalize="none" autoCorrect={false}
              autoComplete="current-password" textContentType="password" editable={!isSubmitting}
              accessibilityState={{ disabled: isSubmitting }}
              returnKeyType="go" onSubmitEditing={handleLogin}
            />
            {!!error && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed, isSubmitting && styles.disabled]}
              onPress={handleLogin} disabled={isSubmitting} accessibilityRole="button"
              accessibilityLabel={isSubmitting ? 'Entrando na conta' : 'Entrar'}
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            >
              <View style={styles.buttonContent}>
                {isSubmitting && <ActivityIndicator color="#ffffff" accessible={false} />}
                <Text style={styles.buttonText}>{isSubmitting ? 'Entrando…' : 'Entrar'}</Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Register')} disabled={isSubmitting}
              accessibilityRole="button" accessibilityLabel="Criar uma conta" accessibilityState={{ disabled: isSubmitting }}
            >
              <Text style={styles.linkText}>Ainda não tem conta? Criar conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#101018' },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 440 },
  brand: { color: '#a78bfa', fontSize: 36, fontWeight: '800', marginBottom: 8 },
  title: { color: '#fafafa', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#c4c4d8', fontSize: 16, marginBottom: 28 },
  label: { color: '#e5e5ef', fontSize: 16, marginBottom: 8 },
  input: { minHeight: 48, color: '#fafafa', backgroundColor: '#1c1c2c', borderColor: '#666683', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 20 },
  hint: { color: '#c4c4d8', fontSize: 14, marginBottom: 16 },
  error: { color: '#fda4af', fontSize: 16, marginBottom: 20 },
  buttonContent: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10 },
  button: { minWidth: 48, minHeight: 48, backgroundColor: '#7c3aed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  link: { minWidth: 48, minHeight: 48, paddingVertical: 18, paddingHorizontal: 8, alignItems: 'center' },
  linkText: { color: '#c4b5fd', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.8 },
  disabled: { backgroundColor: '#35304c' },
});
