type BadgeCriteriaType = "streak" | "score" | "completion" | "custom";

export function formatBadgeRequirement(
  criteriaType: BadgeCriteriaType,
  criteriaValue: Record<string, unknown>,
): string {
  if (criteriaType === "streak") {
    const days = Number(criteriaValue.streak_days ?? 0);
    return days === 1
      ? "Keep a 1-day learning streak"
      : `Keep a ${days}-day learning streak`;
  }

  if (criteriaType === "score") {
    const score = Number(criteriaValue.min_score ?? 0);
    return `Score ${score}% or higher on a quiz`;
  }

  if (criteriaType === "completion") {
    const count = Number(
      criteriaValue.completions_required ?? criteriaValue.quizzes_completed ?? 0,
    );
    return count === 1
      ? "Complete your first quiz"
      : `Complete ${count} quizzes`;
  }

  const notes = String(criteriaValue.notes ?? "").trim();
  return notes || "Complete a special challenge";
}
