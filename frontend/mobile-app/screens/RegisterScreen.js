import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.4/absence-management-app/backend/api/index.php';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}?route=/login`, { email, password });
      if (res.data.success) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        const role = res.data.user.role;
        if (role === 'admin' || role === 'assistant' || role === 'responsable') {
          navigation.replace('AdminDashboard');
        } else {
          navigation.replace('AdminDashboard');
        }
      }
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* ICON */}
        <View style={styles.iconWrap}>
          <Text style={styles.iconText}>👤</Text>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>Bienvenue !</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="exemple@hem.ac.ma"
          placeholderTextColor="#c0c4d4"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* PASSWORD */}
        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.passWrap}>
          <TextInput
            style={styles.passInput}
            placeholder="••••••••••"
            placeholderTextColor="#c0c4d4"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember(!remember)}>
            <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
              {remember && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Se souvenir de moi</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Se connecter</Text>
          }
        </TouchableOpacity>

        {/* OR + FINGERPRINT */}
        <Text style={styles.orText}>ou continuer avec</Text>
        <View style={styles.fpWrap}>
          <TouchableOpacity style={styles.fpBtn}>
            <Text style={styles.fpIcon}>🔐</Text>
          </TouchableOpacity>
        </View>

        {/* REGISTER */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconWrap: {
    alignSelf: 'flex-end',
    marginBottom: 36,
  },
  iconText: { fontSize: 28 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9aa0b4',
    marginBottom: 36,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e8eaf0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 20,
  },
  passWrap: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#e8eaf0',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  passInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#1a1a2e',
  },
  eyeBtn: { paddingRight: 14 },
  eyeIcon: { fontSize: 18 },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3b5bfc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: '#3b5bfc' },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  rememberText: { fontSize: 13, color: '#1a1a2e' },
  forgotText: { fontSize: 13, color: '#3b5bfc', fontWeight: '500' },
  btn: {
    backgroundColor: '#3b5bfc',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  orText: { textAlign: 'center', fontSize: 13, color: '#9aa0b4', marginBottom: 20 },
  fpWrap: { alignItems: 'center', marginBottom: 36 },
  fpBtn: {
    width: 64, height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#e0e6ff',
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fpIcon: { fontSize: 28 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 13, color: '#9aa0b4' },
  registerLink: { fontSize: 13, color: '#3b5bfc', fontWeight: '600' },
});