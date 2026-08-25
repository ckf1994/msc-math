export type CodedGame = {
  slug: string;
  title: string;
  description: string;
  durationSeconds: number;
  tags: string[];
};

export const CODED_GAMES: CodedGame[] = [
  {
    slug: "speed-math",
    title: "Speed Math",
    description:
      "Answer as many calculation questions as you can in 50 seconds. Choose operations and number range before you start.",
    durationSeconds: 50,
    tags: ["Arithmetic", "Timed"],
  },
];

export function getCodedGame(slug: string) {
  return CODED_GAMES.find((game) => game.slug === slug) ?? null;
}
