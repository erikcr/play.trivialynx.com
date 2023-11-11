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
  Input,
  InputField,
  ScrollView,
} from "@gluestack-ui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

import GuestLayout from "../layouts/GuestLayout";

import { supabase } from "../utils/supabase";

function MobileHeader({
  teamData,
  eventData,
}: {
  teamData: Object;
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
          {teamData.name}
        </Text>
      </VStack>
    </VStack>
  );
}

const Main = () => {
  const [teamData, setTeamData] = useState({});
  const [eventData, setEventData] = useState({});
  const [allTeams, setAllTeams] = useState([]);
  const [allRounds, setAllRounds] = useState([]);
  const [activeTab, setActiveTab] = useState("rounds");
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);

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
      status,
      ${process.env.EXPO_PUBLIC_QUESTIONS_TABLE_NAME} (
        id,
        question,
        points,
        status
      )
      `
      )
      .order("order_num")
      .eq("event_id", eventId);

    if (data) {
      setAllRounds(data);
    } else if (error) {
      throw error;
    }
  };

  const subscribeToChanges = async (eventId: string) => {
    supabase
      .channel("db-changes")
      // Listen for Team inserts and updates
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: process.env.EXPO_PUBLIC_TEAMS_TABLE_NAME,
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          getAllTeams(eventId);
        }
      )
      // Listen for Round updates
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: process.env.EXPO_PUBLIC_ROUNDS_TABLE_NAME,
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          getAllRounds(eventId);
        }
      )
      .subscribe();
  };

  const subscribeQuestionUpdates = async (roundId: string) => {
    supabase
      .channel("question_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: process.env.EXPO_PUBLIC_QUESTIONS_TABLE_NAME,
          filter: `round_id=eq.${roundId}`,
        },
        () => {
          getAllRounds(eventId);
        }
      )
      .subscribe();
  };

  const getTeamData = async () => {
    const tn = JSON.parse((await AsyncStorage.getItem("teamData")) || "");
    setTeamData(tn);
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
    getTeamData();
    getEventData();

    subscribeToChanges();
  }, []);

  return (
    <>
      <Box sx={{ "@md": { display: "none" } }}>
        <MobileHeader teamData={teamData} eventData={eventData} />
      </Box>

      <Box
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
          {eventData.name}
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
          {teamData.name}
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
        </Box>

        {activeTab === "rounds" && (
          <VStack>
            <ScrollView
              mb="$6"
              px="$4"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {allRounds.map((item, index) => (
                <Button
                  key={item.id}
                  h="$8"
                  mx="$1"
                  variant={activeRoundIndex === index ? "solid" : "outline"}
                  disabled={item.status === "PENDING"}
                  borderColor={item.status === "PENDING" ? "$light500" : ""}
                  onPress={() => {
                    setActiveRoundIndex(index);
                  }}
                >
                  <ButtonText
                    size="sm"
                    color={item.status === "PENDING" ? "$light500" : ""}
                  >
                    {item.name}
                  </ButtonText>
                </Button>
              ))}
            </ScrollView>

            <ScrollView px="$4">
              {allRounds.length > 0 &&
                allRounds[activeRoundIndex][
                  process.env.EXPO_PUBLIC_QUESTIONS_TABLE_NAME
                ].map((item) => {
                  if (item.status !== "PENDING") {
                    return (
                      <Box
                        h="$56"
                        key={item.id}
                        mb="$4"
                        px="$2"
                        borderWidth={1}
                        borderRadius="$2xl"
                        justifyContent="center"
                      >
                        <Text pb="$2">{item.question}</Text>
                        <Input>
                          <InputField placeholder="Your answer" />
                        </Input>
                        <Text size="sm" pt="$2" bold>
                          Points: {item.points}
                        </Text>
                      </Box>
                    );
                  }
                })}
            </ScrollView>
          </VStack>
        )}

        {activeTab === "teams" && (
          <VStack mx="$3">
            {allTeams.map((item, index) => (
              <Box key={item.id} px="$4">
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
