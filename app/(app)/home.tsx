/* eslint-disable react-hooks/exhaustive-deps */
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DiaryCaptureModal from "../../components/ui/DiaryCaptureModal";
import TrackerButtons from "../../components/ui/TrackerButtons";
import {
  fetchDiariesByMonth,
  fetchDiaryByDate,
  getTodayDateForAPI,
} from "../../services/diaryService";
import { getUserProfile, UserProfile } from "../../services/userService";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
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

// Helper function to get days in a month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get the first day of the month (0 = Sunday, 6 = Saturday)
const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

export default function Home() {
  const today = useMemo(() => new Date(), []); // Current date
  const [currentMonth] = useState(today.getMonth()); // Current month only
  const [currentYear] = useState(today.getFullYear()); // Current year only
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [captureModalVisible, setCaptureModalVisible] = useState(false);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [todayMoods, setTodayMoods] = useState<string[]>([]);
  const [todayDiaryText, setTodayDiaryText] = useState<string>("");
  const [monthlyDiaries, setMonthlyDiaries] = useState<any[]>([]);
  const [todayHealthStats, setTodayHealthStats] = useState<any[]>([]);

  // Helper function to check what data exists for a date
  const getDateData = (day: number) => {
    const dateStr = `${String(day).padStart(2, "0")}-${String(currentMonth + 1).padStart(2, "0")}-${currentYear}`;
    const diary = monthlyDiaries.find((d) => d.date === dateStr);

    if (!diary) return null;

    return {
      hasDiary: !!diary.diary?.content || !!diary.diary?.summary,
      hasMood: diary.mood_tracker && diary.mood_tracker.length > 0,
      hasExpense: diary.expense_tracker && diary.expense_tracker.length > 0,
      hasHealth: diary.health_stats && diary.health_stats.length > 0,
    };
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add previous month's days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevMonthYear);

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isPrevMonth: true,
        hasEntry: false,
        isToday: false,
      });
    }

    // Add current month's days
    const isCurrentMonth =
      currentMonth === today.getMonth() && currentYear === today.getFullYear();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isPrevMonth: false,
        isNextMonth: false,
        hasEntry: false, // You can add logic here to check for entries
        isToday: isCurrentMonth && i === today.getDate(),
      });
    }

    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isNextMonth: true,
        hasEntry: false,
        isToday: false,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getUserProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  const fetchTodayExpenses = useCallback(async () => {
    try {
      const todayDate = getTodayDateForAPI();
      const diary = await fetchDiaryByDate(todayDate);
      const expenses = diary?.expense_tracker ?? [];
      const total = expenses.reduce(
        (sum: number, expense: any) => sum + (expense.amount || 0),
        0
      );
      setTotalExpense(total);
    } catch {
      // Silently handle errors - just set default value
      setTotalExpense(0);
    }
  }, []);

  const fetchTodayMoods = useCallback(async () => {
    try {
      const todayDate = getTodayDateForAPI();
      const diary = await fetchDiaryByDate(todayDate);
      const moods = diary?.mood_tracker ?? [];
      setTodayMoods(moods);
    } catch {
      // Silently handle errors - just set default value
      setTodayMoods([]);
    }
  }, []);

  const fetchTodayHealthStats = useCallback(async () => {
    try {
      const todayDate = getTodayDateForAPI();
      const diary = await fetchDiaryByDate(todayDate);
      const healthStats = diary?.health_stats ?? [];
      setTodayHealthStats(healthStats);
    } catch {
      // Silently handle errors - just set default value
      setTodayHealthStats([]);
    }
  }, []);

  // Helper function to strip HTML tags and decode HTML entities
  const stripHtmlTags = (html: string): string => {
    if (!html) return "";

    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, " ");

    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

    // Remove multiple spaces and trim
    text = text.replace(/\s+/g, " ").trim();

    return text;
  };

  const fetchTodayDiary = useCallback(async () => {
    try {
      const todayDate = getTodayDateForAPI();
      const diary = await fetchDiaryByDate(todayDate);
      // Only show the diary content (not summary)
      const diaryText = diary?.diary?.content || "";
      // Strip HTML tags before setting the state
      setTodayDiaryText(stripHtmlTags(diaryText));
    } catch {
      // Silently handle errors - just set default value
      setTodayDiaryText("");
    }
  }, []);

  const fetchMonthlyDiaries = useCallback(async () => {
    try {
      const month = String(currentMonth + 1).padStart(2, "0");
      const year = String(currentYear);
      const diaries = await fetchDiariesByMonth(month, year);
      setMonthlyDiaries(diaries);
    } catch {
      // Silently handle errors - just set empty array
      setMonthlyDiaries([]);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchProfile();
    fetchTodayExpenses();
    fetchTodayMoods();
    fetchTodayDiary();
    fetchMonthlyDiaries();
    fetchTodayHealthStats();
  }, [
    fetchProfile,
    fetchTodayExpenses,
    fetchTodayMoods,
    fetchTodayDiary,
    fetchMonthlyDiaries,
    fetchTodayHealthStats,
  ]);

  // Fetch monthly diaries when month/year changes
  useEffect(() => {
    fetchMonthlyDiaries();
  }, [currentMonth, currentYear, fetchMonthlyDiaries]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTodayExpenses();
      fetchTodayMoods();
      fetchTodayDiary();
      fetchMonthlyDiaries();
      fetchTodayHealthStats();
    }, [
      fetchTodayExpenses,
      fetchTodayMoods,
      fetchTodayHealthStats,
      fetchTodayDiary,
      fetchMonthlyDiaries,
    ])
  );

  const getProfileImageUrl = () => {
    if (profile?.profile_pic) {
      const base64String = profile.profile_pic;
      if (base64String.startsWith("data:image")) {
        return { uri: base64String };
      }
      return { uri: `data:image/png;base64,${base64String}` };
    }
    return require("../../assets/profile.jpg");
  };

  const handleCaptureDiary = () => {
    setCaptureModalVisible(true);
  };

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
          <View className="mb-8 mt-4 flex-row items-center justify-between">
            <Text
              className="text-lg text-neutral-100"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              DiaryDad
            </Text>
            {/* Profile with Gradient Border */}
            <Pressable
              onPress={() => router.push("/(app)/my-account")}
              style={{ padding: 3, borderRadius: 50 }}
            >
              <LinearGradient
                colors={["#7DDFE8", "#B8E636"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 3,
                  borderRadius: 50,
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 27,
                    overflow: "hidden",
                    backgroundColor: "#000",
                  }}
                >
                  <Image
                    source={getProfileImageUrl()}
                    style={{ width: 30, height: 30 }}
                    resizeMode="cover"
                  />
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Calendar Card */}
          <View className="mb-6 h-[395px] rounded-3xl p-5 bg-[#FFFFFF]/10 justify-center">
            {/* Month and Year */}
            <View className="mb-3 items-center px-4">
              <View className="items-center">
                <Text
                  className="text-xl text-neutral-100"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  {MONTHS[currentMonth]}
                </Text>
                <Text
                  className="text-sm text-neutral-500"
                  style={{ fontFamily: "Satoshi-Regular" }}
                >
                  {currentYear}
                </Text>
              </View>
            </View>

            {/* Weekday Headers */}
            <View className="mb-2 mt-4 flex-row justify-between">
              {WEEKDAYS.map((day) => (
                <View key={day} className="w-11 items-center">
                  <Text
                    className="text-xs text-neutral-500"
                    style={{ fontFamily: "Satoshi-Medium" }}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap">
              {calendarDays.map((dayData, index) => {
                const isToday = dayData.isToday;
                const isOtherMonth = dayData.isPrevMonth || dayData.isNextMonth;
                const isSunday = index % 7 === 0;
                const isSaturday = index % 7 === 6;
                const isPastDate =
                  !isOtherMonth && dayData.day < today.getDate();

                // Get data indicators for this date
                const dateData = !isOtherMonth
                  ? getDateData(dayData.day)
                  : null;
                const hasAnyData =
                  dateData &&
                  (dateData.hasDiary ||
                    dateData.hasMood ||
                    dateData.hasExpense ||
                    dateData.hasHealth);

                return (
                  <Pressable
                    key={`${dayData.day}-${index}`}
                    className="mb-2 w-11 items-center justify-center"
                  >
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-full ${
                        isToday ? "bg-neutral-600" : ""
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          isOtherMonth
                            ? "text-neutral-700"
                            : isPastDate && !hasAnyData
                              ? "text-red-500"
                              : isSunday || isSaturday
                                ? "text-neutral-400"
                                : "text-neutral-100"
                        }`}
                        style={{ fontFamily: "Satoshi-Medium" }}
                      >
                        {dayData.day}
                      </Text>
                    </View>
                    {/* Data Indicator Dots */}
                    {dateData && !isOtherMonth && (
                      <View className="mt-0.5 flex-row gap-0.5">
                        {dateData.hasDiary && (
                          <View
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: "#F8D247" }}
                          />
                        )}
                        {dateData.hasMood && (
                          <View
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: "#FF69B4" }}
                          />
                        )}
                        {dateData.hasExpense && (
                          <View
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: "#4A9EFF" }}
                          />
                        )}
                        {dateData.hasHealth && (
                          <View
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: "#4AFF88" }}
                          />
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Today's Diary Capture Section */}
          <View className="rounded-[20px] py-6 px-3 bg-white/10 ">
            {/* Date Header */}
            <View className="mb-6 items-center">
              <Text
                className="text-2xl text-neutral-100"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                {MONTHS[today.getMonth()].slice(0, 3)} {today.getDate()}
              </Text>
              <Text
                className="mt-1 text-sm text-neutral-500"
                style={{ fontFamily: "Satoshi-Regular" }}
              >
                Today
              </Text>
            </View>

            {/* Tracker Buttons */}
            <TrackerButtons
              todayDiaryText={todayDiaryText}
              todayMoods={todayMoods}
              totalExpense={totalExpense}
              todayHealthStats={todayHealthStats}
              onDiaryPress={handleCaptureDiary}
              onMoodPress={() => router.push("/(app)/mood-tracker")}
              onExpensePress={() => router.push("/(app)/expense-tracker")}
              onHealthPress={() => router.push("/(app)/health-tracker")}
            />
          </View>
        </ScrollView>

        {/* Diary Capture Modal */}
        <DiaryCaptureModal
          visible={captureModalVisible}
          onClose={() => setCaptureModalVisible(false)}
          date="Sept 29"
        />
      </SafeAreaView>
    </ImageBackground>
  );
}
