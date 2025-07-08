import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const { width } = Dimensions.get('window');

interface Message {
  _id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image';
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const textStyle = {
    color: colors.text,
  };

  const subtitleStyle = {
    color: colors.textSecondary,
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text,
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      if (flatListRef.current && messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  }, [messages]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const response = await api.getChatHistory();
      if (response.success && response.data) {
        // Backend returns chat history as array of conversations
        const chatHistory = response.data as any[];
        // Convert to messages format if needed
        const messages = (Array.isArray(chatHistory) ? chatHistory : []).flatMap((conversation: any) =>
          Array.isArray(conversation?.conversation) ? conversation.conversation : []
        );
        setMessages(messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!user) {
      Alert.alert('Login Required', 'Please log in to chat with AI');
      return;
    }

    const userMessage: Message = {
      _id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await api.sendMessage(inputMessage.trim());
      
              if (response.success && response.data) {
          const responseData = response.data as any;
          const aiMessage: Message = {
            _id: (Date.now() + 1).toString(),
            content: responseData.message || responseData.content || 'I understand your question. Let me help you with that.',
            sender: 'ai',
            timestamp: new Date(),
            type: 'text',
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
        // Add a fallback AI message
        const aiMessage: Message = {
          _id: (Date.now() + 1).toString(),
          content: "I'm here to help you with interior design questions! What would you like to know about creating your perfect space?",
          sender: 'ai',
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Add error message
      const errorMessage: Message = {
        _id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Memoize renderMessage
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser 
            ? { backgroundColor: colors.primary } 
            : { backgroundColor: colors.surface, borderColor: colors.border }
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? { color: '#FFFFFF' } : textStyle
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? { color: '#FFFFFF', opacity: 0.8 } : subtitleStyle
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  }, [colors, textStyle, subtitleStyle]);

  const quickQuestions = [
    "What colors work well together?",
    "How do I make a small room look bigger?",
    "What lighting should I use?",
    "Help me choose furniture style",
  ];

  return (
    <KeyboardAvoidingView 
      style={containerStyle} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, textStyle]}>AI Design Assistant</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>
          Get expert advice on interior design and styling
        </Text>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.welcomeContainer}>
          <View style={[styles.welcomeIcon, { backgroundColor: colors.primary }]}> 
            <Ionicons name="chatbubble-ellipses" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.welcomeTitle, textStyle]}>Welcome to SmartSpace.AI</Text>
          <Text style={[styles.welcomeText, subtitleStyle]}>
            I&apos;m your AI design assistant. Ask me anything about interior design, 
            color schemes, furniture placement, or styling tips!
          </Text>
          <View style={styles.quickQuestionsContainer}>
            <Text style={[styles.quickQuestionsTitle, textStyle]}>Quick Questions:</Text>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={`question-${question}-${index}`}
                style={[styles.quickQuestionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleQuickQuestion(question)}
              >
                <Text style={[styles.quickQuestionText, textStyle]}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? (
            <View style={styles.typingContainer}>
              <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                <Text style={[styles.typingText, subtitleStyle]}>AI is typing...</Text>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                </View>
              </View>
            </View>
          ) : null}
        />
      )}

      {/* Input Section */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, inputStyle]}
          placeholder="Ask about interior design..."
          placeholderTextColor={colors.textSecondary}
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
            (!inputMessage.trim() || isLoading) && { opacity: 0.5 }
          ]}
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  quickQuestionsContainer: {
    width: '100%',
  },
  quickQuestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickQuestionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  quickQuestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 16,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 