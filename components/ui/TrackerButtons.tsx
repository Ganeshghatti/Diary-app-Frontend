import React from "react";
import { View } from "react-native";
import DiaryButton from "./DiaryButton";
import ExpenseButton from "./ExpenseButton";
import HealthButton from "./HealthButton";
import MoodButton from "./MoodButton";

interface TrackerButtonsProps {
  todayDiaryText: string;
  todayMoods: string[];
  totalExpense: number;
  todayHealthStats: any[];
  onDiaryPress: () => void;
  onMoodPress: () => void;
  onExpensePress: () => void;
  onHealthPress: () => void;
}

export default function TrackerButtons({
  todayDiaryText,
  todayMoods,
  totalExpense,
  todayHealthStats,
  onDiaryPress,
  onMoodPress,
  onExpensePress,
  onHealthPress,
}: TrackerButtonsProps) {
  return (
    <View>
      {/* Diary Button */}
      <DiaryButton onPress={onDiaryPress} todayDiaryText={todayDiaryText} />

      {/* Mood Button */}
      <MoodButton onPress={onMoodPress} todayMoods={todayMoods} />

      {/* Expense Button */}
      <ExpenseButton onPress={onExpensePress} totalExpense={totalExpense} />

      {/* Health Button */}
      <HealthButton
        onPress={onHealthPress}
        todayHealthStats={todayHealthStats}
      />
    </View>
  );
}
