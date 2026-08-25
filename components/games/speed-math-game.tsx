"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  createSpeedMathQuestion,
  createSpeedMathQueue,
  DEFAULT_SPEED_MATH_SETTINGS,
  type MathOperation,
  type NumberRange,
  type SpeedMathQuestion,
  type SpeedMathSettings,
} from "@/lib/games/speed-math";
import { Button } from "@/components/ui/button";

const DURATION_SECONDS = 50;
const QUEUE_SIZE = 4;

type GamePhase = "setup" | "playing" | "finished";

const OPERATIONS: { id: MathOperation; label: string; symbol: string }[] = [
  { id: "add", label: "Add", symbol: "+" },
  { id: "sub", label: "Subtract", symbol: "−" },
  { id: "mul", label: "Multiply", symbol: "×" },
  { id: "div", label: "Divide", symbol: "÷" },
];

const RANGES: NumberRange[] = [5, 10, 20, 50, 100];

export function SpeedMathGame() {
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [settings, setSettings] = useState<SpeedMathSettings>(
    DEFAULT_SPEED_MATH_SETTINGS,
  );
  const [queue, setQueue] = useState<SpeedMathQuestion[]>([]);
  const [answer, setAnswer] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endsAtRef = useRef<number | null>(null);

  const current = queue[0] ?? null;
  const upcoming = queue.slice(1);

  useEffect(() => {
    if (phase !== "playing") {
      endsAtRef.current = null;
      return;
    }

    // Wall-clock timer so answering / re-renders never pause the countdown.
    endsAtRef.current = Date.now() + DURATION_SECONDS * 1000;
    setSecondsLeft(DURATION_SECONDS);

    const timer = window.setInterval(() => {
      const endsAt = endsAtRef.current;
      if (!endsAt) return;
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        setPhase("finished");
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing") {
      inputRef.current?.focus();
    }
  }, [phase, current?.id]);

  function toggleOperation(operation: MathOperation) {
    setSettings((prev) => {
      const exists = prev.operations.includes(operation);
      const next = exists
        ? prev.operations.filter((item) => item !== operation)
        : [...prev.operations, operation];
      return {
        ...prev,
        operations: next.length > 0 ? next : prev.operations,
      };
    });
  }

  function startGame() {
    setQueue(createSpeedMathQueue(settings, QUEUE_SIZE));
    setAnswer("");
    setSecondsLeft(DURATION_SECONDS);
    setCorrectCount(0);
    setAttemptedCount(0);
    setFlash(null);
    setPhase("playing");
  }

  function appendDigit(digit: string) {
    if (phase !== "playing") return;
    setAnswer((prev) => {
      if (digit === "-" || digit === "−") {
        if (prev.startsWith("-")) return prev.slice(1);
        return `-${prev}`;
      }
      if (prev === "0") return digit;
      if (prev === "-0") return `-${digit}`;
      return `${prev}${digit}`;
    });
  }

  function clearAnswer() {
    setAnswer("");
  }

  function submitAnswer() {
    if (phase !== "playing" || !current || answer.trim() === "" || answer === "-") {
      return;
    }

    const parsed = Number(answer);
    if (!Number.isFinite(parsed)) return;

    const isCorrect = parsed === current.answer;
    setAttemptedCount((prev) => prev + 1);
    if (isCorrect) setCorrectCount((prev) => prev + 1);
    setFlash(isCorrect ? "correct" : "wrong");
    window.setTimeout(() => setFlash(null), 180);

    setQueue((prev) => {
      const rest = prev.slice(1);
      return [...rest, createSpeedMathQuestion(settings)];
    });
    setAnswer("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitAnswer();
    } else if (event.key === "Backspace") {
      // native input handles this
    } else if (event.key === "Escape") {
      clearAnswer();
    }
  }

  if (phase === "setup") {
    return (
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-msc-red">
          Speed Math
        </p>
        <h2 className="mt-2 text-2xl font-bold text-msc-ink">Game settings</h2>
        <p className="mt-2 text-sm text-msc-muted">
          Get as many correct answers as you can in {DURATION_SECONDS} seconds.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-msc-ink">
              Operations (multi-select)
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {OPERATIONS.map((operation) => {
                const selected = settings.operations.includes(operation.id);
                return (
                  <button
                    key={operation.id}
                    type="button"
                    onClick={() => toggleOperation(operation.id)}
                    className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-msc-red bg-msc-red/5 text-msc-red"
                        : "border-gray-200 text-msc-ink hover:border-msc-red/30"
                    }`}
                  >
                    <span className="block text-lg">{operation.symbol}</span>
                    {operation.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-msc-ink">Number range</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RANGES.map((range) => {
                const selected = settings.range === range;
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, range }))}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-msc-red bg-msc-red/5 text-msc-red"
                        : "border-gray-200 text-msc-ink hover:border-msc-red/30"
                    }`}
                  >
                    1–{range}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-msc-ink">
              Allow negative answers
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ].map((option) => {
                const selected = settings.allowNegative === option.value;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        allowNegative: option.value,
                      }))
                    }
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-msc-red bg-msc-red/5 text-msc-red"
                        : "border-gray-200 text-msc-ink hover:border-msc-red/30"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Button className="mt-8 w-full" size="lg" onClick={startGame}>
          Start
        </Button>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-msc-red">
          Time&apos;s up
        </p>
        <h2 className="mt-2 text-3xl font-bold text-msc-ink">{correctCount}</h2>
        <p className="mt-1 text-sm text-msc-muted">correct answers</p>
        <p className="mt-4 text-sm text-msc-muted">
          Attempted {attemptedCount} question{attemptedCount === 1 ? "" : "s"}
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button className="w-full sm:flex-1" onClick={startGame}>
            Play again
          </Button>
          <Button
            className="w-full sm:flex-1"
            variant="outline"
            onClick={() => setPhase("setup")}
          >
            Change settings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-msc-ink">Speed Math Challenge</h2>
          <p className="text-sm text-msc-muted">
            Type your answer and press Enter
          </p>
        </div>
        <div className="flex gap-2">
          <StatPill label="Time" value={`${secondsLeft}s`} />
          <StatPill label="Correct" value={String(correctCount)} />
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
          flash === "correct"
            ? "border-green-300 ring-2 ring-green-200"
            : flash === "wrong"
              ? "border-red-300 ring-2 ring-red-200"
              : "border-gray-100"
        }`}
      >
        <div className="border-b border-gray-100 bg-msc-red/5 px-5 py-6 text-center sm:px-8">
          <p className="text-3xl font-bold tracking-tight text-msc-ink sm:text-4xl">
            {current?.prompt}{" "}
            <span className="text-msc-red">{answer || "?"}</span>
          </p>
        </div>

        <div className="space-y-2 border-b border-gray-100 px-5 py-4 text-center sm:px-8">
          {upcoming.map((question) => (
            <p key={question.id} className="text-lg text-msc-ink">
              {question.prompt}
            </p>
          ))}
        </div>

        <input
          ref={inputRef}
          value={answer}
          onChange={(event) => {
            const next = event.target.value.replace(/[^\d-]/g, "");
            if (next.includes("-")) {
              const digits = next.replace(/-/g, "");
              setAnswer(next.startsWith("-") ? `-${digits}` : digits);
            } else {
              setAnswer(next);
            }
          }}
          onKeyDown={handleKeyDown}
          inputMode="numeric"
          className="sr-only"
          aria-label="Answer input"
        />

        <div className="grid grid-cols-3 gap-px bg-gray-100 p-px">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "−", "0", "↵"].map(
            (key) => {
              const isEnter = key === "↵";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (isEnter) submitAnswer();
                    else appendDigit(key);
                  }}
                  className={`flex h-16 items-center justify-center text-xl font-semibold transition sm:h-20 sm:text-2xl ${
                    isEnter
                      ? "bg-msc-red text-white hover:bg-msc-red-dark"
                      : "bg-white text-msc-ink hover:bg-gray-50"
                  }`}
                >
                  {key}
                </button>
              );
            },
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-msc-muted">
          <button
            type="button"
            onClick={clearAnswer}
            className="font-semibold text-msc-ink hover:text-msc-red"
          >
            Clear
          </button>
          <p>Auto next after submit · most correct wins</p>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm">
      <span className="font-semibold text-msc-muted">{label}</span>{" "}
      <span className="font-bold text-msc-ink">{value}</span>
    </div>
  );
}
