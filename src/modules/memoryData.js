// This file stores the data for Jainil's Memory Management

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

// Mock function to simulate database fetch
export const getFamilyMemberByName = (name) => {
  return familyMembers.find(member => 
    member.name.toLowerCase().includes(name.toLowerCase())
  );
};