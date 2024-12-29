import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { StatusBar } from "@/components/ui/status-bar";
import { Box } from "@/components/ui/box";
import React from "react";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type PrimaryLayoutProps = {
  children: React.ReactNode;
};

export default function PrimaryLayout(props: PrimaryLayoutProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box className="web:h-[100vh]  web:overflow-hidden h-[100%]">
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
            className="flex-1 base:bg-primary-700 md:bg-primary-700 p-8  dark:bg-backgroundDark-900">
            <VStack
              className={` md:flex-${undefined} w-full flex-1 overflow-hidden md:max-w-containerWidth  md:flex-row  md:rounded-xl `}>
              {props.children}
            </VStack>
          </ScrollView>
        </Box>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
