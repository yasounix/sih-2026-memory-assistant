import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import SequenceGame from '../games/SequenceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import SupermarketGame from '../games/SupermarketGame';
import SortingGame from '../games/SortingGame';
import { useTheme } from '../context/ThemeContext';

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState(null);
  const { theme } = useTheme();

  // If no game is selected, show the game menu
  if (!selectedGame) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: theme.text }}>
            🧠 Cognitive Games
          </Text>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => setSelectedGame('sequence')}
          >
            <Text style={styles.menuButtonText}>🔴 Sequence Recall</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#10B981' }]}
            onPress={() => setSelectedGame('memory')}
          >
            <Text style={styles.menuButtonText}>🃏 Memory Match</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => setSelectedGame('supermarket')}
          >
            <Text style={styles.menuButtonText}>🛒 Supermarket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => setSelectedGame('sorting')}
          >
            <Text style={styles.menuButtonText}>🧺 Sorting Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: '#EF4444' }]}
            onPress={() => setSelectedGame(null)}
          >
            <Text style={styles.menuButtonText}>⬅️ Back</Text>
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
        </View>
        <TouchableOpacity
          style={{ padding: 15, backgroundColor: '#EF4444', margin: 20, borderRadius: 10 }}
          onPress={() => setSelectedGame(null)}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            ⬅️ Back to Games Menu
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
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
};