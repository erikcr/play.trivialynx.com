import React, { useEffect, useState } from "react";
import { HStack, Text, VStack, Box, Heading } from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

import GuestLayout from "../layouts/GuestLayout";

function MobileHeader({
  teamName,
  eventData,
}: {
  teamName: string;
  eventData: Object;
}) {
  return (
    <VStack px="$3" mt="$4.5" space="md">
      <VStack space="xs" ml="$1" my="$4">
        <Heading color="$textLight50" sx={{ _dark: { color: "$textDark50" } }}>
          {eventData.name}
        </Heading>
        <Text
          fontSize="$md"
          fontWeight="normal"
          color="$textLight50"
          sx={{
            _dark: { color: "$textDark400" },
          }}
        >
          {teamName}
        </Text>
      </VStack>
    </VStack>
  );
}

const Main = () => {
  const [teamName, setTeamName] = useState("");
  const [eventData, setEventData] = useState({});

  useEffect(() => {
    const getTeamName = async () => {
      const tn = (await AsyncStorage.getItem("teamName")) || "";
      setTeamName(tn);
    };
    const getEventData = async () => {
      const ed = (await AsyncStorage.getItem("eventData")) || "";
      setEventData(JSON.parse(ed));
    };

    getTeamName();
    getEventData();
  }, []);

  return (
    <>
      <Box sx={{ "@md": { display: "none" } }}>
        <MobileHeader teamName={teamName} eventData={eventData} />
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
          {/* {teamName} */}
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
