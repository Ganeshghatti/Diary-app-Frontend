import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  fetchDiaryByDate,
  getTodayDateForAPI,
  saveDiaryWithTrackers,
} from "../../services/diaryService";

interface HealthStat {
  name: string;
  description: string;
  value: string;
  unit: string;
}

interface DefaultHealthCategory {
  name: string;
  unit: string;
  description: string;
}

const DEFAULT_HEALTH_CATEGORIES: DefaultHealthCategory[] = [
  { name: "Steps", unit: "steps", description: "Daily step count" },
  { name: "Sleep", unit: "hrs", description: "Hours of sleep" },
  { name: "Heart Rate", unit: "bpm", description: "Heart rate" },
  {
    name: "Blood Pressure",
    unit: "mmHg",
    description: "Blood pressure reading",
  },
  { name: "Blood Sugar", unit: "mg/dL", description: "Blood sugar level" },
  { name: "Weight", unit: "kg", description: "Body weight" },
  { name: "Body Temperature", unit: "°F", description: "Body temperature" },
];

export default function HealthTracker() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  // Use today's date if no date param is provided
  const dateQuery = (dateParam as string) || getTodayDateForAPI();

  const [healthStats, setHealthStats] = useState<HealthStat[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleCategorySelect = (category: DefaultHealthCategory | "Add") => {
    if (category === "Add") {
      setShowCustomInput(true);
      setSelectedCategory("");
      setSelectedUnit("");
      setDescription("");
      setShowAddModal(true);
    } else {
      setSelectedCategory(category.name);
      setSelectedUnit(category.unit);
      setDescription(category.description);
      setShowCustomInput(false);
      setCustomCategory("");
      setCustomUnit("");
      setShowAddModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedCategory("");
    setSelectedUnit("");
    setValue("");
    setDescription("");
    setCustomCategory("");
    setCustomUnit("");
    setShowCustomInput(false);
    setEditingIndex(null);
  };

  const handleAddHealthStat = () => {
    const finalCategory = showCustomInput ? customCategory : selectedCategory;
    const finalUnit = showCustomInput ? customUnit : selectedUnit;
    const finalDescription = showCustomInput ? "" : description;

    if (!finalCategory.trim()) {
      Toast.show({
        type: "error",
        text1: "Category Required",
        text2: "Please select or enter a category",
      });
      return;
    }

    if (!finalUnit.trim()) {
      Toast.show({
        type: "error",
        text1: "Unit Required",
        text2: "Please enter a unit",
      });
      return;
    }

    if (!value.trim() || isNaN(parseFloat(value))) {
      Toast.show({
        type: "error",
        text1: "Invalid Value",
        text2: "Please enter a valid value",
      });
      return;
    }

    const newHealthStat: HealthStat = {
      name: finalCategory,
      description: finalDescription,
      value: value,
      unit: finalUnit,
    };

    if (editingIndex !== null && editingIndex >= 0) {
      // Update existing health stat
      const updated = healthStats.map((stat, i) =>
        i === editingIndex ? newHealthStat : stat
      );
      setHealthStats(updated);
      setEditingIndex(null);
      Toast.show({ type: "success", text1: "Health Stat Updated" });
    } else {
      setHealthStats([...healthStats, newHealthStat]);
      Toast.show({
        type: "success",
        text1: "Health Stat Added",
        text2: `${finalCategory}: ${value} ${finalUnit}`,
      });
    }

    // Close modal and reset form
    handleCloseModal();
  };

  const handleDeleteHealthStat = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedStats = healthStats.filter((_, i) => i !== deleteIndex);
      setHealthStats(updatedStats);
      Toast.show({
        type: "success",
        text1: "Health Stat Deleted",
      });
    }
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleEditHealthStat = (index: number) => {
    const stat = healthStats[index];
    if (!stat) return;
    setSelectedCategory(stat.name);
    setSelectedUnit(stat.unit);
    setValue(stat.value);
    setDescription(stat.description || "");
    setShowCustomInput(false);
    setEditingIndex(index);
    setShowAddModal(true);
  };

  // Load diary health_stats when date query param is provided or on mount (today's date)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!dateQuery) return;
      try {
        const diary = await fetchDiaryByDate(dateQuery);
        if (!mounted) return;
        const tracker = diary?.health_stats ?? [];
        const mapped: HealthStat[] = (tracker || []).map((t: any) => ({
          name: t.name || "",
          description: t.description || "",
          value: t.value != null ? String(t.value) : "0",
          unit: t.unit || "",
        }));
        setHealthStats(mapped);
      } catch {
        // Silently handle errors - just set empty array
        setHealthStats([]);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [dateQuery]);

  const handleSave = async () => {
    if (healthStats.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Health Stats",
        text2: "Please add at least one health stat",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Format health stats for API
      const healthData = healthStats.map((stat) => ({
        name: stat.name,
        description: stat.description || "",
        value: parseFloat(stat.value),
        unit: stat.unit,
      }));

      // Save to API (always include date - either from param or today's date)
      await saveDiaryWithTrackers({
        date: dateQuery,
        health_stats: healthData,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Health stats saved successfully!",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving health stats:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to save health stats",
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
            <Pressable onPress={() => router.back()} className="mr-3">
              <Text className="text-2xl text-neutral-100">‹</Text>
            </Pressable>
            <Text
              className="text-xl text-neutral-100"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              Health Stats
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          {/* Instruction Note */}
          {healthStats.length > 0 && (
            <Text
              className="mb-3 text-xs text-neutral-400 text-center"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              Hold on an item to delete it
            </Text>
          )}

          {/* Health Stats List */}
          {healthStats.map((stat, index) => (
            <Pressable
              key={index}
              onLongPress={() => handleDeleteHealthStat(index)}
              onPress={() => handleEditHealthStat(index)}
              className="mb-3 rounded-2xl  p-4"
            >
              <View className="flex-row border-b pb-5 border-[#FFFFFF]/60 items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-xl text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    {stat.name}
                  </Text>
                  {stat.description ? (
                    <Text
                      className="mt-1 text-base text-neutral-400"
                      style={{ fontFamily: "Satoshi-Regular" }}
                    >
                      {stat.description}
                    </Text>
                  ) : null}
                </View>
                <View className="bg-[#FFFFFF]/10 p-5 border rounded-[12px]">
                  <Text
                    className="text-base text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    className="text-xs text-neutral-400 text-center mt-1"
                    style={{ fontFamily: "Satoshi-Regular" }}
                  >
                    {stat.unit}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Add Health Stat Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/50"
            onPress={handleCloseModal}
          >
            <Pressable
              className="mx-5 w-11/12 rounded-3xl bg-black p-6"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <View className="mb-6 flex-row items-center justify-between">
                <Text
                  className="text-xl text-neutral-100"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  {editingIndex !== null
                    ? "Edit Health Stat"
                    : "Add Health Stat"}
                </Text>
                <Pressable onPress={handleCloseModal}>
                  <Text className="text-2xl text-neutral-100">×</Text>
                </Pressable>
              </View>

              {/* Form Fields */}
              {showCustomInput ? (
                <>
                  <View className="mb-4">
                    <Text
                      className="mb-2 text-sm text-[#FFFFFF]/60"
                      style={{ fontFamily: "Satoshi-Bold" }}
                    >
                      Category Name
                    </Text>
                    <View className="border-b-2 border-[#FFFFFF]/30 pb-2">
                      <TextInput
                        value={customCategory}
                        onChangeText={setCustomCategory}
                        placeholder="Enter category name"
                        placeholderTextColor="#FFFFFF40"
                        className="text-lg text-[#FFFFFF]/80"
                        style={{ fontFamily: "Satoshi-Medium" }}
                      />
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text
                      className="mb-2 text-sm text-[#FFFFFF]/60"
                      style={{ fontFamily: "Satoshi-Bold" }}
                    >
                      Unit
                    </Text>
                    <View className="border-b-2 border-[#FFFFFF]/30 pb-2">
                      <TextInput
                        value={customUnit}
                        onChangeText={setCustomUnit}
                        placeholder="e.g., steps, kg, liters"
                        placeholderTextColor="#FFFFFF40"
                        className="text-lg text-[#FFFFFF]/80"
                        style={{ fontFamily: "Satoshi-Medium" }}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View className="mb-4">
                    <Text
                      className="mb-2 text-sm text-[#FFFFFF]/60"
                      style={{ fontFamily: "Satoshi-Bold" }}
                    >
                      Category
                    </Text>
                    <View className="border-b-2 border-[#FFFFFF]/30 pb-2">
                      <Text
                        className="text-lg text-[#FFFFFF]/80"
                        style={{ fontFamily: "Satoshi-Medium" }}
                      >
                        {selectedCategory}
                      </Text>
                    </View>
                  </View>

                  {description ? (
                    <View className="mb-4">
                      <Text
                        className="mb-2 text-sm text-[#FFFFFF]/60"
                        style={{ fontFamily: "Satoshi-Bold" }}
                      >
                        Description
                      </Text>
                      <View className="border-b-2 border-[#FFFFFF]/30 pb-2">
                        <Text
                          className="text-sm text-[#FFFFFF]/60"
                          style={{ fontFamily: "Satoshi-Regular" }}
                        >
                          {description}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </>
              )}

              <View className="mb-4">
                <Text
                  className="mb-2 text-sm text-[#FFFFFF]/60"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  Value
                </Text>
                <View className="flex-row items-center border-b-2 border-[#FFFFFF]/30 pb-2">
                  <TextInput
                    value={value}
                    onChangeText={setValue}
                    placeholder="Enter value"
                    placeholderTextColor="#FFFFFF40"
                    keyboardType="decimal-pad"
                    className="flex-1 text-lg text-[#FFFFFF]/80"
                    style={{ fontFamily: "Satoshi-Medium" }}
                  />
                  <Text
                    className="ml-2 text-lg text-[#FFFFFF]/60"
                    style={{ fontFamily: "Satoshi-Medium" }}
                  >
                    {showCustomInput ? customUnit || "unit" : selectedUnit}
                  </Text>
                </View>
              </View>

              {/* Add Button */}
              <Pressable
                onPress={handleAddHealthStat}
                className="rounded-xl bg-[#F4B514] px-4 py-3"
              >
                <Text
                  className="text-center text-base text-[#0A0E1A]"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  {editingIndex !== null ? "Update" : "Add"}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/50"
            onPress={cancelDelete}
          >
            <Pressable
              className="mx-5 w-11/12 rounded-3xl bg-black p-6"
              onPress={(e) => e.stopPropagation()}
            >
              <Text
                className="text-xl text-neutral-100 mb-4"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                Delete Health Stat
              </Text>
              <Text
                className="text-base text-neutral-400 mb-6"
                style={{ fontFamily: "Satoshi-Regular" }}
              >
                Are you sure you want to delete this health stat?
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={cancelDelete}
                  className="flex-1 rounded-xl bg-[#FFFFFF]/10 px-4 py-3"
                >
                  <Text
                    className="text-center text-base text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={confirmDelete}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3"
                >
                  <Text
                    className="text-center text-base text-white"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Bottom Section - Category Selection and Save */}
        <View className="absolute bottom-0 left-0 right-0 bg-[#FFFFFF]/10 px-5 py-4">
          {/* Category Selection */}
          <Text
            className="mb-3 text-sm text-neutral-400"
            style={{ fontFamily: "Satoshi-Medium" }}
          >
            Select vitals
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => handleCategorySelect("Add")}
              className="rounded-full bg-[#F4B514] px-4 py-2"
            >
              <Text
                className="text-sm text-[#0A0E1A]"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                + Add
              </Text>
            </Pressable>

            {DEFAULT_HEALTH_CATEGORIES.map((category) => (
              <Pressable
                key={category.name}
                onPress={() => handleCategorySelect(category)}
                className="rounded-full bg-[#FFFFFF]/10 px-4 py-2"
              >
                <Text
                  className="text-sm text-neutral-100"
                  style={{ fontFamily: "Satoshi-Medium" }}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Save Button */}
          {healthStats.length > 0 && (
            <Pressable
              onPress={handleSave}
              disabled={isSubmitting}
              className="mt-4 rounded-[20px] bg-[#F4B514] px-4 py-4"
            >
              <Text
                className="text-center text-base text-[#0A0E1A]"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                {isSubmitting ? "Saving..." : "Save Health Stats"}
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
