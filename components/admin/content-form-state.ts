export type ContentFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialContentFormState: ContentFormState = {
  status: "idle",
};

