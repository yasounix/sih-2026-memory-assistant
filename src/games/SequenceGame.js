import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const COLORS = [
  {
    id: 'red',
    label: 'Red',
    baseColor: '#EF4444',
    activeColor: '#FCA5A5',
    textColor: '#FFFFFF',
  },
  {
    id: 'blue',
    label: 'Blue',
    baseColor: '#3B82F6',
    activeColor: '#93C5FD',
    textColor: '#FFFFFF',
  },
  {
    id: 'green',
    label: 'Green',
    baseColor: '#10B981',
    activeColor: '#6EE7B7',
    textColor: '#FFFFFF',
  },
  {
    id: 'yellow',
    label: 'Yellow',
    baseColor: '#F59E0B',
    activeColor: '#FDE68A',
    textColor: '#78350F',
  },
];

const DIFFICULTY_SETTINGS = {
  Easy: { flashDuration: 750, pauseDuration: 400 },
  Medium: { flashDuration: 550, pauseDuration: 300 },
  Hard: { flashDuration: 380, pauseDuration: 200 },
};

export default function SequenceGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
}) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'showing' | 'playing' | 'gameover'
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [activeCircle, setActiveCircle] = useState(null);
  const [userTappedCircle, setUserTappedCircle] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Press "Start Game" to begin!');
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  // Clean up all timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  // Duration timer while game is active
  useEffect(() => {
    let interval = null;
    if ((gameState === 'showing' || gameState === 'playing') && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, startTime]);

  // Flash the sequence to the user
  const playSequence = (seqToPlay) => {
    clearAllTimeouts();
    setGameState('showing');
    setActiveCircle(null);
    setUserTappedCircle(null);
    setStatusMessage('Watch the sequence...');

    const settings = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.Easy;
    const { flashDuration, pauseDuration } = settings;
    const initialDelay = 600;

    seqToPlay.forEach((colorId, index) => {
      // Light up the circle
      const onTimeout = setTimeout(() => {
        setActiveCircle(colorId);
      }, initialDelay + index * (flashDuration + pauseDuration));
      timeoutsRef.current.push(onTimeout);

      // Turn off the circle
      const offTimeout = setTimeout(() => {
        setActiveCircle(null);

        // Check if this was the last item in the sequence
        if (index === seqToPlay.length - 1) {
          const readyTimeout = setTimeout(() => {
            setGameState('playing');
            setUserStep(0);
            setStatusMessage('Your turn! Tap the circles in order.');
          }, pauseDuration);
          timeoutsRef.current.push(readyTimeout);
        }
      }, initialDelay + index * (flashDuration + pauseDuration) + flashDuration);
      timeoutsRef.current.push(offTimeout);
    });
  };

  // Start or reset the game
  const startGame = () => {
    clearAllTimeouts();
    const now = Date.now();
    setStartTime(now);
    setDuration(0);
    setScore(0);
    setRound(1);
    setUserStep(0);

    const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
    const initialSeq = [firstColor];
    setSequence(initialSeq);

    playSequence(initialSeq);
  };

  // End game handler
  const handleGameOver = (finalScore) => {
    clearAllTimeouts();
    setGameState('gameover');
    setActiveCircle(null);
    setUserTappedCircle(null);

    const finalDuration = startTime ? Math.max(1, Math.floor((Date.now() - startTime) / 1000)) : duration;
    setDuration(finalDuration);
    setStatusMessage('Game Over! Good try!');

    const result = {
      score: finalScore,
      duration: finalDuration,
      difficulty,
    };

    if (typeof onGameOver === 'function') onGameOver(result);
    if (typeof onFinish === 'function') onFinish(result);
    if (typeof onComplete === 'function') onComplete(result);
  };

  // Handle user tap on a circle
  const handleCirclePress = (colorId) => {
    if (gameState !== 'playing') return;

    // Brief tactile visual feedback for user tap
    setUserTappedCircle(colorId);
    const feedbackTimeout = setTimeout(() => {
      setUserTappedCircle(null);
    }, 250);
    timeoutsRef.current.push(feedbackTimeout);

    const expectedColor = sequence[userStep];

    if (colorId === expectedColor) {
      const nextStep = userStep + 1;

      // Completed the entire sequence for this round!
      if (nextStep === sequence.length) {
        const nextScore = score + 1;
        const nextRound = round + 1;
        setScore(nextScore);
        setRound(nextRound);
        setGameState('showing');
        setStatusMessage('Great job! Get ready for the next color...');

        // Add a new random color to sequence
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
        const nextSequence = [...sequence, randomColor];
        setSequence(nextSequence);

        const nextRoundTimeout = setTimeout(() => {
          playSequence(nextSequence);
        }, 1100);
        timeoutsRef.current.push(nextRoundTimeout);
      } else {
        // Correct tap, advance to next expected step
        setUserStep(nextStep);
      }
    } else {
      // Incorrect tap
      handleGameOver(score);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Sequence Recall</Text>

      {/* Stats Header: Round, Score, Time */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ROUND</Text>
          <Text style={styles.statValue}>{gameState === 'idle' ? '-' : round}</Text>
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
        {gameState === 'playing' && (
          <Text style={styles.progressSubText}>
            Step {userStep + 1} of {sequence.length}
          </Text>
        )}
      </View>

      {/* Circles Grid (2x2) */}
      <View style={styles.gridContainer}>
        <View style={styles.row}>
          {COLORS.slice(0, 2).map((item) => renderCircle(item))}
        </View>
        <View style={styles.row}>
          {COLORS.slice(2, 4).map((item) => renderCircle(item))}
        </View>
      </View>

      {/* Game Over Summary */}
      {gameState === 'gameover' && (
        <View style={styles.gameOverCard}>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Final Score:</Text>
            <Text style={styles.resultValue}>{score} correct rounds</Text>
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

  function renderCircle(item) {
    const isLit = activeCircle === item.id || userTappedCircle === item.id;
    const isInteractive = gameState === 'playing';

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.circle,
          {
            backgroundColor: isLit ? item.activeColor : item.baseColor,
            borderColor: isLit ? '#FFFFFF' : '#1E293B',
            transform: [{ scale: isLit ? 1.08 : 1.0 }],
          },
          isLit && styles.circleActive,
        ]}
        onPress={() => handleCirclePress(item.id)}
        disabled={!isInteractive}
        activeOpacity={0.75}
        accessibilityLabel={`${item.label} circle`}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.circleLabel,
            { color: item.textColor },
            isLit && styles.circleLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyHeading: {
    fontSize: 15,
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
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  statusBannerPlaying: {
    backgroundColor: '#DCFCE7',
  },
  statusBannerGameOver: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  progressSubText: {
    fontSize: 14,
    color: '#166534',
    marginTop: 4,
    fontWeight: '500',
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  circle: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    borderWidth: 3,
    marginHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  circleActive: {
    borderWidth: 4,
    elevation: 10,
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  circleLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  circleLabelActive: {
    fontWeight: '900',
  },
  gameOverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameOverTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resultLabel: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
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

