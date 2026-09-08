import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Screen states
const SCREENS = {
  WELCOME: 'welcome',
  DIFFICULTY: 'difficulty',
  INSTRUCTIONS: 'instructions',
  PLAYING: 'playing',
  RECALL: 'recall',
  FEEDBACK: 'feedback',
  SETTINGS: 'settings',
};

// Difficulty specifications
const LEVELS = {
  easy: {
    id: 'easy',
    name: 'GENTLE DHOP',
    badge: 'Level 1 · Easy',
    subtitle: '2 passes · Very slow pace',
    moves: 2,
    holdDuration: 2400,
    travelDuration: 1800,
    dots: 2,
    description: 'A very gentle sequence with generous observation time. No rush.',
  },
  medium: {
    id: 'medium',
    name: 'DHOP MEMORY',
    badge: 'Level 2 · Medium',
    subtitle: '4 passes · Calm sequence',
    moves: 4,
    holdDuration: 2000,
    travelDuration: 1500,
    dots: 4,
    description: 'A few more passes to practice short-term recall. Still slow and steady.',
  },
  hard: {
    id: 'hard',
    name: 'DHOP MASTER',
    badge: 'Level 3 · Hard',
    subtitle: '6 passes · Memory challenge',
    moves: 6,
    holdDuration: 1800,
    travelDuration: 1400,
    dots: 6,
    description: 'More passes for a deeper memory exercise. Speed stays calm and comfortable.',
  },
};

// Player details (distinguishable, respectful, dignified)
const PLAYERS = [
  {
    id: 1,
    name: 'PLAYER 1',
    label: 'Player 1',
    color: '#059669', // Emerald
    bgLight: '#D1FAE5',
    bgDark: '#064E3B',
    accentText: '#065F46',
  },
  {
    id: 2,
    name: 'PLAYER 2',
    label: 'Player 2',
    color: '#2563EB', // Blue
    bgLight: '#DBEAFE',
    bgDark: '#1E3A8A',
    accentText: '#1E40AF',
  },
  {
    id: 3,
    name: 'PLAYER 3',
    label: 'Player 3',
    color: '#D97706', // Amber / Terracotta
    bgLight: '#FEF3C7',
    bgDark: '#78350F',
    accentText: '#92400E',
  },
];

/* -------------------------------------------------------------
   Visual Subcomponents
------------------------------------------------------------- */

// Soft Assamese Dhop ball
function DhopBall({ size = 46, contrast = 'normal' }) {
  const isHighContrast = contrast === 'high';
  const mainColor = isHighContrast ? '#FFFF00' : '#DC2626';
  const borderColor = isHighContrast ? '#000000' : '#991B1B';
  const stitchColor = isHighContrast ? '#000000' : '#FEE2E2';

  return (
    <View
      style={[
        styles.dhopContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: mainColor,
          borderColor: borderColor,
          borderWidth: isHighContrast ? 3 : 2,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel="Dhop ball"
    >
      {/* Traditional cloth quarter-stitching details */}
      <View
        style={[
          styles.dhopInnerRing,
          {
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: (size * 0.62) / 2,
            borderColor: stitchColor,
          },
        ]}
      />
      <View
        style={[
          styles.dhopStitchHorizontal,
          {
            width: size * 0.75,
            backgroundColor: stitchColor,
          },
        ]}
      />
      <View
        style={[
          styles.dhopStitchVertical,
          {
            height: size * 0.75,
            backgroundColor: stitchColor,
          },
        ]}
      />
      {/* Soft cloth highlight */}
      <View
        style={[
          styles.dhopHighlight,
          {
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: (size * 0.22) / 2,
            backgroundColor: isHighContrast ? '#FFFFFF' : '#FEF2F2',
          },
        ]}
      />
    </View>
  );
}

// Respectful adult/elderly player avatar
function PlayerAvatar({
  player,
  hasDhop = false,
  isTarget = false,
  contrast = 'normal',
  isDarkMode = false,
  scale = 1,
}) {
  const isHighContrast = contrast === 'high';
  const avatarSize = 92 * scale;
  const numBadgeSize = 34 * scale;

  return (
    <View style={[styles.avatarWrapper, { width: avatarSize + 24 }]}>
      {/* Halo highlight if holding the Dhop */}
      <View
        style={[
          styles.avatarCircle,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: isHighContrast
              ? '#111827'
              : isDarkMode
              ? player.bgDark
              : player.bgLight,
            borderColor: hasDhop
              ? isHighContrast
                ? '#FFFF00'
                : player.color
              : isHighContrast
              ? '#FFFFFF'
              : player.color,
            borderWidth: hasDhop ? 4 : 2,
            shadowColor: hasDhop ? player.color : '#000',
            shadowOpacity: hasDhop ? 0.35 : 0.1,
            shadowRadius: hasDhop ? 8 : 4,
            elevation: hasDhop ? 6 : 2,
          },
        ]}
      >
        {/* Stylized serene face & shoulders */}
        <View style={styles.characterContainer}>
          {/* Head & gentle hair */}
          <View
            style={[
              styles.characterHead,
              {
                backgroundColor: isHighContrast
                  ? '#374151'
                  : isDarkMode
                  ? '#4B5563'
                  : '#E2E8F0',
                borderColor: player.color,
              },
            ]}
          >
            {/* Mature gray hair cap */}
            <View
              style={[
                styles.characterHair,
                {
                  backgroundColor: isHighContrast ? '#FFFFFF' : '#CBD5E1',
                },
              ]}
            />
            {/* Friendly calm eyes */}
            <View style={styles.characterEyesRow}>
              <View
                style={[
                  styles.characterEye,
                  { backgroundColor: isHighContrast ? '#FFFF00' : '#1E293B' },
                ]}
              />
              <View
                style={[
                  styles.characterEye,
                  { backgroundColor: isHighContrast ? '#FFFF00' : '#1E293B' },
                ]}
              />
            </View>
          </View>
          {/* Shoulders / dignified shirt in player color */}
          <View
            style={[
              styles.characterShoulders,
              {
                backgroundColor: player.color,
              },
            ]}
          />
        </View>

        {/* Prominent Number Badge */}
        <View
          style={[
            styles.playerNumBadge,
            {
              width: numBadgeSize,
              height: numBadgeSize,
              borderRadius: numBadgeSize / 2,
              backgroundColor: player.color,
              borderColor: '#FFFFFF',
              borderWidth: 2,
            },
          ]}
        >
          <Text style={[styles.playerNumText, { fontSize: 18 * scale }]}>
            {player.id}
          </Text>
        </View>
      </View>

      {/* Player Label */}
      <View
        style={[
          styles.playerLabelContainer,
          {
            backgroundColor: hasDhop
              ? player.color
              : isHighContrast
              ? '#1E293B'
              : isDarkMode
              ? '#334155'
              : '#F1F5F9',
            borderColor: player.color,
            borderWidth: hasDhop ? 2 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.playerLabelText,
            {
              color: hasDhop
                ? '#FFFFFF'
                : isHighContrast
                ? '#FFFF00'
                : isDarkMode
                ? '#F8FAFC'
                : '#0F172A',
              fontSize: 14 * scale,
              fontWeight: hasDhop ? 'bold' : '600',
            },
          ]}
        >
          {player.name}
        </Text>
      </View>
    </View>
  );
}

// Calm Assam landscape background (soft green hills & sky, secondary & uncluttered)
function AssamLandscape({ contrast = 'normal', isDarkMode = false }) {
  if (contrast === 'high') {
    return <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000000' }]} />;
  }

  const skyColor = isDarkMode ? '#0F172A' : '#ECFDF5'; // Soft daylight mint
  const hillFar = isDarkMode ? '#1E293B' : '#A7F3D0';  // Distant gentle rolling hill
  const hillNear = isDarkMode ? '#14532D' : '#6EE7B7'; // Near meadow field
  const fieldFloor = isDarkMode ? '#064E3B' : '#34D399';

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: skyColor }]} pointerEvents="none">
      {/* Sun / soft warm daylight */}
      <View
        style={[
          styles.landscapeSun,
          { backgroundColor: isDarkMode ? '#334155' : '#FEF3C7' },
        ]}
      />
      {/* Distant gentle hill */}
      <View
        style={[
          styles.landscapeHillFar,
          { backgroundColor: hillFar },
        ]}
      />
      {/* Closer green meadow */}
      <View
        style={[
          styles.landscapeHillNear,
          { backgroundColor: hillNear },
        ]}
      />
      {/* Clean open playing field floor */}
      <View
        style={[
          styles.landscapeFloor,
          { backgroundColor: fieldFloor },
        ]}
      />
    </View>
  );
}

