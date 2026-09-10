import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SequenceGame from '../games/SequenceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import SupermarketGame from '../games/SupermarketGame';
import SortingGame from '../games/SortingGame';
import MemoryPathGame from '../games/MemoryPathGame';
import DhopkhelGame from '../games/DhopkhelGame';
import NortheastMemoryGame from '../games/NortheastMemoryGame';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function GamesScreen() {
  const [selectedGame, setSelectedGame] = useState(null);
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  if (!selectedGame) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: theme.text, marginTop: 20 }}>
            {t('games.title')}
          </Text>
          
          <Text style={{ fontSize: 16, color: theme.subText, marginBottom: 20 }}>
            Select an exercise to help maintain cognitive function and memory.
          </Text>

          {/* North East Photo Memory Game */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('northeast')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' }]}>
              <Ionicons name="image" size={24} color="#059669" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>🏞️ North East Memory</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>Observe scenic photos & recall details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('dhopkhel')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#14532D' : '#DCFCE7' }]}>
              <Ionicons name="sparkles" size={24} color="#15803D" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>Dhopkhel Memory</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>Watch · Remember · Find the Dhop</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('sequence')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="game-controller-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.sequenceRecall')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>Practice pattern recognition</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('memory')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="images-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.memoryMatch')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>Improve short-term memory</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('supermarket')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="cart-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.supermarket')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>Practice daily tasks</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('sorting')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="list-circle-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.sorting')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>Categorize objects</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedGame('path')}
          >
            <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="footsteps-outline" size={24} color={theme.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.menuCardTitle, { color: theme.text }]}>{t('games.memoryPath')}</Text>
              <Text style={[styles.menuCardSub, { color: theme.subText }]}>Recall sequences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.cardBorder, marginTop: 10 }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} style={{ marginRight: 8 }} />
            <Text style={[styles.backButtonText, { color: theme.text }]}>{t('common.back')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'dhopkhel') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <DhopkhelGame onExit={() => setSelectedGame(null)} />
      </SafeAreaView>
    );
  }

  if (selectedGame === 'northeast') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <NortheastMemoryGame
          onFinish={() => setSelectedGame(null)}
          onExit={() => setSelectedGame(null)}
          onComplete={(summary) => console.log('North East Memory completed:', summary)}
          onGameOver={(summary) => console.log('North East Memory game over:', summary)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.headerBar, { backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.headerBack} onPress={() => setSelectedGame(null)}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
          <Text style={[styles.headerBackText, { color: theme.primary }]}>{t('games.backToMenu')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, padding: 10 }}>
          {selectedGame === 'sequence' && <SequenceGame />}
          {selectedGame === 'memory' && <MemoryMatchGame />}
          {selectedGame === 'supermarket' && <SupermarketGame />}
          {selectedGame === 'sorting' && <SortingGame />}
          {selectedGame === 'path' && <MemoryPathGame />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuCardSub: {
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
