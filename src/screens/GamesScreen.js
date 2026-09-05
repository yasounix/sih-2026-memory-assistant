import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import SequenceGame from '../games/SequenceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import SupermarketGame from '../games/SupermarketGame';
import SortingGame from '../games/SortingGame';
import MemoryPathGame from '../games/MemoryPathGame';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState(null);
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  // If no game is selected, show the game menu
  if (!selectedGame) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: theme.text }}>
            {t('games.title')}
          </Text>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => setSelectedGame('sequence')}
          >
            <Text style={styles.menuButtonText}>{t('games.sequenceRecall')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#10B981' }]}
            onPress={() => setSelectedGame('memory')}
          >
            <Text style={styles.menuButtonText}>{t('games.memoryMatch')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => setSelectedGame('supermarket')}
          >
            <Text style={styles.menuButtonText}>{t('games.supermarket')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => setSelectedGame('sorting')}
          >
            <Text style={styles.menuButtonText}>{t('games.sorting')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#6366F1' }]}
            onPress={() => setSelectedGame('path')}
          >
            <Text style={styles.menuButtonText}>{t('games.memoryPath')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#EF4444' }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.menuButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render the selected game
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ padding: 10 }}>
          {selectedGame === 'sequence' && <SequenceGame />}
          {selectedGame === 'memory' && <MemoryMatchGame />}
          {selectedGame === 'supermarket' && <SupermarketGame />}
          {selectedGame === 'sorting' && <SortingGame />}
          {selectedGame === 'path' && <MemoryPathGame />}
        </View>
        <TouchableOpacity
          style={{ padding: 15, backgroundColor: '#EF4444', margin: 20, borderRadius: 10 }}
          onPress={() => setSelectedGame(null)}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            {t('games.backToMenu')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});