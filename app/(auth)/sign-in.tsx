import { toastConfig } from "@/config/toastConfig";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import OtpInput from "../../components/ui/OtpInput";
import PhoneInput from "../../components/ui/PhoneInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useAuth } from "../../providers/AuthProvider";
import { requestOTP, verifyOTP } from "../../services/authService";

export default function SignIn() {
  const { setUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageOpacity] = useState(new Animated.Value(1));
  const [imageHeight] = useState(new Animated.Value(300));
  const [imageMarginTop] = useState(new Animated.Value(28));
  const [contentTranslateY] = useState(new Animated.Value(0));

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        Animated.parallel([
          Animated.timing(imageOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(imageHeight, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(imageMarginTop, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(contentTranslateY, {
            toValue: -80,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.parallel([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(imageHeight, {
            toValue: 300,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(imageMarginTop, {
            toValue: 28,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [imageOpacity, imageHeight, imageMarginTop, contentTranslateY]);

  const onGetStarted = async () => {
    if (phone.length < 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Number",
        text2: "Phone number must be 10 digits",
        position: "top",
      });
      return;
    }

    if (!showOtp) {
      // Request OTP
      setBusy(true);
      const result = await requestOTP(phone);
      setBusy(false);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: result.message,
          position: "top",
        });
        setShowOtp(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.error,
          position: "top",
        });
      }
      return;
    }

    // Verify OTP - now expects 6 digits
    if (code.length === 6) {
      setBusy(true);
      const result = await verifyOTP(phone, code);
      setBusy(false);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: result.message,
          position: "top",
        });

        // Set user in AuthProvider
        setUser(result.phone || phone);

        // Route based on newly_created flag
        // Wait a moment for toast to show, then navigate
        setTimeout(() => {
          if (result.newlyCreated) {
            // New user - go to onboarding
            router.replace("/onboarding" as any);
          } else {
            // Existing user - go to home
            router.replace("/(app)/home" as any);
          }
        }, 500);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.error,
          position: "top",
        });
      }
    }
  };

  const handleEditPhone = () => {
    setShowOtp(false);
    setCode("");
  };

  return (
    <ImageBackground
      source={require("../../assets/background-2.png")}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: "cover" }}
    >
      <Animated.View
        className="flex-1 items-center justify-center px-6"
        style={{
          paddingTop: Platform.OS === "ios" ? 50 : 0,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        <MaskedView
          style={{ flexDirection: "row" }}
          maskElement={
            <Text
              className="text-center text-2xl "
              style={{
                fontFamily: "Satoshi-Bold",
              }}
            >
              {"Sign up to capture, \n reflect, & grow"}
            </Text>
          }
        >
          <LinearGradient
            colors={["#FFF0C9", "#B3B5E9", "#22FBFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          >
            <Text
              className="text-center text-2xl opacity-0"
              style={{
                fontFamily: "Satoshi-Medium",
              }}
            >
              {"Sign up to capture, \n reflect, & grow"}
            </Text>
          </LinearGradient>
        </MaskedView>

        <Animated.Image
          source={require("../../assets/signup.png")}
          style={{
            width: 360,
            height: imageHeight,
            marginTop: imageMarginTop,
            resizeMode: "contain",
            opacity: imageOpacity,
          }}
        />

        {!showOtp && (
          <View className="w-full mt-6">
            <PhoneInput value={phone} onChangeText={setPhone} />
          </View>
        )}

        {showOtp && (
          <>
            <Text
              className="mt-6 text-center text-[16px] text-white/60"
              style={{ fontFamily: "Satoshi-Medium" }}
            >
              {`Enter the 6 digit verification code \nsent to your number`}
            </Text>

            <View className="mt-4 flex-row items-center justify-center">
              <View className="flex-row items-center gap-2 rounded-full bg-neutral-800 px-8 py-2">
                <Text
                  className="text-[16px]  text-neutral-100"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  {(() => {
                    const d = phone.replace(/\D/g, "");
                    if (!d) return "";
                    let country = "+91";
                    let national = d;

                    if (d.length > 10) {
                      if (d.startsWith("91")) {
                        country = "+91";
                        national = d.slice(2);
                      } else if (d.length === 11 && d.startsWith("0")) {
                        country = "+91";
                        national = d.slice(1);
                      } else {
                        const extraLen = d.length - 10;
                        country = `+${d.slice(0, extraLen)}`;
                        national = d.slice(extraLen);
                      }
                    }

                    if (!national) return country;
                    return national.length > 5
                      ? `${country}-${national.slice(0, 5)}-${national.slice(5)}`
                      : `${country}-${national}`;
                  })()}
                </Text>

                <Pressable onPress={handleEditPhone} style={{ marginLeft: 8 }}>
                  <Image
                    source={require("../../assets/pencil_icon.png")}
                    style={{ width: 14, height: 14 }}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
            </View>

            <OtpInput value={code} onChangeText={setCode} length={6} />
          </>
        )}

        <View className="mt-10 w-[149px] h-[54px]">
          <PrimaryButton
            title={
              busy ? "Please wait…" : showOtp ? "Verify OTP" : "Get Started"
            }
            onPress={onGetStarted}
            disabled={busy || phone.length < 10 || (showOtp && code.length < 6)}
          />
        </View>

        {/* <View className="mt-6">
          <Text
            className="text-center font-semibold text-sm text-neutral-400"
            style={{ fontFamily: "Satoshi-Medium" }}
          >
            Already have an account?{" "}
            <Text
              onPress={() => router.push("/login" as any)}
              className="text-[#6D72FF] font-semibold"
              style={{ fontFamily: "Satoshi-Medium", cursor: "pointer" }}
            >
              Login
            </Text>
          </Text>
        </View> */}
      </Animated.View>
      <Toast config={toastConfig} />
    </ImageBackground>
  );
}
