import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ─── Game Configuration ───

const LEVELS = {
  Easy: {
    objectCount: 4,
    storyComplexity: 'simple',
    timeBonus: 5,
  },
  Medium: {
    objectCount: 6,
    storyComplexity: 'moderate',
    timeBonus: 3,
  },
  Hard: {
    objectCount: 8,
    storyComplexity: 'complex',
    timeBonus: 1,
  },
};

// ─── Object Database ───

const OBJECTS = {
  keys: { emoji: '🔑', label: 'Keys' },
  glasses: { emoji: '👓', label: 'Glasses' },
  phone: { emoji: '📱', label: 'Phone' },
  medicine: { emoji: '💊', label: 'Medicine' },
  wallet: { emoji: '👛', label: 'Wallet' },
  photo: { emoji: '🖼️', label: 'Photo' },
  flowers: { emoji: '🌺', label: 'Flowers' },
  book: { emoji: '📖', label: 'Book' },
  tea: { emoji: '☕', label: 'Tea Cup' },
  hat: { emoji: '🧢', label: 'Hat' },
  bag: { emoji: '👜', label: 'Bag' },
  scarf: { emoji: '🧣', label: 'Scarf' },
};

// ─── Story Database ───

const STORIES = {
  // Simple stories (Easy mode)
  simple: [
    {
      story: "Rahul called earlier. He said he left his {object} on the table.",
      question: "What did Rahul leave on the table?",
    },
    {
      story: "Priya is coming over. She loves the {object} in the garden.",
      question: "What does Priya love in the garden?",
    },
    {
      story: "Your grandson, Amit, forgot his {object} in the living room.",
      question: "What did Amit forget in the living room?",
    },
  ],
  // Moderate stories (Medium mode)
  moderate: [
    {
      story: "Rahul called and said he was looking for his {object}. He thinks he left it near the window.",
      question: "What is Rahul looking for?",
    },
    {
      story: "Priya is visiting today. She asked if she could borrow your {object}.",
      question: "What does Priya want to borrow?",
    },
    {
      story: "Amit came by this morning. He said he would leave his {object} on the shelf for you.",
      question: "What did Amit leave on the shelf?",
    },
  ],
  // Complex stories (Hard mode)
  complex: [
    {
      story: "Rahul called twice today. First he said he'd visit, then he realized he lost his {object}. He thinks he left it in the kitchen, but he's not sure.",
      question: "What did Rahul lose?",
    },
    {
      story: "Priya is bringing dinner tonight. She asked if you still have her {object} from last time. She said it was on the coffee table.",
      question: "What does Priya want back?",
    },
    {
      story: "Amit is coming to pick up his {object} tomorrow. He said he'd leave yours on the dining table when he arrives.",
      question: "What is Amit coming to pick up?",
    },
  ],
};

// ─── Main Component ───