// Spoken voice caption banner
function VoiceCaption({ text, enabled = true, contrast = 'normal' }) {
  if (!text || !enabled) return null;
  const isHighContrast = contrast === 'high';

  return (
    <View
      style={[
        styles.voiceCaptionContainer,
        {
          backgroundColor: isHighContrast ? '#000000' : '#1E293B',
          borderColor: isHighContrast ? '#FFFF00' : '#334155',
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Voice instruction: ${text}`}
    >
      <Ionicons
        name="volume-medium"
        size={22}
        color={isHighContrast ? '#FFFF00' : '#38BDF8'}
        style={{ marginRight: 8 }}
      />
      <Text
        style={[
          styles.voiceCaptionText,
          { color: isHighContrast ? '#FFFF00' : '#F8FAFC' },
        ]}
      >
        "{text}"
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------
   Main DhopkhelGame Component
------------------------------------------------------------- */
export default function DhopkhelGame({ onExit }) {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();

  // Navigation screen
  const [screen, setScreen] = useState(SCREENS.WELCOME);

  // Difficulty
  const [selectedLevel, setSelectedLevel] = useState('easy');

  // Accessibility settings state
  const [textSize, setTextSize] = useState('large'); // 'large' | 'extraLarge'
  const [buttonSize, setButtonSize] = useState('large'); // 'large' | 'extraLarge'
  const [audio, setAudio] = useState(true); // true | false
  const [animationSpeed, setAnimationSpeed] = useState('slow'); // 'slow' | 'normal'
  const [contrast, setContrast] = useState('normal'); // 'normal' | 'high'

  // Gameplay state
  const [moveSequence, setMoveSequence] = useState([]); // e.g. [1, 2, 3]
  const [stepIndex, setStepIndex] = useState(0);
  const [currentHolder, setCurrentHolder] = useState(1);
  const [isBallVisible, setIsBallVisible] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [voiceText, setVoiceText] = useState("Let's play together.");
  const [userChoice, setUserChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [roundStats, setRoundStats] = useState({ roundsCompleted: 0 });

  // Timers ref for safe cleanup
  const activeTimers = useRef([]);

  // Ball animation value (coordinates relative to playing field)
  const ballPosAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ballOpacityAnim = useRef(new Animated.Value(1)).current;

  // Clear pending timers safely
  const clearTimers = useCallback(() => {
    activeTimers.current.forEach((tId) => clearTimeout(tId));
    activeTimers.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Accessibility multipliers
  const fontScale = textSize === 'extraLarge' ? 1.22 : 1.0;
  const btnScale = buttonSize === 'extraLarge' ? 1.2 : 1.0;
  const animMultiplier = animationSpeed === 'slow' ? 1.5 : 1.0;

  // Derived color scheme
  const colors = useMemo(() => {
    if (contrast === 'high') {
      return {
        bg: '#000000',
        cardBg: '#121212',
        cardBorder: '#FFFF00',
        text: '#FFFF00',
        subText: '#FFFFFF',
        primary: '#00FF66',
        primaryText: '#000000',
        accent: '#FFD700',
        btnText: '#000000',
        divider: '#FFFF00',
      };
    }
    return {
      bg: isDarkMode ? '#0B1320' : '#F0FDF4',
      cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
      cardBorder: isDarkMode ? '#334155' : '#E2E8F0',
      text: isDarkMode ? '#F8FAFC' : '#0F172A',
      subText: isDarkMode ? '#94A3B8' : '#475569',
      primary: '#059669',
      primaryText: '#FFFFFF',
      accent: '#D97706',
      btnText: '#FFFFFF',
      divider: isDarkMode ? '#334155' : '#CBD5E1',
    };
  }, [contrast, isDarkMode]);

  // Speech helper (uses Web Speech API if in web browser, or visual caption)
  const speakText = useCallback(
    (phrase) => {
      setVoiceText(phrase);
      if (!audio) return;
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.rate = 0.85; // Calm, slow pace
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          // Graceful fallback
        }
      }
    },
    [audio]
  );

  // Generate a random valid passing sequence
  // Easy: 2 passes (3 holders, e.g. 1 -> 2 -> 3)
  // Medium: 4 passes (5 holders, e.g. 1 -> 3 -> 2 -> 1 -> 3)
  // Hard: 6 passes (7 holders)
  const generateSequence = useCallback((levelKey) => {
    const config = LEVELS[levelKey] || LEVELS.easy;
    const numMoves = config.moves;
    // Start with a random player (1, 2, or 3)
    let current = Math.floor(Math.random() * 3) + 1;
    const seq = [current];

    for (let i = 0; i < numMoves; i++) {
      // Pick a different player to pass to
      const choices = [1, 2, 3].filter((p) => p !== current);
      const next = choices[Math.floor(Math.random() * choices.length)];
      seq.push(next);
      current = next;
    }
    return seq;
  }, []);

  // Player positions on the gameplay stage (layout coordinates)
  // Player 1: Top center
  // Player 2: Bottom left
  // Player 3: Bottom right
  const stagePositions = useMemo(() => {
    return {
      1: { x: 0, y: -95 },
      2: { x: -95, y: 85 },
      3: { x: 95, y: 85 },
    };
  }, []);

  // Start a round
  const handleStartRound = useCallback(
    (levelKey = selectedLevel) => {
      clearTimers();
      const seq = generateSequence(levelKey);
      setMoveSequence(seq);
      setStepIndex(0);
      setCurrentHolder(seq[0]);
      setIsBallVisible(true);
      ballOpacityAnim.setValue(1);

      // Place ball at starting player
      const startCoord = stagePositions[seq[0]];
      ballPosAnim.setValue(startCoord);

      setScreen(SCREENS.PLAYING);
      setStatusMessage(`Observation: Dhop starts with Player ${seq[0]}.`);
      speakText('Watch the ball carefully.');

      const config = LEVELS[levelKey];
      const holdTime = config.holdDuration * animMultiplier;
      const travelTime = config.travelDuration * animMultiplier;

      // Schedule sequence transitions
      let accumulatedTime = holdTime;

      for (let move = 1; move < seq.length; move++) {
        const fromPlayer = seq[move - 1];
        const toPlayer = seq[move];
        const moveNum = move;

        // Schedule pass start
        const passTimer = setTimeout(() => {
          setStepIndex(moveNum);
          setStatusMessage(`Player ${fromPlayer} passes to Player ${toPlayer}.`);
          speakText(`Player ${fromPlayer} to Player ${toPlayer}.`);

          const targetCoord = stagePositions[toPlayer];
          Animated.timing(ballPosAnim, {
            toValue: targetCoord,
            duration: travelTime,
            useNativeDriver: false,
          }).start(() => {
            setCurrentHolder(toPlayer);
          });
        }, accumulatedTime);

        activeTimers.current.push(passTimer);
        accumulatedTime += travelTime + holdTime;
      }

      // After all passes complete, transition to memory pause & recall
      const endTimer = setTimeout(() => {
        setStatusMessage('Remember who has the Dhop...');
        speakText('Remember who has the Dhop.');

        // Gentle fade-out of the Dhop ball
        Animated.timing(ballOpacityAnim, {
          toValue: 0,
          duration: 900 * animMultiplier,
          useNativeDriver: false,
        }).start(() => {
          setIsBallVisible(false);

          // Transition to Recall screen
          const recallTimer = setTimeout(() => {
            setScreen(SCREENS.RECALL);
            speakText('Who has the Dhop?');
          }, 700 * animMultiplier);
          activeTimers.current.push(recallTimer);
        });
      }, accumulatedTime);

      activeTimers.current.push(endTimer);
    },
    [
      selectedLevel,
      clearTimers,
      generateSequence,
      stagePositions,
      ballPosAnim,
      ballOpacityAnim,
      animMultiplier,
      speakText,
    ]
  );

  // User submits guess on Recall screen
  const handleAnswer = useCallback(
    (chosenPlayerId) => {
      setUserChoice(chosenPlayerId);
      const finalHolder = moveSequence[moveSequence.length - 1];
      const correct = chosenPlayerId === finalHolder;
      setIsCorrect(correct);

      if (correct) {
        setRoundStats((prev) => ({ roundsCompleted: prev.roundsCompleted + 1 }));
        speakText('Well done! Great memory!');
      } else {
        speakText("That's okay. Let's try again.");
      }

      setScreen(SCREENS.FEEDBACK);
    },
    [moveSequence, speakText]
  );

  // Replay current round with fresh sequence
  const handleTryAgain = useCallback(() => {
    handleStartRound(selectedLevel);
  }, [handleStartRound, selectedLevel]);

  // Back button handler
  const handleHeaderBack = useCallback(() => {
    clearTimers();
    if (screen === SCREENS.WELCOME) {
      if (onExit) onExit();
    } else if (screen === SCREENS.DIFFICULTY) {
      setScreen(SCREENS.WELCOME);
      speakText("Let's play together.");
    } else if (screen === SCREENS.INSTRUCTIONS) {
      setScreen(SCREENS.DIFFICULTY);
    } else if (screen === SCREENS.PLAYING || screen === SCREENS.RECALL) {
      setScreen(SCREENS.DIFFICULTY);
    } else if (screen === SCREENS.FEEDBACK) {
      setScreen(SCREENS.DIFFICULTY);
    } else if (screen === SCREENS.SETTINGS) {
      setScreen(SCREENS.WELCOME);
    }
  }, [screen, onExit, clearTimers, speakText]);

  /* -----------------------------------------------------------
     Screen 1: WELCOME
  ----------------------------------------------------------- */
  const renderWelcome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Hero Badge */}
      <View
        style={[
          styles.taglineBadge,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Ionicons name="sparkles" size={16} color={colors.accent} style={{ marginRight: 6 }} />
        <Text style={[styles.taglineText, { color: colors.subText, fontSize: 13 * fontScale }]}>
          Watch · Remember · Find the Dhop
        </Text>
      </View>

      {/* Main Title */}
      <Text style={[styles.mainTitle, { color: colors.text, fontSize: 32 * fontScale }]}>
        DHOPKHEL MEMORY
      </Text>
      <Text style={[styles.mainSubtitle, { color: colors.primary, fontSize: 19 * fontScale }]}>
        A Gentle Memory Game
      </Text>
      <Text style={[styles.culturalNotice, { color: colors.subText, fontSize: 14 * fontScale }]}>
        Inspired by Dhopkhel, Assam
      </Text>

      {/* Visual illustration of Dhop & 3 Players */}
      <View
        style={[
          styles.welcomeHeroCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.welcomeDhopHero}>
          <DhopBall size={64} contrast={contrast} />
          <Text
            style={[
              styles.dhopBallLabel,
              { color: colors.text, fontSize: 15 * fontScale, marginTop: 10 },
            ]}
          >
            The Soft Dhop Ball
          </Text>
        </View>

        <View style={styles.heroPlayersRow}>
          {PLAYERS.map((p) => (
            <PlayerAvatar
              key={p.id}
              player={p}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.78}
            />
          ))}
        </View>
      </View>

      {/* Spoken voice cue */}
      <VoiceCaption text={voiceText} enabled={audio} contrast={contrast} />

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[
          styles.largePrimaryBtn,
          {
            backgroundColor: colors.primary,
            paddingVertical: 18 * btnScale,
          },
        ]}
        onPress={() => {
          setScreen(SCREENS.DIFFICULTY);
          speakText('Choose your difficulty level.');
        }}
        accessibilityRole="button"
        accessibilityLabel="Play Dhopkhel Memory"
      >
        <Ionicons name="play" size={26 * btnScale} color={colors.btnText} style={{ marginRight: 10 }} />
        <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 22 * fontScale }]}>
          PLAY
        </Text>
      </TouchableOpacity>

      {/* Settings & Accessibility link */}
      <TouchableOpacity
        style={[
          styles.secondaryBtn,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
            marginTop: 14,
            paddingVertical: 14 * btnScale,
          },
        ]}
        onPress={() => setScreen(SCREENS.SETTINGS)}
        accessibilityRole="button"
        accessibilityLabel="Accessibility Settings and About"
      >
        <Ionicons name="settings-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
        <Text style={[styles.secondaryBtnText, { color: colors.text, fontSize: 16 * fontScale }]}>
          Accessibility & Settings
        </Text>
      </TouchableOpacity>

      {/* Medical disclaimer note */}
      <Text style={[styles.disclaimerSmall, { color: colors.subText, fontSize: 12 * fontScale }]}>
        Cognitive memory-support practice. Not a medical diagnostic tool or treatment.
      </Text>
    </ScrollView>
  );

  /* -----------------------------------------------------------
     Screen 2: DIFFICULTY SELECTION
  ----------------------------------------------------------- */
  const renderDifficulty = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 26 * fontScale }]}>
        SELECT DIFFICULTY
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.subText, fontSize: 16 * fontScale }]}>
        Choose the pace that feels most comfortable:
      </Text>

      {Object.values(LEVELS).map((lvl) => {
        const isSelected = selectedLevel === lvl.id;
        return (
          <TouchableOpacity
            key={lvl.id}
            style={[
              styles.levelCard,
              {
                backgroundColor: isSelected
                  ? isDarkMode
                    ? '#064E3B'
                    : '#D1FAE5'
                  : colors.cardBg,
                borderColor: isSelected ? colors.primary : colors.cardBorder,
                borderWidth: isSelected ? 3 : 1.5,
                paddingVertical: 18 * btnScale,
              },
            ]}
            onPress={() => {
              setSelectedLevel(lvl.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${lvl.name}, ${lvl.badge}. ${lvl.description}`}
          >
            <View style={styles.levelCardHeader}>
              <View>
                <Text
                  style={[
                    styles.levelBadgeText,
                    { color: colors.primary, fontSize: 13 * fontScale },
                  ]}
                >
                  {lvl.badge}
                </Text>
                <Text
                  style={[
                    styles.levelTitleText,
                    { color: colors.text, fontSize: 22 * fontScale },
                  ]}
                >
                  {lvl.name}
                </Text>
              </View>

              {/* Step dots visual */}
              <View style={styles.dotsRow}>
                {Array.from({ length: lvl.dots }).map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.subText,
                        width: 10 * fontScale,
                        height: 10 * fontScale,
                        borderRadius: (10 * fontScale) / 2,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            <Text
              style={[
                styles.levelSubtitleText,
                { color: colors.subText, fontSize: 15 * fontScale, marginTop: 6 },
              ]}
            >
              {lvl.subtitle}
            </Text>
            <Text
              style={[
                styles.levelDescText,
                { color: colors.subText, fontSize: 13 * fontScale, marginTop: 4 },
              ]}
            >
              {lvl.description}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[
          styles.largePrimaryBtn,
          {
            backgroundColor: colors.primary,
            marginTop: 20,
            paddingVertical: 18 * btnScale,
          },
        ]}
        onPress={() => {
          setScreen(SCREENS.INSTRUCTIONS);
          speakText('Watch the ball carefully. Remember who has the Dhop.');
        }}
        accessibilityRole="button"
        accessibilityLabel="Continue to instructions"
      >
        <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 20 * fontScale }]}>
          CONTINUE
        </Text>
        <Ionicons name="arrow-forward" size={24} color={colors.btnText} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </ScrollView>
  );

  /* -----------------------------------------------------------
     Screen 3: INSTRUCTIONS
  ----------------------------------------------------------- */
  const renderInstructions = () => {
    const activeLevelObj = LEVELS[selectedLevel];
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 26 * fontScale }]}>
          HOW TO PLAY
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.primary, fontSize: 17 * fontScale }]}>
          {activeLevelObj.name} · {activeLevelObj.subtitle}
        </Text>

        <View
          style={[
            styles.instructionBox,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Step 1 */}
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
                WATCH THE DHOP.
              </Text>
              <Text style={[styles.stepDesc, { color: colors.subText, fontSize: 14 * fontScale }]}>
                The red cloth ball will slowly move between the three players.
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumCircle, { backgroundColor: colors.accent }]}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
                REMEMBER WHO HAS IT.
              </Text>
              <Text style={[styles.stepDesc, { color: colors.subText, fontSize: 14 * fontScale }]}>
                Notice which player holds the Dhop when the passes finish.
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.instructionStep}>
            <View style={[styles.stepNumCircle, { backgroundColor: '#2563EB' }]}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: colors.text, fontSize: 18 * fontScale }]}>
                TAP THE PLAYER.
              </Text>
              <Text style={[styles.stepDesc, { color: colors.subText, fontSize: 14 * fontScale }]}>
                The Dhop will hide. Choose Player 1, Player 2, or Player 3.
              </Text>
            </View>
          </View>
        </View>

        {/* Voice caption */}
        <VoiceCaption text="Watch the ball carefully. Remember who has the Dhop." enabled={audio} contrast={contrast} />

        <TouchableOpacity
          style={[
            styles.largePrimaryBtn,
            {
              backgroundColor: colors.primary,
              marginTop: 20,
              paddingVertical: 18 * btnScale,
            },
          ]}
          onPress={() => handleStartRound(selectedLevel)}
          accessibilityRole="button"
          accessibilityLabel="Start the game now"
        >
          <Ionicons name="play" size={24} color={colors.btnText} style={{ marginRight: 8 }} />
          <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 22 * fontScale }]}>
            START
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* -----------------------------------------------------------
     Screen 4: PLAYING (Observation Stage)
  ----------------------------------------------------------- */
  const renderPlaying = () => {
    return (
      <View style={styles.playingContainer}>
        {/* Landscape scenery */}
        <AssamLandscape contrast={contrast} isDarkMode={isDarkMode} />

        {/* Status card at top */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: colors.text, fontSize: 17 * fontScale }]}>
            {statusMessage}
          </Text>
          <Text style={[styles.statusSub, { color: colors.subText, fontSize: 13 * fontScale }]}>
            Move {stepIndex} of {LEVELS[selectedLevel].moves}
          </Text>
        </View>

        {/* Interactive Field with 3 Players */}
        <View style={styles.playingField}>
          {/* Player 1 (Top Center) */}
          <View style={styles.playerPosTop}>
            <PlayerAvatar
              player={PLAYERS[0]}
              hasDhop={currentHolder === 1 && isBallVisible}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.92}
            />
          </View>

          {/* Player 2 (Bottom Left) & Player 3 (Bottom Right) */}
          <View style={styles.playerPosBottomRow}>
            <PlayerAvatar
              player={PLAYERS[1]}
              hasDhop={currentHolder === 2 && isBallVisible}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.92}
            />
            <PlayerAvatar
              player={PLAYERS[2]}
              hasDhop={currentHolder === 3 && isBallVisible}
              contrast={contrast}
              isDarkMode={isDarkMode}
              scale={0.92}
            />
          </View>

          {/* Animated Dhop Ball */}
          {isBallVisible && (
            <Animated.View
              style={[
                styles.animatedDhop,
                {
                  transform: [
                    { translateX: ballPosAnim.x },
                    { translateY: ballPosAnim.y },
                  ],
                  opacity: ballOpacityAnim,
                },
              ]}
              pointerEvents="none"
            >
              <DhopBall size={50} contrast={contrast} />
            </Animated.View>
          )}
        </View>

        {/* Voice caption at bottom */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <VoiceCaption text={voiceText} enabled={audio} contrast={contrast} />
        </View>
      </View>
    );
  };

  /* -----------------------------------------------------------
     Screen 5: RECALL ("WHO HAS THE DHOP?")
  ----------------------------------------------------------- */
  const renderRecall = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header prompt */}
      <View
        style={[
          styles.recallPromptCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.recallDhopIcon}>
          <DhopBall size={54} contrast={contrast} />
        </View>
        <Text style={[styles.recallTitle, { color: colors.text, fontSize: 26 * fontScale }]}>
          WHO HAS THE DHOP?
        </Text>
        <Text style={[styles.recallSubtitle, { color: colors.subText, fontSize: 16 * fontScale }]}>
          Tap the player who was holding the ball:
        </Text>
      </View>

      {/* Voice caption */}
      <VoiceCaption text="Who has the Dhop?" enabled={audio} contrast={contrast} />

      {/* Three large answer buttons */}
      <View style={styles.answersContainer}>
        {PLAYERS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.playerAnswerBtn,
              {
                backgroundColor: colors.cardBg,
                borderColor: p.color,
                borderLeftWidth: 10,
                paddingVertical: 18 * btnScale,
              },
            ]}
            onPress={() => handleAnswer(p.id)}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${p.name}`}
          >
            <View
              style={[
                styles.answerNumBadge,
                { backgroundColor: p.color },
              ]}
            >
              <Text style={styles.answerNumText}>{p.id}</Text>
            </View>

            <View style={styles.answerTextContainer}>
              <Text style={[styles.answerBtnTitle, { color: colors.text, fontSize: 22 * fontScale }]}>
                {p.name}
              </Text>
              <Text style={[styles.answerBtnSub, { color: colors.subText, fontSize: 14 * fontScale }]}>
                Player {p.id}
              </Text>
            </View>

            <Ionicons name="chevron-forward-circle" size={28} color={p.color} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  /* -----------------------------------------------------------
     Screen 6: FEEDBACK (Positive & Encouraging)
  ----------------------------------------------------------- */
  const renderFeedback = () => {
    const finalHolder = moveSequence[moveSequence.length - 1];
    const correctPlayer = PLAYERS.find((p) => p.id === finalHolder);

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: isCorrect ? colors.primary : colors.accent,
              borderWidth: 3,
            },
          ]}
        >
          {/* Gentle Icon */}
          <View
            style={[
              styles.feedbackIconCircle,
              {
                backgroundColor: isCorrect
                  ? isDarkMode
                    ? '#064E3B'
                    : '#D1FAE5'
                  : isDarkMode
                  ? '#78350F'
                  : '#FEF3C7',
              },
            ]}
          >
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'heart'}
              size={56}
              color={isCorrect ? colors.primary : colors.accent}
            />
          </View>

          {/* Heading */}
          <Text
            style={[
              styles.feedbackTitle,
              {
                color: isCorrect ? colors.primary : colors.accent,
                fontSize: 28 * fontScale,
              },
            ]}
          >
            {isCorrect ? 'WELL DONE!' : "That's okay."}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.feedbackSub, { color: colors.text, fontSize: 18 * fontScale }]}>
            {isCorrect
              ? 'Great memory! You tracked the Dhop perfectly.'
              : `Let's try again! ${correctPlayer?.name} was holding the Dhop.`}
          </Text>

          {/* Visual confirmation showing who held the Dhop */}
          <View style={styles.revealedPlayerContainer}>
            <DhopBall size={42} contrast={contrast} />
            <Text style={[styles.revealedPlayerText, { color: colors.text, fontSize: 16 * fontScale }]}>
              Dhop is with {correctPlayer?.name}
            </Text>
          </View>
        </View>

        {/* Voice caption */}
        <VoiceCaption
          text={isCorrect ? 'Well done! Great memory!' : "That's okay. Let's try again."}
          enabled={audio}
          contrast={contrast}
        />

        {/* Action Buttons */}
        <TouchableOpacity
          style={[
            styles.largePrimaryBtn,
            {
              backgroundColor: colors.primary,
              marginTop: 18,
              paddingVertical: 18 * btnScale,
            },
          ]}
          onPress={handleTryAgain}
          accessibilityRole="button"
          accessibilityLabel={isCorrect ? 'Play next round' : 'Try again'}
        >
          <Ionicons
            name={isCorrect ? 'arrow-forward' : 'refresh'}
            size={24}
            color={colors.btnText}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 22 * fontScale }]}>
            {isCorrect ? 'NEXT ROUND' : 'TRY AGAIN'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
              marginTop: 12,
              paddingVertical: 14 * btnScale,
            },
          ]}
          onPress={() => {
            setScreen(SCREENS.DIFFICULTY);
          }}
          accessibilityRole="button"
          accessibilityLabel="Change difficulty level"
        >
          <Ionicons name="options-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[styles.secondaryBtnText, { color: colors.text, fontSize: 16 * fontScale }]}>
            Change Level
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* -----------------------------------------------------------
     Screen 7: SETTINGS & ACCESSIBILITY
  ----------------------------------------------------------- */
  const renderSettings = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 26 * fontScale }]}>
        ACCESSIBILITY & SETTINGS
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.subText, fontSize: 15 * fontScale }]}>
        Customize the experience for comfort:
      </Text>

      {/* Text Size Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          TEXT SIZE
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              textSize === 'large' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTextSize('large')}
            accessibilityRole="button"
            accessibilityLabel="Set text size to Large"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: textSize === 'large' ? colors.btnText : colors.text },
              ]}
            >
              Large
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              textSize === 'extraLarge' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setTextSize('extraLarge')}
            accessibilityRole="button"
            accessibilityLabel="Set text size to Extra Large"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: textSize === 'extraLarge' ? colors.btnText : colors.text },
              ]}
            >
              Extra Large
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Button Size Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          BUTTON SIZE
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              buttonSize === 'large' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setButtonSize('large')}
            accessibilityRole="button"
            accessibilityLabel="Set button size to Large"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: buttonSize === 'large' ? colors.btnText : colors.text },
              ]}
            >
              Large
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              buttonSize === 'extraLarge' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setButtonSize('extraLarge')}
            accessibilityRole="button"
            accessibilityLabel="Set button size to Extra Large"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: buttonSize === 'extraLarge' ? colors.btnText : colors.text },
              ]}
            >
              Extra Large
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Animation Speed Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          ANIMATION SPEED
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              animationSpeed === 'slow' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAnimationSpeed('slow')}
            accessibilityRole="button"
            accessibilityLabel="Set animation speed to Slow and gentle"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: animationSpeed === 'slow' ? colors.btnText : colors.text },
              ]}
            >
              Slow (Gentle)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              animationSpeed === 'normal' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAnimationSpeed('normal')}
            accessibilityRole="button"
            accessibilityLabel="Set animation speed to Normal"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: animationSpeed === 'normal' ? colors.btnText : colors.text },
              ]}
            >
              Normal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Audio Voice Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          AUDIO & VOICE GUIDANCE
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              audio === true && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAudio(true)}
            accessibilityRole="button"
            accessibilityLabel="Turn Audio On"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: audio === true ? colors.btnText : colors.text },
              ]}
            >
              On (Spoken)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              audio === false && { backgroundColor: colors.primary },
            ]}
            onPress={() => setAudio(false)}
            accessibilityRole="button"
            accessibilityLabel="Turn Audio Off"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: audio === false ? colors.btnText : colors.text },
              ]}
            >
              Off (Muted)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contrast Setting */}
      <View style={[styles.settingsGroupCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.settingsGroupTitle, { color: colors.text, fontSize: 17 * fontScale }]}>
          CONTRAST
        </Text>
        <View style={styles.settingsToggleRow}>
          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              contrast === 'normal' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setContrast('normal')}
            accessibilityRole="button"
            accessibilityLabel="Set standard contrast"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: contrast === 'normal' ? colors.btnText : colors.text },
              ]}
            >
              Standard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingOptionBtn,
              contrast === 'high' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setContrast('high')}
            accessibilityRole="button"
            accessibilityLabel="Set high contrast"
          >
            <Text
              style={[
                styles.settingOptionText,
                { color: contrast === 'high' ? colors.btnText : colors.text },
              ]}
            >
              High Contrast
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cultural Information Card */}
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: isDarkMode ? '#1E293B' : '#ECFDF5',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.infoCardTitle, { color: colors.primary, fontSize: 16 * fontScale }]}>
          About Dhopkhel, Assam
        </Text>
        <Text style={[styles.infoCardText, { color: colors.text, fontSize: 14 * fontScale }]}>
          Dhopkhel is a cherished traditional ball game from Assam, traditionally played with a soft woven ball called a 'Dhop'. This digital adaptation preserves the calm visual tracking and attention element for cognitive engagement and memory wellness.
        </Text>
      </View>

      {/* Medical Disclaimer Card */}
      <View
        style={[
          styles.disclaimerCard,
          {
            backgroundColor: isDarkMode ? '#281E15' : '#FFFBEB',
            borderColor: colors.accent,
          },
        ]}
      >
        <Ionicons name="information-circle" size={24} color={colors.accent} style={{ marginBottom: 6 }} />
        <Text style={[styles.disclaimerCardTitle, { color: colors.accent, fontSize: 15 * fontScale }]}>
          Medical Disclaimer
        </Text>
        <Text style={[styles.disclaimerCardText, { color: colors.text, fontSize: 13 * fontScale }]}>
          "This game is designed for cognitive engagement and memory practice. It is not a medical diagnostic tool or treatment for dementia."
        </Text>
      </View>

      {/* Done Button */}
      <TouchableOpacity
        style={[
          styles.largePrimaryBtn,
          {
            backgroundColor: colors.primary,
            marginTop: 18,
            paddingVertical: 16 * btnScale,
          },
        ]}
        onPress={() => setScreen(SCREENS.WELCOME)}
        accessibilityRole="button"
        accessibilityLabel="Save and return to welcome screen"
      >
        <Ionicons name="checkmark" size={24} color={colors.btnText} style={{ marginRight: 8 }} />
        <Text style={[styles.largePrimaryBtnText, { color: colors.btnText, fontSize: 20 * fontScale }]}>
          SAVE & RETURN
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: colors.bg }]}>
      {/* Top Navigation Bar with Back Button */}
      <View
        style={[
          styles.gameTopBar,
          {
            backgroundColor: colors.cardBg,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backTouchTarget}
          onPress={handleHeaderBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
          <Text style={[styles.backButtonLabel, { color: colors.primary, fontSize: 16 * fontScale }]}>
            {screen === SCREENS.WELCOME ? 'Back to Games' : 'Back'}
          </Text>
        </TouchableOpacity>

        {/* Audio Mute Quick Toggle */}
        <TouchableOpacity
          style={[
            styles.muteQuickToggle,
            { backgroundColor: audio ? colors.cardBg : '#EF4444' },
          ]}
          onPress={() => setAudio((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={audio ? 'Mute audio' : 'Unmute audio'}
        >
          <Ionicons
            name={audio ? 'volume-high-outline' : 'volume-mute'}
            size={22}
            color={audio ? colors.text : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Render Active Screen */}
      {screen === SCREENS.WELCOME && renderWelcome()}
      {screen === SCREENS.DIFFICULTY && renderDifficulty()}
      {screen === SCREENS.INSTRUCTIONS && renderInstructions()}
      {screen === SCREENS.PLAYING && renderPlaying()}
      {screen === SCREENS.RECALL && renderRecall()}
      {screen === SCREENS.FEEDBACK && renderFeedback()}
      {screen === SCREENS.SETTINGS && renderSettings()}
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------
   Styles
------------------------------------------------------------- */
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 40,
    alignItems: 'center',
  },
  gameTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backTouchTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backButtonLabel: {
    fontWeight: '600',
    marginLeft: 6,
  },
  muteQuickToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tagline & Header
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  taglineText: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mainTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  mainSubtitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  culturalNotice: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },

  // Welcome Hero Card
  welcomeHeroCard: {
    width: '100%',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  welcomeDhopHero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  dhopBallLabel: {
    fontWeight: '700',
  },
  heroPlayersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },

  // Spoken voice caption banner
  voiceCaptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    width: '100%',
    marginBottom: 16,
  },
  voiceCaptionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Action buttons
  largePrimaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 18,
    minHeight: 58,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  largePrimaryBtnText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 52,
  },
  secondaryBtnText: {
    fontWeight: '600',
  },
  disclaimerSmall: {
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },

  // Section Headers
  sectionHeading: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '600',
  },

  // Difficulty Level Card
  levelCard: {
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    elevation: 1,
  },
  levelCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelTitleText: {
    fontWeight: '800',
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    marginHorizontal: 2,
  },
  levelSubtitleText: {
    fontWeight: '600',
  },
  levelDescText: {
    lineHeight: 18,
  },

  // Instructions
  instructionBox: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '800',
    marginBottom: 2,
  },
  stepDesc: {
    lineHeight: 20,
  },

  // Playing Scene
  playingContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
  },
  statusText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  statusSub: {
    marginTop: 2,
    fontWeight: '600',
  },
  playingField: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    minHeight: 330,
  },
  playerPosTop: {
    alignItems: 'center',
    marginBottom: 24,
  },
  playerPosBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '88%',
    paddingHorizontal: 10,
  },
  animatedDhop: {
    position: 'absolute',
    zIndex: 99,
  },

  // Dhop Ball Component
  dhopContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  dhopInnerRing: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  dhopStitchHorizontal: {
    position: 'absolute',
    height: 1.5,
  },
  dhopStitchVertical: {
    position: 'absolute',
    width: 1.5,
  },
  dhopHighlight: {
    position: 'absolute',
    top: 5,
    left: 7,
    opacity: 0.7,
  },

  // Player Avatar Component
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 50,
  },
  characterHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  characterHair: {
    position: 'absolute',
    top: 0,
    width: 34,
    height: 14,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  characterEyesRow: {
    flexDirection: 'row',
    width: 18,
    justifyContent: 'space-between',
    marginTop: 6,
  },
  characterEye: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  characterShoulders: {
    width: 58,
    height: 28,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 4,
  },
  playerNumBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  playerNumText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  playerLabelContainer: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  playerLabelText: {
    letterSpacing: 0.3,
  },

  // Assam Landscape Background Elements
  landscapeSun: {
    position: 'absolute',
    top: 30,
    right: 36,
    width: 54,
    height: 54,
    borderRadius: 27,
    opacity: 0.6,
  },
  landscapeHillFar: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    right: -40,
    height: 180,
    borderTopLeftRadius: 240,
    borderTopRightRadius: 260,
    opacity: 0.5,
  },
  landscapeHillNear: {
    position: 'absolute',
    bottom: 40,
    left: -60,
    right: -40,
    height: 170,
    borderTopLeftRadius: 280,
    borderTopRightRadius: 220,
    opacity: 0.7,
  },
  landscapeFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    opacity: 0.8,
  },

  // Recall Screen
  recallPromptCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  recallDhopIcon: {
    marginBottom: 12,
  },
  recallTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  recallSubtitle: {
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  answersContainer: {
    width: '100%',
    gap: 12,
  },
  playerAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    minHeight: 68,
    elevation: 2,
  },
  answerNumBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  answerNumText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  answerTextContainer: {
    flex: 1,
  },
  answerBtnTitle: {
    fontWeight: '800',
  },
  answerBtnSub: {
    marginTop: 2,
  },

  // Feedback Screen
  feedbackCard: {
    width: '100%',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  feedbackIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  feedbackTitle: {
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  feedbackSub: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    fontWeight: '600',
  },
  revealedPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  revealedPlayerText: {
    fontWeight: '700',
    marginLeft: 10,
  },

  // Settings
  settingsGroupCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  settingsGroupTitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  settingsToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  settingOptionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  settingOptionText: {
    fontWeight: '700',
    fontSize: 15,
  },
  infoCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontWeight: '800',
    marginBottom: 6,
  },
  infoCardText: {
    lineHeight: 20,
  },
  disclaimerCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  disclaimerCardTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  disclaimerCardText: {
    lineHeight: 19,
    fontStyle: 'italic',
  },
});

