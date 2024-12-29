import { Image } from "@/components/ui/image";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { ScrollView } from "@/components/ui/scroll-view";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import React, { useEffect, useState } from "react";
import {
  router,
  useLocalSearchParams,
  useRootNavigationState,
} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckIcon, InfoIcon, XIcon } from "lucide-react-native";
import { LinearGradient } from '@/components/ui/linear-gradient';

import PrimaryLayout from "../layouts/PrimaryLayout";

import { supabase } from "../utils/supabase";
import { Tables } from "@/types/database.types";
import {
  QuestionsWithResponses,
  TeamsWithResponses,
  TeamScoresSorted,
  TeamWithResponses,
} from "@/types/app.types";

// import { styled } from "@gluestack-style/react";

// const MobileStyledImage = styled(Image, {
//   props: {
//     style: {
//       height: 56,
//       width: 56,
//     },
//   },
// });

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
        <Box className="absolute md:hidden">
          <VStack space="md" className="px-3">
            <VStack space="xs" className="ml-1 my-4">
              <HStack>
                {/* <MobileStyledImage
                alt="gluestack-ui Pro"
                resizeMode="contain"
                sx={{
                  "@md": {
                    w: "$120",
                    h: "$80",
                  },
                }}
                source={require("../assets/images/trivialynx-logo.svg")}
              /> */}
                <VStack className="ml-4">
                  <Heading className="text-textLight-50 dark:text-textDark-50">
                    {event?.name}
                  </Heading>
                  <Text className="text-md font-normal text-textLight-50 dark:text-textDark-400">
                    {myTeam?.name}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <Box className="md:px-8  md:borderTopLeftRadius-none  md:borderTopRightRadius-none  md:borderBottomRightRadius-none dark:bg-backgroundDark-800 mt-2 flex-1 absolute top-20 left-0 right-0 bottom-0 bg-backgroundDark-100 justify-start">
          <Heading className="hidden md:flex  md:text-2xl">
            {event?.name}
          </Heading>

          <Text className="text-md font-normal hidden mb-8 md:flex  md:text-2xl">
            {myTeam?.name}
          </Text>

          {event?.status === "PENDING" ? (
            <Box className="mt-10">
              <Heading className="flex justify-center">Hang tight</Heading>

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
                      activeTab === "rounds" ? "border" : "border-b-[0px]"
                    } ${
                      activeTab === "rounds" ? "text-black" : "text-light-500"
                    } md:flex  md:text-2xl `}
                  >
                    Rounds
                  </Heading>

                  <Heading
                    onPress={() => setActiveTab("teams")}
                    className={` ${
                      activeTab === "teams" ? "border" : "border-b-[0px]"
                    } ${
                      activeTab === "teams" ? "text-black" : "text-light-500"
                    } md:flex  md:text-2xl `}
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
                          activeRound?.id === item.id ? "solid" : "outline"
                        }
                        disabled={item.status === "PENDING"}
                        onPress={() => {
                          setActiveRound(item);
                        }}
                        className={` ${
                          item.status === "PENDING"
                            ? "border-light-500"
                            : "border-"
                        } ${
                          activeRound?.id === item.id ? "bg-primary-700" : "bg-"
                        } h-8 mx-1 `}
                      >
                        <ButtonText
                          size="sm"
                          className={` ${
                            item.status === "PENDING"
                              ? "text-light-500"
                              : "text-"
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
                          className="h-56 mb-4 px-2 border rounded-2xl justify-center"
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
                        item.status === "ONGOING" || item.status === "COMPLETE"
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
                        <Text className="text-md font-normal mb-2 mr-10 md:flex  md:text-2xl">
                          {item.name}
                        </Text>

                        <Text className="text-md font-normal mb-2 md:flex  md:text-2xl">
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
