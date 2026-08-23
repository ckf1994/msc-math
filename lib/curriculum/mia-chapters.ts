/**
 * Chapter lists aligned to United Prime Mathematics in Action.
 *
 * F.1–F.3: Junior Secondary Mathematics in Action (United Prime) — from official
 *          content portal screenshots (2024–2025), with a few off-screen titles
 *          filled from matching MIA materials (marked in comments).
 * F.4–F.6: HKDSE Mathematics in Action (3rd Edition), Compulsory Part
 */

export type CurriculumChapter = {
  formLevel: 1 | 2 | 3 | 4 | 5 | 6;
  chapterNumber: number;
  title: string;
  book?: string;
};

export const MIA_CHAPTERS: CurriculumChapter[] = [
  // ——— F.1 Book 1A ———
  {
    formLevel: 1,
    chapterNumber: 0,
    title: "Revision on Fundamental Arithmetic",
    book: "1A",
  },
  { formLevel: 1, chapterNumber: 1, title: "Basic Mathematics", book: "1A" },
  {
    formLevel: 1,
    chapterNumber: 2,
    title: "Directed Numbers and the Number Line",
    book: "1A",
  },
  { formLevel: 1, chapterNumber: 3, title: "Introduction to Algebra", book: "1A" },
  // Off-screen in portal screenshot; standard placement after algebra
  {
    formLevel: 1,
    chapterNumber: 4,
    title: "Linear Equations in One Unknown",
    book: "1A",
  },
  { formLevel: 1, chapterNumber: 5, title: "Introduction to Geometry", book: "1A" },
  {
    formLevel: 1,
    chapterNumber: 6,
    title: "Introduction to Statistics and Statistical Charts",
    book: "1A",
  },

  // ——— F.1 Book 1B ———
  { formLevel: 1, chapterNumber: 7, title: "Percentages (I)", book: "1B" },
  {
    formLevel: 1,
    chapterNumber: 8,
    title: "Approximate Values and Numerical Estimation",
    book: "1B",
  },
  { formLevel: 1, chapterNumber: 9, title: "Areas and Volumes (I)", book: "1B" },
  {
    formLevel: 1,
    chapterNumber: 10,
    title: "Manipulation of Simple Polynomials",
    book: "1B",
  },
  // Off-screen in portal screenshot
  { formLevel: 1, chapterNumber: 11, title: "Congruent Triangles", book: "1B" },
  {
    formLevel: 1,
    chapterNumber: 12,
    title: "Introduction to Coordinates",
    book: "1B",
  },

  // ——— F.2 Book 2A ———
  { formLevel: 2, chapterNumber: 1, title: "Errors in Measurement", book: "2A" },
  {
    formLevel: 2,
    chapterNumber: 2,
    title: "Identities and Factorization",
    book: "2A",
  },
  {
    formLevel: 2,
    chapterNumber: 3,
    title: "Algebraic Fractions and Formulas",
    book: "2A",
  },
  {
    formLevel: 2,
    chapterNumber: 4,
    title: "Angles related to Rectilinear Figures",
    book: "2A",
  },
  // Off-screen in portal screenshot
  {
    formLevel: 2,
    chapterNumber: 5,
    title: "Introduction to Deductive Geometry",
    book: "2A",
  },
  {
    formLevel: 2,
    chapterNumber: 6,
    title: "More about Statistical Charts",
    book: "2A",
  },

  // ——— F.2 Book 2B ———
  {
    formLevel: 2,
    chapterNumber: 7,
    title: "Rate, Ratio and Proportion",
    book: "2B",
  },
  { formLevel: 2, chapterNumber: 8, title: "Similarity", book: "2B" },
  {
    formLevel: 2,
    chapterNumber: 9,
    title: "Linear Equations in Two Unknowns",
    book: "2B",
  },
  {
    formLevel: 2,
    chapterNumber: 10,
    title: "Pythagoras’ Theorem and Irrational Numbers",
    book: "2B",
  },
  // Off-screen in portal screenshot
  {
    formLevel: 2,
    chapterNumber: 11,
    title: "Areas and Volumes (II)",
    book: "2B",
  },
  { formLevel: 2, chapterNumber: 12, title: "Trigonometric Ratios", book: "2B" },

  // ——— F.3 Book 3A ———
  {
    formLevel: 3,
    chapterNumber: 1,
    title: "More about Factorization of Polynomials",
    book: "3A",
  },
  {
    formLevel: 3,
    chapterNumber: 2,
    title: "Laws of Integral Indices",
    book: "3A",
  },
  {
    formLevel: 3,
    chapterNumber: 3,
    title: "Linear Inequalities in One Unknown",
    book: "3A",
  },
  { formLevel: 3, chapterNumber: 4, title: "Percentages (II)", book: "3A" },
  // Off-screen; confirmed from MIA Book 3A Ch.5 materials + school schedule
  { formLevel: 3, chapterNumber: 5, title: "Quadrilaterals", book: "3A" },
  {
    formLevel: 3,
    chapterNumber: 6,
    title: "Special Lines and Centres in a Triangle",
    book: "3A",
  },

  // ——— F.3 Book 3B (school schedule + MIA chapter tests) ———
  {
    formLevel: 3,
    chapterNumber: 7,
    title: "Areas and Volumes (III)",
    book: "3B",
  },
  {
    formLevel: 3,
    chapterNumber: 8,
    title: "Coordinate Geometry of Straight Lines",
    book: "3B",
  },
  {
    formLevel: 3,
    chapterNumber: 9,
    title: "Trigonometric Relations",
    book: "3B",
  },
  {
    formLevel: 3,
    chapterNumber: 10,
    title: "Applications of Trigonometry",
    book: "3B",
  },
  {
    formLevel: 3,
    chapterNumber: 11,
    title: "Measures of Central Tendency",
    book: "3B",
  },
  {
    formLevel: 3,
    chapterNumber: 12,
    title: "Simple Idea of Probability",
    book: "3B",
  },

  // ——— F.4 HKDSE MIA 3rd Edition ———
  {
    formLevel: 4,
    chapterNumber: 1,
    title: "Quadratic Equations in One Unknown (I)",
    book: "4A",
  },
  {
    formLevel: 4,
    chapterNumber: 2,
    title: "Quadratic Equations in One Unknown (II)",
    book: "4A",
  },
  { formLevel: 4, chapterNumber: 3, title: "Functions and Graphs", book: "4A" },
  {
    formLevel: 4,
    chapterNumber: 4,
    title: "Equations of Straight Lines",
    book: "4A",
  },
  {
    formLevel: 4,
    chapterNumber: 5,
    title: "More about Polynomials",
    book: "4A",
  },
  { formLevel: 4, chapterNumber: 6, title: "Exponential Functions", book: "4B" },
  { formLevel: 4, chapterNumber: 7, title: "Logarithmic Functions", book: "4B" },
  { formLevel: 4, chapterNumber: 8, title: "More about Equations", book: "4B" },
  { formLevel: 4, chapterNumber: 9, title: "Variations", book: "4B" },
  {
    formLevel: 4,
    chapterNumber: 10,
    title: "More about Trigonometry",
    book: "4B",
  },

  // ——— F.5 HKDSE MIA 3rd Edition ———
  {
    formLevel: 5,
    chapterNumber: 1,
    title: "Basic Properties of Circles",
    book: "5A",
  },
  { formLevel: 5, chapterNumber: 2, title: "Tangents to Circles", book: "5A" },
  { formLevel: 5, chapterNumber: 3, title: "Inequalities", book: "5A" },
  { formLevel: 5, chapterNumber: 4, title: "Linear Programming", book: "5A" },
  {
    formLevel: 5,
    chapterNumber: 5,
    title: "Applications of Trigonometry in 2-dimensional Problems",
    book: "5A",
  },
  {
    formLevel: 5,
    chapterNumber: 6,
    title: "Applications of Trigonometry in 3-dimensional Problems",
    book: "5A",
  },
  { formLevel: 5, chapterNumber: 7, title: "Equations of Circles", book: "5B" },
  { formLevel: 5, chapterNumber: 8, title: "Locus", book: "5B" },
  {
    formLevel: 5,
    chapterNumber: 9,
    title: "Measures of Dispersion",
    book: "5B",
  },
  {
    formLevel: 5,
    chapterNumber: 10,
    title: "Permutation and Combination",
    book: "5B",
  },
  {
    formLevel: 5,
    chapterNumber: 11,
    title: "More about Probability",
    book: "5B",
  },

  // ——— F.6 HKDSE MIA 3rd Edition ———
  {
    formLevel: 6,
    chapterNumber: 1,
    title: "Arithmetic and Geometric Sequences",
    book: "6A",
  },
  {
    formLevel: 6,
    chapterNumber: 2,
    title: "Summation of Arithmetic and Geometric Sequences",
    book: "6A",
  },
  {
    formLevel: 6,
    chapterNumber: 3,
    title: "More about Graphs of Functions",
    book: "6A",
  },
  {
    formLevel: 6,
    chapterNumber: 4,
    title: "Uses and Abuses of Statistics",
    book: "6A",
  },
];

export function chapterLabel(chapter: CurriculumChapter): string {
  return `Ch.${chapter.chapterNumber} ${chapter.title}`;
}

export function sortOrderFor(chapter: CurriculumChapter): number {
  return chapter.formLevel * 100 + chapter.chapterNumber;
}
