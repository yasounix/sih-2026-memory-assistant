import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getFamilyMembers } from '../modules/database';
import { familyMembers as fallbackFamilyMembers } from '../modules/memoryData';
import AddFamilyMemberModal from '../components/AddFamilyMemberModal';

export default function MemoriesScreen() {
  const { patientId } = usePatient();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const loadFamily = async () => {
    try {
      setLoading(true);
      console.log(`MemoriesScreen: patientId = ${patientId}`);
      const data = await getFamilyMembers(patientId);
      console.log(`MemoriesScreen: family =`, data);
      // Only use fallback data if connection fails, NOT when empty
      setFamily(data || []);
    } catch (error) {
      console.error('MemoriesScreen: Error fetching family:', error);
      setFamily(fallbackFamilyMembers || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamily();
  }, [patientId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={[styles.loadingText, { color: theme.subText }]}>
          {t('memories.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  const familyList = family || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('memories.title')}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={familyList}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Image
                source={{ uri: item.photo_url || 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Family' }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.relation, { color: theme.subText }]}>{item.relationship}</Text>
                {item.description ? (
                  <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {t('memories.empty')}
            </Text>
          }
        />

        <AddFamilyMemberModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          patientId={patientId}
          onAdded={loadFamily}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    backgroundColor: '#E2E8F0',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  relation: {
    fontSize: 16,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 30,
  },
});