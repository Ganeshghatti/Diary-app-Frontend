import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Screen from "../../components/ui/Screen";
import { streamDiaryChat } from "../../services/diaryService";
import { getUserProfile } from "../../services/userService";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function Search() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Fetch user profile picture
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile?.success && profile.data?.profile_pic_url) {
          setUserProfilePic(profile.data.profile_pic_url);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    Keyboard.dismiss();
    scrollToBottom();

    // Create AI response message with empty text
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: "",
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, aiMessage]);
    scrollToBottom();

    try {
      let streamedText = "";

      await streamDiaryChat(userMessage.text, (chunk: string) => {
        streamedText += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, text: streamedText, isStreaming: true }
              : msg
          )
        );
        scrollToBottom();
      });

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error("Error streaming chat:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                text: "Sorry, I couldn't process your request. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isUser) {
      return (
        <View className="flex-row justify-end mb-4 px-4">
          <View className="flex-row items-end max-w-[80%]">
            <View className="bg-[#F4B514] rounded-2xl rounded-br-sm px-4 py-3 mr-2">
              <Text
                className="text-[#1F1F1F] text-base"
                style={{ fontFamily: "Satoshi-Medium" }}
              >
                {item.text}
              </Text>
            </View>
            {userProfilePic ? (
              <Image
                source={{ uri: userProfilePic }}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <View className="w-8 h-8 rounded-full bg-[#4A4A4A] items-center justify-center">
                <Ionicons name="person" size={16} color="#9CA3AF" />
              </View>
            )}
          </View>
        </View>
      );
    }

    return (
      <View className="flex-row justify-start mb-4 px-4">
        <View className="flex-row items-end max-w-[80%]">
          <View className="w-8 h-8 rounded-full bg-[#F4B514] items-center justify-center mr-2">
            <Text
              className="text-[#1F1F1F] text-base font-bold"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              VD
            </Text>
          </View>
          <View className="bg-[#2A2A2A] rounded-2xl rounded-bl-sm px-4 py-3">
            <Text
              className="text-neutral-100 text-base"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              {item.text}
            </Text>
            {item.isStreaming && (
              <View className="mt-1">
                <View className="w-1 h-4 bg-[#F4B514] animate-pulse" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <View className="w-20 h-20 rounded-full bg-[#2A2A2A] items-center justify-center mb-4">
        <Text
          className="text-[#F4B514] text-3xl font-bold"
          style={{ fontFamily: "Satoshi-Bold" }}
        >
          VD
        </Text>
      </View>
      <Text
        className="text-2xl font-semibold text-neutral-100 text-center mb-2"
        style={{ fontFamily: "Satoshi-Bold" }}
      >
        Chat with Virtual Dad
      </Text>
      <Text
        className="text-neutral-400 text-center text-base"
        style={{ fontFamily: "Satoshi-Regular" }}
      >
        Ask me anything about your diary entries, your mood, health, expenses,
        or just have a conversation!
      </Text>
      <View className="mt-8 w-full">
        <Text
          className="text-neutral-500 text-sm mb-3"
          style={{ fontFamily: "Satoshi-Medium" }}
        >
          Try asking:
        </Text>
        <View className="space-y-2">
          <View className="bg-[#2A2A2A] rounded-xl px-4 py-3 mb-2">
            <Text
              className="text-neutral-300 text-sm"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              &ldquo;How am I doing this month?&rdquo;
            </Text>
          </View>
          <View className="bg-[#2A2A2A] rounded-xl px-4 py-3 mb-2">
            <Text
              className="text-neutral-300 text-sm"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              &ldquo;Show my birth certificate&rdquo;
            </Text>
          </View>
          <View className="bg-[#2A2A2A] rounded-xl px-4 py-3">
            <Text
              className="text-neutral-300 text-sm"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              &ldquo;How is my heart status last month?&rdquo;
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="flex-1 pt-16">
          {/* Header */}
          <View className="px-4 pb-4 border-b border-[#2A2A2A]">
            <Text
              className="text-2xl font-semibold text-neutral-100"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              Chat
            </Text>
          </View>

          {/* Messages List */}
          <View className="flex-1">
            {messages.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
                onContentSizeChange={scrollToBottom}
                onLayout={scrollToBottom}
              />
            )}
          </View>

          {/* Input Area */}
          <View className="px-4 py-3 border-t border-[#2A2A2A] bg-[#1F1F1F]">
            <View className="flex-row items-center bg-[#2A2A2A] rounded-full px-4 py-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor="#6B7280"
                className="flex-1 text-neutral-100 text-base py-2"
                style={{ fontFamily: "Satoshi-Regular" }}
                multiline
                maxLength={500}
                editable={!isLoading}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="ml-2"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#F4B514" />
                ) : (
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      inputText.trim() ? "bg-[#F4B514]" : "bg-[#3A3A3A]"
                    }`}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={inputText.trim() ? "#1F1F1F" : "#6B7280"}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
