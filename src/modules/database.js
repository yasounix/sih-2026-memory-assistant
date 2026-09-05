import { supabase } from './supabaseClient';

export const getPatientProfile = async (patientId) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('patient_id', patientId)
    .single();
  if (error) console.error('Error fetching patient:', error);
  return data;
};

export const savePatientProfile = async (patientData) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .upsert([patientData], { onConflict: 'patient_id' })
      .select();
    if (error) {
      console.warn('Supabase savePatientProfile error:', error.message || error);
      return null;
    }
    return data;
  } catch (error) {
    console.warn('Supabase savePatientProfile network exception:', error.message || error);
    return null;
  }
};

export const getAllPatients = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : [
      { id: '1', patient_id: 'P001', name: 'Chandni Devi', age: 72, gender: 'Female' },
      { id: '2', patient_id: 'P002', name: 'Ramesh Sharma', age: 78, gender: 'Male' },
    ];
  } catch (error) {
    console.error('Error fetching all patients:', error);
    return [
      { id: '1', patient_id: 'P001', name: 'Chandni Devi', age: 72, gender: 'Female' },
      { id: '2', patient_id: 'P002', name: 'Ramesh Sharma', age: 78, gender: 'Male' },
    ];
  }
};

export const getReminders = async (patientId) => {
  console.log(`Fetching reminders for patient: ${patientId}`);
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
  console.log(`Data received from Supabase:`, data);
  return data;
};

export const getFamilyMembers = async (patientId) => {
  console.log(`Fetching family members for patient: ${patientId}`);
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('patient_id', patientId);
  if (error) {
    console.error('Error fetching family members:', error);
    throw error;
  }
  console.log(`Data received from Supabase:`, data);
  return data;
};

export const addFamilyMember = async (data) => {
  const { data: result, error } = await supabase
    .from('family_members')
    .insert([data])
    .select();
  if (error) {
    console.error('Error adding family member:', error);
    throw error;
  }
  return result;
};

export const deleteFamilyMember = async (id) => {
  const { data, error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting family member:', error);
    throw error;
  }
  return data;
};

export const saveGameResult = async (resultData) => {
  const { data, error } = await supabase
    .from('game_results')
    .insert([resultData]);
  if (error) console.error('Error saving game result:', error);
  return data;
};

export const updateReminder = async (id, updates) => {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id);
  if (error) console.error('Error updating reminder:', error);
  return data;
};