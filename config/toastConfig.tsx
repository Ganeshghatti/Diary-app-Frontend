import React from "react";
import {
  BaseToast,
  BaseToastProps,
  ErrorToast,
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
        borderColor: "#B8E636",
        shadowColor: "#B8E636",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
        color: "#EAEAEA",
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
        borderColor: "#EF4444",
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
        color: "#EAEAEA",
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
