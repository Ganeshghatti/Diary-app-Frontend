import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TrackerButtons from "../../components/ui/TrackerButtons";
import { fetchDiaryByDate } from "../../services/diaryService";

export default function Archive() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [diaryData, setDiaryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper function to strip HTML tags
  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    let text = html.replace(/<[^>]*>/g, " ");
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    text = text.replace(/\s+/g, " ").trim();
    return text;
  };

  // Format date to DD-MM-YYYY for API
  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch diary data for selected date
  const fetchDiaryData = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = formatDateForAPI(date);
      const diary = await fetchDiaryByDate(dateStr);
      setDiaryData(diary);
    } catch (error) {
      console.error("Error fetching diary:", error);
      setDiaryData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when selectedDate changes
  useEffect(() => {
    fetchDiaryData(selectedDate);
  }, [selectedDate, fetchDiaryData]);

  // Navigation handlers
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    const today = new Date();
    // Don't allow navigation beyond today
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getWeekday = (date: Date): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Check if selected date is today
  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  // Extract data from diary response
  const diaryText = diaryData?.diary?.content
    ? stripHtmlTags(diaryData.diary.content)
    : "";
  const aiSummary = diaryData?.diary?.summary || "";
  const moods = diaryData?.mood_tracker || [];
  const expenses = diaryData?.expense_tracker || [];
  const healthStats = diaryData?.health_stats || [];
  const totalExpense = expenses.reduce(
    (sum: number, expense: any) => sum + (expense.amount || 0),
    0
  );

  return (
    <ImageBackground
      source={require("../../assets/background-2.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View className="mb-6 mt-4">
            <Text
              className="text-2xl font-semibold text-neutral-100"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              Archive
            </Text>
            <Text
              className="mt-2 text-neutral-500"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              View your past diary entries
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View className="py-10">
              <ActivityIndicator size="large" color="#7DDFE8" />
            </View>
          )}

          {/* Content */}
          {!loading && (
            <>
              {/* Tracker Buttons */}
              <TrackerButtons
                todayDiaryText={diaryText}
                todayMoods={moods}
                totalExpense={totalExpense}
                todayHealthStats={healthStats}
                onDiaryPress={() => router.push("/(app)/home")}
                onMoodPress={() => router.push("/(app)/mood-tracker")}
                onExpensePress={() => router.push("/(app)/expense-tracker")}
                onHealthPress={() => router.push("/(app)/health-tracker")}
              />

              {/* AI Summary Section */}
              {aiSummary && (
                <View className="mt-6 rounded-2xl bg-white/10 p-5">
                  <Text
                    className="mb-3 text-lg text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    AI Summary
                  </Text>
                  <Text
                    className="text-base leading-6 text-neutral-300"
                    style={{ fontFamily: "Satoshi-Regular" }}
                  >
                    {aiSummary}
                  </Text>
                </View>
              )}

              {/* Actual Diary Content */}
              {diaryText && (
                <View className="mt-6 rounded-2xl bg-white/10 p-5">
                  <Text
                    className="mb-3 text-lg text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    Your Diary
                  </Text>
                  <Text
                    className="text-base leading-6 text-neutral-300"
                    style={{ fontFamily: "Satoshi-Regular" }}
                  >
                    {diaryText}
                  </Text>
                </View>
              )}

              {/* No Data Message */}
              {!diaryData && !loading && (
                <View className="mt-10 items-center rounded-2xl bg-white/5 p-8">
                  <Text
                    className="text-center text-neutral-400"
                    style={{ fontFamily: "Satoshi-Medium", fontSize: 16 }}
                  >
                    No diary entry found for this date
                  </Text>
                  <Text
                    className="mt-2 text-center text-neutral-500"
                    style={{ fontFamily: "Satoshi-Regular", fontSize: 14 }}
                  >
                    Use the navigation to browse other dates
                  </Text>
                </View>
              )}

              {/* Date Navigation - Bottom */}
              <View className="mt-8 flex-row items-center justify-between rounded-2xl bg-white/10 px-4 py-4">
                <Pressable
                  onPress={goToPreviousDay}
                  className="rounded-full bg-white/10 p-3"
                >
                  <Text
                    className="text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold", fontSize: 18 }}
                  >
                    ←
                  </Text>
                </Pressable>

                <Pressable onPress={goToToday}>
                  <View className="items-center">
                    <Text
                      className="text-lg text-neutral-100"
                      style={{ fontFamily: "Satoshi-Bold" }}
                    >
                      {formatDisplayDate(selectedDate)}
                    </Text>
                    <Text
                      className="text-sm text-neutral-500"
                      style={{ fontFamily: "Satoshi-Regular" }}
                    >
                      {getWeekday(selectedDate)}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={goToNextDay}
                  disabled={isToday()}
                  className={`rounded-full bg-white/10 p-3 ${
                    isToday() ? "opacity-30" : ""
                  }`}
                >
                  <Text
                    className="text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold", fontSize: 18 }}
                  >
                    →
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
