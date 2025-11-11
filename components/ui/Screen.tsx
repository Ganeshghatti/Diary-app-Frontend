import React from "react";
import { ImageBackground, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Screen: React.FC<Props> = ({ children, className }) => {
  return (
    <ImageBackground
      source={require("../../assets/background-2.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        className={`flex-1 ${className || ""}` as any}
        edges={["top", "left", "right"]}
      >
        <View className="flex-1 px-5">{children}</View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Screen;
