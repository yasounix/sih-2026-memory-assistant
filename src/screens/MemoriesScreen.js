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
      
      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Image source={{ uri: item.photo_url }} style={styles.image} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.relation, { color: theme.subText }]}>{item.relationship}</Text>
              <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
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