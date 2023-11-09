import React, { useEffect, useState } from "react";
import {
  HStack,
  Text,
  VStack,
  Box,
  Heading,
  Divider,
} from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

import GuestLayout from "../layouts/GuestLayout";

import { supabase } from "../utils/supabase";

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
  const [allTeams, setAllTeams] = useState([]);

  const getTeamName = async () => {
    const tn = (await AsyncStorage.getItem("teamName")) || "";
    setTeamName(tn);
  };

  const getAllTeams = async (eventId: string) => {
    const { data, error } = await supabase
      .from(process.env.EXPO_PUBLIC_TEAMS_TABLE_NAME)
      .select()
      .eq("event_id", eventId);

    if (data) {
      console.log(data);
      setAllTeams(data);
    }
  };

  const getEventData = async () => {
    const ed = JSON.parse((await AsyncStorage.getItem("eventData")) || "");
    setEventData(ed);

    if (Object.hasOwn(ed, "id")) {
      getAllTeams(ed.id);
    }
  };

  useEffect(() => {
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
        justifyContent="flex-start"
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
          {teamName}
        </Text>

        <Box>
          <Heading
            mb="$4"
            sx={{
              "@md": { display: "flex", fontSize: "$2xl" },
            }}
          >
            Teams
          </Heading>

          <VStack mx="$3">
            {allTeams.map((item, index) => (
              <>
                <HStack flex={1} justifyContent="space-between" key={item.id}>
                  <Text
                    fontSize="$md"
                    fontWeight="normal"
                    mb="$2"
                    sx={{
                      "@md": { display: "flex", fontSize: "$2xl" },
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    fontSize="$md"
                    fontWeight="normal"
                    mb="$2"
                    sx={{
                      "@md": { display: "flex", fontSize: "$2xl" },
                    }}
                  >
                    0
                  </Text>
                </HStack>

                {index < allTeams.length - 1 && <Divider mb="$2" />}
              </>
            ))}
          </VStack>
        </Box>
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
