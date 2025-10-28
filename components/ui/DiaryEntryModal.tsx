import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DiaryEntry, formatDate } from "../../services/diaryService";

type Props = {
  visible: boolean;
  entry: DiaryEntry | null;
  onClose: () => void;
};

const DiaryEntryModal: React.FC<Props> = ({ visible, entry, onClose }) => {
  if (!entry) return null;

  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/80"
        onPress={onClose}
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <Pressable
          className="mx-5 w-full max-w-md rounded-3xl bg-neutral-900 p-6"
          onPress={(e) => e.stopPropagation()}
          style={{ maxHeight: "80%" }}
        >
          {/* Header */}
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1">
              <Text
                className="text-lg text-neutral-100"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                {formatDate(entry.date)}
              </Text>
              <Text
                className="mt-1 text-xs text-neutral-500"
                style={{ fontFamily: "Satoshi-Regular" }}
              >
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="rounded-full bg-neutral-800 p-2"
            >
              <Text
                className="text-base text-neutral-400"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Text
              className="text-base leading-7 text-white/90"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              {entry.content}
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DiaryEntryModal;
