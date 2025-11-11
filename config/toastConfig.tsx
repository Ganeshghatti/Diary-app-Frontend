import React from "react";
import {
  BaseToast,
  BaseToastProps,
  ErrorToast,
  InfoToast,
} from "react-native-toast-message";

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: 0,
        backgroundColor: "#151515",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#4CAF50",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
        color: "#4CAF50",
        fontFamily: "Satoshi-Bold",
      }}
      text2Style={{
        fontSize: 13,
        color: "#B3B3B3",
        fontFamily: "Satoshi-Medium",
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftWidth: 0,
        backgroundColor: "#151515",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#E06666",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
        color: "#E06666",
        fontFamily: "Satoshi-Bold",
      }}
      text2Style={{
        fontSize: 13,
        color: "#B3B3B3",
        fontFamily: "Satoshi-Medium",
      }}
    />
  ),
  info: (props: BaseToastProps) => (
    <InfoToast
      {...props}
      style={{
        borderLeftWidth: 0,
        backgroundColor: "#151515",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#4facfe",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
        color: "#4facfe",
        fontFamily: "Satoshi-Bold",
      }}
      text2Style={{
        fontSize: 13,
        color: "#B3B3B3",
        fontFamily: "Satoshi-Medium",
      }}
    />
  ),
};
