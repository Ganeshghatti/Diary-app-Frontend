import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, Text } from "react-native";

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

const PrimaryButton: React.FC<Props> = ({ title, onPress, disabled }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ overflow: "hidden", borderRadius: 30 }}
    >
      <LinearGradient
        colors={["#F4B514", "#B8E636"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          padding: 12,
          borderRadius: 30,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 16,
            fontFamily: "Satoshi-Bold",
            color: "#000",
          }}
        >
          {title}
        </Text>
        <Image
          source={require("../../assets/arrow_icon.png")}
          style={{ width: 18, height: 18, marginLeft: -7 }}
          resizeMode="contain"
        />
      </LinearGradient>
    </Pressable>
  );
};

export default PrimaryButton;
