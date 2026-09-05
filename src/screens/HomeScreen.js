<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Text, View, Button, ScrollView, ActivityIndicator } from 'react-native';
import { testConnection } from '../modules/supabaseClient';
import { getReminders } from '../modules/database';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Connecting...');
  const [reminders, setReminders] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Test the connection
        const connected = await testConnection();
        setIsConnected(connected);
        
        if (connected) {
          setStatus('✅ Connected to Supabase');
          const reminderList = await getReminders('P001');
          setReminders(reminderList);
        } else {
          setStatus('❌ Using mock data');
          // Fallback to mock data
          const { reminders: mockReminders } = await import('../modules/memoryData');
          setReminders(mockReminders);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setStatus('❌ Error loading data');
        // Fallback to mock data
        try {
          const { reminders: mockReminders } = await import('../modules/memoryData');
          setReminders(mockReminders);
        } catch (e) {
          console.error('Mock data error:', e);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }
=======
import React from 'react';
import { Text, View, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { reminders } from '../modules/memoryData';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
>>>>>>> c5603c822cd9152f6932b6e5b40571db78e107d4

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 20, color: theme.text }}>
        Good Morning! 🌅
      </Text>
<<<<<<< HEAD
      
      <Text style={{ 
        fontSize: 16, 
        color: isConnected ? 'green' : 'orange', 
        marginVertical: 10 
      }}>
        {status}
      </Text>
      
      <Text style={{ fontSize: 20, color: 'gray', marginVertical: 5 }}>
        Today is {new Date().toLocaleDateString()}
      </Text>
      
      <View style={{ marginTop: 30, backgroundColor: 'white', padding: 20, borderRadius: 15 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>My Day 📋</Text>
        {reminders.length > 0 ? (
          reminders.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 18 }}>{item.completed ? '✅' : '⬜'}</Text>
              <Text style={{ fontSize: 18, marginLeft: 10 }}>{item.title}</Text>
              <Text style={{ fontSize: 16, marginLeft: 'auto', color: 'gray' }}>{item.time}</Text>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 18, color: 'gray', marginTop: 10 }}>
            No reminders found
          </Text>
        )}
=======

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
>>>>>>> c5603c822cd9152f6932b6e5b40571db78e107d4
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