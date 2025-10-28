import { Redirect } from "expo-router";
import React from "react";
import { useAuth } from "../providers/AuthProvider";

export default function Index() {
  const { state } = useAuth();
  if (state.loading) return null;
  return state.user ? (
    <Redirect href="/(app)/home" />
  ) : (
    <Redirect href="/(auth)/sign-in" />
  );
}
