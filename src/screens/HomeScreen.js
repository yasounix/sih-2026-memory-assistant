import React from 'react';
import { Text, View, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { reminders } from '../modules/memoryData';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 20, color: theme.text }}>
        Good Morning! 🌅
      </Text>

      <Text style={{ fontSize: 20, color: theme.subText, marginVertical: 10 }}>
        Today is {new Date().toLocaleDateString()}
      </Text>

      <View
        style={{
          marginTop: 30,
          backgroundColor: theme.cardBackground,
          padding: 20,
          borderRadius: 15,
          borderWidth: 1,
          borderColor: theme.cardBorder,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text }}>My Day 📋</Text>
        {reminders.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>{item.completed ? '✅' : '⬜'}</Text>
            <Text style={{ fontSize: 18, marginLeft: 10, color: theme.text }}>{item.title}</Text>
            <Text style={{ fontSize: 16, marginLeft: 'auto', color: theme.subText }}>{item.time}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ width: '45%' }}>
          <Button title="Play Games" color="#2196F3" onPress={() => navigation.navigate('Games')} />
        </View>
        <View style={{ width: '45%' }}>
          <Button title="View Memories" color="#4CAF50" onPress={() => navigation.navigate('Memories')} />
        </View>
      </View>
    </ScrollView>
  );
}