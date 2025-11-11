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

interface ExpenseItem {
  name: string;
  amount: string;
  description: string;
}

const DEFAULT_CATEGORIES = [
  "Food",
  "Shopping",
  "Rent/ Bill",
  "Groceries",
  "Travel",
  "EMI",
  "Personal Care",
  "Education",
];

export default function ExpenseTracker() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  // Use today's date if no date param is provided
  const dateQuery = (dateParam as string) || getTodayDateForAPI();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const totalAmount = expenses.reduce(
    (sum, expense) => sum + (parseFloat(expense.amount) || 0),
    0
  );

  const formatIndian = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) || 0 : value || 0;
    return new Intl.NumberFormat("en-IN").format(Math.round(num));
  };

  const handleCategorySelect = (category: string) => {
    if (category === "Add") {
      setShowCustomInput(true);
      setSelectedCategory("");
      setShowAddModal(true);
    } else {
      setSelectedCategory(category);
      setShowCustomInput(false);
      setCustomCategory("");
      setShowAddModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedCategory("");
    setAmount("");
    setDescription("");
    setCustomCategory("");
    setShowCustomInput(false);
  };

  const handleAddExpense = () => {
    const finalCategory = showCustomInput ? customCategory : selectedCategory;

    if (!finalCategory.trim()) {
      Toast.show({
        type: "error",
        text1: "Category Required",
        text2: "Please select or enter a category",
      });
      return;
    }

    if (!amount.trim() || isNaN(parseFloat(amount))) {
      Toast.show({
        type: "error",
        text1: "Invalid Amount",
        text2: "Please enter a valid amount",
      });
      return;
    }

    const newExpense: ExpenseItem = {
      name: finalCategory,
      amount: amount,
      description: description,
    };

    if (editingIndex !== null && editingIndex >= 0) {
      // Update existing expense
      const updated = expenses.map((e, i) =>
        i === editingIndex ? newExpense : e
      );
      setExpenses(updated);
      setEditingIndex(null);
      Toast.show({ type: "success", text1: "Expense Updated" });
    } else {
      setExpenses([...expenses, newExpense]);
      Toast.show({
        type: "success",
        text1: "Expense Added",
        text2: `${finalCategory}: ₹${amount}`,
      });
    }

    // Close modal and reset form
    setShowAddModal(false);
    setSelectedCategory("");
    setAmount("");
    setDescription("");
    setCustomCategory("");
    setShowCustomInput(false);
  };

  const handleDeleteExpense = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedExpenses = expenses.filter((_, i) => i !== deleteIndex);
      setExpenses(updatedExpenses);
      Toast.show({
        type: "success",
        text1: "Expense Deleted",
      });
    }
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };

  const handleEditExpense = (index: number) => {
    const item = expenses[index];
    if (!item) return;
    setSelectedCategory(item.name);
    setAmount(item.amount);
    setDescription(item.description || "");
    setShowCustomInput(false);
    setEditingIndex(index);
    setShowAddModal(true);
  };

  // Load diary expense_tracker when date query param is provided or on mount (today's date)
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!dateQuery) return;
      try {
        const diary = await fetchDiaryByDate(dateQuery);
        if (!mounted) return;
        const tracker = diary?.expense_tracker ?? [];
        const mapped: ExpenseItem[] = (tracker || []).map((t: any) => ({
          name: t.name || "",
          amount: t.amount != null ? String(t.amount) : "0",
          description: t.description || "",
        }));
        setExpenses(mapped);
      } catch {
        // Silently handle errors - just set empty array
        setExpenses([]);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [dateQuery]);

  const handleSave = async () => {
    if (expenses.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Expenses",
        text2: "Please add at least one expense",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Format expenses for API
      const expenseData = expenses.map((expense) => ({
        name: expense.name,
        amount: parseFloat(expense.amount),
        description: expense.description || undefined,
      }));

      // Save to API (always include date - either from param or today's date)
      await saveDiaryWithTrackers({
        date: dateQuery,
        expense_tracker: expenseData,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Expenses saved successfully!",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving expenses:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to save expenses",
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
              Expense Tracker
            </Text>
          </View>
          <Text
            className="text-lg text-neutral-100"
            style={{ fontFamily: "Satoshi-Bold" }}
          >
            ₹ {formatIndian(totalAmount)}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          {/* Instruction Note */}
          {expenses.length > 0 && (
            <Text
              className="mb-3 text-xs text-neutral-400 text-center"
              style={{ fontFamily: "Satoshi-Regular" }}
            >
              Hold on an item to delete it
            </Text>
          )}

          {/* Expense List */}
          {expenses.map((expense, index) => (
            <Pressable
              key={index}
              onLongPress={() => handleDeleteExpense(index)}
              onPress={() => handleEditExpense(index)}
              className="mb-3 rounded-2xl  p-4"
            >
              <View className="flex-row border-b pb-5 border-[#FFFFFF]/60 items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-xl text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    {expense.name}
                  </Text>
                  {expense.description ? (
                    <Text
                      className="mt-1 text-base text-neutral-400"
                      style={{ fontFamily: "Satoshi-Regular" }}
                    >
                      {expense.description}
                    </Text>
                  ) : null}
                </View>
                <Text
                  className="text-base bg-[#FFFFFF]/10 p-5 border rounded-[12px] text-neutral-100"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  ₹ {formatIndian(expense.amount)}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Add Expense Modal */}
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
                  Add Expense
                </Text>
                <Pressable onPress={handleCloseModal}>
                  <Text className="text-2xl text-neutral-100">×</Text>
                </Pressable>
              </View>

              {/* Form Fields */}
              {showCustomInput ? (
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
              ) : (
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
              )}

              <View className="mb-4">
                <Text
                  className="mb-2 text-sm text-[#FFFFFF]/60"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  Amount
                </Text>
                <View className="border-b-2 border-[#FFFFFF]/30 pb-2">
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Enter amount"
                    placeholderTextColor="#FFFFFF40"
                    keyboardType="decimal-pad"
                    className="text-lg text-[#FFFFFF]/80"
                    style={{ fontFamily: "Satoshi-Medium" }}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text
                  className="mb-2 text-sm text-[#FFFFFF]/60"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  Description (optional)
                </Text>
                <View className="border-b-2 border-[#FFFFFF]/30 pb-2">
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter description"
                    placeholderTextColor="#FFFFFF40"
                    className="text-lg text-[#FFFFFF]/80"
                    style={{ fontFamily: "Satoshi-Medium" }}
                  />
                </View>
              </View>

              {/* Add Button */}
              <Pressable
                onPress={handleAddExpense}
                className="rounded-xl bg-[#F4B514] px-4 py-3"
              >
                <Text
                  className="text-center text-base text-[#0A0E1A]"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  Add Expense
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
                Delete Expense
              </Text>
              <Text
                className="text-base text-neutral-400 mb-6"
                style={{ fontFamily: "Satoshi-Regular" }}
              >
                Are you sure you want to delete this expense?
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
            Select expense
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

            {DEFAULT_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                onPress={() => handleCategorySelect(category)}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === category
                    ? "bg-[#F4B514]/40"
                    : "bg-[#FFFFFF]/10"
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-neutral-100"
                  }`}
                  style={{ fontFamily: "Satoshi-Medium" }}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Save Button */}
          {expenses.length > 0 && (
            <Pressable
              onPress={handleSave}
              disabled={isSubmitting}
              className="mt-4 rounded-[20px] bg-[#F4B514] px-4 py-4"
            >
              <Text
                className="text-center text-base text-[#0A0E1A]"
                style={{ fontFamily: "Satoshi-Bold" }}
              >
                {isSubmitting ? "Saving..." : "Save Expenses"}
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
