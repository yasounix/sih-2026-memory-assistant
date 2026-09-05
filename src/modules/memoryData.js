import { supabase } from './supabaseClient';

export const getFamilyMembers = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('patient_id', patientId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching family members:', error.message);
    return [];
  }
};