import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { DiaryEntry, formatDate } from "../../services/diaryService";

type Props = {
  entry: DiaryEntry;
  onPress: () => void;
};

const DiaryEntryCard: React.FC<Props> = ({ entry, onPress }) => {
  const previewText =
    entry.content.length > 100
      ? entry.content.substring(0, 100) + "..."
      : entry.content;

  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 rounded-2xl bg-neutral-900 p-4"
      activeOpacity={0.7}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text
          className="text-sm text-neutral-400"
          style={{ fontFamily: "Satoshi-Medium" }}
        >
          {formatDate(entry.date)}
        </Text>
        <Text
          className="text-xs text-neutral-500"
          style={{ fontFamily: "Satoshi-Regular" }}
        >
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </Text>
      </View>

      <Text
        className="text-base leading-6 text-white/80"
        style={{ fontFamily: "Satoshi-Regular" }}
        numberOfLines={3}
      >
        {previewText}
      </Text>
    </TouchableOpacity>
  );
};

export default DiaryEntryCard;
