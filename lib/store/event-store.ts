import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Tables } from "@/lib/types/database.types";

type Event = Tables<"event">;
type Team = Tables<"team">;
type Question = Tables<"question">;

interface EventState {
  event: Event | null;
  team: Team | null;
  questions: Question[];
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setEvent: (event: Event | null) => void;
  setTeam: (team: Team | null) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  event: null,
  team: null,
  questions: [],
  currentQuestionIndex: 0,
  isLoading: false,
  error: null,
};

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      ...initialState,

      // Actions
      setEvent: (event) => set({ event }),
      setTeam: (team) => set({ team }),
      setQuestions: (questions) => set({ questions }),
      setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: "event-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
