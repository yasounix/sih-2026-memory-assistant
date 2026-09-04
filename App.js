import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 4 Screens (Empty rooms for your team)
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'blue' }}>Home Screen</Text>
    </View>
  );
}

function GamesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'blue' }}>Games Screen</Text>
    </View>
  );
}

function MemoriesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'blue' }}>Memories Screen</Text>
    </View>
  );
}

function AIScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'blue' }}>AI Assistant Screen</Text>
    </View>
  );
}

// Bottom Tab Navigation
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Games') {
              iconName = focused ? 'game-controller' : 'game-controller-outline';
            } else if (route.name === 'Memories') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'AI') {
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Games" component={GamesScreen} />
        <Tab.Screen name="Memories" component={MemoriesScreen} />
        <Tab.Screen name="AI" component={AIScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}