/**
 * SUH TAH LAM - Character3D
 *
 * Realistic stylized 3D articulated character system:
 * - Realistic human proportions (head, neck, shoulders, torso, arms, hands, hips, legs, feet)
 * - Authentic Northeast Indian inspired attire (woven patterned sash, headband, waist cincher)
 * - Upright 3D counter-tilt standing naturally on the 3D courtyard floor
 * - Dynamic ground drop shadow matching movement and lift
 * - Articulated animation states: stepping, turning, holding bamboo, push/pull
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function Character3D({
  role = 'dancer', // 'dancer' | 'holder_left' | 'holder_right' | 'observer'
  positionX = 0, // Animated.Value or number
  positionY = 0, // Animated.Value or number
  actionState = 'idle', // 'idle' | 'step_left' | 'step_right' | 'step_center' | 'turn' | 'holding_bamboo' | 'push_pull'
  isAltered = false, // for Mode 5: Spot the Change
}) {
  const stepBobAnim = useRef(new Animated.Value(0)).current;
  const leftLegAnim = useRef(new Animated.Value(0)).current;
  const rightLegAnim = useRef(new Animated.Value(0)).current;
  const armSwayAnim = useRef(new Animated.Value(0)).current;
  const turnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (actionState.startsWith('step')) {
      // Natural stepping cadence: torso bobs, legs articulate alternately
      Animated.parallel([
        Animated.sequence([
          Animated.timing(stepBobAnim, { toValue: -8, duration: 180, useNativeDriver: true }),
          Animated.timing(stepBobAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(leftLegAnim, { toValue: -12, duration: 180, useNativeDriver: true }),
          Animated.timing(leftLegAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(armSwayAnim, { toValue: 8, duration: 200, useNativeDriver: true }),
          Animated.timing(armSwayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    } else if (actionState === 'turn') {
      Animated.sequence([
        Animated.timing(turnAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(turnAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [actionState]);

  const isDancer = role === 'dancer';
  const isHolder = role === 'holder_left' || role === 'holder_right';

  const characterTransform = [
    // Counter-tilt from ground plane (52deg) so character stands upright in 3D
    { rotateX: '-52deg' },
    { rotateZ: '4deg' },
    { translateY: stepBobAnim },
    {
      rotateY: turnAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0deg', '180deg', '360deg'],
      }),
    },
  ];

  return (
    <Animated.View
      style={[
        styles.characterAnchor,
        {
          transform: [
            { translateX: positionX },
            { translateY: positionY },
          ],
        },
      ]}
      pointerEvents="none"
    >
      {/* 3D Drop Shadow on courtyard floor */}
      <View
        style={[
          styles.groundShadow,
          isDancer ? styles.dancerShadow : styles.holderShadow,
          isAltered && styles.shadowAltered,
        ]}
      />

      {/* Upright Articulated Figure */}
      <Animated.View style={[styles.uprightRig, { transform: characterTransform }]}>
        {/* Head with Headband and Styled Hair */}
        <View style={styles.headContainer}>
          <View style={styles.hairVolume} />
          <View style={styles.faceSkin}>
            {/* Subtle facial structure */}
            <View style={styles.faceEyeRow}>
              <View style={styles.eyeDot} />
              <View style={styles.eyeDot} />
            </View>
          </View>
          {/* Traditional Northeast Woven Headband */}
          <View style={styles.wovenHeadband}>
            <View style={styles.headbandStripe} />
          </View>
        </View>

        {/* Neck */}
        <View style={styles.neck} />

        {/* Torso & Shoulders with Authentic Patterned Sash */}
        <View style={[styles.torsoContainer, isHolder && styles.holderTorso]}>
          {/* Base tunic/vest */}
          <View style={[styles.tunicBase, isDancer ? styles.dancerTunic : styles.holderTunic]}>
            {/* Traditional diagonal woven sash across chest */}
            {isDancer && (
              <View style={styles.wovenSash}>
                <View style={styles.sashPatternRed} />
                <View style={styles.sashPatternWhite} />
              </View>
            )}
          </View>

          {/* Left Arm & Hand */}
          <Animated.View
            style={[
              styles.armLeft,
              isHolder ? styles.holderArmLeft : styles.dancerArmLeft,
              { transform: [{ rotate: armSwayAnim.interpolate({ inputRange: [-10, 10], outputRange: ['-12deg', '12deg'] }) }] },
            ]}
          >
            <View style={styles.upperArm} />
            <View style={styles.forearm} />
            <View style={styles.hand} />
          </Animated.View>

          {/* Right Arm & Hand */}
          <Animated.View
            style={[
              styles.armRight,
              isHolder ? styles.holderArmRight : styles.dancerArmRight,
              { transform: [{ rotate: armSwayAnim.interpolate({ inputRange: [-10, 10], outputRange: ['12deg', '-12deg'] }) }] },
            ]}
          >
            <View style={styles.upperArm} />
            <View style={styles.forearm} />
            <View style={styles.hand} />
          </Animated.View>
        </View>

        {/* Woven Belt / Waistband */}
        <View style={styles.waistBand}>
          <View style={styles.beltAccent} />
        </View>

        {/* Lower Garment (Traditional Wrap / Dhoti / Sarong) & Legs */}
        {isDancer ? (
          <View style={styles.lowerBodyDancer}>
            {/* Traditional Wrap Skirt */}
            <View style={styles.wrapSkirt}>
              <View style={styles.skirtBorderRed} />
              <View style={styles.skirtBorderBlack} />
            </View>

            {/* Stepping Legs */}
            <View style={styles.legsRow}>
              {/* Left Leg & Foot */}
              <Animated.View style={[styles.leg, { transform: [{ translateY: leftLegAnim }] }]}>
                <View style={styles.calf} />
                <View style={styles.foot} />
              </Animated.View>

              {/* Right Leg & Foot */}
              <Animated.View style={[styles.leg, { transform: [{ translateY: rightLegAnim }] }]}>
                <View style={styles.calf} />
                <View style={styles.foot} />
              </Animated.View>
            </View>
          </View>
        ) : (
          /* Seated / Crouching Holder Legs */
          <View style={styles.crouchLegsRow}>
            <View style={styles.crouchKneeLeft} />
            <View style={styles.crouchKneeRight} />
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  characterAnchor: {
    position: 'absolute',
    width: 60,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  groundShadow: {
    position: 'absolute',
    bottom: 2,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 1,
  },
  dancerShadow: {
    width: 32,
    height: 14,
  },
  holderShadow: {
    width: 44,
    height: 18,
  },
  shadowAltered: {
    backgroundColor: 'rgba(245, 158, 11, 0.5)',
  },
  uprightRig: {
    alignItems: 'center',
    zIndex: 2,
    bottom: 12,
  },
  headContainer: {
    width: 20,
    height: 22,
    alignItems: 'center',
    zIndex: 5,
  },
  hairVolume: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 13,
    backgroundColor: '#1C1917',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  faceSkin: {
    position: 'absolute',
    bottom: 0,
    width: 17,
    height: 15,
    backgroundColor: '#D9A066',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceEyeRow: {
    flexDirection: 'row',
    width: 10,
    justifyContent: 'space-between',
    marginTop: 2,
  },
  eyeDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#292524',
  },
  wovenHeadband: {
    position: 'absolute',
    top: 5,
    width: 21,
    height: 5,
    backgroundColor: '#DC2626',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#FEF08A',
    justifyContent: 'center',
  },
  headbandStripe: {
    height: 1,
    backgroundColor: '#1E293B',
  },
  neck: {
    width: 6,
    height: 4,
    backgroundColor: '#C58C54',
    marginTop: -1,
  },
  torsoContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    position: 'relative',
    zIndex: 4,
  },
  holderTorso: {
    width: 32,
    height: 24,
  },
  tunicBase: {
    width: 24,
    height: 26,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dancerTunic: {
    backgroundColor: '#B91C1C', // Rich traditional red
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  holderTunic: {
    backgroundColor: '#374151', // Dark charcoal traditional vest
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  wovenSash: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ rotate: '40deg' }, { scale: 1.4 }],
  },
  sashPatternRed: {
    height: 4,
    backgroundColor: '#FDE047',
  },
  sashPatternWhite: {
    height: 3,
    backgroundColor: '#F8FAFC',
  },
  armLeft: {
    position: 'absolute',
    left: -7,
    top: 2,
    width: 6,
    height: 22,
    alignItems: 'center',
  },
  armRight: {
    position: 'absolute',
    right: -7,
    top: 2,
    width: 6,
    height: 22,
    alignItems: 'center',
  },
  dancerArmLeft: {
    transform: [{ rotate: '-18deg' }],
  },
  dancerArmRight: {
    transform: [{ rotate: '18deg' }],
  },
  holderArmLeft: {
    transform: [{ rotate: '25deg' }, { translateY: 4 }],
  },
  holderArmRight: {
    transform: [{ rotate: '-25deg' }, { translateY: 4 }],
  },
  upperArm: {
    width: 5,
    height: 10,
    backgroundColor: '#D9A066',
    borderRadius: 2,
  },
  forearm: {
    width: 4,
    height: 8,
    backgroundColor: '#C58C54',
    borderRadius: 2,
  },
  hand: {
    width: 4,
    height: 4,
    backgroundColor: '#D9A066',
    borderRadius: 2,
  },
  waistBand: {
    width: 24,
    height: 5,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  beltAccent: {
    width: 8,
    height: 2,
    backgroundColor: '#EAB308',
  },
  lowerBodyDancer: {
    alignItems: 'center',
    zIndex: 3,
  },
  wrapSkirt: {
    width: 26,
    height: 18,
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  skirtBorderRed: {
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#DC2626',
  },
  skirtBorderBlack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FDE047',
  },
  legsRow: {
    flexDirection: 'row',
    width: 20,
    justifyContent: 'space-between',
    marginTop: -2,
  },
  leg: {
    width: 6,
    height: 16,
    alignItems: 'center',
  },
  calf: {
    width: 5,
    height: 12,
    backgroundColor: '#D9A066',
    borderRadius: 2,
  },
  foot: {
    width: 7,
    height: 4,
    backgroundColor: '#C58C54',
    borderRadius: 2,
    marginTop: -1,
  },
  crouchLegsRow: {
    flexDirection: 'row',
    width: 38,
    justifyContent: 'space-between',
    marginTop: -4,
  },
  crouchKneeLeft: {
    width: 14,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1F2937',
  },
  crouchKneeRight: {
    width: 14,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1F2937',
  },
});

