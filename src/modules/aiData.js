// This file stores the data for Chandni's AI Assistant

// Mock AI responses (will be replaced with real LLM calls later)
export const getAIResponse = (question, patientId = 'P001') => {
  const lowerQuestion = question.toLowerCase();
  
  // Simple rule-based responses
  if (lowerQuestion.includes('rahul')) {
    return "Rahul is your son. He lives in Guwahati and works as a software engineer. He visits you every month.";
  }
  
  if (lowerQuestion.includes('priya')) {
    return "Priya is your daughter. She lives in Delhi and is a doctor. She calls you every Sunday.";
  }
  
  if (lowerQuestion.includes('today')) {
    return "Today's schedule: 8:00 AM - Take medicine, 10:30 AM - Walk in the garden, 6:00 PM - Call Rahul.";
  }
  
  if (lowerQuestion.includes('family')) {
    return "Your family includes: Rahul (son), Priya (daughter), and Anita (granddaughter).";
  }
  
  if (lowerQuestion.includes('medicine')) {
    return "You need to take your medicine at 8:00 AM and 8:00 PM. Please check with your doctor.";
  }
  
  // Default response
  return "I'm here to help you. You can ask me about your family, today's schedule, or your medicines. What would you like to know?";
};