export type MathOperation = "add" | "sub" | "mul" | "div";
export type NumberRange = 5 | 10 | 20 | 50 | 100;

export type SpeedMathSettings = {
  operations: MathOperation[];
  range: NumberRange;
  allowNegative: boolean;
};

export type SpeedMathQuestion = {
  id: string;
  left: number;
  right: number;
  operation: MathOperation;
  answer: number;
  prompt: string;
};

const OP_SYMBOL: Record<MathOperation, string> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

export const DEFAULT_SPEED_MATH_SETTINGS: SpeedMathSettings = {
  operations: ["add"],
  range: 10,
  allowNegative: true,
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOperation(operations: MathOperation[]) {
  return operations[randomInt(0, operations.length - 1)]!;
}

export function createSpeedMathQuestion(
  settings: SpeedMathSettings,
): SpeedMathQuestion {
  const operations =
    settings.operations.length > 0
      ? settings.operations
      : (["add"] as MathOperation[]);
  const operation = pickOperation(operations);
  const max = settings.range;

  let left = 0;
  let right = 0;
  let answer = 0;

  if (operation === "add") {
    left = randomInt(1, max);
    right = randomInt(1, max);
    answer = left + right;
  } else if (operation === "sub") {
    if (settings.allowNegative) {
      left = randomInt(1, max);
      right = randomInt(1, max);
    } else {
      left = randomInt(1, max);
      right = randomInt(1, left);
    }
    answer = left - right;
  } else if (operation === "mul") {
    left = randomInt(1, max);
    right = randomInt(1, max);
    answer = left * right;
  } else {
    // Integer division: ensure exact answers.
    right = randomInt(1, max);
    const quotient = randomInt(1, max);
    left = right * quotient;
    answer = quotient;
  }

  return {
    id: `${operation}-${left}-${right}-${answer}-${Math.random().toString(36).slice(2, 8)}`,
    left,
    right,
    operation,
    answer,
    prompt: `${left} ${OP_SYMBOL[operation]} ${right} =`,
  };
}

export function createSpeedMathQueue(
  settings: SpeedMathSettings,
  size = 4,
): SpeedMathQuestion[] {
  return Array.from({ length: size }, () => createSpeedMathQuestion(settings));
}
