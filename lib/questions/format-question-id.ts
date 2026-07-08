export function formatQuestionId(id: string) {
  return `Q-${id.slice(0, 8).toUpperCase()}`;
}

