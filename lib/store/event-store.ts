import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Event = Tables<"event">;
type Team = Tables<"team">;
type Question = Tables<"question">;
type Round = Tables<"round">;
type Response = Tables<"response">;

interface EventState {
  event: Event | null;
  team: Team | null;
  rounds: Round[];
  activeRound: Round | null;
  questions: Question[];
  responses: Record<string, string>;
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setEvent: (event: Event | null) => void;
  setTeam: (team: Team | null) => void;
  setRounds: (rounds: Round[]) => void;
  setActiveRound: (round: Round | null) => void;
  setQuestions: (questions: Question[]) => void;
  setResponse: (questionId: string, response: string) => void;
  submitResponse: (questionId: string) => Promise<void>;
  setCurrentQuestionIndex: (index: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchRounds: (eventId: string) => Promise<void>;
  fetchQuestions: (roundId: string) => Promise<void>;
  fetchEventStatus: (eventId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  event: null,
  team: null,
  rounds: [],
  activeRound: null,
  questions: [],
  responses: {},
  currentQuestionIndex: 0,
  isLoading: false,
  error: null,
};

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setEvent: (event) => set({ event }),
      setTeam: (team) => set({ team }),
      setRounds: (rounds) => set({ rounds }),
      setActiveRound: (round) => set({ activeRound: round }),
      setQuestions: (questions) => set({ questions }),
      setResponse: (questionId, response) =>
        set((state) => ({
          responses: {
            ...state.responses,
            [questionId]: response,
          },
        })),
      submitResponse: async (questionId: string) => {
        const state = get();
        if (!state.team?.id || !state.responses[questionId]) {
          throw new Error("Team or response not found");
        }

        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from("response")
            .upsert(
              {
                team_id: state.team.id,
                question_id: questionId,
                text_response: state.responses[questionId],
              },
              { onConflict: "team_id, question_id" },
            )
            .select()
            .single();

          if (error) throw error;
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      setCurrentQuestionIndex: (currentQuestionIndex) =>
        set({ currentQuestionIndex }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchEventStatus: async (eventId: string) => {
        try {
          const { data: event, error } = await supabase
            .from("event")
            .select("*")
            .eq("id", eventId)
            .single();

          if (error) throw error;
          if (event) {
            set({ event });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      fetchRounds: async (eventId: string) => {
        const state = get();
        if (state.event?.status === "pending") {
          set({ rounds: [], activeRound: null, questions: [], error: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data: rounds, error } = await supabase
            .from("round")
            .select("*")
            .eq("event_id", eventId)
            .neq("status", "pending")
            .order("sequence_number", { ascending: true });

          if (error) throw error;

          set({ rounds: rounds || [] });
          if (rounds && rounds.length > 0) {
            set({ activeRound: rounds[0] });
          }
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchQuestions: async (roundId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("question")
            .select("*")
            .eq("round_id", roundId)
            .neq("status", "pending")
            .order("sequence_number", { ascending: true });

          if (error) throw error;
          set({ questions: data || [] });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: "event-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
