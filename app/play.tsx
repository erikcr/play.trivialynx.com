import React, { useEffect, useState } from "react";
import {
  HStack,
  Text,
  VStack,
  Box,
  Fab,
  FabLabel,
  Button,
  ButtonText,
  Heading,
  Divider,
  Input,
  InputField,
  ScrollView,
} from "@gluestack-ui/themed";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import PrimaryLayout from "../layouts/PrimaryLayout";

import { supabase } from "../utils/supabase";
import { Tables } from "@/types/database.types";

export default function PlayScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  // Event
  const [event, setEvent] = useState<Tables<"v001_events_stag">>();

  // Teams
  const [myTeam, setMyTeam] = useState<Tables<"v001_teams_stag">>();

  // Questions
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  const getEvent = async () => {
    const { data, error } = await supabase
      .from("v001_events_stag")
      .select()
      .eq("id", eventId);

    if (data) {
      setEvent(data[0]);
    }
  };

  const getMyTeam = async () => {
    const storedTeam = await AsyncStorage.getItem("myTeam");

    if (!storedTeam) {
      router.replace("/");
    } else {
      const team = JSON.parse(storedTeam);
      setMyTeam(team);
      getEvent();
    }
  };

  useEffect(() => {
    if (!eventId) {
      router.push("/");
    } else {
      getMyTeam();

      supabase
        .channel("event-update")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "v001_events_stag",
            filter: `id=eq.${eventId}`,
          },
          (payload) => {
            setEvent(payload.new as Tables<"v001_events_stag">);
          }
        )
        .subscribe();
    }
  }, []);

  return (
    <>
      <PrimaryLayout>
        <Box sx={{ "@md": { display: "none" } }}>
          <MobileHeader myTeam={myTeam} event={event} />
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
            {event?.name}
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
            {myTeam?.name}
          </Text>

          {event?.status === "PENDING" && <PendingEvent />}

          {event?.status === "ONGOING" && (
            <OngoingEvent setReadyToSubmit={setReadyToSubmit} />
          )}

          {event?.status === "COMPLETE" && <CompleteEvent />}
        </Box>
      </PrimaryLayout>

      {readyToSubmit && (
        <Fab
          size="md"
          placement="bottom right"
          bgColor="$primary700"
          sx={{
            "@md": {
              px: "$8",
              bgColor: "$backgroundLight800",
            },
          }}
        >
          <FabLabel>Submit</FabLabel>
        </Fab>
      )}
    </>
  );
}

function MobileHeader({
  myTeam,
  event,
}: {
  myTeam: Tables<"v0_teams_stag"> | undefined;
  event: Tables<"v0_events_stag"> | undefined;
}) {
  return (
    <VStack px="$3" mt="$4.5" space="md">
      <VStack space="xs" ml="$1" my="$4">
        <Heading color="$textLight50" sx={{ _dark: { color: "$textDark50" } }}>
          {event?.name}
        </Heading>
        <Text
          fontSize="$md"
          fontWeight="normal"
          color="$textLight50"
          sx={{
            _dark: { color: "$textDark400" },
          }}
        >
          {myTeam?.name}
        </Text>
      </VStack>
    </VStack>
  );
}

function PendingEvent() {
  return (
    <>
      <Heading display="flex" justifyContent="center">
        Hang tight
      </Heading>

      <Text display="flex" justifyContent="center">
        The organizer will start the event soon.
      </Text>
    </>
  );
}