export default function MemoryPathGame({
  difficulty: initialDifficulty = 'Easy',
  onComplete,
  onFinish,
  onGameOver,
}) {
  const { theme, isDarkMode } = useTheme();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // idle | showing | playing | gameover | story
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const [objects, setObjects] = useState([]);
  const [correctObject, setCorrectObject] = useState(null);
  const [currentStory, setCurrentStory] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Press "Start Game" to begin!');

  const timerRef = useRef(null);
  const storyTimerRef = useRef(null);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    };
  }, []);

  // ─── Timer ───
  useEffect(() => {
    if ((gameState === 'story' || gameState === 'playing') && startTime) {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime]);

  // ─── Start Game ───
  const startGame = () => {
    setScore(0);
    setRound(1);
    setDuration(0);
    setStartTime(Date.now());
    setGameState('story');
    setFeedback(null);
    setSelectedObjectId(null);
    setStatusMessage('Listen carefully...');
    startNewRound();
  };

  // ─── Start New Round ───
  const startNewRound = () => {
    const config = LEVELS[difficulty] || LEVELS.Easy;
    const objectKeys = Object.keys(OBJECTS);
    const shuffled = [...objectKeys].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, config.objectCount);
    const correct = selected[Math.floor(Math.random() * selected.length)];

    setObjects(selected);
    setCorrectObject(correct);

    // Pick a story
    const storyPool = STORIES[config.storyComplexity] || STORIES.simple;
    const randomStory = storyPool[Math.floor(Math.random() * storyPool.length)];
    const filledStory = randomStory.story.replace('{object}', OBJECTS[correct].label.toLowerCase());
    setCurrentStory({
      text: filledStory,
      question: randomStory.question,
    });

    setGameState('story');
    setSelectedObjectId(null);
    setFeedback(null);
    setStatusMessage('📖 Reading story...');

    // Auto-advance to playing after story duration
    const storyDuration = difficulty === 'Easy' ? 5000 : difficulty === 'Medium' ? 4000 : 3000;
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    storyTimerRef.current = setTimeout(() => {
      setGameState('playing');
      setStatusMessage('👆 Tap the correct object!');
    }, storyDuration);
  };

  // ─── Handle Object Tap ───
  const handleObjectPress = (objectId) => {
    if (gameState !== 'playing') return;

    setSelectedObjectId(objectId);

    if (objectId === correctObject) {
      // Correct!
      const newScore = score + 1;
      setScore(newScore);
      setFeedback({ type: 'correct', message: '✅ Great job!' });
      setStatusMessage('🎉 Correct!');

      // Move to next round after delay
      setTimeout(() => {
        if (round >= 8) {
          endGame(newScore);
        } else {
          setRound(round + 1);
          startNewRound();
        }
      }, 1200);
    } else {
      // Wrong!
      setFeedback({
        type: 'wrong',
        message: `❌ The correct answer was: ${OBJECTS[correctObject].label}`,
      });
      setStatusMessage('❌ Try again next round!');

      // End game after wrong answer (or let them continue - choose design)
      // This version ends the game on wrong answer (encourages focus)
      setTimeout(() => {
        endGame(score);
      }, 2000);
    }
  };

  // ─── End Game ───
  const endGame = (finalScore) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    setGameState('gameover');
    setStatusMessage('Game Over!');

    const finalDuration = startTime
      ? Math.max(1, Math.floor((Date.now() - startTime) / 1000))
      : duration;

    const result = {
      score: finalScore,
      duration: finalDuration,
      difficulty,
      roundsCompleted: round - 1,
    };

    if (typeof onComplete === 'function') onComplete(result);
    if (typeof onFinish === 'function') onFinish(result);
    if (typeof onGameOver === 'function') onGameOver(result);
  };

  // ─── Render ───
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>🧩 Memory Path</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>ROUND</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{gameState === 'idle' ? '-' : round}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>SCORE</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{score}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>TIME</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{duration}s</Text>
          </View>
        </View>

        {/* Difficulty Selector (idle only) */}
        {gameState === 'idle' && (
          <View style={styles.difficultyContainer}>
            <Text style={[styles.difficultyHeading, { color: theme.subText }]}>Select Difficulty:</Text>
            <View style={styles.difficultyButtons}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyButton,
                    { backgroundColor: isDarkMode ? theme.cardBorder : '#E2E8F0' },
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
            { backgroundColor: isDarkMode ? '#1E293B' : '#E0E7FF' },
            gameState === 'gameover' && styles.statusBannerGameOver,
            gameState === 'playing' && styles.statusBannerPlaying,
          ]}
        >
          <Text style={[styles.statusText, { color: isDarkMode ? '#F8FAFC' : '#1E293B' }]}>
            {statusMessage}
          </Text>
        </View>

        {/* Story Display */}
        {gameState === 'story' && currentStory && (
          <View style={[styles.storyContainer, { backgroundColor: isDarkMode ? '#292524' : '#FEF3C7' }]}>
            <Text style={[styles.storyText, { color: theme.text }]}>📖 {currentStory.text}</Text>
            <Text style={[styles.questionText, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
              ❓ {currentStory.question}
            </Text>
          </View>
        )}

        {/* Objects Grid */}
        {gameState !== 'idle' && gameState !== 'gameover' && (
          <View style={styles.objectsContainer}>
            <View style={styles.objectsGrid}>
              {objects.map((objKey) => (
                <TouchableOpacity
                  key={objKey}
                  style={[
                    styles.objectButton,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.cardBorder,
                      borderWidth: 1,
                    },
                    selectedObjectId === objKey &&
                      (feedback?.type === 'correct'
                        ? styles.objectButtonCorrect
                        : feedback?.type === 'wrong'
                        ? styles.objectButtonWrong
                        : {}),
                    gameState !== 'playing' && styles.objectButtonDisabled,
                  ]}
                  onPress={() => handleObjectPress(objKey)}
                  disabled={gameState !== 'playing'}
                >
                  <Text style={styles.objectEmoji}>{OBJECTS[objKey].emoji}</Text>
                  <Text style={[styles.objectLabel, { color: theme.text }]}>{OBJECTS[objKey].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Feedback */}
        {feedback && (
          <View
            style={[
              styles.feedbackContainer,
              feedback.type === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                feedback.type === 'correct' ? styles.feedbackTextCorrect : styles.feedbackTextWrong,
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        )}

        {/* Game Over Summary */}
        {gameState === 'gameover' && (
          <View style={[styles.gameOverContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.gameOverTitle, { color: theme.text }]}>🏁 Game Over</Text>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>Final Score:</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{score} objects</Text>
            </View>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>Rounds:</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{round - 1}</Text>
            </View>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>Time:</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{duration}s</Text>
            </View>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>Difficulty:</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{difficulty}</Text>
            </View>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            gameState === 'idle' ? styles.actionButtonStart : styles.actionButtonSecondary,
          ]}
          onPress={startGame}
        >
          <Text style={styles.actionButtonText}>
            {gameState === 'idle'
              ? '🎮 Start Game'
              : gameState === 'gameover'
              ? '🔄 Play Again'
              : '🔄 Restart'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  difficultyHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  difficultyButtonActive: {
    backgroundColor: '#6366F1',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  statusBanner: {
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  statusBannerPlaying: {
    backgroundColor: '#D1FAE5',
  },
  statusBannerGameOver: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  storyContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  storyText: {
    fontSize: 20,
    color: '#1E293B',
    lineHeight: 28,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 18,
    color: '#92400E',
    marginTop: 10,
    fontWeight: '600',
  },
  objectsContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  objectButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: '22%',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  objectButtonCorrect: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  objectButtonWrong: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  objectButtonDisabled: {
    opacity: 0.6,
  },
  objectEmoji: {
    fontSize: 32,
  },
  objectLabel: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    textAlign: 'center',
  },
  feedbackContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#D1FAE5',
  },
  feedbackWrong: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackTextCorrect: {
    color: '#065F46',
  },
  feedbackTextWrong: {
    color: '#991B1B',
  },
  gameOverContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E293B',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    alignItems: 'center',
  },
  actionButtonStart: {
    backgroundColor: '#6366F1',
  },
  actionButtonSecondary: {
    backgroundColor: '#94A3B8',
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});