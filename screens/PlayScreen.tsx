import React, { useEffect, useState } from "react";
import {
  HStack,
  Text,
  VStack,
  Box,
  Button,
  ButtonText,
  Heading,
  Divider,
  ScrollView,
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
  const [allRounds, setAllRounds] = useState([]);
  const [activeTab, setActiveTab] = useState("rounds");

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
      setAllTeams(data);
    }
  };

  const getAllRounds = async (eventId: string) => {
    const { data, error } = await supabase
      .from(process.env.EXPO_PUBLIC_ROUNDS_TABLE_NAME)
      .select(
        `
      id,
      name,
      ${process.env.EXPO_PUBLIC_QUESTIONS_TABLE_NAME} (
        question
      )
      `
      )
      .eq("event_id", eventId);

    if (data) {
      console.log(data);
      setAllRounds(data);
    } else if (error) {
      throw error;
    }
  };

  const getEventData = async () => {
    const ed = JSON.parse((await AsyncStorage.getItem("eventData")) || "");
    setEventData(ed);

    if (Object.hasOwn(ed, "id")) {
      getAllTeams(ed.id);
      getAllRounds(ed.id);
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
          <HStack flex={1} justifyContent="space-around">
            <Heading
              mb="$4"
              sx={{
                "@md": { display: "flex", fontSize: "$2xl" },
              }}
              color={activeTab === "rounds" ? "$black" : "$light500"}
              borderBottomWidth={activeTab === "rounds" ? 1 : 0}
              onPress={() => setActiveTab("rounds")}
            >
              Rounds
            </Heading>

            <Heading
              mb="$4"
              sx={{
                "@md": { display: "flex", fontSize: "$2xl" },
              }}
              color={activeTab === "teams" ? "$black" : "$light500"}
              borderBottomWidth={activeTab === "teams" ? 1 : 0}
              onPress={() => setActiveTab("teams")}
            >
              Teams
            </Heading>
          </HStack>

          {activeTab === "rounds" && (
            <VStack>
              <HStack>
                {allRounds.map((item) => (
                  <Button key={item.id} h="$8" mx="$1">
                    <ButtonText size="sm">{item.name}</ButtonText>
                  </Button>
                ))}
              </HStack>
            </VStack>
          )}

          {activeTab === "teams" && (
            <VStack mx="$3">
              {allTeams.map((item, index) => (
                <Box key={item.id}>
                  <HStack flex={1} justifyContent="space-between">
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
                </Box>
              ))}
            </VStack>
          )}
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
