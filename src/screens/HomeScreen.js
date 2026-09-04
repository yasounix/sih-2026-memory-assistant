import React from 'react';
import { Text, View, Button, ScrollView } from 'react-native';
import { reminders } from '../modules/memoryData';

export default function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 20 }}>
        Good Morning! 🌅
      </Text>
      
      <Text style={{ fontSize: 20, color: 'gray', marginVertical: 10 }}>
        Today is {new Date().toLocaleDateString()}
      </Text>
      
      <View style={{ marginTop: 30, backgroundColor: 'white', padding: 20, borderRadius: 15 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>My Day 📋</Text>
        {reminders.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>{item.completed ? '✅' : '⬜'}</Text>
            <Text style={{ fontSize: 18, marginLeft: 10 }}>{item.title}</Text>
            <Text style={{ fontSize: 16, marginLeft: 'auto', color: 'gray' }}>{item.time}</Text>
          </View>
        ))}
      </View>
      
      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ width: '45%' }}>
          <Button title="Play Games" color="#2196F3" onPress={() => {}} />
        </View>
        <View style={{ width: '45%' }}>
          <Button title="View Memories" color="#4CAF50" onPress={() => {}} />
        </View>
      </View>
    </ScrollView>
  );
}