import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface DiaryButtonProps {
  onPress: () => void;
  todayDiaryText: string;
}

export default function DiaryButton({
  onPress,
  todayDiaryText,
}: DiaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl"
      style={{ overflow: "hidden" }}
    >
      <LinearGradient
        colors={["rgba(162, 116, 0, 0.4)", "rgba(0, 144, 147, 0.4)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.19, y: 1 }}
        style={{
          paddingVertical: 18,
          paddingHorizontal: 22,
          borderRadius: 14,
          minHeight: 90,
          position: "relative",
        }}
      >
        {todayDiaryText.length > 0 && (
          <Image
            source={require("../../assets/diary_tab.png")}
            style={{
              position: "absolute",
              bottom: 0,
              top: 50,
              right: -20,
              width: 110,
              height: 110,
              resizeMode: "contain",
              opacity: 0.4,
            }}
          />
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            className="text-left text-neutral-100"
            style={{ fontFamily: "Satoshi-Bold", fontSize: 18 }}
          >
            Capture Today&apos;s Diary
          </Text>

          {todayDiaryText.length === 0 && (
            <Image
              source={require("../../assets/diary_tab.png")}
              style={{
                width: 44,
                height: 44,
                resizeMode: "contain",
              }}
            />
          )}
        </View>

        {todayDiaryText.length > 0 && (
          <View
            style={{ marginTop: 12, width: "85%" }}
            className="bg-white/10 rounded-xl py-6 px-3"
          >
            <Text
              className="text-md text-neutral-100"
              style={{ fontFamily: "Satoshi-Bold" }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {todayDiaryText}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
