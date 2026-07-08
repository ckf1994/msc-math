export type CreateQuestionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialCreateQuestionState: CreateQuestionState = {
  status: "idle",
};

