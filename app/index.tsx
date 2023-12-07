import React from "react";
import {
  Box,
  VStack,
  Button,
  Image,
  Center,
  ButtonText,
} from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";

import PrimaryLayout from "../layouts/PrimaryLayout";

import { styled } from "@gluestack-style/react";

const StyledImage = styled(Image, {
  "@sm": {
    props: {
      style: {
        height: 40,
        width: 320,
      },
    },
  },
  "@md": {
    props: {
      style: {
        height: 141,
        width: 275,
      },
    },
  },
});

// to render login and sign up buttons
function ActionButtons() {
  return (
    <VStack
      space="xs"
      mt="$10"
      sx={{
        "@md": {
          mt: "$12",
        },
      }}
    >
      <Button
        sx={{
          ":hover": {
            bg: "$backgroundLight100",
          },
        }}
        size="md"
        variant="solid"
        action="primary"
        isDisabled={false}
        isFocusVisible={false}
        backgroundColor="$backgroundLight0"
        onPress={() => {
          router.replace("/join");
        }}
      >
        <ButtonText
          fontWeight="$bold"
          textDecorationLine="none"
          color="$primary500"
        >
          JOIN EVENT
        </ButtonText>
      </Button>
    </VStack>
  );
}

function HeaderLogo() {
  return (
    <Box alignItems="center" justifyContent="center">
      <StyledImage
        alt="gluestack-ui Pro"
        resizeMode="contain"
        source={require("../assets/images/brainybrawls.svg")}
        sx={{
          "@md": {
            display: "flex",
          },
        }}
        display="none"
      />

      <StyledImage
        sx={{
          "@md": {
            display: "none",
          },
        }}
        alt="gluestack-ui Pro"
        display="flex"
        source={require("../assets/images/brainybrawls.svg")}
      />
    </Box>
  );
}

export default function HomeScreen() {
  return (
    <PrimaryLayout>
      <Center w="$full" flex={1}>
        <Box
          maxWidth="$508"
          w="$full"
          minHeight="$544"
          bg="$primary700"
          sx={{
            "@md": {
              // h: '$authcard',
              px: "$8",
              rounded: "$lg",
            },
          }}
          px="$4"
          justifyContent="center"
        >
          <HeaderLogo />
          <ActionButtons />
        </Box>
      </Center>
    </PrimaryLayout>
  );
}
