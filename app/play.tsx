import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { ScrollView } from "@/components/ui/scroll-view";
import { StatusBar } from "@/components/ui/status-bar";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useEventStore } from "@/lib/store/event-store";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { Save, TriangleAlert } from "lucide-react-native";
import type React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import { useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { z } from "zod";

type Event = Tables<"event">;
type Round = Tables<"round">;
type Team = Tables<"team">;
type Question = Tables<"question">;

function DesktopMessage() {
  return (
    <Center className="h-screen bg-primary-600 dark:bg-primary-800">
      <VStack space="xl" className="p-8">
        <Heading size="3xl" className="text-center">
          TriviaLynx
        </Heading>
        <VStack space="sm">
          <Heading size="lg" className="text-center">
            Please Use a Mobile Device
          </Heading>
          <Text size="md" className="text-center text-primary-100">
            This trivia game is designed for mobile and tablet devices. Please
            open this page on your phone or tablet to play.
          </Text>
        </VStack>
      </VStack>
    </Center>
  );
}

export default function PlayPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  const {
    event,
    team,
    rounds,
    activeRound,
    questions,
    responses,
    isLoading,
    error,
    fetchRounds,
    fetchQuestions,
    setActiveRound,
    setResponse,
    submitResponse,
  } = useEventStore();

  const toast = useToast();

  useEffect(() => {
    if (event?.id) {
      fetchRounds(event.id);
    }
  }, [event?.id, fetchRounds]);

  useEffect(() => {
    if (activeRound?.id) {
      fetchQuestions(activeRound.id);
    }
  }, [activeRound?.id, fetchQuestions]);

  const handleSubmitResponse = async (questionId: string) => {
    try {
      await submitResponse(questionId);
    } catch (error) {
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={id}>
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>Failed to submit answer</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  if (isDesktop) {
    return <DesktopMessage />;
  }

  if (error) {
    return (
      <Center className="flex-1 bg-background">
        <Text className="text-destructive">{error}</Text>
      </Center>
    );
  }

  return (
    <Box className="flex-1 bg-primary">
      <StatusBar
        translucent
        barStyle="light-content"
        className="bg-transparent"
      />

      {/* Fixed Header */}
      <SafeAreaView>
        <Box className="px-4 py-5">
          <VStack>
            <Text className="text-xl font-bold text-foreground">
              TriviaLynx
            </Text>
            {event && (
              <Text className="text-sm text-foreground/80">{event.name}</Text>
            )}
            {team && (
              <Text className="text-sm text-foreground/80">
                Team: {team.name}
              </Text>
            )}
          </VStack>
        </Box>

        {/* Rounds Section */}
        <Box>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 pb-4"
          >
            <HStack space="sm">
              {rounds.map((round) => (
                <Button
                  key={round.id}
                  variant="outline"
                  onPress={() => setActiveRound(round)}
                  className={
                    activeRound?.id === round.id
                      ? "bg-secondary border-foreground"
                      : "bg-transparent text-muted border-muted"
                  }
                >
                  <ButtonText
                    className={
                      activeRound?.id === round.id
                        ? "text-foreground"
                        : "text-muted"
                    }
                  >
                    Round {round.sequence_number}
                  </ButtonText>
                </Button>
              ))}
            </HStack>
          </ScrollView>
        </Box>
      </SafeAreaView>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 scrollbar-hide bg-white rounded-t-xl">
        {/* Questions Section */}
        <VStack space="md" className="px-4 pt-4 pb-8">
          {activeRound && (
            <Heading size="lg" className="text-primary">
              {activeRound.name || `Round ${activeRound.sequence_number}`}
            </Heading>
          )}

          {questions.map((question) => (
            <Box
              key={question.id}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <VStack space="sm">
                <Text className="font-semibold text-card-foreground">
                  Question {question.sequence_number}
                </Text>
                <Text className="text-card-foreground">
                  {question.question_text}
                </Text>
                {question.points && (
                  <Text className="text-sm text-muted-foreground">
                    Points: {question.points}
                  </Text>
                )}
                <HStack space="sm" className="w-full">
                  <FormControl className="flex-1">
                    <Input>
                      <InputField
                        placeholder="Enter your answer"
                        value={responses?.[question.id] || ""}
                        onChangeText={(text) => setResponse(question.id, text)}
                        className="text-base placeholder:text-muted-foreground"
                      />
                    </Input>
                  </FormControl>
                  <Button
                    variant="solid"
                    className="bg-primary p-3.5"
                    onPress={() => handleSubmitResponse(question.id)}
                    disabled={!responses?.[question.id]}
                  >
                    <ButtonIcon as={Save} className="text-foreground" />
                  </Button>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}
