import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
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
import { useLanguage } from '../context/LanguageContext';

// ─── Game Configuration ───

const LEVELS = {
  Easy: {
    objectCount: 4,
    storyComplexity: 'simple',
    timeBonus: 5,
    description: 'Gentle: 4 Objects • 6s Reading Time',
  },
  Medium: {
    objectCount: 6,
    storyComplexity: 'moderate',
    timeBonus: 3,
    description: 'Standard: 6 Objects • 4.5s Reading Time',
  },
  Hard: {
    objectCount: 8,
    storyComplexity: 'complex',
    timeBonus: 1,
    description: 'Challenging: 8 Objects • 3s Reading Time',
  },
};

// ─── Object Database ───

const OBJECTS = {
  keys: { icon: 'key', label: 'Keys' },
  glasses: { icon: 'glasses', label: 'Glasses' },
  phone: { icon: 'cellphone', label: 'Phone' },
  medicine: { icon: 'pill', label: 'Medicine' },
  wallet: { icon: 'wallet', label: 'Wallet' },
  photo: { icon: 'image', label: 'Photo' },
  flowers: { icon: 'flower', label: 'Flowers' },
  book: { icon: 'book-open-variant', label: 'Book' },
  tea: { icon: 'coffee', label: 'Tea Cup' },
  hat: { icon: 'hat-fedora', label: 'Hat' },
  bag: { icon: 'bag-personal', label: 'Bag' },
  umbrella: { icon: 'umbrella', label: 'Umbrella' },
};

// ─── Story IDs ───

const STORY_IDS = {
  simple: ['s1', 's2', 's3'],
  moderate: ['s4', 's5', 's6'],
  complex: ['s7', 's8', 's9'],
};

// ─── Main Component ───

export default function MemoryPathGame({
  difficulty: initialDifficulty = 'Easy',
  onComplete,
  onFinish,
  onGameOver,
}) {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // idle | showing | playing | gameover | story
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const [objects, setObjects] = useState([]);
  const [correctObject, setCorrectObject] = useState(null);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [statusKey, setStatusKey] = useState('desc');

  const timerRef = useRef(null);
  const storyTimerRef = useRef(null);

  const getObjectLabel = (objKey) => {
    return t(`games.memoryPathGame.objects.${objKey}`) || OBJECTS[objKey]?.label || objKey;
  };

  const getDifficultyDesc = (diff) => {
    if (diff === 'Easy') return t('games.memoryPathGame.easyDesc') || LEVELS.Easy.description;
    if (diff === 'Medium') return t('games.memoryPathGame.mediumDesc') || LEVELS.Medium.description;
    return t('games.memoryPathGame.hardDesc') || LEVELS.Hard.description;
  };

  const getStoryText = () => {
    if (!currentStoryId || !correctObject) return '';
    return t(`games.memoryPathGame.stories.${currentStoryId}_story`, {
      object: getObjectLabel(correctObject).toLowerCase(),
    });
  };

  const getQuestionText = () => {
    if (!currentStoryId) return '';
    return t(`games.memoryPathGame.stories.${currentStoryId}_q`);
  };

  const getStatusText = () => {
    switch (statusKey) {
      case 'listenCarefully':
        return t('games.memoryPathGame.listenCarefully');
      case 'readingStory':
        return t('games.memoryPathGame.readingStory');
      case 'tapCorrectObject':
        return t('games.memoryPathGame.tapCorrectObject');
      case 'correct':
        return t('common.correct');
      case 'tryAgainNext':
        return t('games.memoryPathGame.tryAgainNext');
      case 'gameOver':
        return t('games.memoryPathGame.gameOver');
      case 'desc':
      default:
        return t('games.memoryMatchGame.pressStart');
    }
  };

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
    setStatusKey('listenCarefully');
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

    // Pick a story ID
    const storyPool = STORY_IDS[config.storyComplexity] || STORY_IDS.simple;
    const randomStoryId = storyPool[Math.floor(Math.random() * storyPool.length)];
    setCurrentStoryId(randomStoryId);

    setGameState('story');
    setSelectedObjectId(null);
    setFeedback(null);
    setStatusKey('readingStory');

    // Auto-advance to playing after story duration
    const storyDuration = difficulty === 'Easy' ? 6000 : difficulty === 'Medium' ? 4500 : 3000;
    if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    storyTimerRef.current = setTimeout(() => {
      setGameState('playing');
      setStatusKey('tapCorrectObject');
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
      setFeedback({ type: 'correct' });
      setStatusKey('correct');

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
      });
      setStatusKey('tryAgainNext');

      // End game after wrong answer
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
    setStatusKey('gameOver');

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
          <Text style={[styles.title, { color: theme.text }]}>{t('games.memoryPathGame.title')}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{t('common.round').toUpperCase()}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{gameState === 'idle' ? '-' : round}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{t('common.score').toUpperCase()}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{score}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.statLabel, { color: theme.subText }]}>{t('common.time').toUpperCase()}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{duration}{t('common.seconds')}</Text>
          </View>
        </View>

        {/* Difficulty Selector (idle only) */}
        {gameState === 'idle' && (
          <View style={styles.difficultyContainer}>
            <Text style={[styles.difficultyHeading, { color: theme.subText }]}>
              {t('games.memoryMatchGame.selectDifficulty')}:
            </Text>
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
                    {t(`common.${diff.toLowerCase()}`) || diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.difficultySubtitle, { color: theme.primary }]}>
              {getDifficultyDesc(difficulty)}
            </Text>
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
            {getStatusText()}
          </Text>
        </View>

        {/* Story Display */}
        {gameState === 'story' && currentStoryId && (
          <View style={[styles.storyContainer, { backgroundColor: isDarkMode ? '#292524' : '#FEF3C7' }]}>
            <Text style={[styles.storyText, { color: theme.text }]}>{getStoryText()}</Text>
            <Text style={[styles.questionText, { color: isDarkMode ? '#FCD34D' : '#92400E' }]}>
              {getQuestionText()}
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
                  <MaterialCommunityIcons name={OBJECTS[objKey].icon} size={34} color={theme.primary} style={{ marginBottom: 4 }} />
                  <Text style={[styles.objectLabel, { color: theme.text }]}>{getObjectLabel(objKey)}</Text>
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
              {feedback.type === 'correct'
                ? t('games.supermarketGame.greatJob')
                : t('games.memoryPathGame.correctAnswerWas', { object: getObjectLabel(correctObject) })}
            </Text>
          </View>
        )}

        {/* Game Over Summary */}
        {gameState === 'gameover' && (
          <View style={[styles.gameOverContainer, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: 1 }]}>
            <Text style={[styles.gameOverTitle, { color: theme.text }]}>{t('games.memoryPathGame.gameOver')}</Text>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.memoryPathGame.finalScore')}</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>
                {t('games.memoryPathGame.objectsCount', { count: score })}
              </Text>
            </View>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('games.memoryPathGame.rounds')}</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{round - 1}</Text>
            </View>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('common.time')}:</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>{duration}{t('common.seconds')}</Text>
            </View>
            <View style={[styles.resultRow, { borderBottomColor: theme.cardBorder }]}>
              <Text style={[styles.resultLabel, { color: theme.subText }]}>{t('common.difficulty')}:</Text>
              <Text style={[styles.resultValue, { color: theme.text }]}>
                {t(`common.${difficulty.toLowerCase()}`) || difficulty}
              </Text>
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
              ? t('common.startGame')
              : gameState === 'gameover'
              ? t('common.playAgain')
              : t('common.restartGame')}
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
  difficultySubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
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