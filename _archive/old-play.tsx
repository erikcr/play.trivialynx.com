import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import { StatusBar } from "@/components/ui/status-bar";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { supabase } from "@/lib/supabase";
import type {
  QuestionsWithResponses,
  TeamScoresSorted,
  TeamWithResponses,
  TeamsWithResponses,
} from "@/lib/types/app.types";
import type { Tables } from "@/lib/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  router,
  useLocalSearchParams,
  useRootNavigationState,
} from "expo-router";
import React, { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Event = Tables<"event">;
type Question = Tables<"question">;
type Response = Tables<"response">;
type Round = Tables<"round">;
type Team = Tables<"team">;

export default function PlayScreen() {
  const rootNavigationState = useRootNavigationState();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  // Event
  const [event, setEvent] = useState<Event>();

  // Teams
  const [teams, setTeams] = useState<TeamsWithResponses>();
  const [teamsSorted, setTeamsSorted] = useState<TeamScoresSorted[]>();
  const [myTeam, setMyTeam] = useState<TeamWithResponses>();

  // Rounds
  const [rounds, setRounds] = useState<Round[]>([]);
  const [activeRound, setActiveRound] = useState<Round>();

  // Questions
  const [questions, setQuestions] = useState<QuestionsWithResponses>();
  const [activeQuestion, setActiveQuestion] = useState<Question>();
  const [activeQuestionResponse, setActiveQuestionResponse] = useState("");

  // Responses
  const [responses, setResponses] = useState<Response[]>();

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
        .from("response")
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
      .from("question")
      .select("*, response: response (id, submitted_answer, is_correct)")
      .order("id")
      .eq("round_id", activeRound?.id);

    if (data) {
      setQuestions(data);

      if (activeRound?.status === "ongoing") {
        if (!data.filter((item) => item.status === "pending").length) {
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
      .from("round")
      .select()
      .order("order_num")
      .eq("event_id", eventId);
    if (data) {
      setRounds(data);

      const findFirstOngoing = data.find((i) => i.status === "ongoing");
      const findFirstPending = data.find((i) => i.status === "pending");
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
      },
    );

    if (data) {
      setTeamsSorted(data);
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
        .from("team")
        .select(
          "*, responses: response ( *, question: question ( id, points ) )",
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
      .from("event")
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
          table: "round",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          getRounds();
        },
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
            table: "question",
            filter: `round_id=eq.${activeRound?.id}`,
          },
          () => {
            getQuestions();
          },
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
              table: "event",
              filter: `id=eq.${eventId}`,
            },
            (payload) => {
              setEvent(payload.new as Event);
            },
          )
          .subscribe();
      }
    }
  }, [rootNavigationState, eventId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box className="web:h-[100vh] web:overflow-hidden h-[100%]">
          <StatusBar
            translucent
            barStyle="light-content"
            className="bg-transparent"
          />
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              flexGrow: 1,
              justifyContent: "center",
            }}
            bounces={false}
            className="flex-1 base:bg-zinc-700 md:bg-primary dark:bg-background"
          >
            <VStack
              className={
                "w-full flex-1 overflow-hidden md:max-w-containerWidth md:flex-row md:rounded-xl md:p-24"
              }
            >
              <Box className="absolute md:hidden">
                <VStack space="md" className="px-3">
                  <VStack space="xs" className="ml-1 my-4">
                    <HStack>
                      <VStack className="ml-4">
                        <Heading className="text-foreground dark:text-foreground">
                          {event?.name}
                        </Heading>
                        <Text className="text-md font-normal text-muted-foreground dark:text-muted-foreground">
                          {myTeam?.name}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>

              <Box className="md:px-8 rounded-t-2xl md:rounded-tl-none md:rounded-r-2xl py-8 flex-1 bg-background dark:bg-background justify-between">
                <Heading className="hidden md:flex md:text-2xl text-foreground">
                  {event?.name}
                </Heading>

                <Text className="text-md font-normal hidden mb-8 md:flex md:text-2xl text-muted-foreground">
                  {myTeam?.name}
                </Text>

                {event?.status === "pending" ? (
                  <Box className="mt-10">
                    <Heading className="flex justify-center">
                      Hang tight
                    </Heading>

                    <Text className="flex justify-center">
                      The organizer will start the event soon.
                    </Text>
                  </Box>
                ) : (
                  <>
                    <Box>
                      <HStack className="pt-4 mb-2 flex-1 justify-around">
                        <Heading
                          onPress={() => setActiveTab("rounds")}
                          className={` ${
                            activeTab === "rounds"
                              ? "border-primary"
                              : "border-b-0"
                          } ${
                            activeTab === "rounds"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          } md:flex md:text-2xl `}
                        >
                          Rounds
                        </Heading>

                        <Heading
                          onPress={() => setActiveTab("teams")}
                          className={` ${
                            activeTab === "teams"
                              ? "border-primary"
                              : "border-b-0"
                          } ${
                            activeTab === "teams"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          } md:flex md:text-2xl `}
                        >
                          Teams
                        </Heading>
                      </HStack>
                    </Box>

                    {activeTab === "rounds" && (
                      <ScrollView className="pb-8">
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="mt-3 mb-5 px-4"
                        >
                          {rounds.map((item, index) => (
                            <Button
                              key={item.id}
                              variant={
                                activeRound?.id === item.id
                                  ? "solid"
                                  : "outline"
                              }
                              disabled={item.status === "pending"}
                              onPress={() => {
                                setActiveRound(item);
                              }}
                              className={` ${
                                item.status === "pending"
                                  ? "border-muted"
                                  : "border-primary"
                              } ${
                                activeRound?.id === item.id
                                  ? "bg-primary"
                                  : "bg-background"
                              } h-8 mx-1 `}
                            >
                              <ButtonText
                                size="sm"
                                className={` ${
                                  item.status === "pending"
                                    ? "text-muted-foreground"
                                    : activeRound?.id === item.id
                                      ? "text-primary-foreground"
                                      : "text-foreground"
                                } `}
                              >
                                {item.name}
                              </ButtonText>
                            </Button>
                          ))}
                        </ScrollView>

                        <Box className="px-4">
                          {questions
                            ?.filter((item) => item.status !== "PENDING")
                            .map((item) => (
                              <Box
                                key={item.id}
                                className="h-56 mb-4 px-2 border border-border rounded-2xl justify-center"
                              >
                                <Text className="pb-2">{item.question}</Text>
                                <Input isDisabled={item?.status === "COMPLETE"}>
                                  <InputField
                                    type="text"
                                    placeholder="Your answer"
                                    // defaultValue={
                                    //   myTeam?.responses.find(
                                    //     (i) => i.question.id === item.id
                                    //   )?.submitted_answer || ""
                                    // }
                                    onFocus={() => setActiveQuestion(item)}
                                    // onEndEditing={saveResponse}
                                    onChangeText={saveResponse}
                                    // className={` ${
                                    //   item?.status === "COMPLETE"
                                    //     ? myTeam?.responses.find(
                                    //         (i) => i.question.id === item.id
                                    //       )?.is_correct
                                    //       ? "border-green-500"
                                    //       : "border-red-500"
                                    //     : "border-"
                                    // } ${
                                    //   item?.status === "COMPLETE"
                                    //     ? "border-[2px]"
                                    //     : "border-[0px]"
                                    // } `}
                                  />
                                </Input>

                                <Text size="sm" bold className="pt-2">
                                  Points:{" "}
                                  {/* {item?.status === "COMPLETE"
                              ? myTeam?.responses.find(
                                  (i) => i.question.id === item.id
                                )?.is_correct
                                ? item.points
                                : 0
                              : item.points} */}
                                </Text>
                                {item?.status === "COMPLETE" && (
                                  <Text size="sm" bold className="pt-2">
                                    Answer: {item.answer}
                                  </Text>
                                )}
                              </Box>
                            ))}

                          {!questions?.filter(
                            (item) =>
                              item.status === "ONGOING" ||
                              item.status === "COMPLETE",
                          ).length && (
                            <Heading className="flex justify-center">
                              Round pending...
                            </Heading>
                          )}
                        </Box>
                      </ScrollView>
                    )}

                    {activeTab === "teams" && (
                      <VStack className="mx-3 mt-3">
                        {teamsSorted?.map((item, index) => (
                          <Box key={item.id} className="px-8">
                            <HStack className="flex-1 justify-between">
                              <Text className="text-md font-normal mb-2 mr-10 md:flex md:text-2xl text-foreground">
                                {item.name}
                              </Text>

                              <Text className="text-md font-normal mb-2 md:flex md:text-2xl text-foreground">
                                {item.team_total_points}
                              </Text>
                            </HStack>

                            {teams && index < teams?.length - 1 && (
                              <Divider className="mb-2" />
                            )}
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </>
                )}
              </Box>
            </VStack>
          </ScrollView>
        </Box>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
