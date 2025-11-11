import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";
import api from "./api";
import { getAuthToken } from "./authService";

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractTextResponse {
  text: string;
  image_url: string;
  remaining_uses: number;
}

const DIARY_STORAGE_KEY = "diary_entries";

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Get today's date in DD-MM-YYYY format (for API)
export const getTodayDateForAPI = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
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

// Custom error class for API errors
export class APIError extends Error {
  statusCode: number;
  errorMessage: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorMessage = message;
    this.name = "APIError";
  }
}

// Extract text from diary image
export const extractTextFromImage = async (
  imageUri: string
): Promise<ExtractTextResponse> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();

    const formData = new FormData();

    // Create file object from uri
    const filename = imageUri.split("/").pop() || "diary_image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("image", {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const response = await api.post<ExtractTextResponse>(
      "/diary/extract-text",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to extract text from image";

      throw new APIError(statusCode, errorMessage);
    } else if (error.request) {
      // Network error - no response received
      throw new APIError(0, "Network error. Please check your connection.");
    } else {
      // Other errors
      throw new APIError(-1, error.message || "An unexpected error occurred");
    }
  }
};

// Interface for create/update diary request
export interface CreateUpdateDiaryRequest {
  date?: string; // Optional: DD-MM-YYYY format for past diaries. Don't send for today's diary
  diary: {
    content: string;
    summary: string;
  };
  mood_tracker?: string[];
  expense_tracker?: {
    name: string;
    amount: number;
  }[];
  health_stats?: {
    name: string;
    description: string;
    value: number;
    unit: string;
  }[];
}

// Create or update diary entry via API
export const createOrUpdateDiary = async (
  content: string,
  summary: string,
  date?: string // Optional: for past diaries in DD-MM-YYYY format
): Promise<void> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();

    // Prepare request body
    const requestBody: CreateUpdateDiaryRequest = {
      diary: {
        content,
        summary,
      },
    };

    // Only add date if provided (for past diaries)
    if (date) {
      requestBody.date = date;
    }

    const response = await api.post("/diary", requestBody, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    });

    return response.data;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to save diary entry";

      throw new APIError(statusCode, errorMessage);
    } else if (error.request) {
      // Network error - no response received
      throw new APIError(0, "Network error. Please check your connection.");
    } else {
      // Other errors
      throw new APIError(-1, error.message || "An unexpected error occurred");
    }
  }
};

// Save diary with trackers (for expense, mood, health tracking)
export const saveDiaryWithTrackers = async (
  data: Partial<CreateUpdateDiaryRequest>
): Promise<void> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();

    const response = await api.post("/diary", data, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    });

    return response.data;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to save tracker data";

      throw new APIError(statusCode, errorMessage);
    } else if (error.request) {
      // Network error - no response received
      throw new APIError(0, "Network error. Please check your connection.");
    } else {
      // Other errors
      throw new APIError(-1, error.message || "An unexpected error occurred");
    }
  }
};

// Fetch diary for a specific date (DD-MM-YYYY expected by backend)
export const fetchDiaryByDate = async (date: string): Promise<any> => {
  try {
    const authToken = await getAuthToken();

    const response = await api.get(`/diary`, {
      params: { date },
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    });

    // API returns { diary: { ... } }
    return response.data?.diary ?? null;
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status;

      // If diary doesn't exist for the date (404), return null instead of throwing
      if (statusCode === 404) {
        return null;
      }

      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to fetch diary";

      throw new APIError(statusCode, errorMessage);
    } else if (error.request) {
      throw new APIError(0, "Network error. Please check your connection.");
    } else {
      throw new APIError(-1, error.message || "An unexpected error occurred");
    }
  }
};

// Fetch diaries for a specific month (format: MM-YYYY, e.g., "11-2025")
export const fetchDiariesByMonth = async (
  month: string,
  year: string
): Promise<any> => {
  try {
    const authToken = await getAuthToken();

    const response = await api.get(`/diary/month`, {
      params: { month, year },
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    });

    // API returns { diaries: [...] }
    return response.data?.diaries ?? [];
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status;

      // If no diaries exist for the month, return empty array
      if (statusCode === 404) {
        return [];
      }

      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        "Failed to fetch diaries";

      throw new APIError(statusCode, errorMessage);
    } else if (error.request) {
      throw new APIError(0, "Network error. Please check your connection.");
    } else {
      throw new APIError(-1, error.message || "An unexpected error occurred");
    }
  }
};

