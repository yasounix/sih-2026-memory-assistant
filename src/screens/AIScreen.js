// src/screens/AIScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { getAIResponse } from '../modules/aiData';

export default function AIScreen() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const answer = await getAIResponse(question);
    setResponse(answer);
    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>AI Assistant 🤖</Text>
      
      <TextInput
        style={{ fontSize: 20, borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 10, marginTop: 20 }}
        placeholder="Ask me anything..."
        value={question}
        onChangeText={setQuestion}
      />
      
      <TouchableOpacity
        style={{ backgroundColor: '#2196F3', padding: 15, borderRadius: 10, marginTop: 10 }}
        onPress={askAI}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>
          {loading ? 'Thinking...' : 'Ask'}
        </Text>
      </TouchableOpacity>
      
      {response ? (
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, marginTop: 20 }}>
          <Text style={{ fontSize: 20 }}>{response}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}