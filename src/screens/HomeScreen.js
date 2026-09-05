import React, { useEffect, useState } from 'react';
import { Text, View, Button, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReminders } from '../modules/database';
import { reminders as fallbackReminders } from '../modules/memoryData';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { patientId, patientName } = usePatient();
  const { t, currentLanguage } = useLanguage();
  const [reminders, setReminders] = useState(fallbackReminders || []);
  const [statusState, setStatusState] = useState({ type: 'loading' });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        console.log(`HomeScreen: patientId = ${patientId}`);
        const data = await getReminders(patientId);
        if (isMounted) {
          console.log(`HomeScreen: reminders =`, data);
          // Only use fallback data if connection fails, NOT when empty
          setReminders(data || []);
          setStatusState({ type: 'connected', name: patientName });
        }
      } catch (error) {
        console.error('HomeScreen: Error fetching data:', error);
        if (isMounted) {
          setReminders(fallbackReminders || []);
          setStatusState({ type: 'offline' });
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [patientId, patientName]);

  const safeReminders = reminders || [];

  const getStatusDisplay = () => {
    switch (statusState.type) {
      case 'connected':
        return { text: t('home.connected', { name: statusState.name || patientName || '' }), isSuccess: true };
      case 'demo':
        return { text: t('home.demoData', { name: statusState.name || patientName || '' }), isSuccess: false };
      case 'offline':
        return { text: t('home.offlineData'), isSuccess: false };
      case 'loading':
      default:
        return { text: t('common.loading'), isSuccess: false };
    }
  };

  const statusDisplay = getStatusDisplay();

  const defaultFriend =
    currentLanguage === 'as' || currentLanguage === 'bn'
      ? 'বন্ধু'
      : currentLanguage === 'hi'
      ? 'मित्र'
      : 'Friend';

  const localeCode =
    currentLanguage === 'as'
      ? 'as-IN'
      : currentLanguage === 'bn'
      ? 'bn-IN'
      : currentLanguage === 'hi'
      ? 'hi-IN'
      : 'en-US';

  let formattedDate;
  try {
    formattedDate = new Date().toLocaleDateString(localeCode, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    formattedDate = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          {t('home.greeting', { name: patientName || defaultFriend })}
        </Text>

        <Text
          style={[
            styles.statusBadge,
            { color: statusDisplay.isSuccess ? '#10B981' : '#F59E0B' },
          ]}
        >
          {statusDisplay.text}
        </Text>

        <Text style={[styles.dateText, { color: theme.subText }]}>
          {t('home.todayIs', { date: formattedDate })}
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('home.myDay')}
          </Text>
          {safeReminders.length > 0 ? (
            safeReminders.map((item) => (
              <View key={item.id?.toString() || Math.random().toString()} style={styles.reminderRow}>
                <Text style={styles.checkIcon}>{item.completed ? '✅' : '⬜'}</Text>
                <Text style={[styles.reminderTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.reminderTime, { color: theme.subText }]}>{item.time}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {t('home.noReminders')}
            </Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => navigation.navigate('Games')}
          >
            <Text style={styles.actionButtonText}>{t('home.playGames')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('Memories')}
          >
            <Text style={styles.actionButtonText}>{t('home.viewMemories')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  statusBadge: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  dateText: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: '500',
  },
  card: {
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reminderRow: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  checkIcon: {
    fontSize: 22,
  },
  reminderTitle: {
    fontSize: 20,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  reminderTime: {
    fontSize: 18,
    marginLeft: 'auto',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonRow: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});