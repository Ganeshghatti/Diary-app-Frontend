import React from "react";
import { Text, View } from "react-native";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Screen from "../../components/ui/Screen";
import { useAuth } from "../../providers/AuthProvider";

export default function Home() {
  const { state, signOut } = useAuth();
  return (
    <Screen>
      <View className="mt-20">
        <Text
          className="text-2xl font-semibold text-neutral-100"
          style={{ fontFamily: "Satoshi-Bold" }}
        >
          Hello {state.user?.phone}
        </Text>
        <Text
          className="mt-2 text-neutral-500"
          style={{ fontFamily: "Satoshi-Regular" }}
        >
          You&apos;re logged in. This is the app home.
        </Text>
      </View>
      <View className="mt-8">
        <PrimaryButton title="Sign out" onPress={signOut} />
      </View>
    </Screen>
  );
}
