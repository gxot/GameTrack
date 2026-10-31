import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail } from '../services/authStorage';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (isSubmitting) return;
    setError('');
    if (!name.trim() || !email.trim() || !password.trim() || !confirmation.trim()) {
      setError('Preencha todos os campos para criar sua conta.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem. Confira a confirmação.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(name, email, password);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View style={styles.content}>
            <Text style={styles.brand} accessibilityRole="header">GameTrack</Text>
            <Text style={styles.title} accessibilityRole="header">Crie sua conta</Text>
            <Text style={styles.subtitle}>Comece seu catálogo pessoal de jogos.</Text>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input} value={name} onChangeText={setName}
              accessibilityLabel="Nome" placeholder="Como podemos chamar você?" placeholderTextColor="#a1a1b8"
              autoCapitalize="words" autoComplete="name" textContentType="name" editable={!isSubmitting}
            />
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input} value={email} onChangeText={setEmail}
              accessibilityLabel="E-mail" placeholder="seuemail@exemplo.com" placeholderTextColor="#a1a1b8"
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              autoComplete="email" textContentType="emailAddress" editable={!isSubmitting}
            />
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input} value={password} onChangeText={setPassword}
              accessibilityLabel="Senha, mínimo de 6 caracteres" placeholder="Crie uma senha" placeholderTextColor="#a1a1b8"
              secureTextEntry autoCapitalize="none" autoCorrect={false}
              autoComplete="new-password" textContentType="newPassword" editable={!isSubmitting}
            />
            <Text style={styles.hint}>Use pelo menos 6 caracteres.</Text>
            <Text style={styles.label}>Confirmação de senha</Text>
            <TextInput
              style={styles.input} value={confirmation} onChangeText={setConfirmation}
              accessibilityLabel="Confirmação de senha" placeholder="Repita sua senha" placeholderTextColor="#a1a1b8"
              secureTextEntry autoCapitalize="none" autoCorrect={false}
              autoComplete="new-password" textContentType="newPassword" editable={!isSubmitting}
              returnKeyType="go" onSubmitEditing={handleRegister}
            />
            {!!error && <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</Text>}
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed, isSubmitting && styles.disabled]}
              onPress={handleRegister} disabled={isSubmitting} accessibilityRole="button"
              accessibilityLabel={isSubmitting ? 'Criando conta' : 'Cadastrar'}
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            >
              {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.link, pressed && styles.pressed]}
              onPress={() => navigation.goBack()} disabled={isSubmitting}
              accessibilityRole="button" accessibilityLabel="Voltar ao login" accessibilityState={{ disabled: isSubmitting }}
            >
              <Text style={styles.linkText}>Já tem uma conta? Voltar ao login</Text>
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
  input: { color: '#fafafa', backgroundColor: '#1c1c2c', borderColor: '#666683', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 20 },
  hint: { color: '#c4c4d8', fontSize: 14, marginBottom: 16 },
  error: { color: '#fda4af', fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#7c3aed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  link: { paddingVertical: 18, paddingHorizontal: 8, alignItems: 'center' },
  linkText: { color: '#c4b5fd', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.6 },
});