function OngoingEvent({ setReadyToSubmit }: { setReadyToSubmit: Function }) {
  // Event
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  // Teams
  const [teams, setTeams] = useState<Tables<"v001_teams_stag">[]>([]);

  // Rounds
  const [rounds, setRounds] = useState<Tables<"v001_rounds_stag">[]>([]);
  const [activeRound, setActiveRound] = useState<Tables<"v001_rounds_stag">>();

  // Questions
  const [questions, setQuestions] = useState<Tables<"v001_questions_stag">[]>();
  const [storedQuestions, setStoredQuestions] = useState({});

  // Display
  const [activeTab, setActiveTab] = useState("rounds");

  const getQuestions = async () => {
    const { data, error } = await supabase
      .from("v001_questions_stag")
      .select()
      .order("id")
      .eq("round_id", activeRound?.id);

    if (data) {
      setQuestions(data);

      if (!data.filter((item) => item.status === "PENDING").length) {
        setReadyToSubmit(true);
      } else {
        setReadyToSubmit(false);
      }
    }
  };

  const getRounds = async () => {
    const { data, error } = await supabase
      .from("v001_rounds_stag")
      .select()
      .order("order_num")
      .eq("event_id", eventId);
    if (data) {
      data.map((item) => {
        if (item.status === "ONGOING") {
          setActiveRound(item);
        }
      });
      setRounds(data);
    } else if (error) {
      throw error;
    }
  };

  const getStoredAnswers = async () => {
    const keys = await AsyncStorage.getAllKeys();
    keys.map(async (item) => {
      if (item.includes("response_")) {
        const val = await AsyncStorage.getItem(item);
        setStoredQuestions({
          ...storedQuestions,
          [item]: val,
        });
      }
    });
  };

  const updateResponse = async (value: string, questionId: number) => {
    await AsyncStorage.setItem(
      `response_${activeRound?.id}_${questionId}`,
      value
    );
  };

  const getTeams = async () => {
    const { data, error } = await supabase
      .from("v001_teams_stag")
      .select()
      .eq("event_id", eventId);

    if (data) {
      setTeams(data);
    }
  };

  useEffect(() => {
    getStoredAnswers();
  }, []);

  useEffect(() => {
    if (activeRound) {
      getQuestions();

      supabase
        .channel("question-changes")
        // Listen for Team inserts and updates
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "v001_questions_stag",
            filter: `round_id=eq.${activeRound?.id}`,
          },
          () => {
            getQuestions();
          }
        )
        .subscribe();
    }
  }, [activeRound]);

  useEffect(() => {
    getRounds();
  }, []);

  useEffect(() => {
    getTeams();
  }, []);

  useEffect(() => {
    supabase
      .channel("team-changes")
      // Listen for Team inserts and updates
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "v001_teams_stag",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          getTeams();
        }
      )
      .subscribe();

    supabase
      .channel("round-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "v001_rounds_stag",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          getRounds();
        }
      )
      .subscribe();
  }, []);

  return (
    <>
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
            {rounds.map((item, index) => (
              <Button
                key={item.id}
                h="$8"
                mx="$1"
                bgColor={activeRound?.id === item.id ? "$primary700" : ""}
                variant={activeRound?.id === item.id ? "solid" : "outline"}
                disabled={item.status === "PENDING"}
                borderColor={item.status === "PENDING" ? "$light500" : ""}
                onPress={() => {
                  setActiveRound(item);
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

          <Box px="$4">
            {questions
              ?.filter((item) => item.status !== "PENDING")
              .map((item) => (
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
                  <Input isDisabled={activeRound?.status === "COMPLETE"}>
                    <InputField type="text" placeholder="Your answer" />
                  </Input>
                  <Text size="sm" pt="$2" bold>
                    Points: {item.points}
                  </Text>
                </Box>
              ))}

            {!questions?.filter(
              (item) => item.status === "ONGOING" || item.status === "COMPLETE"
            ).length && (
              <Heading display="flex" justifyContent="center">
                Round pending...
              </Heading>
            )}
          </Box>
        </VStack>
      )}

      {activeTab === "teams" && (
        <VStack mx="$3">
          {teams.map((item, index) => (
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

              {index < teams.length - 1 && <Divider mb="$2" />}
            </Box>
          ))}
        </VStack>
      )}
    </>
  );
}

function CompleteEvent() {
  return (
    <>
      <Heading display="flex" justifyContent="center">
        Uh oh
      </Heading>

      <Text display="flex" justifyContent="center">
        The event has already ended.
      </Text>
    </>
  );
}
