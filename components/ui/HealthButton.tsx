import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface HealthButtonProps {
  onPress: () => void;
  todayHealthStats: any[];
}

export default function HealthButton({
  onPress,
  todayHealthStats,
}: HealthButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl mt-4"
      style={{ overflow: "hidden" }}
    >
      <LinearGradient
        colors={["rgba(42, 233, 17, 0.4)", "rgba(43, 142, 153, 0.4)"]}
        start={{ x: 0.025, y: 0 }}
        end={{ x: 1.057, y: 1 }}
        style={{
          paddingVertical: 20,
          paddingHorizontal: 22,
          borderRadius: 14,
          height: 100,
          position: "relative",
        }}
      >
        {/* Background Image - only show when there's data */}
        {todayHealthStats.length > 0 && (
          <Image
            source={require("../../assets/health_tab.png")}
            style={{
              position: "absolute",
              bottom: 0,
              top: 20,
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
            Health Stats
          </Text>

          {todayHealthStats.length === 0 && (
            <Image
              source={require("../../assets/health_tab.png")}
              style={{
                width: 44,
                height: 44,
                resizeMode: "contain",
              }}
            />
          )}
        </View>

        {todayHealthStats.length > 0 && (
          <View style={{ marginTop: 12, width: "100%" }}>
            <View className="flex-row flex-wrap gap-2 justify-end">
              {todayHealthStats.slice(0, 2).map((stat, index) => (
                <View
                  key={`${stat.name}-${index}`}
                  className="rounded-full bg-[#FFFFFF]/20 px-4 py-2"
                >
                  <Text
                    className="text-sm text-neutral-100"
                    style={{ fontFamily: "Satoshi-Bold" }}
                  >
                    {stat.name} {stat.value}
                    {stat.unit}
                  </Text>
                </View>
              ))}
              {todayHealthStats.length > 2 &&
                todayHealthStats.slice(2).map((_, extraIndex) => (
                  <View
                    key={`extra-${extraIndex}`}
                    className="rounded-full bg-[#FFFFFF]/20 px-3 py-2"
                  >
                    <Text
                      className="text-sm text-neutral-100"
                      style={{ fontFamily: "Satoshi-Medium" }}
                    >
                      +{extraIndex + 1}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
