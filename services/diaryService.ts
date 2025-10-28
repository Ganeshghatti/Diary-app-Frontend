import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  content: string;
  createdAt: string;
  updatedAt: string;
}

const DIARY_STORAGE_KEY = "diary_entries";

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Format date for display (e.g., "Monday, Jan 15, 2025")
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

// Get all diary entries
export const getAllDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(DIARY_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error getting diary entries:", error);
    return [];
  }
};

// Get today's diary entry
export const getTodayEntry = async (): Promise<DiaryEntry | null> => {
  try {
    const entries = await getAllDiaryEntries();
    const today = getTodayDate();
    return entries.find((entry) => entry.date === today) || null;
  } catch (error) {
    console.error("Error getting today's entry:", error);
    return null;
  }
};

// Save or update diary entry for today
export const saveDiaryEntry = async (content: string): Promise<boolean> => {
  try {
    const entries = await getAllDiaryEntries();
    const today = getTodayDate();
    const now = new Date().toISOString();

    const existingIndex = entries.findIndex((entry) => entry.date === today);

    if (existingIndex >= 0) {
      // Update existing entry
      entries[existingIndex] = {
        ...entries[existingIndex],
        content,
        updatedAt: now,
      };
    } else {
      // Create new entry
      const newEntry: DiaryEntry = {
        id: now,
        date: today,
        content,
        createdAt: now,
        updatedAt: now,
      };
      entries.push(newEntry);
    }

    // Sort entries by date (newest first)
    entries.sort((a, b) => b.date.localeCompare(a.date));

    await AsyncStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error("Error saving diary entry:", error);
    return false;
  }
};

// Delete a diary entry by date
export const deleteDiaryEntry = async (date: string): Promise<boolean> => {
  try {
    const entries = await getAllDiaryEntries();
    const filtered = entries.filter((entry) => entry.date !== date);
    await AsyncStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    return false;
  }
};

// Get entries count
export const getDiaryEntriesCount = async (): Promise<number> => {
  try {
    const entries = await getAllDiaryEntries();
    return entries.length;
  } catch (error) {
    console.error("Error getting entries count:", error);
    return 0;
  }
};
