import React from 'react';
import { Text, View, FlatList, Image, StyleSheet } from 'react-native';
import { familyMembers } from '../modules/memoryData';

export default function MemoriesScreen() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>
        My Family 👨‍👩‍👧‍👦
      </Text>
      
      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.photo_url }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.relation}>{item.relationship}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
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