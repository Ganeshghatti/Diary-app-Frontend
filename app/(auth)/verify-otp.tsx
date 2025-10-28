import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import OtpInput from "../../components/ui/OtpInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Screen from "../../components/ui/Screen";
import { useAuth } from "../../providers/AuthProvider";

export default function VerifyOtp() {
  const { phone: phoneParam, otp: otpParam } = useLocalSearchParams<{
    phone?: string;
    otp?: string;
  }>();
  const phone = (phoneParam as string) || "";
  const [code, setCode] = useState("".padEnd(6, " "));
  const [verifying, setVerifying] = useState(false);
  const { verifyOtp } = useAuth();

  useEffect(() => {
    // Prefill via params for demo
    if (otpParam && typeof otpParam === "string") {
      const otp = otpParam.toString();
      setCode(otp);
    }
  }, [otpParam]);

  const onVerify = async () => {
    setVerifying(true);
    const ok = await verifyOtp(phone, code.replace(/\s/g, ""));
    setVerifying(false);
    if (ok) router.replace("/onboarding" as any);
  };

  return (
    <Screen>
      <View className="mt-16">
        <Text className="text-2xl font-semibold text-neutral-100">
          Enter OTP
        </Text>
        <Text className="mt-2 text-neutral-400">
          We sent a code to +91 {phone}
        </Text>
      </View>
      <OtpInput value={code} onChangeText={setCode} />
      <View className="mt-8">
        <PrimaryButton
          title={verifying ? "Verifying…" : "Continue"}
          onPress={onVerify}
          disabled={verifying || code.trim().length < 6}
        />
      </View>
      {otpParam ? (
        <Text className="mt-4 text-center text-xs text-neutral-500">
          Demo OTP: {otpParam}
        </Text>
      ) : null}
    </Screen>
  );
}
