import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.4/absence-management-app/backend/api/index.php';

export default function StudentManagementScreen({ navigation }) {
  const [tab, setTab] = useState('list');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', filiere_id: '', group_name: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?route=students`);
      setStudents(res.data || []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les étudiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!form.first_name || !form.last_name) {
      Alert.alert('Erreur', 'Prénom et nom sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}?route=students`, form);
      Alert.alert('Succès', 'Étudiant ajouté !');
      setForm({ first_name: '', last_name: '', email: '', filiere_id: '', group_name: '' });
      setTab('list');
      fetchStudents();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur lors de l\'ajout.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Étudiants</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'list' && styles.tabActive]}
          onPress={() => { setTab('list'); fetchStudents(); }}
        >
          <Text style={[styles.tabText, tab === 'list' && styles.tabTextActive]}>Liste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'add' && styles.tabActive]}
          onPress={() => setTab('add')}
        >
          <Text style={[styles.tabText, tab === 'add' && styles.tabTextActive]}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {tab === 'list' ? (
        <ScrollView style={styles.content}>
          {/* SEARCH */}
          <TextInput
            style={styles.search}
            placeholder="🔍  Rechercher un étudiant..."
            placeholderTextColor="#9aa0b4"
            value={search}
            onChangeText={setSearch}
          />

          {loading
            ? <ActivityIndicator color="#3b5bfc" style={{ marginTop: 40 }} />
            : filtered.length === 0
              ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>🎓</Text>
                  <Text style={styles.emptyText}>Aucun étudiant trouvé</Text>
                  <TouchableOpacity style={styles.loadBtn} onPress={fetchStudents}>
                    <Text style={styles.loadBtnText}>Charger les étudiants</Text>
                  </TouchableOpacity>
                </View>
              )
              : filtered.map((s, i) => (
                <View key={i} style={styles.studentCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {s.first_name[0]}{s.last_name[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.first_name} {s.last_name}</Text>
                    <Text style={styles.studentInfo}>{s.email || 'Pas d\'email'}</Text>
                    <Text style={styles.studentGroup}>{s.group_name || 'Groupe non défini'}</Text>
                  </View>
                </View>
              ))
          }
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>Ajouter un étudiant</Text>

          <Text style={styles.label}>Prénom *</Text>
          <TextInput style={styles.input} placeholder="Prénom" placeholderTextColor="#c0c4d4"
            value={form.first_name} onChangeText={v => setForm({ ...form, first_name: v })} />

          <Text style={styles.label}>Nom *</Text>
          <TextInput style={styles.input} placeholder="Nom" placeholderTextColor="#c0c4d4"
            value={form.last_name} onChangeText={v => setForm({ ...form, last_name: v })} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="email@exemple.com" placeholderTextColor="#c0c4d4"
            value={form.email} onChangeText={v => setForm({ ...form, email: v })}
            keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Groupe</Text>
          <TextInput style={styles.input} placeholder="Ex: G1, G2..." placeholderTextColor="#c0c4d4"
            value={form.group_name} onChangeText={v => setForm({ ...form, group_name: v })} />

          <TouchableOpacity style={styles.btn} onPress={handleAddStudent} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Ajouter l'étudiant</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  header: {
    backgroundColor: '#3b5bfc',
    padding: 20,
    paddingTop: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#3b5bfc' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9aa0b4' },
  tabTextActive: { color: '#fff' },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 16 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1a1a2e',
    marginBottom: 16,
  },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#9aa0b4', marginBottom: 20 },
  loadBtn: {
    backgroundColor: '#3b5bfc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loadBtnText: { color: '#fff', fontWeight: '600' },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 46, height: 46,
    borderRadius: 23,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#3b5bfc' },
  studentName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  studentInfo: { fontSize: 12, color: '#9aa0b4', marginTop: 2 },
  studentGroup: { fontSize: 12, color: '#3b5bfc', marginTop: 2 },
  formTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#1a1a2e', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e8eaf0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#3b5bfc',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});