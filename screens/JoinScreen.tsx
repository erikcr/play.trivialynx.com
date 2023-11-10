import React from "react";
import {
  Center,
  Button,
  FormControl,
  HStack,
  Input,
  Text,
  VStack,
  useToast,
  Toast,
  Box,
  ToastTitle,
  ToastDescription,
  InputField,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  ButtonText,
  Image,
  Heading,
} from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Keyboard } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";

import GuestLayout from "../layouts/GuestLayout";

import { supabase } from "../utils/supabase";

import { styled } from "@gluestack-style/react";

const StyledImage = styled(Image, {
  props: {
    style: {
      height: 40,
      width: 320,
    },
  },
});

const joinEventSchema = z.object({
  joinCode: z
    .string()
    .min(1, "Join code is required")
    .regex(new RegExp("^\\d+$"), "Join code must be a number"),
  teamName: z.string().min(3, "C'mon you can do better than that"),
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
    const { data, error } = await supabase
      .from(process.env.EXPO_PUBLIC_EVENTS_TABLE_NAME)
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
                  Please double check the code you entered
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } else {
      const eventToJoin = data[0];

      await AsyncStorage.setItem("joinCode", _data.joinCode);
      await AsyncStorage.setItem("teamName", _data.teamName);
      await AsyncStorage.setItem("eventData", JSON.stringify(eventToJoin));

      const insertData = await supabase
        .from(process.env.EXPO_PUBLIC_TEAMS_TABLE_NAME)
        .insert([{ name: _data.teamName, event_id: eventToJoin.id }])
        .select();

      router.push("/play");
    }
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <VStack justifyContent="space-between">
        <FormControl isInvalid={!!errors.joinCode} isRequired={true}>
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
              <Input>
                <InputField
                  fontSize="$sm"
                  placeholder="Join code"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.joinCode?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl my="$6" isInvalid={!!errors.teamName} isRequired={true}>
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
              <Input>
                <InputField
                  fontSize="$sm"
                  placeholder="Team name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="sm" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.teamName?.message}
            </FormControlErrorText>
          </FormControlError>

          <FormControlHelper></FormControlHelper>
        </FormControl>
      </VStack>

      <Button
        variant="solid"
        size="lg"
        mt="$5"
        onPress={handleSubmit(onSubmit)}
      >
        <ButtonText fontSize="$sm">JOIN EVENT</ButtonText>
      </Button>
    </>
  );
};

function SideContainerWeb() {
  return (
    <Center
      flex={1}
      bg="$primary500"
      sx={{
        _dark: { bg: "$primary500" },
      }}
    >
      <StyledImage
        w="$80"
        h="$10"
        alt="gluestack-ui Pro"
        resizeMode="contain"
        source={require("./assets/images/gluestackUiProLogo_web_light.svg")}
      />
    </Center>
  );
}

function MobileHeader() {
  return (
    <VStack px="$3" mt="$4.5" space="md">
      <VStack space="xs" ml="$1" my="$4">
        <Heading color="$textLight50" sx={{ _dark: { color: "$textDark50" } }}>
          Let's get ready to trivia
        </Heading>
        <Text
          fontSize="$md"
          fontWeight="normal"
          color="$primary300"
          sx={{
            _dark: { color: "$textDark400" },
          }}
        >
          Enter join code and team name
        </Text>
      </VStack>
    </VStack>
  );
}

const Main = () => {
  return (
    <>
      <Box sx={{ "@md": { display: "none" } }}>
        <MobileHeader />
      </Box>

      <Box
        px="$4"
        sx={{
          "@md": {
            px: "$8",
            borderTopLeftRadius: "$none",
            borderTopRightRadius: "$none",
            borderBottomRightRadius: "$none",
          },
          _dark: { bg: "$backgroundDark800" },
        }}
        py="$8"
        flex={1}
        bg="$backgroundLight0"
        justifyContent="space-between"
        borderTopLeftRadius="$2xl"
        borderTopRightRadius="$2xl"
        borderBottomRightRadius="$none"
      >
        <Heading
          display="none"
          mb="$8"
          sx={{
            "@md": { display: "flex", fontSize: "$2xl" },
          }}
        >
          Enter join code and team name
        </Heading>

        <JoinEventForm />

        <HStack
          space="xs"
          alignItems="center"
          justifyContent="center"
          mt="auto"
        ></HStack>
      </Box>
    </>
  );
};

const JoinScreen = () => {
  return (
    <GuestLayout>
      <Box display="none" sx={{ "@md": { display: "flex" } }} flex={1}>
        <SideContainerWeb />
      </Box>
      <Main />
    </GuestLayout>
  );
};

export default JoinScreen;
