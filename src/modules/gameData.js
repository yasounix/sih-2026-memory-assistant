// This file stores the data for Panchal's Cognitive Games

export const gameList = [
  {
    id: '1',
    name: 'Sequence Recall',
    description: 'Remember and repeat the pattern of lights.',
    difficulty: 'Easy',
    icon: '🎯',
  },
  {
    id: '2',
    name: 'Memory Match',
    description: 'Find the matching pairs of cards.',
    difficulty: 'Medium',
    icon: '🧠',
  },
  {
    id: '3',
    name: 'Picture Recognition',
    description: 'Identify the correct picture from a set.',
    difficulty: 'Hard',
    icon: '🖼️',
  },
];

// Mock function to simulate a game result
export const getMockGameResult = () => {
  return {
    score: Math.floor(Math.random() * 100),
    duration: Math.floor(Math.random() * 60) + 10, // seconds
    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString(),
  };
};