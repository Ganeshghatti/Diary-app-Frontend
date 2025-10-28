import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const onboardingSteps = [
  {
    id: 1,
    title: "Upload photos with your entries.\nCapture your days vividly.",
    image: require("../assets/onboarding1.png"),
    width: 420,
    height: 420,
    marginTop: 150,
  },
  {
    id: 2,
    title: "Ask, and your diary finds it.\nJust type or speak naturally.",
    image: require("../assets/onboarding2.png"),
    width: 350,
    height: 380,
    marginTop: 130,
    marginLeft: -10,
  },
  {
    id: 3,
    title: "Multi-language support.\nWrite in your native language.",
    image: require("../assets/onboarding3.png"),
    width: 400,
    height: 400,
    marginTop: 150,
  },
  {
    id: 4,
    title: "Archive of all memories\nin one view",
    image: require("../assets/onboarding4.png"),
    width: 420,
    height: 540,
    marginTop: 150,
    marginLeft: 20,
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("/(app)/home" as any);
    }
  };

  const handleSkip = () => {
    router.replace("/(app)/home" as any);
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="flex-1">
          {/* Content Area - Centered */}
          <View className="flex-1 items-center justify-center px-8">
            <Text
              className="absolute top-32 text-center text-xl text-white/80"
              style={{
                fontFamily: "Satoshi-Bold",
                lineHeight: 28,
              }}
            >
              {currentStepData.title}
            </Text>

            {/* Onboarding Image */}
            <Image
              source={currentStepData.image}
              style={{
                width: currentStepData.width,
                height: currentStepData.height,
                resizeMode: "contain",
                marginTop: currentStepData.marginTop,
                marginLeft: currentStepData.marginLeft,
              }}
            />

            {/* Placeholder for custom content/images */}
            <View className="mt-8">
              {/* You can add images or custom content here */}
            </View>
          </View>

          {/* Bottom Navigation */}
          <View className="px-6 pb-8">
            <View className="flex-row items-center justify-between ">
              {/* Skip button */}
              <TouchableOpacity onPress={handleSkip}>
                <Text
                  className="text-white/80 text-base"
                  style={{ fontFamily: "Satoshi-Bold" }}
                >
                  Skip
                </Text>
              </TouchableOpacity>

              {/* Progress indicators */}
              <View
                className="flex-row gap-2 items-center"
                style={{ marginLeft: 35 }}
              >
                {onboardingSteps.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded-full ${
                      index === currentStep
                        ? "bg-yellow-400 w-8"
                        : "bg-neutral-700 w-2"
                    }`}
                  />
                ))}
              </View>

              {/* Next/Done button */}
              <TouchableOpacity
                onPress={handleNext}
                className="bg-yellow-400 rounded-full w-[82px] h-[44px]  px-[20px] items-center justify-center"
              >
                <Text
                  className="text-black text-base "
                  style={{
                    fontFamily: "Satoshi-Black",
                  }}
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    "Done"
                  ) : (
                    <Image
                      source={require("../assets/arrow_icon.png")}
                      style={{ width: 18, height: 18 }}
                      resizeMode="contain"
                    />
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
