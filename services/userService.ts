import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export interface UserProfile {
  phone: string;
  timezone: string;
  created_at: {
    $date: string;
  };
  email: string;
  name: string;
  profile_pic_url: string;
  profile_pic: string;
}

export interface UserProfileResponse {
  user: UserProfile;
}

// Get user profile
export const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get<UserProfileResponse>("/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: response.data.user,
      message: "Profile fetched successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to fetch profile. Please try again.",
      data: null,
    };
  }
};

// Update user profile
export const updateUserProfile = async (
  profileData: FormData | Partial<UserProfile>
) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const isFormData = profileData instanceof FormData;

    const response = await api.put("/user/profile", profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData && { "Content-Type": "multipart/form-data" }),
      },
    });

    return {
      success: true,
      data: response.data.user,
      message: response.data.message || "Profile updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to update profile. Please try again.",
      data: null,
    };
  }
};
