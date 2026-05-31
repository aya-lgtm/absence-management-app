import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.4/absence-management-app/backend/api/index.php';

export default function FilieresScreen({ navigation }) {
  const [tab, setTab] = useState('filieres');
  const [loading, setLoading] = useState(false);
  const [filieres, setFilieres] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filiereForm, setFiliereForm] = useState({ name: '', code: '', description: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', volume_horaire: '', coefficient: '', filiere_id: '' });

  const fetchFilieres = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?route=filieres`);
      setFilieres(res.data || []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les filières.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?route=subjects`);
      setSubjects(res.data || []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les matières.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFiliere = async () => {
    if (!filiereForm.name) { Alert.alert('Erreur', 'Le nom est obligatoire.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}?route=filieres`, filiereForm);
      Alert.alert('Succès', 'Filière ajoutée !');
      setFiliereForm({ name: '', code: '', description: '' });
      fetchFilieres();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!subjectForm.name) { Alert.alert('Erreur', 'Le nom est obligatoire.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}?route=subjects`, subjectForm);
      Alert.alert('Succès', 'Matière ajoutée !');
      setSubjectForm({ name: '', code: '', volume_horaire: '', coefficient: '', filiere_id: '' });
      fetchSubjects();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Erreur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filières & Matières</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'filieres' && styles.tabActive]}
          onPress={() => { setTab('filieres'); fetchFilieres(); }}
        >
          <Text style={[styles.tabText, tab === 'filieres' && styles.tabTextActive]}>Filières</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'subjects' && styles.tabActive]}
          onPress={() => { setTab('subjects'); fetchSubjects(); }}
        >
          <Text style={[styles.tabText, tab === 'subjects' && styles.tabTextActive]}>Matières</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">

        {tab === 'filieres' ? (
          <>
            <Text style={styles.sectionTitle}>Ajouter une filière</Text>

            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} placeholder="Ex: Engineering Science" placeholderTextColor="#c0c4d4"
              value={filiereForm.name} onChangeText={v => setFiliereForm({ ...filiereForm, name: v })} />

            <Text style={styles.label}>Code</Text>
            <TextInput style={styles.input} placeholder="Ex: ES, BS..." placeholderTextColor="#c0c4d4"
              value={filiereForm.code} onChangeText={v => setFiliereForm({ ...filiereForm, code: v })} />

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Description..." placeholderTextColor="#c0c4d4" multiline
              value={filiereForm.description} onChangeText={v => setFiliereForm({ ...filiereForm, description: v })} />

            <TouchableOpacity style={styles.btn} onPress={handleAddFiliere} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Ajouter la filière</Text>}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Filières existantes</Text>
            {filieres.length === 0
              ? <Text style={styles.emptyText}>Aucune filière — appuyez sur "Filières" pour charger</Text>
              : filieres.map((f, i) => (
                <View key={i} style={styles.card}>
                  <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>{f.code || 'N/A'}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{f.name}</Text>
                    {f.description && <Text style={styles.cardSub}>{f.description}</Text>}
                  </View>
                </View>
              ))
            }
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Ajouter une matière</Text>

            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} placeholder="Ex: Développement Mobile" placeholderTextColor="#c0c4d4"
              value={subjectForm.name} onChangeText={v => setSubjectForm({ ...subjectForm, name: v })} />

            <Text style={styles.label}>Code</Text>
            <TextInput style={styles.input} placeholder="Ex: DEV-MOB" placeholderTextColor="#c0c4d4"
              value={subjectForm.code} onChangeText={v => setSubjectForm({ ...subjectForm, code: v })} />

            <Text style={styles.label}>Volume horaire (h)</Text>
            <TextInput style={styles.input} placeholder="Ex: 45" placeholderTextColor="#c0c4d4"
              value={subjectForm.volume_horaire} onChangeText={v => setSubjectForm({ ...subjectForm, volume_horaire: v })}
              keyboardType="numeric" />

            <Text style={styles.label}>Coefficient</Text>
            <TextInput style={styles.input} placeholder="Ex: 3" placeholderTextColor="#c0c4d4"
              value={subjectForm.coefficient} onChangeText={v => setSubjectForm({ ...subjectForm, coefficient: v })}
              keyboardType="numeric" />

            <TouchableOpacity style={styles.btn} onPress={handleAddSubject} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Ajouter la matière</Text>}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Matières existantes</Text>
            {subjects.length === 0
              ? <Text style={styles.emptyText}>Aucune matière — appuyez sur "Matières" pour charger</Text>
              : subjects.map((s, i) => (
                <View key={i} style={styles.card}>
                  <View style={[styles.cardBadge, { backgroundColor: '#f0fdf4' }]}>
                    <Text style={[styles.cardBadgeText, { color: '#16a34a' }]}>{s.volume_horaire || '?'}h</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{s.name}</Text>
                    <Text style={styles.cardSub}>Coefficient : {s.coefficient || 'N/A'}</Text>
                  </View>
                </View>
              ))
            }
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 14, marginTop: 8 },
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
    marginBottom: 24,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#9aa0b4', textAlign: 'center', marginTop: 12, marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  cardBadge: {
    width: 46, height: 46,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadgeText: { fontSize: 12, fontWeight: '700', color: '#3b5bfc' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  cardSub: { fontSize: 12, color: '#9aa0b4', marginTop: 2 },
});