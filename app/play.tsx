import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import { StatusBar } from "@/components/ui/status-bar";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { TriangleAlert } from "lucide-react-native";
import type React from "react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useWindowDimensions } from "react-native";
import { z } from "zod";

function DesktopMessage() {
  return (
    <Center className="h-screen bg-primary-600 dark:bg-primary-800">
      <VStack space="xl" className="p-8">
        <Heading size="3xl" className="text-center">
          TriviaLynx
        </Heading>
        <VStack space="sm">
          <Heading size="lg" className="text-center">
            Please Use a Mobile Device
          </Heading>
          <Text size="md" className="text-center text-primary-100">
            This trivia game is designed for mobile and tablet devices. Please
            open this page on your phone or tablet to play.
          </Text>
        </VStack>
      </VStack>
    </Center>
  );
}

export default function JoinPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024; // Standard desktop breakpoint

  if (isDesktop) {
    return <DesktopMessage />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box className="web:h-[100vh] web:overflow-hidden h-[100%]">
          <StatusBar
            translucent
            barStyle="light-content"
            className="bg-transparent"
          />
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              flexGrow: 1,
              justifyContent: "center",
            }}
            bounces={false}
            className="flex-1 base:bg-zinc-700 md:bg-primary dark:bg-background"
          >
            <VStack
              className={`w-full flex-1 overflow-hidden md:max-w-containerWidth md:flex md:p-24`}
            >
              <Box className="md:px-8 md:rounded-2xl py-8 flex-1 bg-background dark:bg-background justify-between">
                <Box className="px-4 md:px-0">Event</Box>
              </Box>
            </VStack>
          </ScrollView>
        </Box>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
