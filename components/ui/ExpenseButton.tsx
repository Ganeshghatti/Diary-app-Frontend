import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface ExpenseButtonProps {
  onPress: () => void;
  totalExpense: number;
}

export default function ExpenseButton({
  onPress,
  totalExpense,
}: ExpenseButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl mt-4"
      style={{ overflow: "hidden" }}
    >
      <LinearGradient
        colors={["rgba(19, 27, 255, 0.4)", "rgba(11, 141, 153, 0.4)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.108, y: 1 }}
        style={{
          paddingVertical: 18,
          paddingHorizontal: 22,
          alignItems: "center",
          borderRadius: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          height: 90,
          position: "relative",
        }}
      >
        {/* Background Image */}
        <Image
          source={require("../../assets/exprense_tab.png")}
          style={{
            position: "absolute",
            bottom: 0,
            top: 10,
            right: -20,
            width: 110,
            height: 110,
            resizeMode: "contain",
            opacity: 0.4,
          }}
        />

        <Text
          className="text-left text-neutral-100"
          style={{ fontFamily: "Satoshi-Bold", fontSize: 18 }}
        >
          Expense Tracker
        </Text>

        <View
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            zIndex: 1,
          }}
        >
          <Text
            className="text-neutral-100"
            style={{ fontFamily: "Satoshi-Bold", fontSize: 18 }}
          >
            ₹ {new Intl.NumberFormat("en-IN").format(Math.round(totalExpense))}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
