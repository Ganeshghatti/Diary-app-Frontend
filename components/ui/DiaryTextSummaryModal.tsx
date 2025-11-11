import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface DiaryTextSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  extractedText: string;
  summary: string;
  isLoadingSummary: boolean;
  onSave: () => void;
  remainingUses?: number | null;
}

export default function DiaryTextSummaryModal({
  visible,
  onClose,
  extractedText,
  summary,
  isLoadingSummary,
  onSave,
  remainingUses,
}: DiaryTextSummaryModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={["#1e3a5f", "#0d1f33"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-4 pt-12">
          <Pressable
            onPress={onClose}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          <Text
            className="text-xl text-white"
            style={{ fontFamily: "Satoshi-Bold" }}
          >
            Diary Entry
          </Text>
          <View className="h-10 w-10" />
        </View>

        {/* Remaining Uses Badge */}
        {remainingUses !== null && remainingUses !== undefined && (
          <View className="mx-5 mb-2 flex-row items-center justify-center rounded-full bg-white/10 py-2">
            <Ionicons name="camera-outline" size={16} color="#F8D247" />
            <Text
              className="ml-2 text-xs text-neutral-300"
              style={{ fontFamily: "Satoshi-Medium" }}
            >
              {remainingUses} image scan{remainingUses !== 1 ? "s" : ""}{" "}
              remaining today
            </Text>
          </View>
        )}

        {/* Content */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Extracted Text Section */}
          <View className="mb-6 mt-4">
            <View className="mb-3 flex-row items-center">
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#F8D247"
              />
              <Text
                className="ml-2 text-base text-white"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                Extracted Text
              </Text>
            </View>
            <View className="rounded-2xl bg-white/10 p-4">
              <Text
                className="text-sm leading-6 text-white"
                style={{ fontFamily: "Satoshi-Regular" }}
              >
                {extractedText}
              </Text>
            </View>
          </View>

          {/* Summary Section */}
          <View className="mb-6">
            <View className="mb-3 flex-row items-center">
              <Ionicons name="sparkles-outline" size={20} color="#F8D247" />
              <Text
                className="ml-2 text-base text-white"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                AI Summary
              </Text>
            </View>
            <View className="min-h-[100px] rounded-2xl bg-white/10 p-4">
              {isLoadingSummary && !summary ? (
                <View className="flex-1 items-center justify-center py-8">
                  <ActivityIndicator size="large" color="#F8D247" />
                  <Text
                    className="mt-4 text-sm text-neutral-400"
                    style={{ fontFamily: "Satoshi-Regular" }}
                  >
                    Generating summary...
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-sm leading-6 text-white"
                  style={{ fontFamily: "Satoshi-Regular" }}
                >
                  {summary || "Summary will appear here..."}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-5 pb-8 pt-4">
          <Pressable
            onPress={onSave}
            disabled={isLoadingSummary}
            className={`items-center justify-center rounded-full py-4 ${
              isLoadingSummary ? "opacity-50" : ""
            }`}
            style={{ backgroundColor: "#F8D247" }}
          >
            <Text
              className="text-base text-black"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              Save to Diary
            </Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            className="mt-3 items-center justify-center rounded-full bg-white/10 py-4"
          >
            <Text
              className="text-base text-white"
              style={{ fontFamily: "Satoshi-Medium" }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Modal>
  );
}
