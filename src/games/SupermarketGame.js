import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const SUPERMARKET_ITEMS = [
  { id: 'apple', label: 'Apple', emoji: '🍎' },
  { id: 'bread', label: 'Bread', emoji: '🍞' },
  { id: 'milk', label: 'Milk', emoji: '🥛' },
  { id: 'banana', label: 'Banana', emoji: '🍌' },
  { id: 'cheese', label: 'Cheese', emoji: '🧀' },
  { id: 'carrot', label: 'Carrot', emoji: '🥕' },
  { id: 'egg', label: 'Eggs', emoji: '🥚' },
  { id: 'meat', label: 'Meat', emoji: '🥩' },
  { id: 'broccoli', label: 'Broccoli', emoji: '🥦' },
  { id: 'orange', label: 'Orange', emoji: '🍊' },
  { id: 'tomato', label: 'Tomato', emoji: '🍅' },
  { id: 'chicken', label: 'Chicken', emoji: '🍗' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'grapes', label: 'Grapes', emoji: '🍇' },
  { id: 'corn', label: 'Corn', emoji: '🌽' },
  { id: 'cookie', label: 'Cookie', emoji: '🍪' },
];

const MAX_ROUNDS = 5;

function generateRoundData(difficulty) {
  let listSize = 3;
  let shelfSize = 6;
  if (difficulty === 'Medium') {
    listSize = 4;
    shelfSize = 8;
  } else if (difficulty === 'Hard') {
    listSize = 5;
    shelfSize = 10;
  }

  // Shuffle items to pick
  const shuffled = [...SUPERMARKET_ITEMS].sort(() => Math.random() - 0.5);
  
  // Pick target items
  const targetItems = shuffled.slice(0, listSize);
  
  // Pick distractors
  const distractorItems = shuffled.slice(listSize, shelfSize);
  
  // Combine and shuffle for the shelf
  const shelfItems = [...targetItems, ...distractorItems].sort(() => Math.random() - 0.5);

  return {
    targetItems,
    shelfItems,
  };
}

export default function SupermarketGame({
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
  const [statusMessage, setStatusMessage] = useState('Press "Start Game" to go shopping!');
  
  const [currentRoundData, setCurrentRoundData] = useState(() => generateRoundData(initialDifficulty));
  const [foundItemIds, setFoundItemIds] = useState([]);
  const [wrongFeedbackId, setWrongFeedbackId] = useState(null);

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
    setFoundItemIds([]);
    setWrongFeedbackId(null);
    setCurrentRoundData(generateRoundData(difficulty));
    setGameState('playing');
    setStatusMessage('Find the items on your list.');
  };

  const handleGameOver = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusMessage('Shopping complete! Great job!');

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
    if (foundItemIds.includes(item.id)) return; // Already found

    clearAllTimeouts();

    const isTarget = currentRoundData.targetItems.some(t => t.id === item.id);

    if (isTarget) {
      const newFound = [...foundItemIds, item.id];
      setFoundItemIds(newFound);
      const nextScore = score + 1;
      setScore(nextScore);
      setWrongFeedbackId(null);
      
      if (newFound.length === currentRoundData.targetItems.length) {
        setStatusMessage('Great job! 🌟 All items found!');
        
        const nextRound = round + 1;
        const delayTimer = setTimeout(() => {
          if (nextRound > MAX_ROUNDS) {
            handleGameOver(nextScore);
          } else {
            setRound(nextRound);
            setCurrentRoundData(generateRoundData(difficulty));
            setFoundItemIds([]);
            setStatusMessage('Find the items on your new list.');
          }
        }, 1500);
        timeoutsRef.current.push(delayTimer);
      } else {
        setStatusMessage('Great job! 🌟');
        const clearMsgTimer = setTimeout(() => {
            if(gameState === 'playing') {
                setStatusMessage('Keep going!');
            }
        }, 1200);
        timeoutsRef.current.push(clearMsgTimer);
      }
    } else {
      setStatusMessage('That item is not on the list.');
      setWrongFeedbackId(item.id);
      
      const wrongFeedbackTimer = setTimeout(() => {
        setWrongFeedbackId(null);
        if(gameState === 'playing') {
            setStatusMessage('Find the items on your list.');
        }
      }, 1500);
      timeoutsRef.current.push(wrongFeedbackTimer);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Supermarket Run 🛒</Text>

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
            statusMessage.includes('not on the list') && styles.bannerIncorrect,
            gameState === 'gameover' && styles.bannerGameOver,
          ]}
        >
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>

        {/* Shopping List */}
        {(gameState === 'playing' || gameState === 'gameover') && (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>📝 Shopping List</Text>
            <View style={styles.listItemsWrapper}>
              {currentRoundData.targetItems.map(item => {
                const isFound = foundItemIds.includes(item.id);
                return (
                  <View key={item.id} style={styles.listItem}>
                    <Text style={styles.listCheckbox}>
                      {isFound ? '✅' : '⬜'}
                    </Text>
                    <Text style={[
                      styles.listText,
                      isFound && styles.listTextFound
                    ]}>
                      {item.emoji} {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Supermarket Shelf */}
        {gameState === 'playing' && (
          <View style={styles.shelfContainer}>
            <Text style={styles.shelfTitle}>Supermarket Shelf</Text>
            <View style={styles.shelfGrid}>
              {currentRoundData.shelfItems.map(item => {
                const isFound = foundItemIds.includes(item.id);
                const isWrong = wrongFeedbackId === item.id;
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.shelfItem,
                      isFound && styles.shelfItemFound,
                      isWrong && styles.shelfItemWrong
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.7}
                    disabled={isFound}
                  >
                    <Text style={styles.shelfEmoji}>{item.emoji}</Text>
                    <Text style={styles.shelfLabel}>{item.label}</Text>
                    {isFound && (
                      <View style={styles.foundOverlay}>
                        <Text style={styles.foundCheck}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Game Over Summary */}
        {gameState === 'gameover' && (
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Shopping Trip Complete! 🛒</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Items Found:</Text>
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
    paddingBottom: 40, // extra padding for scrolling
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
    fontSize: 22, // Minimum 22px
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    backgroundColor: '#FEF3C7', // Pale yellow like a notepad
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#FDE68A',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
    textAlign: 'center',
  },
  listItemsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  listCheckbox: {
    fontSize: 24,
    marginRight: 8,
  },
  listText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  listTextFound: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  shelfContainer: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  shelfTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 12,
    textAlign: 'center',
  },
  shelfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  shelfItem: {
    width: '45%',
    minHeight: 100, // Large touch target > 60px
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
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
  shelfItemFound: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    opacity: 0.7,
  },
  shelfItemWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 3,
  },
  shelfEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  shelfLabel: {
    fontSize: 22, // Minimum 22px
    fontWeight: 'bold',
    color: '#1E293B',
  },
  foundOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  foundCheck: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
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

