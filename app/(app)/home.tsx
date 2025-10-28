import { toastConfig } from "@/config/toastConfig";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import DiaryEditor from "../../components/ui/DiaryEditor";
import DiaryEntryCard from "../../components/ui/DiaryEntryCard";
import DiaryEntryModal from "../../components/ui/DiaryEntryModal";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Screen from "../../components/ui/Screen";
import { useAuth } from "../../providers/AuthProvider";
import {
  DiaryEntry,
  getAllDiaryEntries,
  getTodayDate,
} from "../../services/diaryService";

export default function Home() {
  const { state, signOut } = useAuth();
  const [pastEntries, setPastEntries] = useState<DiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPastEntries();
  }, []);

  const loadPastEntries = async () => {
    const entries = await getAllDiaryEntries();
    const today = getTodayDate();
    // Filter out today's entry to show only past entries
    const past = entries.filter((entry) => entry.date !== today);
    setPastEntries(past);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPastEntries();
    setRefreshing(false);
  }, []);

  const handleEntryPress = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const handleSave = () => {
    loadPastEntries();
  };

  return (
    <Screen>
      <FlatList
        data={pastEntries}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Greeting */}
            <View className="mb-6 mt-24">
              <Text
                className="text-2xl font-semibold text-neutral-100"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                Hello {state.user?.phone}
              </Text>
              <Text
                className="mt-1 text-sm text-neutral-400"
                style={{ fontFamily: "Satoshi-Regular" }}
              >
                Capture your thoughts, reflect, and grow
              </Text>
            </View>

            {/* Diary Editor */}
            <View className="mb-6" style={{ height: 400 }}>
              <DiaryEditor onSave={handleSave} />
            </View>

            {/* Past Entries Header */}
            {pastEntries.length > 0 && (
              <View className="mb-4 mt-2">
                <Text
                  className="text-lg text-neutral-100"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  Past Entries
                </Text>
                <Text
                  className="mt-1 text-sm text-neutral-500"
                  style={{ fontFamily: "Satoshi-Regular" }}
                >
                  {pastEntries.length}{" "}
                  {pastEntries.length === 1 ? "entry" : "entries"}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <DiaryEntryCard entry={item} onPress={() => handleEntryPress(item)} />
        )}
        ListFooterComponent={
          <View className="mb-6 mt-4">
            <PrimaryButton title="Sign out" onPress={signOut} />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F4B514"
            colors={["#F4B514"]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Entry View Modal */}
      <DiaryEntryModal
        visible={modalVisible}
        entry={selectedEntry}
        onClose={() => setModalVisible(false)}
      />

      {/* Toast */}
      <Toast config={toastConfig} />
    </Screen>
  );
}
