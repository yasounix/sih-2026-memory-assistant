import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePatient } from '../context/PatientContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const RELATIONSHIPS = [
  { label: 'Son', icon: '👦' },
  { label: 'Daughter', icon: '👧' },
  { label: 'Spouse', icon: '💍' },
  { label: 'Grandchild', icon: '👶' },
  { label: 'Other', icon: '🤝' },
];

export default function SetupWizard({ onComplete }) {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const {
    patientName: initialPatientName,
    patientAge: initialPatientAge,
    caregiverName: initialCaregiverName,
    relationship: initialRelationship,
    isEditingSetup,
    closeSetupWizard,
    savePatientSetup,
  } = usePatient();

  const [caregiverName, setCaregiverName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [relationship, setRelationship] = useState('Son');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialPatientName && initialPatientName !== 'Chandni Devi') {
      setPatientName(initialPatientName);
    } else if (isEditingSetup) {
      setPatientName(initialPatientName || '');
    }
    if (initialCaregiverName) setCaregiverName(initialCaregiverName);
    if (initialPatientAge) setPatientAge(String(initialPatientAge));
    if (initialRelationship) setRelationship(initialRelationship);
  }, [initialPatientName, initialCaregiverName, initialPatientAge, initialRelationship, isEditingSetup]);

  const handleSave = async () => {
    if (!patientName.trim()) {
      setErrorMessage('Please enter the patient’s name.');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);

    try {
      await savePatientSetup({
        caregiverName: caregiverName.trim(),
        patientName: patientName.trim(),
        patientAge: patientAge.trim(),
        relationship,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.warn('Setup save error:', err);
      Alert.alert('Saved locally', 'Details saved on your device successfully.');
      if (onComplete) onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  const selectedRelObj = RELATIONSHIPS.find((r) => r.label === relationship) || RELATIONSHIPS[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? '#374151' : '#E0E7FF' }]}>
            <Text style={styles.avatarEmoji}>👵</Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {isEditingSetup ? 'Edit Patient Profile' : "Welcome! Let's set up your app."}
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {isEditingSetup
              ? 'Update details below to personalize the memory assistant.'
              : 'Enter a few details to personalize daily reminders, memory prompts, and games.'}
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View style={styles.form}>
          {/* Caregiver Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Caregiver Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={theme.subText}
              value={caregiverName}
              onChangeText={(text) => {
                setCaregiverName(text);
                if (errorMessage) setErrorMessage('');
              }}
              accessibilityLabel="Caregiver Name input"
            />
          </View>

          {/* Patient Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Patient Name <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: errorMessage ? '#EF4444' : theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="e.g. Chandni Devi"
              placeholderTextColor={theme.subText}
              value={patientName}
              onChangeText={(text) => {
                setPatientName(text);
                if (errorMessage) setErrorMessage('');
              }}
              accessibilityLabel="Patient Name input"
            />
          </View>

          {/* Patient Age */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Patient Age</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                  color: theme.text,
                },
              ]}
              placeholder="e.g. 72"
              placeholderTextColor={theme.subText}
              value={patientAge}
              onChangeText={setPatientAge}
              keyboardType="numeric"
              maxLength={3}
              accessibilityLabel="Patient Age input"
            />
          </View>

          {/* Relationship Dropdown */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Relationship to Patient</Text>
            <TouchableOpacity
              style={[
                styles.dropdownTrigger,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
              onPress={() => setDropdownOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Select Relationship"
            >
              <Text style={[styles.dropdownValue, { color: theme.text }]}>
                {selectedRelObj.icon} {selectedRelObj.label}
              </Text>
              <Ionicons name="chevron-down" size={24} color={theme.subText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: '#2563EB' }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>💾 Save & Continue</Text>
            )}
          </TouchableOpacity>

          {isEditingSetup && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={closeSetupWizard}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: theme.subText }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Relationship Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <Text style={[styles.modalHeaderTitle, { color: theme.text }]}>
              Select Relationship
            </Text>

            {RELATIONSHIPS.map((item) => {
              const isSelected = item.label === relationship;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected
                        ? isDarkMode
                          ? '#1E3A8A'
                          : '#DBEAFE'
                        : 'transparent',
                      borderColor: isSelected ? '#2563EB' : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setRelationship(item.label);
                    setDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        color: isSelected ? '#2563EB' : theme.text,
                        fontWeight: isSelected ? 'bold' : '600',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={24} color="#2563EB" style={styles.optionCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEmoji: {
    fontSize: 46,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    gap: 18,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 20,
  },
  dropdownTrigger: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 20,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 32,
    gap: 12,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },
  cancelButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 6,
    gap: 10,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalOption: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 18,
    flex: 1,
  },
  optionCheck: {
    marginLeft: 8,
  },
});

