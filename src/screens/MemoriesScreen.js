<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator } from 'react-native';
import { getFamilyMembers } from '../modules/memoryData'; // Import dynamic function

export default function MemoriesScreen({ route }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // You need to pass the actual patientId here or use a default for now
  const patientId = route.params?.patientId || 'P001'; 

  useEffect(() => {
    const loadData = async () => {
      const data = await getFamilyMembers(patientId);
      setMembers(data);
      setLoading(false);
    };
    loadData();
  }, [patientId]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View>
=======
import React from 'react';
import { Text, View, FlatList, Image, StyleSheet } from 'react-native';
import { familyMembers } from '../modules/memoryData';
import { useTheme } from '../context/ThemeContext';

export default function MemoriesScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: theme.text }}>
        My Family 👨‍👩‍👧‍👦
      </Text>
      
>>>>>>> c5603c822cd9152f6932b6e5b40571db78e107d4
      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
<<<<<<< HEAD
          <View style={{ padding: 15, borderBottomWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name} ({item.relationship})</Text>
            <Text>{item.description}</Text>
=======
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Image source={{ uri: item.photo_url }} style={styles.image} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.relation, { color: theme.subText }]}>{item.relationship}</Text>
              <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
            </View>
>>>>>>> c5603c822cd9152f6932b6e5b40571db78e107d4
          </View>
        )}
      />
    </View>
  );
<<<<<<< HEAD
}
=======
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  relation: {
    fontSize: 16,
    color: 'gray',
  },
  description: {
    fontSize: 14,
    marginTop: 5,
  },
});
>>>>>>> c5603c822cd9152f6932b6e5b40571db78e107d4