// Generate summary from text with streaming support
export const generateSummary = async (
  text: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    // Get auth token
    const authToken = await getAuthToken();

    console.log("Starting summary generation...", {
      textLength: text.length,
      hasAuth: !!authToken,
      apiUrl: `${API_BASE_URL}/diary/generate-summary`,
    });

    const response = await fetch(`${API_BASE_URL}/diary/generate-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
      body: JSON.stringify({ text }),
    });

    console.log("Response received:", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    if (!response.ok) {
      let errorMessage = "Failed to generate summary";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error("Error response data:", errorData);
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
          console.error("Error response text:", errorText);
        } catch {
          // Use status text as fallback
          errorMessage = response.statusText || errorMessage;
          console.error("Error status text:", response.statusText);
        }
      }

      throw new APIError(response.status, errorMessage);
    }

    // Check if response.body exists
    if (!response.body) {
      // Fallback: Try to get the full response as text
      console.warn(
        "Response body not available for streaming, falling back to full response"
      );
      const fullResponse = await response.text();
      console.log("Full response received:", fullResponse.substring(0, 200));

      // Split by newlines and process each line
      const lines = fullResponse.split("\n").filter((line) => line.trim());
      console.log(`Processing ${lines.length} lines`);

      for (const line of lines) {
        try {
          // Remove "data: " prefix if present (SSE format)
          const jsonStr = line.startsWith("data: ") ? line.slice(6) : line;
          const parsed = JSON.parse(jsonStr);
          if (parsed.type === "chunk" && parsed.text) {
            onChunk(parsed.text);
          }
        } catch {
          console.warn("Failed to parse JSON line:", line);
        }
      }
      console.log("Fallback processing complete");
      return;
    }

    console.log("Starting stream reading...");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log(`Streaming complete. Total chunks received: ${chunkCount}`);
        break;
      }

      // Decode the chunk
      buffer += decoder.decode(value, { stream: true });

      // Split by newlines to handle multiple JSON objects
      const lines = buffer.split("\n");

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      // Process each complete line
      for (const line of lines) {
        if (line.trim()) {
          try {
            // Remove "data: " prefix if present (SSE format)
            const jsonStr = line.startsWith("data: ") ? line.slice(6) : line;
            const parsed = JSON.parse(jsonStr);

            // Handle chunk type - extract the text
            if (parsed.type === "chunk" && parsed.text) {
              chunkCount++;
              onChunk(parsed.text);
            }
            // Handle complete type - streaming is done
            else if (parsed.type === "complete") {
              console.log("Summary generation complete");
            }
          } catch (parseError) {
            console.warn("Failed to parse JSON chunk:", line, parseError);
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer.trim()) {
      try {
        // Remove "data: " prefix if present (SSE format)
        const jsonStr = buffer.startsWith("data: ") ? buffer.slice(6) : buffer;
        const parsed = JSON.parse(jsonStr);
        if (parsed.type === "chunk" && parsed.text) {
          onChunk(parsed.text);
        }
      } catch (parseError) {
        console.warn("Failed to parse final JSON chunk:", buffer, parseError);
      }
    }
  } catch (error: any) {
    console.error("Error in generateSummary:", {
      name: error?.name,
      message: error?.message,
      isAPIError: error instanceof APIError,
    });

    // If it's already an APIError, rethrow it (don't log again)
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("Network")) {
      console.error("Network error detected");
      throw new APIError(0, "Network error. Please check your connection.");
    }

    // Handle timeout errors
    if (error.name === "AbortError") {
      console.error("Timeout error detected");
      throw new APIError(408, "Request timeout. Please try again.");
    }

    // Generic error
    console.error("Generic error in generateSummary:", error);
    throw new APIError(
      -1,
      error.message || "An unexpected error occurred while generating summary"
    );
  }
};

// Stream diary chat responses using XMLHttpRequest for React Native compatibility
export const streamDiaryChat = async (
  query: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const getToken = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          reject(new APIError(401, "Authentication token not found"));
          return;
        }

        const xhr = new XMLHttpRequest();
        let lastResponseLength = 0;
        let buffer = "";

        xhr.open("POST", `${API_BASE_URL}/diary/chat`, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        // Handle progress events for streaming
        xhr.onprogress = () => {
          if (xhr.status === 200) {
            const currentResponse = xhr.responseText;
            const newData = currentResponse.substring(lastResponseLength);
            lastResponseLength = currentResponse.length;

            if (newData) {
              buffer += newData;

              // Process complete lines (SSE format: "data: {...}\n")
              const lines = buffer.split("\n");
              buffer = lines.pop() || ""; // Keep incomplete line in buffer

              for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                  try {
                    // SSE format: "data: {...}"
                    let jsonStr = trimmedLine;
                    if (trimmedLine.startsWith("data: ")) {
                      jsonStr = trimmedLine.substring(6); // Remove "data: " prefix
                    }

                    const parsed = JSON.parse(jsonStr);

                    // Only send text chunks, ignore start/complete events
                    if (parsed.type === "chunk" && parsed.text) {
                      onChunk(parsed.text);
                    }
                  } catch {
                    // Silently ignore parse errors
                  }
                }
              }
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            // Process any remaining data in buffer
            if (buffer.trim()) {
              try {
                let jsonStr = buffer.trim();
                if (jsonStr.startsWith("data: ")) {
                  jsonStr = jsonStr.substring(6);
                }
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === "chunk" && parsed.text) {
                  onChunk(parsed.text);
                }
              } catch {
                // Silently ignore parse errors
              }
            }
            resolve();
          } else {
            reject(
              new APIError(
                xhr.status,
                `Failed to connect to chat: ${xhr.statusText}`
              )
            );
          }
        };

        xhr.onerror = () => {
          reject(
            new APIError(0, "Network error. Please check your connection.")
          );
        };

        xhr.ontimeout = () => {
          reject(new APIError(408, "Request timeout. Please try again."));
        };

        xhr.timeout = 60000; // 60 second timeout

        xhr.send(JSON.stringify({ query }));
      } catch (error) {
        if (error instanceof APIError) {
          reject(error);
        } else {
          console.error("Error streaming diary chat:", error);
          reject(
            new APIError(
              -1,
              error instanceof Error
                ? error.message
                : "An unexpected error occurred while streaming chat"
            )
          );
        }
      }
    };

    getToken();
  });
};
