import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => {
      if (u) setUser(JSON.parse(u));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const menuItems = [
    { icon: '👥', label: 'Gestion des Étudiants', screen: 'StudentManagement', color: '#eef2ff' },
    { icon: '📚', label: 'Filières & Matières', screen: 'Filieres', color: '#f0fdf4' },
    { icon: '📋', label: 'Saisie des Absences', screen: 'Login', color: '#fff7ed' },
    { icon: '📊', label: 'Statistiques', screen: 'Login', color: '#fdf4ff' },
    { icon: '🔔', label: 'Notifications', screen: 'Login', color: '#fff1f2' },
    { icon: '⚙️', label: 'Paramètres', screen: 'Login', color: '#f8fafc' },
  ];

  const stats = [
    { label: 'Étudiants', value: '248', icon: '🎓' },
    { label: 'Professeurs', value: '32', icon: '👨‍🏫' },
    { label: 'Absences aujourd\'hui', value: '12', icon: '📌' },
    { label: 'Matières', value: '14', icon: '📖' },
  ];

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Bonjour 👋</Text>
          <Text style={styles.userName}>
            {user ? `${user.first_name} ${user.last_name}` : 'Administrateur'}
          </Text>
          <Text style={styles.userRole}>{user?.role || 'admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Oui', onPress: handleLogout }
        ])}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* STATS */}
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* MENU */}
        <Text style={styles.sectionTitle}>Menu principal</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuCard, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  header: {
    backgroundColor: '#3b5bfc',
    padding: 28,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcome: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 2 },
  userRole: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' },
  logoutBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: { fontSize: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#9aa0b4', textAlign: 'center' },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    paddingBottom: 32,
  },
  menuCard: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuIcon: { fontSize: 32, marginBottom: 10 },
  menuLabel: { fontSize: 13, fontWeight: '600', color: '#1a1a2e', textAlign: 'center' },
});