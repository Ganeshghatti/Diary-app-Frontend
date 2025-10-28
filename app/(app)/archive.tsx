import React from "react";
import { Text, View } from "react-native";
import Screen from "../../components/ui/Screen";

export default function Archive() {
  return (
    <Screen>
      <View className="mt-20">
        <Text
          className="text-2xl font-semibold text-neutral-100"
          style={{ fontFamily: "Satoshi-Bold" }}
        >
          Archive
        </Text>
        <Text
          className="mt-2 text-neutral-500"
          style={{ fontFamily: "Satoshi-Regular" }}
        >
          View all your past diary entries
        </Text>
      </View>
    </Screen>
  );
}
