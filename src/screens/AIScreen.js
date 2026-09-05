import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AIScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>AI Assistant Screen</Text>
    </View>
  );
}