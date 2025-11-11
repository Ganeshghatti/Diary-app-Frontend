import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/AuthProvider";

interface MenuItemProps {
  image: ImageSourcePropType;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ image, title, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 flex-row items-center justify-between rounded-2xl p-5"
    >
      <View className="flex-row items-center gap-4">
        <Image source={image} style={{ width: 28, height: 28 }} />
        <Text
          className="text-lg text-neutral-100"
          style={{ fontFamily: "Satoshi-Medium" }}
        >
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
};

export default function MyAccount() {
  const { signOut } = useAuth();

  const handleProfileDetails = () => {
    router.push("/(app)/profile-details");
  };

  const handleVirtualDad = () => {
    console.log("Navigate to Virtual Dad");
    // router.push("/(app)/virtual-dad");
  };

  const handleSupport = () => {
    console.log("Navigate to Support");
    // router.push("/(app)/support");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ImageBackground
      source={require("../../assets/background-2.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View className="mb-8 mt-4 flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-4">
              <Ionicons name="chevron-back" size={24} color="#E5E7EB" />
            </Pressable>
            <Text
              className="text-xl text-neutral-100"
              style={{ fontFamily: "Satoshi-Bold" }}
            >
              My Account
            </Text>
          </View>

          <MenuItem
            image={require("../../assets/profile_acc.png")}
            title="Profile Details"
            onPress={handleProfileDetails}
          />

          <MenuItem
            image={require("../../assets/virtual_acc.png")}
            title="Virtual Dad"
            onPress={handleVirtualDad}
          />

          <MenuItem
            image={require("../../assets/support_acc.png")}
            title="Support"
            onPress={handleSupport}
          />

          <Pressable
            onPress={handleLogout}
            className="mt-24 flex-row items-center justify-between rounded-2xl p-5"
          >
            <View className="flex-row items-center gap-4">
              <Image
                source={require("../../assets/logout_acc.png")}
                style={{ width: 28, height: 28 }}
              />
              <Text
                className="text-lg text-neutral-100"
                style={{ fontFamily: "Satoshi-Medium" }}
              >
                Logout
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
