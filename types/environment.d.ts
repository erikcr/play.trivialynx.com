export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EXPO_PUBLIC_SUPABASE_URL: string;
            EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
            EXPO_PUBLIC_EVENTS_TABLE_NAME: string;
            EXPO_PUBLIC_ROUNDS_TABLE_NAME: string;
            EXPO_PUBLIC_QUESTIONS_TABLE_NAME: string;
            EXPO_PUBLIC_TEAMS_TABLE_NAME: string;
            EXPO_PUBLIC_RESPONSES_TABLE_NAME: string;
        }
    }
}