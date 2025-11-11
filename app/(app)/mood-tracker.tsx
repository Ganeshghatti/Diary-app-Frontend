import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  fetchDiaryByDate,
  getTodayDateForAPI,
  saveDiaryWithTrackers,
} from "../../services/diaryService";

const DEFAULT_MOODS = [
  "Happy",
  "Calm",
  "Loved",
  "Grateful",
  "Cheerful",
  "Excited",
  "Playful",
  "Relaxed",
  "Tired",
  "Thoughtful",
  "Neutral",
  "Uneasy",
  "Tired",
  "Skeptical",
  "Meh",
  "Meh",
  "Tired",
  "Sad",
  "Angry",
  "Anxious",
  "Unsure",
  "Confused",
  "Exhausted",
  "Overwhelmed",
  "Stressed",
  "Drained",
  "Unwell",
];

export default function MoodTracker() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  // Use today's date if no date param is provided
  const dateQuery = (dateParam as string) || getTodayDateForAPI();

  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods((prev) => {
      if (prev.includes(mood)) {
        // Remove mood if already selected
        return prev.filter((m) => m !== mood);
      } else {
        // Add mood if not selected
        return [...prev, mood];
      }
    });
  };

  // Load diary mood_tracker when date query param is provided or on mount (today's date)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!dateQuery) return;
      try {
        const diary = await fetchDiaryByDate(dateQuery);
        if (!mounted) return;
        const tracker = diary?.mood_tracker ?? [];
        // mood_tracker is an array of strings
        setSelectedMoods(tracker || []);
      } catch {
        // Silently handle errors - just set empty array
        setSelectedMoods([]);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [dateQuery]);

  const handleSave = async () => {
    if (selectedMoods.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Moods Selected",
        text2: "Please select at least one mood",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert moods to lowercase for API
      const moodData = selectedMoods.map((mood) => mood.toLowerCase());

      // Save to API (always include date - either from param or today's date)
      await saveDiaryWithTrackers({
        date: dateQuery,
        mood_tracker: moodData,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Moods saved successfully!",
      });

      // Navigate to home after a short delay
      setTimeout(() => {
        router.push("/(app)/home");
      }, 1000);
    } catch (error: any) {
      console.error("Error saving moods:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to save moods",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background-2.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.push("/(app)/home")}
              className="mr-3"
            >
              <Text className="text-2xl text-neutral-100">‹</Text>
            </Pressable>
            <Text
              className="text-xl text-neutral-100"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              Mood Tracker
            </Text>
          </View>
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting || selectedMoods.length === 0}
            className={`rounded-full px-4 py-2 ${
              selectedMoods.length === 0 || isSubmitting
                ? "bg-[#FFFFFF]/20"
                : "bg-[#F4B514]"
            }`}
          >
            <Text
              className={`text-base ${
                selectedMoods.length === 0 || isSubmitting
                  ? "text-neutral-400"
                  : "text-[#0A0E1A]"
              }`}
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              {isSubmitting ? "..." : "✓"}
            </Text>
          </Pressable>
        </View>

        {/* Mood Selection Tags */}
        <View className="px-5 py-4">
          <Text
            className="mb-3 text-sm text-neutral-400"
            style={{ fontFamily: "Satoshi-Medium" }}
          >
            Pick today&apos;s mood
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => {
                // Clear all selections or could add custom mood functionality
                setSelectedMoods([]);
              }}
              className="rounded-full bg-[#F4B514] px-4 py-2"
            >
              <Text
                className="text-sm text-[#0A0E1A]"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                + Add
              </Text>
            </Pressable>

            {DEFAULT_MOODS.map((mood, index) => (
              <Pressable
                key={`${mood}-${index}`}
                onPress={() => handleMoodToggle(mood)}
                className={`rounded-full px-4 py-2 ${
                  selectedMoods.includes(mood)
                    ? "bg-[#F4B514]/40"
                    : "bg-[#FFFFFF]/10"
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedMoods.includes(mood)
                      ? "text-white"
                      : "text-neutral-100"
                  }`}
                  style={{ fontFamily: "Satoshi-Medium" }}
                >
                  {mood}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          {/* Selected Moods Display */}
          {selectedMoods.length > 0 && (
            <View className="mb-6">
              <Text
                className="mb-3 text-sm text-neutral-400"
                style={{ fontFamily: "Satoshi-Medium" }}
              >
                Selected moods ({selectedMoods.length})
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedMoods.map((mood, index) => (
                  <Pressable
                    key={`${mood}-${index}`}
                    onPress={() => handleMoodToggle(mood)}
                    className="rounded-full bg-[#F4B514]/20 border border-[#F4B514] px-4 py-2 flex-row items-center"
                  >
                    <Text
                      className="text-sm text-neutral-100"
                      style={{ fontFamily: "Satoshi-Medium" }}
                    >
                      {mood}
                    </Text>
                    <Text
                      className="text-sm text-neutral-100 ml-2"
                      style={{ fontFamily: "Satoshi-Bold" }}
                    >
                      ×
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Section - Save Button */}
        {selectedMoods.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-[#FFFFFF]/10">
            <Pressable
              onPress={handleSave}
              disabled={isSubmitting}
              className="rounded-[20px] bg-[#F4B514] px-4 py-4"
            >
              <Text
                className="text-center text-base text-[#0A0E1A]"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                {isSubmitting ? "Saving..." : "Save Moods"}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}
