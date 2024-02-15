import React, { useEffect } from "react";
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
  Divider,
} from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Keyboard } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";

import PrimaryLayout from "../layouts/PrimaryLayout";

import { supabase } from "../utils/supabase";

import { styled } from "@gluestack-style/react";

const StyledImage = styled(Image, {
  props: {
    style: {
      height: 280,
      width: 280,
    },
  },
});

const MobileStyledImage = styled(Image, {
  props: {
    style: {
      height: 56,
      width: 56,
    },
  },
});

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
      const fourHours = 4 * 60 * 60 *1000;

      if (Date.now() - joinDate < fourHours) {
        router.replace(`/play?eventId=${joinCode}`);
      }
    }
  };

  useEffect(() => {
    checkJoinDate();
  }, []);

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
              <Input isDisabled={code ? true : false}>
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
        sx={{
          _light: { bg: "$primary700" },
          _dark: { bg: "$primary500" },
        }}
        onPress={handleSubmit(onSubmit)}
      >
        <ButtonText fontSize="$sm">JOIN EVENT</ButtonText>
      </Button>
    </>
  );
};

function EmailForm() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<EmailSchemaType>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (_data: EmailSchemaType) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: _data.email,
      options: {
        // set this to false if you do not want the user to be automatically signed up
        shouldCreateUser: false,
        emailRedirectTo: "https://trivitlynx.tech",
      },
    });

    console.log(data);
  };

  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <Divider mt="$12" mb="$12" />

      <Text>Enter your email to start creating your own</Text>

      <FormControl mt="$6" isInvalid={!!errors.email} isRequired={true}>
        <Controller
          name="email"
          control={control}
          rules={{
            validate: async (value) => {
              try {
                await emailSchema.parseAsync({ email: value });
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
                placeholder="Email"
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
          <FormControlErrorText>{errors?.email?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <Button
        variant="solid"
        size="lg"
        mt="$5"
        sx={{
          _light: { bg: "$primary700" },
          _dark: { bg: "$primary500" },
        }}
        onPress={handleSubmit(onSubmit)}
      >
        <ButtonText fontSize="$sm">CREATE YOUR OWN</ButtonText>
      </Button>
    </>
  );
}

function SideContainerWeb() {
  return (
    <Center
      flex={1}
      bg="$primary600"
      sx={{
        _dark: { bg: "$primary600" },
      }}
    >
      <StyledImage
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
      />
    </Center>
  );
}

function MobileHeader() {
  return (
    <VStack px="$3" mt="$4.5" space="md">
      <VStack space="xs" ml="$1" my="$4">
        <HStack>
          <MobileStyledImage
            alt="gluestack-ui Pro"
            resizeMode="contain"
            sx={{
              "@md": {
                w: "$120",
                h: "$80",
              },
            }}
            source={require("../assets/images/trivialynx-logo.svg")}
          />
          <VStack ml="$4">
            <Heading
              color="$textLight50"
              sx={{ _dark: { color: "$textDark50" } }}
            >
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
        </HStack>
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

        {/* <EmailForm /> */}

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

export default function JoinScreen() {
  return (
    <PrimaryLayout>
      <Box
        display="none"
        sx={{ "@md": { display: "flex", bg: "$green400" } }}
        flex={1}
      >
        <SideContainerWeb />
      </Box>
      <Main />
    </PrimaryLayout>
  );
}
