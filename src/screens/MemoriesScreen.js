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
      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderBottomWidth: 1, borderColor: '#ddd' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name} ({item.relationship})</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}