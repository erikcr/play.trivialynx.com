import { Tables } from "./database.types";
import { supabase } from "../utils/supabase";
import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js'

const questionsWithResponses = supabase
  .from("v002_questions_stag")
  .select(`*, v002_responses_stag ( id, is_correct )`);
export type QuestionsWithResponses = QueryData<typeof questionsWithResponses>;