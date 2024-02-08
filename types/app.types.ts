import { Tables } from "./database.types";
import { supabase } from "../utils/supabase";
import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js'

const questionsWithResponsesQuery = supabase
  .from("v002_questions_stag")
  .select(`*, response: v002_responses_stag ( id, is_correct )`);
export type QuestionsWithResponses = QueryData<typeof questionsWithResponsesQuery>;

const teamsWithResponsesQuery = supabase
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