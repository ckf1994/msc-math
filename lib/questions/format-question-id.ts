export function formatQuestionId(id: string) {
  const hex = id.replace(/-/g, "").slice(0, 8);
  const value = Number.parseInt(hex, 16);

  if (Number.isNaN(value)) {
    return `Q-${id.slice(0, 5).toUpperCase()}`;
  }

  return `Q-${String(value % 100000).padStart(5, "0")}`;
}
