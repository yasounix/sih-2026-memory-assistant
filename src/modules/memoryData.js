import { supabase } from './supabaseClient';

// Default / mock family members for offline use and fallback
export const familyMembers = [
  {
    id: '1',
    name: 'Rahul',
    relationship: 'Son',
    description: 'Lives in Guwahati. Works as a software engineer.',
    photo_url: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Rahul',
    patient_id: 'P001',
  },
  {
    id: '2',
    name: 'Priya',
    relationship: 'Daughter',
    description: 'Lives in Delhi. Is a doctor.',
    photo_url: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=Priya',
    patient_id: 'P001',
  },
  {
    id: '3',
    name: 'Anita',
    relationship: 'Granddaughter',
    description: 'Studies in college. Visits every weekend.',
    photo_url: 'https://via.placeholder.com/150/FF9800/FFFFFF?text=Anita',
    patient_id: 'P001',
  },
];

// Default / mock reminders for offline use and fallback
export const reminders = [
  {
    id: '1',
    title: 'Take Morning Medicine',
    time: '08:00 AM',
    completed: false,
  },
  {
    id: '2',
    title: 'Walk in the Garden',
    time: '10:30 AM',
    completed: false,
  },
  {
    id: '3',
    title: 'Call Rahul',
    time: '06:00 PM',
    completed: false,
  },
];

// Fetch family members from Supabase with automatic mock fallback
export const getFamilyMembers = async (patientId = 'P001') => {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('patient_id', patientId);

    if (error) throw error;
    return data && data.length > 0 ? data : familyMembers;
  } catch (error) {
    console.error('Error fetching family members from Supabase:', error.message);
    return familyMembers;
  }
};

// Helper function to look up family member by name
export const getFamilyMemberByName = (name) => {
  return familyMembers.find((member) =>
    member.name.toLowerCase().includes(name.toLowerCase())
  );
};