import { supabase } from './supabaseClient';

// Existing exports...

export const getPatientProfile = async (patientId) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('patient_id', patientId)
    .single();
  if (error) console.error('Error fetching patient:', error);
  return data;
};

export const getReminders = async (patientId) => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
  if (error) console.error('Error fetching reminders:', error);
  return data;
};

export const saveGameResult = async (resultData) => {
  const { data, error } = await supabase
    .from('game_results')
    .insert([resultData]);
  if (error) console.error('Error saving game result:', error);
  return data;
};