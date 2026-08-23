export type CreateQuestionValues = {
  formLevel: string;
  chapterName: string;
  topicId: string;
  difficulty: string;
  type: "mcq" | "short_answer";
  pastPaper: string;
  pastPaperYear: string;
  contentText: string;
  explanationText: string;
  optionText0: string;
  optionText1: string;
  optionText2: string;
  optionText3: string;
  optionImageUrl0: string;
  optionImageUrl1: string;
  optionImageUrl2: string;
  optionImageUrl3: string;
  optionCorrect0: boolean;
  optionCorrect1: boolean;
  optionCorrect2: boolean;
  optionCorrect3: boolean;
  acceptedAnswers: string;
  answerType: "exact" | "numeric";
  tolerance: string;
  isActive: boolean;
};

export type CreateQuestionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: CreateQuestionValues;
  completedAt?: number;
};

export const initialCreateQuestionState: CreateQuestionState = {
  status: "idle",
};

export const emptyCreateQuestionValues: CreateQuestionValues = {
  formLevel: "",
  chapterName: "",
  topicId: "",
  difficulty: "",
  type: "mcq",
  pastPaper: "",
  pastPaperYear: "",
  contentText: "",
  explanationText: "",
  optionText0: " ",
  optionText1: " ",
  optionText2: " ",
  optionText3: " ",
  optionImageUrl0: "",
  optionImageUrl1: "",
  optionImageUrl2: "",
  optionImageUrl3: "",
  optionCorrect0: false,
  optionCorrect1: false,
  optionCorrect2: false,
  optionCorrect3: false,
  acceptedAnswers: "",
  answerType: "exact",
  tolerance: "",
  isActive: true,
};
