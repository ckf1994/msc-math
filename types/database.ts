export type UserRole = "student" | "teacher" | "admin";

export type QuestionType = "mcq" | "short_answer";
export type Difficulty = "easy" | "medium" | "hard";
export type QuizType = "quiz" | "homework" | "game";
export type AttemptStatus = "in_progress" | "completed" | "abandoned";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_test_account: boolean;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  created_at: string;
};

export type Class = {
  id: string;
  name: string;
  form_level: number;
  academic_year: string;
  created_at: string;
};

export type Topic = {
  id: string;
  form_level: number;
  chapter_name: string;
  topic_name: string;
  hkdse_reference: string | null;
  sort_order: number;
};

export type Question = {
  id: string;
  topic_id: string | null;
  difficulty: Difficulty | null;
  type: QuestionType;
  content_text: string | null;
  content_image_url: string | null;
  explanation_text: string | null;
  explanation_image_url: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  is_active: boolean;
};

export type GrowthQuote = {
  id: string;
  quote_text: string;
  author: string | null;
  is_active: boolean;
};
