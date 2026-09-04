import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const SORTING_DATA = [
  {
    category: 'Fruits',
    items: [
      { id: 'apple', label: 'Apple', emoji: '🍎' },
      { id: 'banana', label: 'Banana', emoji: '🍌' },
      { id: 'grapes', label: 'Grapes', emoji: '🍇' },
      { id: 'strawberry', label: 'Strawberry', emoji: '🍓' },
      { id: 'orange', label: 'Orange', emoji: '🍊' },
      { id: 'watermelon', label: 'Watermelon', emoji: '🍉' },
    ]
  },
  {
    category: 'Vegetables',
    items: [
      { id: 'carrot', label: 'Carrot', emoji: '🥕' },
      { id: 'broccoli', label: 'Broccoli', emoji: '🥦' },
      { id: 'potato', label: 'Potato', emoji: '🥔' },
      { id: 'corn', label: 'Corn', emoji: '🌽' },
      { id: 'onion', label: 'Onion', emoji: '🧅' },
      { id: 'lettuce', label: 'Lettuce', emoji: '🥬' },
    ]
  },
  {
    category: 'Animals',
    items: [
      { id: 'dog', label: 'Dog', emoji: '🐶' },
      { id: 'cat', label: 'Cat', emoji: '🐱' },
      { id: 'rabbit', label: 'Rabbit', emoji: '🐰' },
      { id: 'fox', label: 'Fox', emoji: '🦊' },
      { id: 'bear', label: 'Bear', emoji: '🐻' },
      { id: 'mouse', label: 'Mouse', emoji: '🐭' },
    ]
  },
  {
    category: 'Vehicles',
    items: [
      { id: 'car', label: 'Car', emoji: '🚗' },
      { id: 'bus', label: 'Bus', emoji: '🚌' },
      { id: 'taxi', label: 'Taxi', emoji: '🚕' },
      { id: 'ambulance', label: 'Ambulance', emoji: '🚑' },
      { id: 'tractor', label: 'Tractor', emoji: '🚜' },
      { id: 'bicycle', label: 'Bicycle', emoji: '🚲' },
    ]
  }
];

const MAX_ROUNDS = 5;

function generateRoundData(difficulty) {
  let itemsPerCategory = 2; // Easy: 4 items total
  if (difficulty === 'Medium') itemsPerCategory = 3; // 6 items
  else if (difficulty === 'Hard') itemsPerCategory = 4; // 8 items

  // Pick 2 random categories
  const shuffledCategories = [...SORTING_DATA].sort(() => Math.random() - 0.5);
  const selectedCats = shuffledCategories.slice(0, 2);

  const categories = selectedCats.map(c => c.category);
  
  let roundItems = [];
  
  selectedCats.forEach(catObj => {
    const shuffledItems = [...catObj.items].sort(() => Math.random() - 0.5);
    const picked = shuffledItems.slice(0, itemsPerCategory).map(item => ({
      ...item,
      category: catObj.category,
    }));
    roundItems = [...roundItems, ...picked];
  });

  // Shuffle the final item list
  roundItems.sort(() => Math.random() - 0.5);

  return { categories, items: roundItems };
}

