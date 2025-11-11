import { toastConfig } from "@/config/toastConfig";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "../../services/userService";

interface ProfileFieldProps {
  label: string;
  value: string;
  verified?: boolean;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  verified,
  editable,
  onChangeText,
  keyboardType = "default",
}) => {
  return (
    <View className="mb-10">
      <Text
        className="mb-2 text-sm text-[#FFFFFF]/60"
        style={{ fontFamily: "Satoshi-Bold" }}
      >
        {label}
      </Text>
      <View className="flex-row border-b-2 border-[#FFFFFF]/30 items-center justify-between pb-2 ">
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            className="flex-1 text-lg text-[#FFFFFF]/80"
            style={{ fontFamily: "Satoshi-Medium" }}
            placeholderTextColor="#FFFFFF40"
            keyboardType={keyboardType}
            editable={editable}
          />
        ) : (
          <Text
            className="text-lg text-[#FFFFFF]/80"
            style={{ fontFamily: "Satoshi-Medium" }}
          >
            {value}
          </Text>
        )}
        {verified && (
          <View
            className="h-6 w-6 items-center justify-center rounded-full"
            style={{ backgroundColor: "#F8D247" }}
          >
            <Image
              source={require("../../assets/check.png")}
              style={{ width: 12, height: 12 }}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default function ProfileDetails() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        setName(response.data.name);
        setEmail(response.data.email || "");
        setProfileImage(response.data.profile_pic);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.error || "Failed to load profile",
          position: "top",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getProfileImageUrl = () => {
    // If in edit mode and new image selected, show the new image
    if (isEditing && imageFile?.uri) {
      return { uri: imageFile.uri };
    }

    // If in edit mode and no new image, but has profileImage state
    if (isEditing && profileImage) {
      const base64String = profileImage;
      if (base64String.startsWith("data:image")) {
        return { uri: base64String };
      }
      return { uri: `data:image/png;base64,${base64String}` };
    }

    // Default case: use profile data
    if (profile?.profile_pic) {
      const base64String = profile.profile_pic;
      if (base64String.startsWith("data:image")) {
        return { uri: base64String };
      }
      return { uri: `data:image/png;base64,${base64String}` };
    }
    return require("../../assets/profile.jpg"); // Default profile image
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take a photo!"
        );
        return false;
      }
    }
    return true;
  };

  const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need media library permissions to select a photo!"
        );
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = () => {
    Alert.alert(
      "Select Image",
      "Choose an option to update your profile picture",
      [
        {
          text: "Take Photo",
          onPress: handleTakePhoto,
        },
        {
          text: "Choose from Gallery",
          onPress: handlePickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageFile({
        uri: asset.uri,
        type: "image/jpeg",
        name: `profile_${Date.now()}.jpg`,
      });
      setProfileImage(asset.uri);
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageFile({
        uri: asset.uri,
        type: "image/jpeg",
        name: `profile_${Date.now()}.jpg`,
      });
      setProfileImage(asset.uri);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset fields to original values
    setName(profile?.name || "");
    setEmail(profile?.email || "");
    setProfileImage(profile?.profile_pic || null);
    setImageFile(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("name", name);
      if (email) {
        formData.append("email", email);
      }

      if (imageFile) {
        formData.append("profile_pic", {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.name,
        } as any);
      }

      const response = await updateUserProfile(formData);

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile updated successfully",
          position: "top",
        });
        setIsEditing(false);
        // Refresh profile
        await fetchProfile();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.error || "Failed to update profile",
          position: "top",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Something went wrong",
        position: "top",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <ImageBackground
          source={require("../../assets/background-2.png")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#F8D247" />
            </View>
          </SafeAreaView>
        </ImageBackground>
        <Toast config={toastConfig} />
      </>
    );
  }

  return (
    <>
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
              <View className="flex-row items-center">
                <Pressable onPress={() => router.back()} className="mr-4">
                  <Ionicons name="chevron-back" size={24} color="#E5E7EB" />
                </Pressable>
                <Text
                  className="text-xl text-neutral-100"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  Profile Details
                </Text>
              </View>

              {isEditing && (
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleCancel}
                    className="rounded-full border-2 px-4 py-2"
                    style={{ borderColor: "#FFFFFF40" }}
                    disabled={isSaving}
                  >
                    <Text
                      className="text-sm text-neutral-100"
                      style={{ fontFamily: "Satoshi-Medium" }}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSave}
                    className="rounded-full px-4 py-2"
                    style={{ backgroundColor: "#F8D247" }}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text
                        className="text-sm text-black"
                        style={{ fontFamily: "Satoshi-Bold" }}
                      >
                        Save
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            {/* Profile Picture Section */}
            <View className="mb-8 items-center">
              {/* Profile Picture with Gradient Border */}
              <View className="relative mb-4">
                <LinearGradient
                  colors={["#7DDFE8", "#B8E636"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: 4,
                    borderRadius: 80,
                  }}
                >
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 76,
                      overflow: "hidden",
                      backgroundColor: "#000",
                    }}
                  >
                    <Image
                      source={getProfileImageUrl()}
                      style={{ width: 120, height: 120 }}
                      resizeMode="cover"
                    />
                  </View>
                </LinearGradient>

                {isEditing ? (
                  <Pressable
                    onPress={handleImagePicker}
                    className="absolute -bottom-2 -right-2 h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#F8D247" }}
                  >
                    <Ionicons name="camera" size={20} color="#000" />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleEdit}
                    className="absolute -bottom-10 left-48 flex-row items-center gap-2 rounded-full border-2 px-4 py-2"
                    style={{
                      borderColor: "#FFFFFF40",
                    }}
                  >
                    <Text
                      className="text-sm text-neutral-100"
                      style={{ fontFamily: "Satoshi-Medium" }}
                    >
                      Edit
                    </Text>
                    <Image
                      source={require("../../assets/pencil_icon.png")}
                      style={{ width: 16, height: 16 }}
                      resizeMode="contain"
                    />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Profile Fields */}
            <View>
              <ProfileField
                label="Name*"
                value={isEditing ? name : profile?.name || "N/A"}
                editable={isEditing}
                onChangeText={setName}
              />

              <ProfileField
                label="Mobile Number*"
                value={profile?.phone || "N/A"}
                editable={false}
              />

              <ProfileField
                label="Mail Address"
                value={isEditing ? email : profile?.email || "N/A"}
                verified={!!profile?.email && !isEditing}
                editable={isEditing}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
      <Toast config={toastConfig} />
    </>
  );
}
