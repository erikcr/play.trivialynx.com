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
  InputIcon,
  InputSlot,
  Alert,
  AlertIcon,
  AlertText,
  Image,
  LinearGradient,
} from "@gluestack-ui/themed";
import {
  router,
  useLocalSearchParams,
  useRootNavigationState,
} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckIcon, InfoIcon, XIcon } from "lucide-react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";

import PrimaryLayout from "../layouts/PrimaryLayout";

import { supabase } from "../utils/supabase";
import { Tables } from "@/types/database.types";
import {
  QuestionsWithResponses,
  TeamsWithResponses,
  TeamScoresSorted,
  TeamWithResponses,
} from "@/types/app.types";

import { styled } from "@gluestack-style/react";

const MobileStyledImage = styled(Image, {
  props: {
    style: {
      height: 56,
      width: 56,
    },
  },
});

export default function PlayScreen() {
  const rootNavigationState = useRootNavigationState();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  /**
   * State params
   */

  // Event
  const [event, setEvent] = useState<Tables<"v002_events_stag">>();

  // Teams
  const [teams, setTeams] = useState<TeamsWithResponses>();
  const [myTeam, setMyTeam] = useState<TeamWithResponses>();
  const [teamsSorted, setTeamSorted] = useState<TeamScoresSorted[]>();

  // Rounds
  const [rounds, setRounds] = useState<Tables<"v002_rounds_stag">[]>([]);
  const [activeRound, setActiveRound] = useState<Tables<"v002_rounds_stag">>();
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<QuestionsWithResponses>();
  const [activeQuestion, setActiveQuestion] =
    useState<Tables<"v002_questions_stag">>();
  const [activeQuestionResponse, setActiveQuestionResponse] = useState("");

  // Responses
  const [responses, setResponses] = useState<Tables<"v002_responses_stag">[]>();

  // Display
  const [activeTab, setActiveTab] = useState("rounds");

  /**
   * Action functions
   */

  // Responses functions
  const saveResponse = async (text: string) => {
    const responseId = `${myTeam?.id}${activeQuestion?.id}`;

    if (activeQuestion && myTeam) {
      const { data, error } = await supabase
        .from("v002_responses_stag")
        .upsert({
          id: `${myTeam.id}${activeQuestion.id}`,
          submitted_answer: text,
          question_id: activeQuestion.id,
          team_id: myTeam.id,
        })
        .select();

      getMyTeam();

      if (error) {
        console.log(error);
      }
    }
  };

  // Questions functions
  const getQuestions = async () => {
    const { data, error } = await supabase
      .from("v002_questions_stag")
      .select(
        "*, response: v002_responses_stag (id, submitted_answer, is_correct)"
      )
      .order("id")
      .eq("round_id", activeRound?.id);

    if (data) {
      setQuestions(data);

      if (activeRound?.status === "ONGOING") {
        if (!data.filter((item) => item.status === "PENDING").length) {
          setReadyToSubmit(true);
        } else {
          setReadyToSubmit(false);
        }
      }
    } else if (error) {
      console.log(error);
    }
  };

  // Rounds functions
  const getRounds = async () => {
    const { data, error } = await supabase
      .from("v002_rounds_stag")
      .select()
      .order("order_num")
      .eq("event_id", eventId);
    if (data) {
      setRounds(data);

      const findFirstOngoing = data.find((i) => i.status === "ONGOING");
      const findFirstPending = data.find((i) => i.status === "PENDING");
      if (findFirstOngoing) {
        setActiveRound(findFirstOngoing);
      } else if (findFirstPending) {
        setActiveRound(findFirstPending);
      } else {
        setActiveRound(data[data.length - 1]);
      }
    } else if (error) {
      throw error;
    }
  };

  // Team functions
  const getTeamsScoresSorted = async () => {
    const { data, error } = await supabase.functions.invoke(
      "get_teams_scores_sorted",
      {
        body: { eventId },
      }
    );

    if (data) {
      setTeamSorted(data);
    } else if (error) {
      console.error(error);
    }
  };

  const getMyTeam = async () => {
    const storedTeam = await AsyncStorage.getItem("myTeam");

    if (!storedTeam) {
      router.replace("/");
    } else {
      const team = JSON.parse(storedTeam);

      const { data, error } = await supabase
        .from("v002_teams_stag")
        .select(
          "*, responses: v002_responses_stag ( *, question: v002_questions_stag ( id, points ) )"
        )
        .eq("id", team.id);

      if (data) {
        setMyTeam(data[0]);
      }

      getEvent();
    }
  };

  // Event functions
  const getEvent = async () => {
    const { data, error } = await supabase
      .from("v002_events_stag")
      .select()
      .eq("id", eventId);

    if (data) {
      setEvent(data[0]);
    }
  };

  // Subscriptions
  useEffect(() => {
    supabase
      .channel("round-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "v002_rounds_stag",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          getRounds();
        }
      )
      .subscribe();
  }, []);

  useEffect(() => {
    if (activeRound) {
      getQuestions();

      supabase
        .channel("question-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "v002_questions_stag",
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
    getTeamsScoresSorted();
  }, []);

  useEffect(() => {
    if (rootNavigationState.key) {
      if (!eventId) {
        router.replace("/");
      } else {
        getMyTeam();

        supabase
          .channel("event-update")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "v002_events_stag",
              filter: `id=eq.${eventId}`,
            },
            (payload) => {
              setEvent(payload.new as Tables<"v002_events_stag">);
            }
          )
          .subscribe();
      }
    }
  }, [rootNavigationState, eventId]);

  return (
    <>
      <PrimaryLayout>
        <Box position="absolute" sx={{ "@md": { display: "none" } }}>
          <VStack px="$3" space="md">
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
              </HStack>
            </VStack>
          </VStack>
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
          mt="$2"
          flex={1}
          position="absolute"
          top="$20"
          left="$0"
          right="$0"
          bottom="$0"
          bg="$backgroundDark100"
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

          {event?.status === "PENDING" ? (
            <Box mt="$10">
              <Heading display="flex" justifyContent="center">
                Hang tight
              </Heading>

              <Text display="flex" justifyContent="center">
                The organizer will start the event soon.
              </Text>
            </Box>
          ) : (
            <>
              <Box>
                <HStack pt="$4" mb="$2" flex={1} justifyContent="space-around">
                  <Heading
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
                <ScrollView pb="$8">
                  <ScrollView
                    mt="$3"
                    mb="$5"
                    px="$4"
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {rounds.map((item, index) => (
                      <Button
                        key={item.id}
                        h="$8"
                        mx="$1"
                        bgColor={
                          activeRound?.id === item.id ? "$primary700" : ""
                        }
                        variant={
                          activeRound?.id === item.id ? "solid" : "outline"
                        }
                        disabled={item.status === "PENDING"}
                        borderColor={
                          item.status === "PENDING" ? "$light500" : ""
                        }
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
                          <Input isDisabled={item?.status === "COMPLETE"}>
                            <InputField
                              type="text"
                              placeholder="Your answer"
                              borderWidth={item?.status === "COMPLETE" ? 2 : 0}
                              borderColor={
                                item?.status === "COMPLETE"
                                  ? myTeam?.responses.find(
                                      (i) => i.question.id === item.id
                                    )?.is_correct
                                    ? "$green500"
                                    : "$red500"
                                  : ""
                              }
                              defaultValue={
                                myTeam?.responses.find(
                                  (i) => i.question.id === item.id
                                )?.submitted_answer || ""
                              }
                              onFocus={() => setActiveQuestion(item)}
                              onChangeText={saveResponse}
                              // onEndEditing={saveResponse}
                            />
                          </Input>

                          <Text size="sm" pt="$2" bold>
                            Points:{" "}
                            {item?.status === "COMPLETE"
                              ? myTeam?.responses.find(
                                  (i) => i.question.id === item.id
                                )?.is_correct
                                ? item.points
                                : 0
                              : item.points}
                          </Text>
                          {item?.status === "COMPLETE" && (
                            <Text size="sm" pt="$2" bold>
                              Answer: {item.answer}
                            </Text>
                          )}
                        </Box>
                      ))}

                    {!questions?.filter(
                      (item) =>
                        item.status === "ONGOING" || item.status === "COMPLETE"
                    ).length && (
                      <Heading display="flex" justifyContent="center">
                        Round pending...
                      </Heading>
                    )}
                  </Box>
                </ScrollView>
              )}

              {activeTab === "teams" && (
                <VStack mx="$3" mt="$3">
                  {teamsSorted?.map((item, index) => (
                    <Box key={item.id} px="$8">
                      <HStack flex={1} justifyContent="space-between">
                        <Text
                          fontSize="$md"
                          fontWeight="normal"
                          mb="$2"
                          mr="$10"
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
                          {item.team_total_points}
                        </Text>
                      </HStack>

                      {teams && index < teams?.length - 1 && (
                        <Divider mb="$2" />
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </>
          )}
        </Box>
      </PrimaryLayout>

      {/* {event?.status === "COMPLETE" && (
        <Alert px="$2.5" py="$5" action="info" variant="solid">
          <AlertIcon as={InfoIcon} mr="$3" />
          <AlertText>This event has concluded.</AlertText>
        </Alert>
      )} */}
    </>
  );
}
