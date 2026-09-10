import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { usePatient } from '../context/PatientContext';
import {
  getNextMemoryScene,
  getSceneQuestions,
  recordSceneView,
  recordPerformance,
} from '../modules/database';
import { supabase } from '../modules/supabaseClient';

const DIFFICULTY_CONFIG = {
  Easy: { duration: 8, label: 'Easy (8s observation)' },
  Medium: { duration: 6, label: 'Medium (6s observation)' },
  Hard: { duration: 4, label: 'Hard (4s observation)' },
};

const MAX_QUESTIONS_PER_GAME = 5;

export default function NortheastMemoryGame({
  difficulty: initialDifficulty = 'Easy',
  onGameOver,
  onFinish,
  onComplete,
}) {
  const { theme } = useTheme();
  const { patientId } = usePatient();
  const activePatientId = patientId || 'P001';

  // Game lifecycle states: 'idle' | 'loading' | 'showing' | 'question' | 'feedback' | 'gameover' | 'empty' | 'error'
  const [gameState, setGameState] = useState('idle');
  const [difficulty, setDifficulty] = useState(initialDifficulty);

  // Scene & questions
  const [scene, setScene] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Timing & score
  const [observationTimeLeft, setObservationTimeLeft] = useState(8);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [score, setScore] = useState(0);
  const [gameDuration, setGameDuration] = useState(0);
  const [gameStartTimestamp, setGameStartTimestamp] = useState(0);

  // Feedback state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // Duration tracker during active gameplay
  useEffect(() => {
    if (gameState === 'showing' || gameState === 'question' || gameState === 'feedback') {
      const interval = setInterval(() => {
        setGameDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Helper to resolve public image URL
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const { data } = supabase.storage.from('memory-photos').getPublicUrl(imagePath);
    return data?.publicUrl || null;
  }, []);

  // Parse options safely into a plain array of strings
  const parseOptions = (rawOptions) => {
    if (Array.isArray(rawOptions)) {
      return rawOptions.map(String);
    }
    if (typeof rawOptions === 'string') {
      try {
        const parsed = JSON.parse(rawOptions);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        return rawOptions.split(',').map((s) => s.trim());
      }
    }
    return [];
  };

  // Start the game by loading a new memory scene
  const startGame = async () => {
    setGameState('loading');
    setImageLoadError(false);
    setErrorMessage('');
    setScore(0);
    setGameDuration(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setGameStartTimestamp(Date.now());

    try {
      const nextScene = await getNextMemoryScene(activePatientId);

      if (!nextScene) {
        // Patient has seen all scenes or database is empty
        setGameState('empty');
        return;
      }

      // Fetch questions for this scene
      const sceneQuestions = await getSceneQuestions(nextScene.scene_id);

      if (!sceneQuestions || sceneQuestions.length === 0) {
        // If current scene has no questions yet, mark as seen and inform user
        await recordSceneView(activePatientId, nextScene.scene_id);
        setErrorMessage('This photo does not have questions yet. Please try another.');
        setGameState('error');
        return;
      }

      const activeQuestions = sceneQuestions.slice(0, MAX_QUESTIONS_PER_GAME);
      setScene(nextScene);
      setQuestions(activeQuestions);

      // Record scene view immediately
      await recordSceneView(activePatientId, nextScene.scene_id);

      // Begin observation period
      const obsDuration = DIFFICULTY_CONFIG[difficulty]?.duration || 8;
      setObservationTimeLeft(obsDuration);
      setGameState('showing');
    } catch (err) {
      console.error('Failed to start memory game:', err);
      setErrorMessage('Could not load memory photos. Please check your connection.');
      setGameState('error');
    }
  };

  // Observation countdown timer
  useEffect(() => {
    if (gameState === 'showing') {
      const initialSeconds = DIFFICULTY_CONFIG[difficulty]?.duration || 8;
      setObservationTimeLeft(initialSeconds);

      timerRef.current = setInterval(() => {
        setObservationTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('question');
            setQuestionStartTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, difficulty]);

  // Handle user selecting an answer
  const handleAnswerSelect = async (option) => {
    if (gameState !== 'question') return;

    const responseTimeSeconds = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = String(option).trim().toLowerCase() === String(currentQ.answer).trim().toLowerCase();

    setSelectedAnswer(option);
    setIsLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setGameState('feedback');

    // Record response in background
    try {
      await recordPerformance({
        patient_id: activePatientId,
        scene_id: scene?.scene_id || 'unknown',
        question_id: currentQ.question_id,
        selected_answer: String(option),
        correct_answer: String(currentQ.answer),
        is_correct: isCorrect,
        response_time: responseTimeSeconds,
        difficulty: difficulty,
        game_name: 'North East Memory',
      });
    } catch (recordErr) {
      console.warn('Could not record performance:', recordErr);
    }

    // Move to next question after feedback pause
    feedbackTimeoutRef.current = setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswer(null);
        setQuestionStartTime(Date.now());
        setGameState('question');
      } else {
        // Game complete
        const finalScore = isCorrect ? score + 1 : score;
        setGameState('gameover');
        const summary = {
          score: finalScore,
          total: questions.length,
          difficulty,
          duration: gameDuration,
        };
        onGameOver?.(summary);
        onFinish?.(summary);
        onComplete?.(summary);
      }
    }, 2200);
  };

  // Reset progress so patient can replay scenes
  const handleReplaySeenPhotos = async () => {
    try {
      setGameState('loading');
      await supabase.from('player_scene_history').delete().eq('patient_id', activePatientId);
      startGame();
    } catch (err) {
      console.warn('Could not reset scene history:', err);
      startGame();
    }
  };

  // -------------------------------------------------------------
  // Render: Loading State
  // -------------------------------------------------------------
  if (gameState === 'loading') {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.instructionText, { color: theme.text, marginTop: 24 }]}>
          Loading your next photo...
        </Text>
      </View>
    );
  }

  // -------------------------------------------------------------
  // Render: All Photos Seen (Empty State)
  // -------------------------------------------------------------
  if (gameState === 'empty') {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background, padding: 24 }]}>
        <Ionicons name="trophy-outline" size={64} color={theme.primary} style={{ marginBottom: 16 }} />
        <Text style={[styles.titleText, { color: theme.text, textAlign: 'center' }]}>
          You've seen all photos! Great job!
        </Text>
        <Text style={[styles.subText, { color: theme.subText, marginTop: 12, textAlign: 'center' }]}>
          You have successfully completed every photo in this collection.
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 32 }]}
          onPress={handleReplaySeenPhotos}
        >
          <Text style={[styles.primaryButtonText, { color: theme.cardBackground }]}>
            Play Again (Review All)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
          onPress={() => onFinish?.()}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Back to Games</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------
  // Render: Error State
  // -------------------------------------------------------------
  if (gameState === 'error') {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background, padding: 24 }]}>
        <Ionicons name="alert-circle-outline" size={56} color={theme.subText} style={{ marginBottom: 16 }} />
        <Text style={[styles.titleText, { color: theme.text, textAlign: 'center' }]}>
          Something went wrong
        </Text>
        <Text style={[styles.subText, { color: theme.subText, marginTop: 12, textAlign: 'center' }]}>
          {errorMessage || 'Unable to load photo details. Please check your connection.'}
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 32 }]}
          onPress={startGame}
        >
          <Text style={[styles.primaryButtonText, { color: theme.cardBackground }]}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
          onPress={() => setGameState('idle')}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------------------
  // Render: Idle State (Difficulty & Start)
  // -------------------------------------------------------------
  if (gameState === 'idle') {
    return (
      <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <Text style={[styles.titleText, { color: theme.text }]}>
            🏞️ North East Memory
          </Text>
          <Text style={[styles.subText, { color: theme.subText, marginTop: 10 }]}>
            Observe calming scenes from North East India and test your short-term memory.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Difficulty</Text>

          {['Easy', 'Medium', 'Hard'].map((lvl) => {
            const isSelected = difficulty === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                    borderColor: isSelected ? theme.primary : theme.cardBorder,
                    marginTop: 12,
                  },
                ]}
                onPress={() => setDifficulty(lvl)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    { color: isSelected ? theme.cardBackground : theme.text },
                  ]}
                >
                  {DIFFICULTY_CONFIG[lvl].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 24 }]}
          onPress={startGame}
        >
          <Text style={[styles.primaryButtonText, { color: theme.cardBackground }]}>
            Start Game
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // Render: Showing State (Photo Display with Calm 0.5 Opacity)
  // -------------------------------------------------------------
  if (gameState === 'showing') {
    const photoUrl = getImageUrl(scene?.image_path);

    return (
      <View style={[styles.container, { backgroundColor: theme.background, padding: 16 }]}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, alignItems: 'center' }]}>
          <Text style={[styles.titleText, { color: theme.text }]}>
            Take your time. Look carefully.
          </Text>
          <Text style={[styles.timerBadgeText, { color: theme.primary, marginTop: 8 }]}>
            Time remaining: {observationTimeLeft}s
          </Text>
        </View>

        <View style={[styles.imageWrapper, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}>
          {photoUrl && !imageLoadError ? (
            <Image
              source={{ uri: photoUrl }}
              style={[styles.sceneImage, { opacity: 0.5 }]}
              resizeMode="cover"
              onError={() => setImageLoadError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color={theme.subText} />
              <Text style={[styles.subText, { color: theme.subText, marginTop: 12 }]}>
                Scenic memory photo
              </Text>
            </View>
          )}
        </View>

        {scene?.description ? (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}>
            <Text style={[styles.captionText, { color: theme.subText, textAlign: 'center' }]}>
              {scene.description}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  // -------------------------------------------------------------
  // Render: Question & Feedback States
  // -------------------------------------------------------------
  if (gameState === 'question' || gameState === 'feedback') {
    const currentQ = questions[currentQuestionIndex];
    const options = parseOptions(currentQ?.options);

    return (
      <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.background }]}>
        {/* Question Header Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
          <View style={styles.rowBetween}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <Text style={[styles.badgeText, { color: theme.subText }]}>
              Score: {score}
            </Text>
          </View>

          <Text style={[styles.questionText, { color: theme.text, marginTop: 16 }]}>
            {currentQ?.question || 'What did you observe in the picture?'}
          </Text>
        </View>

        {/* Options List */}
        <View style={{ marginTop: 16 }}>
          {options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const isCorrectOption =
              String(opt).trim().toLowerCase() === String(currentQ?.answer).trim().toLowerCase();

            let optionBg = theme.cardBackground;
            let optionBorder = theme.cardBorder;
            let optionTextColor = theme.text;

            if (gameState === 'feedback') {
              if (isSelected && isLastAnswerCorrect) {
                optionBg = theme.primary;
                optionBorder = theme.primary;
                optionTextColor = theme.cardBackground;
              } else if (isSelected && !isLastAnswerCorrect) {
                optionBg = theme.cardBorder;
                optionBorder = theme.subText;
                optionTextColor = theme.text;
              } else if (isCorrectOption) {
                optionBg = theme.cardBackground;
                optionBorder = theme.primary;
                optionTextColor = theme.primary;
              }
            }

            return (
              <TouchableOpacity
                key={`${opt}-${idx}`}
                disabled={gameState === 'feedback'}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: optionBg,
                    borderColor: optionBorder,
                    marginBottom: 14,
                  },
                ]}
                onPress={() => handleAnswerSelect(opt)}
              >
                <Text style={[styles.optionButtonText, { color: optionTextColor }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback Message Card */}
        {gameState === 'feedback' && (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 8 }]}>
            <Text
              style={[
                styles.feedbackText,
                { color: isLastAnswerCorrect ? theme.primary : theme.text, textAlign: 'center' },
              ]}
            >
              {isLastAnswerCorrect
                ? '✨ Correct! Well done!'
                : `That's okay! Correct answer: ${currentQ?.answer}`}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  // -------------------------------------------------------------
  // Render: Game Over State
  // -------------------------------------------------------------
  if (gameState === 'gameover') {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background, padding: 24 }]}>
        <Ionicons name="checkmark-circle-outline" size={72} color={theme.primary} style={{ marginBottom: 16 }} />
        <Text style={[styles.titleText, { color: theme.text, textAlign: 'center' }]}>
          Game Complete!
        </Text>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, width: '100%', marginTop: 24 }]}>
          <Text style={[styles.scoreSummaryText, { color: theme.text, textAlign: 'center' }]}>
            Final Score: {score} / {questions.length}
          </Text>
          <Text style={[styles.subText, { color: theme.subText, marginTop: 8, textAlign: 'center' }]}>
            Difficulty: {difficulty} · Time: {gameDuration}s
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary, marginTop: 32 }]}
          onPress={startGame}
        >
          <Text style={[styles.primaryButtonText, { color: theme.cardBackground }]}>
            Play Next Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, marginTop: 16 }]}
          onPress={() => onFinish?.()}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
            Back to Games
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 20,
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 22,
    textAlign: 'center',
  },
  timerBadgeText: {
    fontSize: 22,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
  badgeText: {
    fontSize: 20,
    fontWeight: '600',
  },
  captionText: {
    fontSize: 20,
    fontStyle: 'italic',
  },
  feedbackText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scoreSummaryText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sceneImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionButtonText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 60,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});

