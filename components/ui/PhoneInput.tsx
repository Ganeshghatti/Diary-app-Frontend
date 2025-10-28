import React from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
};

const PhoneInput: React.FC<Props> = ({ value, onChangeText }) => {
  return (
    <View className="mt-6">
      <Text
        className="mb-2 font-semibold* text-sm text-white/60"
        style={{ fontFamily: "Satoshi-Medium" }}
      >
        Mobile Number*
      </Text>
      <View className="flex-row items-center mt-3 rounded-[30px] bg-neutral-900 px-4 py-2">
        <Text
          className="mr-2 text-neutral-300"
          style={{ fontFamily: "Satoshi-Medium" }}
        >
          +91
        </Text>
        <TextInput
          keyboardType="phone-pad"
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter phone number"
          placeholderTextColor="#6B7280"
          className="flex-1 text-white/80 text-base "
          style={{ fontFamily: "Satoshi-Medium" }}
          maxLength={10}
        />
      </View>
    </View>
  );
};

export default PhoneInput;
