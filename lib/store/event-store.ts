import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Tables } from "@/lib/types/database.types";
import { supabase } from "@/lib/supabase";

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
            [questionId]: response 
          } 
        })),
      submitResponse: async (questionId: string) => {
        const state = get();
        if (!state.team?.id || !state.responses[questionId]) {
          throw new Error("Team or response not found");
        }

        set({ isLoading: true, error: null });
        try {
          const startTime = new Date();
          const { error } = await supabase
            .from("response")
            .upsert({
              team_id: state.team.id,
              question_id: questionId,
              text_response: state.responses[questionId],
              response_time_seconds: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
              created_at: startTime.toISOString(),
              updated_at: new Date().toISOString(),
            })
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
      setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchRounds: async (eventId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("round")
            .select("*")
            .eq("event_id", eventId)
            .order("sequence_number", { ascending: true });

          if (error) throw error;

          set({ rounds: data || [] });
          if (data && data.length > 0 && !get().activeRound) {
            set({ activeRound: data[0] });
            await get().fetchQuestions(data[0].id);
          }
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
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
    }
  )
);
