import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

// Request OTP API
export const requestOTP = async (phone: string) => {
  try {
    const response = await api.post("/auth/request-otp", {
      phone: phone,
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message || "OTP sent successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to send OTP. Please try again.",
      data: null,
    };
  }
};

// Verify OTP API
export const verifyOTP = async (phone: string, otp: string) => {
  try {
    const response = await api.post("/auth/verify-otp", {
      phone: phone,
      otp: otp,
    });

    // Store the token and user data
    if (response.data.token) {
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("userPhone", response.data.phone);
      await AsyncStorage.setItem(
        "isNewUser",
        response.data.newly_created.toString()
      );
    }

    return {
      success: true,
      data: response.data,
      message: response.data.message || "OTP verified successfully",
      token: response.data.token,
      phone: response.data.phone,
      newlyCreated: response.data.newly_created,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        "Failed to verify OTP. Please try again.",
      data: null,
      token: null,
      phone: null,
      newlyCreated: false,
    };
  }
};

// Get stored token
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// Logout (clear token and user data)
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("userPhone");
    await AsyncStorage.removeItem("isNewUser");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
