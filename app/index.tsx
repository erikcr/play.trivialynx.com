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

type Event = Tables<"event">;
type Team = Tables<"team">;

const joinEventSchema = z.object({
  joinCode: z.string().min(1, "Join code is required"),
  teamName: z
    .string()
    .min(1, "Team name is required")
    .min(3, "C'mon you can do better than that"),
});

type JoinEventSchemaType = z.infer<typeof joinEventSchema>;

const JoinEventForm = () => {
  const { code } = useLocalSearchParams<{ code?: string }>();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<JoinEventSchemaType>({
    resolver: zodResolver(joinEventSchema),
  });

  const toast = useToast();

  const onSubmit = async (_data: JoinEventSchemaType) => {
    await AsyncStorage.clear();

    const { data, error } = await supabase
      .from("event")
      .select()
      .limit(1)
      .eq("join_code", _data.joinCode)
      .single();

    if (error) {
      console.error(error);
    }

    if (!data) {
      toast.show({
        placement: "bottom",
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="error">
              <VStack space="xs">
                <ToastTitle>Invalid join code</ToastTitle>
                <ToastDescription>
                  Please double check the code you entered.
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } else {
      const eventToJoin = data as Event;

      await AsyncStorage.setItem("eventId", eventToJoin.id);
      await AsyncStorage.setItem("joinDate", JSON.stringify(Date.now()));

      const { data: newTeam } = await supabase
        .from("team")
        .insert([{ name: _data.teamName, event_id: eventToJoin.id }])
        .select()
        .single();

      if (newTeam) {
        await AsyncStorage.setItem("myTeam", JSON.stringify(newTeam as Team));
      }

      reset();

      router.replace(`/play?eventId=${eventToJoin.id}`);
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const checkJoinDate = async () => {
    const joinCode = await AsyncStorage.getItem("joinCode");
    const joinDateStr = await AsyncStorage.getItem("joinDate");

    if (joinDateStr) {
      const joinDate = JSON.parse(joinDateStr);
      const fourHours = 4 * 60 * 60 * 1000;

      if (Date.now() - joinDate < fourHours) {
        router.replace(`/play?eventId=${joinCode}`);
      }
    }
  };

  useEffect(() => {
    checkJoinDate();
  }, []);

  return (
    <Box className="w-full max-w-md mx-auto px-4 py-6 lg:p-8">
      <VStack space="xl">
        <VStack space="lg">
          <FormControl
            isInvalid={!!errors.joinCode}
            isRequired={true}
            size="lg"
          >
            <Controller
              name="joinCode"
              defaultValue={code ? code : ""}
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await joinEventSchema.parseAsync({ joinCode: value });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  size="lg"
                  variant="outline"
                  isDisabled={code ? true : false}
                  className="bg-white dark:bg-gray-800"
                >
                  <InputField
                    placeholder="Enter event code"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    className="text-base placeholder:text-muted-foreground"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon
                size="xs"
                as={TriangleAlert}
                className="text-red-400"
              />
              <FormControlErrorText size="sm" className="text-red-400">
                {errors?.joinCode?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl
            isInvalid={!!errors.teamName}
            isRequired={true}
            size="lg"
          >
            <Controller
              name="teamName"
              defaultValue=""
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await joinEventSchema.parseAsync({
                      teamName: value,
                    });
                    return true;
                  } catch (error: any) {
                    return error.message;
                  }
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  size="lg"
                  variant="outline"
                  className=" dark:bg-gray-800"
                >
                  <InputField
                    placeholder="Enter team name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    className="text-base placeholder:text-muted-foreground"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon
                size="xs"
                as={TriangleAlert}
                className="text-red-400"
              />
              <FormControlErrorText size="sm" className="text-red-400">
                {errors?.teamName?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>

        <Button
          variant="solid"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          className="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 dark:bg-primary"
        >
          <ButtonText className="text-base font-medium text-primary-foreground">
            Join Event
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

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

function MobileHeader() {
  return (
    <VStack space="md" className="px-3 mt-4.5">
      <VStack space="xl" className="p-8">
        <Heading size="2xl" className="text-center">
          TriviaLynx
        </Heading>

        <HStack className="flex flex-col justify-center">
          <VStack>
            <Heading className="text-center text-textLight-50 dark:text-textDark-50">
              Let's get ready to trivia
            </Heading>
            <Text className="text-center text-md font-normal text-muted-foreground dark:text-muted-foreground">
              Enter join code and team name
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </VStack>
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
                <MobileHeader />

                <Box className="px-4 md:px-0">
                  <JoinEventForm />
                </Box>
              </Box>
            </VStack>
          </ScrollView>
        </Box>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
