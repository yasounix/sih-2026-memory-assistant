import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍊'];

const DIFFICULTY_SETTINGS = {
  Easy: { flipBackDuration: 1400 },
  Medium: { flipBackDuration: 1000 },
  Hard: { flipBackDuration: 650 },
};

// Helper to shuffle cards using Fisher-Yates algorithm
function createShuffledDeck() {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, index) => ({
    id: index,
    emoji,
  }));

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export default function MemoryMatchGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
}) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'gameover'
  const [cards, setCards] = useState(() => createShuffledDeck());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [score, setScore] = useState(0); // number of attempts
  const [statusMessage, setStatusMessage] = useState('Press "Start Game" to begin!');
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isProcessingMismatch, setIsProcessingMismatch] = useState(false);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Duration timer while game is active
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

  // Start or restart the game
  const startGame = () => {
    clearAllTimeouts();
    const newDeck = createShuffledDeck();
    setCards(newDeck);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setScore(0);
    setIsProcessingMismatch(false);

    const now = Date.now();
    setStartTime(now);
    setDuration(0);
    setGameState('playing');
    setStatusMessage('Find matching pairs of cards!');
  };

  // End game handler
  const handleGameCompletion = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    setFlippedIndices([]);

    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusMessage('Wonderful! You found all pairs!');

    const result = {
      score: finalScore,
      duration: finalDuration,
      difficulty,
    };

    if (typeof onGameOver === 'function') onGameOver(result);
    if (typeof onFinish === 'function') onFinish(result);
    if (typeof onComplete === 'function') onComplete(result);
  };

  // Handle card tap
  const handleCardPress = (index) => {
    if (gameState !== 'playing' || isProcessingMismatch) return;

    // Card already flipped or matched
    if (flippedIndices.includes(index) || matchedIndices.includes(index)) return;

    if (flippedIndices.length === 0) {
      // First card flipped
      setFlippedIndices([index]);
    } else if (flippedIndices.length === 1) {
      // Second card flipped
      const firstIndex = flippedIndices[0];
      const newFlipped = [firstIndex, index];
      setFlippedIndices(newFlipped);

      const nextScore = score + 1;
      setScore(nextScore);

      if (cards[firstIndex].emoji === cards[index].emoji) {
        // Matched!
        const nextMatched = [...matchedIndices, firstIndex, index];
        setMatchedIndices(nextMatched);
        setFlippedIndices([]);

        const pairsRemaining = (cards.length - nextMatched.length) / 2;
        if (pairsRemaining === 0) {
          // All pairs matched - victory!
          const finishTimeout = setTimeout(() => {
            handleGameCompletion(nextScore);
          }, 600);
          timeoutsRef.current.push(finishTimeout);
        } else {
          setStatusMessage(`Match found! ${pairsRemaining} ${pairsRemaining === 1 ? 'pair' : 'pairs'} left.`);
        }
      } else {
        // Not a match - flip back after delay
        setIsProcessingMismatch(true);
        setStatusMessage('Not a match, try again!');

        const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Easy;
        const flipBackTimeout = setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessingMismatch(false);
          setStatusMessage('Find matching pairs of cards!');
        }, settings.flipBackDuration);

        timeoutsRef.current.push(flipBackTimeout);
      }
    }
  };

  const matchedPairsCount = Math.floor(matchedIndices.length / 2);

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Memory Match</Text>

      {/* Stats Header: Pairs Matched, Attempts/Score, Time */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>PAIRS</Text>
          <Text style={styles.statValue}>
            {matchedPairsCount}/8
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ATTEMPTS</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{duration}s</Text>
        </View>
      </View>

      {/* Difficulty Selector (available before starting) */}
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
                onPress={() => setDifficulty(diff)}
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
          gameState === 'gameover' && styles.statusBannerGameOver,
          gameState === 'playing' && styles.statusBannerPlaying,
        ]}
      >
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      {/* 4x4 Cards Grid */}
      <View style={styles.gridContainer}>
        {[0, 1, 2, 3].map((rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {cards
              .slice(rowIndex * 4, rowIndex * 4 + 4)
              .map((card, colIndex) => {
                const cardIndex = rowIndex * 4 + colIndex;
                return renderCard(card, cardIndex);
              })}
          </View>
        ))}
      </View>

      {/* Game Over Summary */}
      {gameState === 'gameover' && (
        <View style={styles.gameOverCard}>
          <Text style={styles.gameOverTitle}>Game Complete! 🎉</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Attempts:</Text>
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
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Pairs Matched:</Text>
            <Text style={styles.resultValue}>8 / 8</Text>
          </View>
        </View>
      )}

      {/* Primary Action Button: Start / Play Again */}
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
    </SafeAreaView>
  );

  function renderCard(card, index) {
    const isFlipped = flippedIndices.includes(index);
    const isMatched = matchedIndices.includes(index);
    const isRevealed = isFlipped || isMatched;
    const isInteractive = gameState === 'playing' && !isRevealed && !isProcessingMismatch;

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          isRevealed ? styles.cardFlipped : styles.cardCovered,
          isMatched && styles.cardMatched,
          isFlipped && styles.cardActive,
        ]}
        onPress={() => handleCardPress(index)}
        disabled={!isInteractive}
        activeOpacity={0.7}
        accessibilityLabel={
          isRevealed ? `${card.emoji} card` : `Card at position ${index + 1}`
        }
        accessibilityRole="button"
      >
        {isRevealed ? (
          <Text style={styles.cardEmoji}>{card.emoji}</Text>
        ) : (
          <Text style={styles.cardCoverText}>❓</Text>
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 6,
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
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 88,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  difficultyHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: '#2563EB',
  },
  difficultyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  statusBanner: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
  },
  statusBannerPlaying: {
    backgroundColor: '#EFF6FF',
  },
  statusBannerGameOver: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  card: {
    width: 74,
    height: 74,
    borderRadius: 12,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
  },
  cardCovered: {
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  cardFlipped: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  cardActive: {
    borderColor: '#2563EB',
    transform: [{ scale: 1.04 }],
    elevation: 6,
  },
  cardMatched: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2.5,
    borderColor: '#16A34A',
    opacity: 0.9,
  },
  cardEmoji: {
    fontSize: 34,
  },
  cardCoverText: {
    fontSize: 26,
    color: '#93C5FD',
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameOverTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  resultLabel: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: '#64748B',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

