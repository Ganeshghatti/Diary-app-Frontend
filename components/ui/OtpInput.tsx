import React, { useRef } from "react";
import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  length?: number;
};

const OtpInput: React.FC<Props> = ({ value, onChangeText, length = 6 }) => {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, idx: number) => {
    // On web, the entire value might be passed; take only the last digit
    const clean = text.replace(/\D/g, "").slice(-1);

    // Build new value array, ensuring we have exactly 'length' characters
    const valueArray = value.split("");
    while (valueArray.length < length) valueArray.push("");

    // If user cleared the field, handle backspace
    if (!clean) {
      valueArray[idx] = "";
      onChangeText(valueArray.join(""));
      // Focus previous input on backspace
      if (idx > 0) inputs.current[idx - 1]?.focus();
      return;
    }

    valueArray[idx] = clean;
    const next = valueArray.join("");
    onChangeText(next);

    // Auto-advance to next input
    if (clean && idx < length - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  return (
    <View className="mt-6 flex-row  justify-between">
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          className="h-[48px] w-[37px] mx-1 rounded-xl border-neutral-700 bg-neutral-900 text-center text-lg text-neutral-100"
          style={{ fontFamily: "Satoshi-Bold" }}
          keyboardType="number-pad"
          maxLength={1}
          value={value[i] || ""}
          onChangeText={(t) => handleChange(t, i)}
          selectTextOnFocus
          autoComplete="off"
        />
      ))}
    </View>
  );
};

export default OtpInput;
