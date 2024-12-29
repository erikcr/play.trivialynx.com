import React, { useEffect } from "react";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Heading } from "@/components/ui/heading";
import { StatusBar } from "@/components/ui/status-bar";
import { Box } from "@/components/ui/box";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import { z } from "zod";
import { router, useLocalSearchParams } from "expo-router";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
} from "@/components/ui/form-control";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";
import { Keyboard } from "react-native";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { TriangleAlert } from "lucide-react-native";

// const MobileStyledImage = styled(Image, {
//   props: {
//     style: {
//       height: 56,
//       width: 56,
//     },
//   },
// });

const joinEventSchema = z.object({
  joinCode: z
    .string()
    .min(1, "Join code is required")
    .regex(new RegExp("^\\d+$"), "Join code must be a number"),
  teamName: z
    .string()
    .min(1, "Team name is required")
    .min(3, "C'mon you can do better than that"),
});

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
});

type JoinEventSchemaType = z.infer<typeof joinEventSchema>;
type EmailSchemaType = z.infer<typeof emailSchema>;

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
      .from("v002_events_stag")
      .select()
      .limit(1)
      .eq("join_code", _data.joinCode);

    if (!data?.length) {
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
      const eventToJoin = data[0];

      await AsyncStorage.setItem("joinCode", _data.joinCode);
      await AsyncStorage.setItem("joinDate", JSON.stringify(Date.now()));

      const newTeam = await supabase
        .from("v002_teams_stag")
        .insert([{ name: _data.teamName, event_id: eventToJoin.id }])
        .select();

      if (newTeam.data) {
        await AsyncStorage.setItem("myTeam", JSON.stringify(newTeam.data[0]));
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
                    className="text-base"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={TriangleAlert} />
              <FormControlErrorText>
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
                  className="bg-white dark:bg-gray-800"
                >
                  <InputField
                    placeholder="Enter team name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    className="text-base"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={TriangleAlert} />
              <FormControlErrorText>
                {errors?.teamName?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>

        <Button
          variant="solid"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 dark:bg-primary-500"
        >
          <ButtonText className="text-base font-medium">Join Event</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

function SideContainerWeb() {
  return (
    <Center className="flex-1 bg-primary-600 dark:bg-primary-600 md:rounded-l-2xl">
      {/* <StyledImage
        w="$80"
        h="$80"
        alt="gluestack-ui Pro"
        resizeMode="contain"
        sx={{
          "@md": {
            display: "hidden",
          },
        }}
        source={require("../assets/images/trivialynx-logo.svg")}
      /> */}
    </Center>
  );
}

function MobileHeader() {
  return (
    <VStack space="md" className="px-3 mt-4.5">
      <VStack space="xs" className="ml-1 my-4">
        <HStack>
          {/* <MobileStyledImage
            alt="gluestack-ui Pro"
            resizeMode="contain"
            sx={{
              "@md": {
                w: "$120",
                h: "$80",
              },
            }}
            source={require("../assets/images/trivialynx-logo.svg")}
          /> */}
          <VStack className="ml-4">
            <Heading className="text-textLight-50 dark:text-textDark-50">
              Let's get ready to trivia
            </Heading>
            <Text className="text-md font-normal text-textLight-100 dark:text-textDark-400">
              Enter join code and team name
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </VStack>
  );
}

const Main = () => {
  return (
    <>
      <Box className="md:hidden ">
        <MobileHeader />
      </Box>
      <Box className="px-4 md:px-8 rounded-t-2xl md:rounded-tl-none md:rounded-r-2xl py-8 flex-1 bg-backgroundLight-0 justify-between">
        <Heading className="hidden mb-8 md:flex md:text-2xl md:justify-center">
          Enter join code and team name
        </Heading>

        <JoinEventForm />

        <HStack
          space="xs"
          className="items-center justify-center mt-auto"
        ></HStack>
      </Box>
    </>
  );
};

const index = ({ children }: { children: React.ReactNode }) => {
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
            className="flex-1 base:bg-zinc-700 md:bg-primary-700 dark:bg-backgroundDark-900"
          >
            <VStack
              className={`w-full flex-1 overflow-hidden md:max-w-containerWidth md:flex-row md:rounded-xl md:p-24`}
            >
              <Box className="hidden md:flex flex-1">
                <SideContainerWeb />
              </Box>

              <Main />
            </VStack>
          </ScrollView>
        </Box>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default index;
