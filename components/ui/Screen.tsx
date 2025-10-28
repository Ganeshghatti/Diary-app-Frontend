import React from "react";
import { SafeAreaView, View } from "react-native";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const Screen: React.FC<Props> = ({ children, className }) => {
  return (
    <SafeAreaView className={`flex-1 bg-black ${className || ""}` as any}>
      <View className="flex-1 px-5">{children}</View>
    </SafeAreaView>
  );
};

export default Screen;
