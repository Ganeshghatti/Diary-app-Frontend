import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface MoodButtonProps {
  onPress: () => void;
  todayMoods: string[];
}

export default function MoodButton({ onPress, todayMoods }: MoodButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl mt-4"
      style={{ overflow: "hidden" }}
    >
      <LinearGradient
        colors={["rgba(228, 255, 27, 0.4)", "rgba(153, 43, 131, 0.4)"]}
        start={{ x: 0.025, y: 0 }}
        end={{ x: 1.057, y: 1 }}
        style={{
          paddingVertical: 18,
          paddingHorizontal: 22,
          borderRadius: 14,
          minHeight: 90,
          position: "relative",
        }}
      >
        {todayMoods.length > 0 && (
          <Image
            source={require("../../assets/mood_tab.png")}
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
            Mood Tracker
          </Text>

          {todayMoods.length === 0 && (
            <Image
              source={require("../../assets/mood_tab.png")}
              style={{
                width: 44,
                height: 44,
                resizeMode: "contain",
              }}
            />
          )}
        </View>

        {todayMoods.length > 0 && (
          <View style={{ marginTop: 12, width: "100%" }}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {todayMoods.slice(0, 3).map((mood, index) => (
                <View
                  key={`${mood}-${index}`}
                  className="rounded-full bg-[#FFFFFF]/20 px-4 py-2"
                >
                  <Text
                    className="text-sm text-neutral-100 capitalize"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    {mood}
                  </Text>
                </View>
              ))}
              {todayMoods.length > 3 && (
                <View className="rounded-full bg-[#FFFFFF]/20 px-3 py-2">
                  <Text
                    className="text-sm text-neutral-100"
                    style={{ fontFamily: "Satoshi-Medium" }}
                  >
                    +{todayMoods.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
