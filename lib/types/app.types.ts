import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Tables } from "./database.types";

const questionsWithResponsesQuery = supabase
  .from("v002_questions_stag")
  .select(`*, response: v002_responses_stag ( id, is_correct )`);
export type QuestionsWithResponses = QueryData<
  typeof questionsWithResponsesQuery
>;

const teamsWithResponsesQuery = supabase.from("v002_teams_stag").select(`
    id,
    name,
    responses: v002_responses_stag (
      id,
      is_correct,
      submitted_answer,
      question: v002_questions_stag (
        id,
        points
      )
    )
  `);
export type TeamsWithResponses = QueryData<typeof teamsWithResponsesQuery>;

const teamWithResponsesQuery = supabase
  .from("v002_teams_stag")
  .select(`
    id,
    name,
    responses: v002_responses_stag (
      id,
      is_correct,
      submitted_answer,
      question: v002_questions_stag (
        id,
        points
      )
    )
  `)
  .limit(1);
export type TeamWithResponses = QueryData<typeof teamWithResponsesQuery>[0];

const responseWithQuestionsQuery = supabase
  .from("v002_responses_stag")
  .select(`
    id,
    is_correct,
    submitted_answer,
    v002_questions_stag (
      points
    )
  `)
  .limit(1);
export type ResponeWithQuestions = QueryData<typeof responseWithQuestionsQuery>;

export type TeamScoresSorted = {
  id: string;
  name: string;
  team_total_points: number;
  responses: Tables<"v002_responses_stag">[];
};
