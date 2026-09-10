import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePatient } from '../context/PatientContext';
import { getAIResponse } from '../modules/aiData';

export default function AIScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const { patientId, patientName } = usePatient();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t('ai.responses.default'),
    },
  ]);

  const quickPrompts = [
    { id: 'rahul', key: 'ai.questionRahul' },
    { id: 'priya', key: 'ai.questionPriya' },
    { id: 'schedule', key: 'ai.questionSchedule' },
    { id: 'medicine', key: 'ai.questionMedicine' },
  ];

  const handleSend = (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    setTimeout(() => {
      const responseText = getAIResponse(query, patientId);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 400);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Banner */}
          <View style={[styles.headerBanner, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <View style={[styles.headerIconContainer, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF' }]}>
              <Ionicons name="chatbubbles" size={26} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.text }]}>{t('ai.title')}</Text>
              <Text style={[styles.subtitle, { color: theme.subText }]}>{t('ai.subtitle')}</Text>
            </View>
          </View>

          {/* Suggested Quick Question Chips */}
          <View style={styles.quickQuestionsSection}>
            <Text style={[styles.sectionHeading, { color: theme.subText }]}>
              {t('ai.commonQuestions')}
            </Text>
            <View style={styles.chipsContainer}>
              {quickPrompts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.promptChip,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                  onPress={() => handleSend(t(item.key))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="bulb-outline" size={15} color={theme.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.promptChipText, { color: theme.text }]}>
                    {t(item.key)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chat Messages */}
          <View style={styles.chatArea}>
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userRow : styles.assistantRow,
                  ]}
                >
                  {!isUser && (
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                      <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: theme.primary }]
                        : [
                            styles.assistantBubble,
                            {
                              backgroundColor: theme.cardBackground,
                              borderColor: theme.cardBorder,
                            },
                          ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: isUser ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </View>
              );
            })}

            {loading && (
              <View style={[styles.messageRow, styles.assistantRow]}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.messageBubble,
                    styles.assistantBubble,
                    {
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.cardBorder,
                      flexDirection: 'row',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <ActivityIndicator size="small" color={theme.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.messageText, { color: theme.subText }]}>
                    {t('ai.thinking')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Input Bar */}
        <View
          style={[
            styles.inputBarContainer,
            {
              backgroundColor: theme.cardBackground,
              borderTopColor: theme.cardBorder,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
                borderColor: theme.cardBorder,
                color: theme.text,
              },
            ]}
            placeholder={t('ai.placeholder')}
            placeholderTextColor={theme.subText}
            value={inputQuery}
            onChangeText={setInputQuery}
            onSubmitEditing={() => handleSend(inputQuery)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary }]}
            onPress={() => handleSend(inputQuery)}
            activeOpacity={0.8}
            disabled={loading || !inputQuery.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  quickQuestionsSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  promptChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chatArea: {
    marginTop: 8,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});