export default function SortingGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
}) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'gameover'
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Press "Start Game" to begin!');
  
  const [currentRoundData, setCurrentRoundData] = useState(() => generateRoundData(initialDifficulty));
  const [sortedItemIds, setSortedItemIds] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Duration timer
  useEffect(() => {
    let interval = null;
    if (gameState === 'playing' && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, startTime]);

  const startGame = () => {
    clearAllTimeouts();
    const now = Date.now();
    setStartTime(now);
    setDuration(0);
    setScore(0);
    setRound(1);
    setSortedItemIds([]);
    setSelectedItemId(null);
    setCurrentRoundData(generateRoundData(difficulty));
    setGameState('playing');
    setStatusMessage('Select an item, then tap its category.');
  };

  const handleGameOver = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusMessage('Sorting complete! Great job!');

    const result = {
      score: finalScore,
      duration: finalDuration,
      difficulty,
    };

    if (typeof onGameOver === 'function') onGameOver(result);
    if (typeof onFinish === 'function') onFinish(result);
    if (typeof onComplete === 'function') onComplete(result);
  };

  const handleItemPress = (item) => {
    if (gameState !== 'playing') return;
    if (sortedItemIds.includes(item.id)) return; // Already sorted
    
    // Toggle selection
    if (selectedItemId === item.id) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(item.id);
    }
  };

  const handleCategoryPress = (categoryName) => {
    if (gameState !== 'playing') return;
    if (!selectedItemId) {
      setStatusMessage('Please select an item to sort first.');
      return;
    }

    const item = currentRoundData.items.find(i => i.id === selectedItemId);
    if (!item) return;

    clearAllTimeouts();

    if (item.category === categoryName) {
      // Correct!
      const newSorted = [...sortedItemIds, item.id];
      setSortedItemIds(newSorted);
      const nextScore = score + 1;
      setScore(nextScore);
      setSelectedItemId(null);
      
      if (newSorted.length === currentRoundData.items.length) {
        setStatusMessage('Great job! 🌟 All sorted!');
        
        const nextRound = round + 1;
        const delayTimer = setTimeout(() => {
          if (nextRound > MAX_ROUNDS) {
            handleGameOver(nextScore);
          } else {
            setRound(nextRound);
            setCurrentRoundData(generateRoundData(difficulty));
            setSortedItemIds([]);
            setStatusMessage('Select an item, then tap its category.');
          }
        }, 1500);
        timeoutsRef.current.push(delayTimer);
      } else {
        setStatusMessage('Great job! 🌟');
        const clearMsgTimer = setTimeout(() => {
            if(gameState === 'playing') {
                setStatusMessage('Keep going!');
            }
        }, 1500);
        timeoutsRef.current.push(clearMsgTimer);
      }
    } else {
      // Wrong category!
      let singularCategory = categoryName.endsWith('s') 
        ? categoryName.slice(0, -1).toLowerCase() 
        : categoryName.toLowerCase();
        
      setStatusMessage(`That's not a ${singularCategory}. Try again.`);
      
      const wrongFeedbackTimer = setTimeout(() => {
        if(gameState === 'playing') {
            setStatusMessage('Select an item, then tap its category.');
        }
      }, 2500);
      timeoutsRef.current.push(wrongFeedbackTimer);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Sorting Game 📦</Text>

        {/* Stats Header */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ROUND</Text>
            <Text style={styles.statValue}>
              {gameState === 'idle' ? '-' : `${round}/${MAX_ROUNDS}`}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SCORE</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TIME</Text>
            <Text style={styles.statValue}>{duration}s</Text>
          </View>
        </View>

        {/* Difficulty Selector */}
        {gameState === 'idle' && (
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyHeading}>Select Difficulty:</Text>
            <View style={styles.difficultyButtons}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyButton,
                    difficulty === diff && styles.difficultyButtonActive,
                  ]}
                  onPress={() => {
                    setDifficulty(diff);
                    setCurrentRoundData(generateRoundData(diff));
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      difficulty === diff && styles.difficultyButtonTextActive,
                    ]}
                  >
                    {diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            statusMessage.includes('Great job') && styles.bannerCorrect,
            statusMessage.includes('not a') && styles.bannerIncorrect,
            gameState === 'gameover' && styles.bannerGameOver,
          ]}
        >
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>

        {/* Play Area */}
        {gameState === 'playing' && (
          <View style={styles.playArea}>
            
            {/* Items Grid */}
            <Text style={styles.sectionTitle}>1. Tap an object to select it:</Text>
            <View style={styles.itemsGrid}>
              {currentRoundData.items.map(item => {
                const isSorted = sortedItemIds.includes(item.id);
                const isSelected = selectedItemId === item.id;
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemCard,
                      isSelected && styles.itemCardSelected,
                      isSorted && styles.itemCardSorted
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                    disabled={isSorted}
                  >
                    <Text style={[styles.itemEmoji, isSorted && styles.opacityLow]}>{item.emoji}</Text>
                    <Text style={[styles.itemLabel, isSorted && styles.opacityLow]}>{item.label}</Text>
                    {isSorted && (
                      <View style={styles.sortedOverlay}>
                        <Text style={styles.sortedCheck}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Categories */}
            <Text style={styles.sectionTitle}>2. Tap the correct category:</Text>
            <View style={styles.categoriesRow}>
              {currentRoundData.categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryCard,
                    // Slightly highlight categories if an item is selected to prompt action
                    selectedItemId && styles.categoryCardPrompt
                  ]}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>
        )}

        {/* Game Over Summary */}
        {gameState === 'gameover' && (
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Sorting Complete! 📦</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Items Sorted:</Text>
              <Text style={styles.resultValue}>{score}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Duration:</Text>
              <Text style={styles.resultValue}>{duration} seconds</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Difficulty:</Text>
              <Text style={styles.resultValue}>{difficulty}</Text>
            </View>
          </View>
        )}

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            gameState === 'playing' && styles.secondaryButton,
          ]}
          onPress={startGame}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {gameState === 'idle'
              ? 'Start Game'
              : gameState === 'gameover'
              ? 'Play Again'
              : 'Restart Game'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 4,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: '#2563EB',
  },
  difficultyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  statusBanner: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  bannerCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  bannerIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  bannerGameOver: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  playArea: {
    width: '100%',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
    marginTop: 8,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  itemCard: {
    width: '45%',
    minHeight: 110, // Minimum 60px height
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.02 }],
  },
  itemCardSorted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 2,
  },
  itemEmoji: {
    fontSize: 44,
    marginBottom: 6,
  },
  itemLabel: {
    fontSize: 22, // Minimum 22px
    fontWeight: 'bold',
    color: '#1E293B',
  },
  opacityLow: {
    opacity: 0.4,
  },
  sortedOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sortedCheck: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minHeight: 120, // Huge touch target
    backgroundColor: '#E0E7FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#A5B4FC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryCardPrompt: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameOverTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0284C7',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultLabel: {
    fontSize: 20,
    color: '#475569',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    minHeight: 64, // Minimum 60px
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  secondaryButton: {
    backgroundColor: '#64748B',
  },
  primaryButtonText: {
    fontSize: 24, // Minimum 22px
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

