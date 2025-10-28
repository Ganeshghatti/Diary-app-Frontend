import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  formatDate,
  getTodayDate,
  getTodayEntry,
  saveDiaryEntry,
} from "../../services/diaryService";

type Props = {
  onSave?: () => void;
};

const DiaryEditor: React.FC<Props> = ({ onSave }) => {
  const [content, setContent] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    loadTodayEntry();
  }, []);

  useEffect(() => {
    // Calculate word count
    const words = content.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [content]);

  const loadTodayEntry = async () => {
    setLoading(true);
    const entry = await getTodayEntry();
    if (entry) {
      setContent(entry.content);
      setInitialContent(entry.content);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty Entry",
        text2: "Please write something before saving",
        position: "top",
      });
      return;
    }

    if (content === initialContent) {
      Toast.show({
        type: "error",
        text1: "No Changes",
        text2: "You haven't made any changes",
        position: "top",
      });
      return;
    }

    Keyboard.dismiss();
    setSaving(true);
    const success = await saveDiaryEntry(content);
    setSaving(false);

    if (success) {
      setInitialContent(content);
      Toast.show({
        type: "success",
        text1: "Saved",
        text2: "Your diary entry has been saved",
        position: "top",
      });
      onSave?.();
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save diary entry",
        position: "top",
      });
    }
  };

  const hasChanges = content !== initialContent;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#F4B514" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="mb-4">
        <Text
          className="text-xl text-neutral-100"
          style={{ fontFamily: "Satoshi-Bold" }}
        >
          Today&apos;s Entry
        </Text>
        <Text
          className="mt-1 text-sm text-neutral-400"
          style={{ fontFamily: "Satoshi-Medium" }}
        >
          {formatDate(getTodayDate())}
        </Text>
      </View>

      {/* Text Editor */}
      <View className="flex-1 rounded-3xl bg-neutral-900 p-4">
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="How was your day? Write your thoughts here..."
          placeholderTextColor="#6B7280"
          multiline
          textAlignVertical="top"
          className="flex-1 text-base text-white/90"
          style={{ fontFamily: "Satoshi-Regular" }}
        />
      </View>

      {/* Footer with word count and save button */}
      <View className="mt-4 flex-row items-center justify-between">
        <Text
          className="text-sm text-neutral-500"
          style={{ fontFamily: "Satoshi-Medium" }}
        >
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !hasChanges}
          className={`rounded-full px-6 py-3 ${
            hasChanges && !saving ? "bg-[#F4B514]" : "bg-neutral-800"
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text
              className={`text-sm ${
                hasChanges ? "text-black" : "text-neutral-600"
              }`}
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              Save Entry
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DiaryEditor;
