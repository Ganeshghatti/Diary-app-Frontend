import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import Toast from "react-native-toast-message";
import {
  APIError,
  createOrUpdateDiary,
  extractTextFromImage,
  fetchDiaryByDate,
  generateSummary,
  getTodayDateForAPI,
} from "../../services/diaryService";
import DiaryTextSummaryModal from "./DiaryTextSummaryModal";

interface DiaryCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  date?: string;
  existingDiaryContent?: string;
  existingDiarySummary?: string;
}

export default function DiaryCaptureModal({
  visible,
  onClose,
  date = "Sept 29",
  existingDiaryContent = "",
  existingDiarySummary = "",
}: DiaryCaptureModalProps) {
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

  const [activeTab, setActiveTab] = useState<"capture" | "write" | "voice">(
    "capture"
  );
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const richText = useRef<RichEditor>(null);

  // States for write mode
  const [writtenText, setWrittenText] = useState("");

  // States for text extraction and summary
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [remainingUses, setRemainingUses] = useState<number | null>(null);

  // States for voice mode
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [recordingPermission, setRecordingPermission] = useState(false);

  // Load existing diary when modal opens
  useEffect(() => {
    const loadExistingDiary = async () => {
      if (visible) {
        try {
          const todayDate = getTodayDateForAPI();
          const diary = await fetchDiaryByDate(todayDate);

          if (diary?.diary?.content) {
            setWrittenText(diary.diary.content);
            setExtractedText(stripHtmlTags(diary.diary.content));
            if (diary.diary.summary) {
              setSummary(diary.diary.summary);
            }
            // Set content in rich editor after a small delay to ensure it's mounted
            setTimeout(() => {
              if (richText.current) {
                richText.current.setContentHTML(diary.diary.content);
              }
            }, 100);
            // Switch to write tab if there's existing content
            setActiveTab("write");
          } else {
            // Reset to empty if no diary exists
            setWrittenText("");
            setExtractedText("");
            setSummary("");
            setTimeout(() => {
              if (richText.current) {
                richText.current.setContentHTML("");
              }
            }, 100);
          }
        } catch (error) {
          console.error("Error loading existing diary:", error);
          // Silently fail - just means no existing diary
        }
      }
    };

    loadExistingDiary();
  }, [visible]);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission?.granted, requestPermission]);

  useEffect(() => {
    // Request audio recording permission
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setRecordingPermission(status === "granted");
    })();
  }, []);

  const startRecording = async () => {
    try {
      if (!recordingPermission) {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission Required",
            text2: "Please grant microphone permission to use voice recording.",
          });
          return;
        }
        setRecordingPermission(true);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Recording Failed",
        text2: "Failed to start recording. Please try again.",
      });
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // For now, we'll simulate speech-to-text by prompting user
      // In a production app, you would send the audio to a speech-to-text API
      Toast.show({
        type: "info",
        text1: "Recording Stopped",
        text2: "Processing audio...",
      });

      // Simulated text - in production, this would come from a speech-to-text API
      const simulatedText =
        "This is where the transcribed text would appear from your speech.";
      setVoiceText((prev) => prev + (prev ? " " : "") + simulatedText);

      setRecording(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Recording Error",
        text2: "Failed to stop recording.",
      });
    }
  };

  const handleUseVoiceText = async () => {
    if (!voiceText.trim()) {
      Toast.show({
        type: "error",
        text1: "Empty Text",
        text2: "Please record something before continuing.",
      });
      return;
    }

    try {
      setIsProcessing(true);
      // Strip HTML tags from voice text for display (in case of any formatting)
      setExtractedText(stripHtmlTags(voiceText));

      Toast.show({
        type: "success",
        text1: "Text Saved",
        text2: "Generating AI summary...",
      });

      setShowSummaryModal(true);
      setIsLoadingSummary(true);
      setSummary("");

      await generateSummary(voiceText, (chunk) => {
        setSummary((prev) => prev + chunk);
      });

      setIsLoadingSummary(false);

      Toast.show({
        type: "success",
        text1: "Summary Generated",
        text2: "Your diary entry is ready!",
      });
    } catch (error: any) {
      const { title, message } = getErrorMessage(error);

      Toast.show({
        type: "error",
        text1: title,
        text2: message,
      });

      if (showSummaryModal) {
        handleCloseSummaryModal();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Capture Failed",
        text2: "Failed to capture photo. Please try again.",
      });
    }
  };

  const handleGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Gallery Error",
        text2: "Failed to select image from gallery.",
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const getErrorMessage = (error: any): { title: string; message: string } => {
    if (error instanceof APIError) {
      const statusCode = error.statusCode;

      // Handle specific status codes
      switch (statusCode) {
        case 0:
          return {
            title: "Network Error",
            message: error.errorMessage,
          };
        case 400:
          return {
            title: "Invalid Request",
            message: error.errorMessage,
          };
        case 401:
          return {
            title: "Unauthorized",
            message: "Please log in again to continue.",
          };
        case 403:
          return {
            title: "Access Denied",
            message: error.errorMessage,
          };
        case 404:
          return {
            title: "Not Found",
            message: "The requested resource was not found.",
          };
        case 408:
          return {
            title: "Request Timeout",
            message: "The request took too long. Please try again.",
          };
        case 413:
          return {
            title: "File Too Large",
            message: "The image file is too large. Please use a smaller image.",
          };
        case 415:
          return {
            title: "Unsupported Format",
            message: "The image format is not supported.",
          };
        case 429:
          return {
            title: "Too Many Requests",
            message:
              error.errorMessage ||
              "You've reached your usage limit. Please try again later.",
          };
        case 500:
          return {
            title: "Server Error",
            message: "Something went wrong on our end. Please try again later.",
          };
        case 502:
          return {
            title: "Bad Gateway",
            message: "Service temporarily unavailable. Please try again.",
          };
        case 503:
          return {
            title: "Service Unavailable",
            message:
              "The service is currently unavailable. Please try again later.",
          };
        case 504:
          return {
            title: "Gateway Timeout",
            message: "The request timed out. Please try again.",
          };
        default:
          return {
            title: "Error",
            message: error.errorMessage || "An unexpected error occurred.",
          };
      }
    }

    // Fallback for non-APIError errors
    return {
      title: "Error",
      message: error?.message || "An unexpected error occurred.",
    };
  };

  const handleUsePhoto = async () => {
    if (!capturedImage) return;

    try {
      setIsProcessing(true);

      // Step 1: Extract text from image
      const extractResponse = await extractTextFromImage(capturedImage);

      // Validate extracted text
      if (!extractResponse.text || extractResponse.text.trim().length === 0) {
        throw new APIError(
          400,
          "No text could be extracted from the image. Please try a clearer image with visible text."
        );
      }

      // Strip HTML tags from extracted text
      setExtractedText(stripHtmlTags(extractResponse.text));
      setRemainingUses(extractResponse.remaining_uses);

      // Show success toast for text extraction
      Toast.show({
        type: "success",
        text1: "Text Extracted",
        text2: "Generating AI summary...",
      });

      // Show the summary modal
      setShowSummaryModal(true);
      setIsLoadingSummary(true);
      setSummary("");

      // Step 2: Generate summary with streaming
      await generateSummary(extractResponse.text, (chunk) => {
        setSummary((prev) => prev + chunk);
      });

      setIsLoadingSummary(false);

      Toast.show({
        type: "success",
        text1: "Summary Generated",
        text2: "Your diary entry is ready!",
      });
    } catch (error: any) {
      const { title, message } = getErrorMessage(error);

      Toast.show({
        type: "error",
        text1: title,
        text2: message,
      });

      // If we got an error after showing the summary modal, close it
      if (showSummaryModal) {
        handleCloseSummaryModal();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseWrittenText = async () => {
    // Strip HTML tags to check if there's actual content
    const textContent = writtenText.replace(/<[^>]*>/g, "").trim();

    if (!textContent) {
      Toast.show({
        type: "error",
        text1: "Empty Text",
        text2: "Please write something before continuing.",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Strip HTML tags from written text for display
      setExtractedText(stripHtmlTags(writtenText));

      // Show success toast
      Toast.show({
        type: "success",
        text1: "Text Saved",
        text2: "Generating AI summary...",
      });

      // Show the summary modal
      setShowSummaryModal(true);
      setIsLoadingSummary(true);
      setSummary("");

      // Generate summary with streaming - send HTML content
      await generateSummary(writtenText, (chunk) => {
        setSummary((prev) => prev + chunk);
      });

      setIsLoadingSummary(false);

      Toast.show({
        type: "success",
        text1: "Summary Generated",
        text2: "Your diary entry is ready!",
      });
    } catch (error: any) {
      const { title, message } = getErrorMessage(error);

      Toast.show({
        type: "error",
        text1: title,
        text2: message,
      });

      // If we got an error after showing the summary modal, close it
      if (showSummaryModal) {
        handleCloseSummaryModal();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDiary = async () => {
    try {
      // Call the create/update diary API with text content and summary
      await createOrUpdateDiary(extractedText, summary);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Diary entry saved successfully!",
      });
      handleCloseSummaryModal();
      onClose();
    } catch (error: any) {
      const { title, message } = getErrorMessage(error);

      Toast.show({
        type: "error",
        text1: title,
        text2: message,
      });
    }
  };

  const handleCloseSummaryModal = () => {
    setShowSummaryModal(false);
    setExtractedText("");
    setSummary("");
    setIsLoadingSummary(false);
    setCapturedImage(null);
    setWrittenText("");
    setVoiceText("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <ImageBackground
        source={require("../../assets/background-2.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-4 pt-12">
            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </Pressable>
            {activeTab === "write" &&
            writtenText.replace(/<[^>]*>/g, "").trim().length > 0 ? (
              <Pressable
                onPress={handleUseWrittenText}
                disabled={isProcessing}
                className={`h-10 w-10 items-center justify-center rounded-full bg-white/20 ${isProcessing ? "opacity-50" : ""}`}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="checkmark" size={28} color="#FFFFFF" />
                )}
              </Pressable>
            ) : (
              <Pressable
                onPress={onClose}
                className="h-10 w-10 items-center justify-center"
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          {/* Camera/Content Area */}
          <View className="flex-1">
            {/* Camera Preview Area */}
            {activeTab === "capture" && (
              <View className="flex-1">
                {!permission?.granted ? (
                  // Show permission request
                  <View className="flex-1 items-center justify-center">
                    <Text
                      className="mb-4 text-white"
                      style={{ fontFamily: "Satoshi-Medium" }}
                    >
                      Camera permission is required
                    </Text>
                    <Pressable
                      onPress={requestPermission}
                      className="rounded-full bg-white/20 px-6 py-3"
                    >
                      <Text
                        className="text-white"
                        style={{ fontFamily: "Satoshi-Bold" }}
                      >
                        Grant Permission
                      </Text>
                    </Pressable>
                  </View>
                ) : capturedImage ? (
                  // Show captured image
                  <View className="flex-1 bg-black">
                    <Image
                      source={{ uri: capturedImage }}
                      className="h-full w-full"
                      resizeMode="contain"
                    />
                    {/* Action buttons for captured image */}
                    <View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-center gap-8">
                      <Pressable
                        onPress={handleRetake}
                        disabled={isProcessing}
                        className={`h-16 w-16 items-center justify-center rounded-full bg-white/20 ${isProcessing ? "opacity-50" : ""}`}
                      >
                        <Ionicons name="refresh" size={28} color="#FFFFFF" />
                      </Pressable>
                      <Pressable
                        onPress={handleUsePhoto}
                        disabled={isProcessing}
                        className={`h-16 w-16 items-center justify-center rounded-full ${isProcessing ? "opacity-50" : ""}`}
                        style={{ backgroundColor: "#F8D247" }}
                      >
                        {isProcessing ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <Ionicons
                            name="checkmark"
                            size={32}
                            color="#000000"
                          />
                        )}
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  // Show live camera
                  <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing="back"
                  />
                )}
              </View>
            )}

            {/* Write Tab Content */}
            {activeTab === "write" && (
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
              >
                <View className="flex-1 mb-4 ">
                  <View className="flex-1 px-5 pt-6">
                    {/* Rich Text Editor */}
                    <View className="flex-1 rounded-2xl overflow-hidden bg-white/10">
                      <RichEditor
                        ref={richText}
                        className="flex-1 pt-6"
                        initialContentHTML=""
                        placeholder="Start writing your thoughts..."
                        onChange={(html) => setWrittenText(html)}
                        editorStyle={{
                          backgroundColor: "transparent",
                          color: "#FFFFFF",
                          placeholderColor: "rgba(255, 255, 255, 0.3)",
                          contentCSSText: `
                          font-family: 'Satoshi-Regular', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          font-size: 16px;
                          line-height: 1.6;
                          padding: 16px;
                          h1 {
                            font-family: 'Satoshi-Bold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            font-size: 32px;
                            font-weight: 700;
                            margin: 12px 0;
                            color: #F8D247;
                          }
                          h2 {
                            font-family: 'Satoshi-Bold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            font-size: 28px;
                            font-weight: 600;
                            margin: 10px 0;
                            color: #F8D247;
                          }
                          strong {
                            font-family: 'Satoshi-Bold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          }
                          em {
                            font-family: 'Satoshi-Medium', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            font-style: italic;
                          }
                        `,
                        }}
                      />

                      {/* Rich Text Toolbar */}
                      <RichToolbar
                        editor={richText}
                        actions={[
                          actions.setBold,
                          actions.setItalic,
                          actions.setUnderline,
                          actions.insertBulletsList,
                          actions.insertOrderedList,
                          actions.blockquote,
                          actions.undo,
                          actions.redo,
                        ]}
                        iconTint="#FFFFFF"
                        selectedIconTint="#F8D247"
                        disabledIconTint="rgba(255, 255, 255, 0.3)"
                        iconSize={24}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          borderTopWidth: 1,
                          borderTopColor: "rgba(255, 255, 255, 0.1)",
                          paddingVertical: 8,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>
            )}

            {/* Voice Tab Content */}
            {activeTab === "voice" && (
              <View className="flex-1">
                <View className="flex-1 px-5 pt-6">
                  <Text
                    className="mb-4 text-lg text-white"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    Voice Recording
                  </Text>

                  {/* Recording Status */}
                  <View className="mb-6 items-center">
                    <View
                      className={`mb-4 h-32 w-32 items-center justify-center rounded-full ${
                        isRecording ? "bg-red-500/20" : "bg-white/10"
                      }`}
                    >
                      <Ionicons
                        name={isRecording ? "mic" : "mic-outline"}
                        size={64}
                        color={isRecording ? "#EF4444" : "#FFFFFF"}
                      />
                    </View>

                    {isRecording && (
                      <View className="flex-row items-center gap-2">
                        <View className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <Text
                          className="text-sm text-white"
                          style={{ fontFamily: "Satoshi-Medium" }}
                        >
                          Recording...
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Record/Stop Button */}
                  <View className="mb-6 items-center">
                    <Pressable
                      onPress={isRecording ? stopRecording : startRecording}
                      disabled={isProcessing}
                      className={`rounded-full px-8 py-4 ${
                        isRecording ? "bg-red-500" : "bg-[#F8D247]"
                      } ${isProcessing ? "opacity-50" : ""}`}
                    >
                      <Text
                        className={`text-base ${
                          isRecording ? "text-white" : "text-black"
                        }`}
                        style={{ fontFamily: "Satoshi-Bold" }}
                      >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </Text>
                    </Pressable>

                    {!recordingPermission && (
                      <Text
                        className="mt-4 text-center text-sm text-neutral-400"
                        style={{ fontFamily: "Satoshi-Regular" }}
                      >
                        Microphone permission is required
                      </Text>
                    )}
                  </View>

                  {/* Transcribed Text Display */}
                  {voiceText && (
                    <View className="flex-1 rounded-2xl bg-white/10 p-4">
                      <Text
                        className="mb-2 text-sm text-neutral-400"
                        style={{ fontFamily: "Satoshi-Medium" }}
                      >
                        Transcribed Text:
                      </Text>
                      <Text
                        className="text-base leading-6 text-white"
                        style={{ fontFamily: "Satoshi-Regular" }}
                      >
                        {voiceText}
                      </Text>
                    </View>
                  )}

                  {/* Note about feature */}
                  {!voiceText && !isRecording && (
                    <View className="flex-1 items-center justify-center px-8">
                      <Ionicons
                        name="information-circle-outline"
                        size={48}
                        color="#FFFFFF50"
                      />
                      <Text
                        className="mt-4 text-center text-sm text-neutral-400"
                        style={{ fontFamily: "Satoshi-Regular" }}
                      >
                        Tap the button to start recording your thoughts. Your
                        voice will be transcribed automatically.
                      </Text>
                      <Text
                        className="mt-2 text-center text-xs text-neutral-500"
                        style={{ fontFamily: "Satoshi-Regular" }}
                      >
                        Note: Speech-to-text requires an active internet
                        connection.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action button for voice text */}
                {voiceText.trim().length > 0 && !isRecording && (
                  <View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-center">
                    <Pressable
                      onPress={handleUseVoiceText}
                      disabled={isProcessing}
                      className={`h-16 w-16 items-center justify-center rounded-full ${
                        isProcessing ? "opacity-50" : ""
                      }`}
                      style={{ backgroundColor: "#F8D247" }}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#000000" />
                      ) : (
                        <Ionicons name="checkmark" size={32} color="#000000" />
                      )}
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Bottom Controls */}
          <View className="bg-black pb-8">
            {/* Tab Navigation */}
            <View className="flex-row items-center justify-center gap-2.5 px-5 py-4">
              <Pressable
                className={`flex-row items-center justify-center gap-1.5 rounded-full px-4 py-2 ${
                  activeTab === "capture" ? "bg-white/10" : "bg-transparent"
                }`}
                onPress={() => setActiveTab("capture")}
              >
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={activeTab === "capture" ? "#FFFFFF" : "#666666"}
                />
                <Text
                  className={`text-sm ${
                    activeTab === "capture" ? "text-white" : "text-neutral-600"
                  }`}
                  style={{ fontFamily: "Satoshi-Medium" }}
                >
                  Capture
                </Text>
              </Pressable>

              <Pressable
                className={`flex-row items-center justify-center gap-1.5 rounded-full px-4 py-2 ${
                  activeTab === "write" ? "bg-white/10" : "bg-transparent"
                }`}
                onPress={() => setActiveTab("write")}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={activeTab === "write" ? "#FFFFFF" : "#666666"}
                />
                <Text
                  className={`text-sm ${
                    activeTab === "write" ? "text-white" : "text-neutral-600"
                  }`}
                  style={{ fontFamily: "Satoshi-Medium" }}
                >
                  Write
                </Text>
              </Pressable>

              <Pressable
                className={`flex-row items-center justify-center gap-1.5 rounded-full px-4 py-2 ${
                  activeTab === "voice" ? "bg-white/10" : "bg-transparent"
                }`}
                onPress={() => setActiveTab("voice")}
              >
                <Ionicons
                  name="mic-outline"
                  size={20}
                  color={activeTab === "voice" ? "#FFFFFF" : "#666666"}
                />
                <Text
                  className={`text-sm ${
                    activeTab === "voice" ? "text-white" : "text-neutral-600"
                  }`}
                  style={{ fontFamily: "Satoshi-Medium" }}
                >
                  Voice
                </Text>
              </Pressable>
            </View>

            {/* Capture Controls - Only show when on capture tab and no image captured */}
            {activeTab === "capture" && !capturedImage && (
              <View className="items-center justify-center px-10 py-5">
                <View className="flex-row items-center justify-center gap-20">
                  {/* Gallery Button */}
                  <Pressable
                    className="h-15 w-15 items-center justify-center"
                    onPress={handleGallery}
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                      <Ionicons
                        name="images-outline"
                        size={24}
                        color="#FFFFFF"
                      />
                    </View>
                  </Pressable>

                  {/* Capture Button - Centered */}
                  <Pressable
                    className="h-20 w-20 items-center justify-center rounded-full border-4 border-white/30"
                    style={{ backgroundColor: "#F8D247" }}
                    onPress={handleCapture}
                  >
                    <View
                      className="h-17 w-17 rounded-full"
                      style={{ backgroundColor: "#F8D247" }}
                    />
                  </Pressable>

                  {/* Empty space for symmetry */}
                  <View className="h-15 w-15" />
                </View>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>

      {/* Text Summary Modal */}
      <DiaryTextSummaryModal
        visible={showSummaryModal}
        onClose={handleCloseSummaryModal}
        extractedText={extractedText}
        summary={summary}
        isLoadingSummary={isLoadingSummary}
        onSave={handleSaveDiary}
        remainingUses={remainingUses}
      />
    </Modal>
  );
}
