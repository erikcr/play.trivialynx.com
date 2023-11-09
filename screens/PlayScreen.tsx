import React from "react";
import { HStack, Text, VStack, Box, Heading } from "@gluestack-ui/themed";

import GuestLayout from "../layouts/GuestLayout";

function MobileHeader() {
  return (
    <VStack px="$3" mt="$4.5" space="md">
      <VStack space="xs" ml="$1" my="$4">
        <Heading color="$textLight50" sx={{ _dark: { color: "$textDark50" } }}>
          Event name
        </Heading>
        <Text
          fontSize="$md"
          fontWeight="normal"
          color="$textLight50"
          sx={{
            _dark: { color: "$textDark400" },
          }}
        >
          Team name
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
          sx={{
            "@md": { display: "flex", fontSize: "$2xl" },
          }}
        >
          Event name
        </Heading>

        <Text
          fontSize="$md"
          fontWeight="normal"
          display="none"
          mb="$8"
          sx={{
            "@md": { display: "flex", fontSize: "$2xl" },
          }}
        >
          Team name
        </Text>

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

const PlayScreen = () => {
  return (
    <GuestLayout>
      <Main />
    </GuestLayout>
  );
};

export default PlayScreen;
