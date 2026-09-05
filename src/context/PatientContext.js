import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePatientProfile } from '../modules/database';

const PatientContext = createContext();

const STORAGE_KEYS = {
  SETUP_DONE: 'appSetupDone',
  PATIENT_ID: 'patient_id',
  PATIENT_NAME: 'patient_name',
  PATIENT_PROFILE: '@patient_profile',
};

export function PatientProvider({ children }) {
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingSetup, setIsEditingSetup] = useState(false);

  const [patientId, setPatientId] = useState('P001');
  const [patientName, setPatientName] = useState('Chandni Devi');
  const [patientAge, setPatientAge] = useState('72');
  const [caregiverName, setCaregiverName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Load setup status and patient data from AsyncStorage on app load
  useEffect(() => {
    let isMounted = true;
    async function loadStoredData() {
      try {
        const setupVal = await AsyncStorage.getItem(STORAGE_KEYS.SETUP_DONE);
        const hasSetup = setupVal === 'true' || setupVal === '1';

        const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE);
        const storedId = await AsyncStorage.getItem(STORAGE_KEYS.PATIENT_ID);
        const storedName = await AsyncStorage.getItem(STORAGE_KEYS.PATIENT_NAME);

        if (isMounted) {
          if (profileJson) {
            try {
              const parsed = JSON.parse(profileJson);
              if (parsed.patientId) setPatientId(parsed.patientId);
              if (parsed.patientName) setPatientName(parsed.patientName);
              if (parsed.patientAge) setPatientAge(String(parsed.patientAge));
              if (parsed.caregiverName) setCaregiverName(parsed.caregiverName);
              if (parsed.relationship) setRelationship(parsed.relationship);
              if (parsed.photoUrl) setPhotoUrl(parsed.photoUrl);
            } catch (e) {
              console.warn('Error parsing stored patient profile:', e);
            }
          } else {
            if (storedId) setPatientId(storedId);
            if (storedName) setPatientName(storedName);
          }
          setIsSetupDone(hasSetup);
        }
      } catch (error) {
        console.warn('Error reading patient data from AsyncStorage:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStoredData();
    return () => {
      isMounted = false;
    };
  }, []);

  const savePatientSetup = useCallback(async (data) => {
    const assignedId = patientId && patientId !== 'P001'
      ? patientId
      : `P_${Date.now()}`;

    const profileData = {
      patientId: assignedId,
      patientName: (data.patientName || '').trim() || 'Loved One',
      patientAge: (data.patientAge || '').toString().trim(),
      caregiverName: (data.caregiverName || '').trim(),
      relationship: data.relationship || 'Other',
      photoUrl: data.photoUrl || '',
    };

    // 1. Update State
    setPatientId(profileData.patientId);
    setPatientName(profileData.patientName);
    setPatientAge(profileData.patientAge);
    setCaregiverName(profileData.caregiverName);
    setRelationship(profileData.relationship);
    setPhotoUrl(profileData.photoUrl);
    setIsSetupDone(true);
    setIsEditingSetup(false);

    // 2. Persist to AsyncStorage
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.SETUP_DONE, 'true'],
        [STORAGE_KEYS.PATIENT_ID, profileData.patientId],
        [STORAGE_KEYS.PATIENT_NAME, profileData.patientName],
        [STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(profileData)],
      ]);
    } catch (storageErr) {
      console.warn('AsyncStorage error saving patient setup:', storageErr);
    }

    // 3. Save to Supabase (patients table)
    try {
      await savePatientProfile({
        patient_id: profileData.patientId,
        name: profileData.patientName,
        age: parseInt(profileData.patientAge, 10) || null,
      });
    } catch (dbErr) {
      console.warn('Supabase save error (continuing offline):', dbErr);
    }

    return profileData;
  }, [patientId]);

  const selectPatient = useCallback((id, name) => {
    setPatientId(id);
    if (name) setPatientName(name);
  }, []);

  const openSetupWizard = useCallback(() => {
    setIsEditingSetup(true);
  }, []);

  const closeSetupWizard = useCallback(() => {
    setIsEditingSetup(false);
  }, []);

  return (
    <PatientContext.Provider
      value={{
        isSetupDone,
        isLoading,
        isEditingSetup,
        patientId,
        currentPatientId: patientId,
        patientName,
        currentPatientName: patientName,
        patientAge,
        caregiverName,
        relationship,
        photoUrl,
        savePatientSetup,
        selectPatient,
        openSetupWizard,
        closeSetupWizard,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    return {
      isSetupDone: true,
      isLoading: false,
      isEditingSetup: false,
      patientId: 'P001',
      currentPatientId: 'P001',
      patientName: 'Chandni Devi',
      currentPatientName: 'Chandni Devi',
      patientAge: '72',
      caregiverName: '',
      relationship: '',
      photoUrl: '',
      savePatientSetup: async () => {},
      selectPatient: () => {},
      openSetupWizard: () => {},
      closeSetupWizard: () => {},
    };
  }
  return context;
}

export default PatientContext;
