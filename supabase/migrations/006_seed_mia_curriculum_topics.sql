-- Seed Mathematics in Action chapter list into public.topics
-- F.1–F.3: Junior Secondary Mathematics in Action (United Prime) — portal TOC 2024–2025
-- F.4–F.6: HKDSE Mathematics in Action (3rd Edition)
--
-- Safe to re-run. Remaps legacy Directed Numbers samples, removes unused old F.1–F.3
-- topic rows, then inserts any missing canonical chapters.

-- Ensure Directed Numbers chapter exists for remapping
insert into public.topics (form_level, chapter_name, topic_name, hkdse_reference, sort_order)
select
  1,
  'Ch.2 Directed Numbers and the Number Line',
  'Directed Numbers and the Number Line',
  'Junior Secondary Mathematics in Action · Book 1A',
  102
where not exists (
  select 1 from public.topics
  where form_level = 1
    and chapter_name = 'Ch.2 Directed Numbers and the Number Line'
);

-- Remap legacy / wrong-title Directed Numbers questions
update public.questions q
set topic_id = t_new.id
from public.topics t_old
join public.topics t_new
  on t_new.form_level = 1
 and t_new.chapter_name = 'Ch.2 Directed Numbers and the Number Line'
where q.topic_id = t_old.id
  and t_old.form_level = 1
  and (
    t_old.topic_name in ('Directed Numbers', 'Directed Numbers and the Number Line')
    or t_old.chapter_name like '%Directed Numbers%'
  )
  and t_old.id is distinct from t_new.id;

-- Drop unused non-canonical F.1–F.3 topics (keeps rows still referenced by questions)
delete from public.topics t
where t.form_level between 1 and 3
  and not exists (select 1 from public.questions q where q.topic_id = t.id)
  and t.chapter_name not in (
    'Ch.0 Revision on Fundamental Arithmetic',
    'Ch.1 Basic Mathematics',
    'Ch.2 Directed Numbers and the Number Line',
    'Ch.3 Introduction to Algebra',
    'Ch.4 Linear Equations in One Unknown',
    'Ch.5 Introduction to Geometry',
    'Ch.6 Introduction to Statistics and Statistical Charts',
    'Ch.7 Percentages (I)',
    'Ch.8 Approximate Values and Numerical Estimation',
    'Ch.9 Areas and Volumes (I)',
    'Ch.10 Manipulation of Simple Polynomials',
    'Ch.11 Congruent Triangles',
    'Ch.12 Introduction to Coordinates',
    'Ch.1 Errors in Measurement',
    'Ch.2 Identities and Factorization',
    'Ch.3 Algebraic Fractions and Formulas',
    'Ch.4 Angles related to Rectilinear Figures',
    'Ch.5 Introduction to Deductive Geometry',
    'Ch.6 More about Statistical Charts',
    'Ch.7 Rate, Ratio and Proportion',
    'Ch.8 Similarity',
    'Ch.9 Linear Equations in Two Unknowns',
    'Ch.10 Pythagoras’ Theorem and Irrational Numbers',
    'Ch.11 Areas and Volumes (II)',
    'Ch.12 Trigonometric Ratios',
    'Ch.1 More about Factorization of Polynomials',
    'Ch.2 Laws of Integral Indices',
    'Ch.3 Linear Inequalities in One Unknown',
    'Ch.4 Percentages (II)',
    'Ch.5 Quadrilaterals',
    'Ch.6 Special Lines and Centres in a Triangle',
    'Ch.7 Areas and Volumes (III)',
    'Ch.8 Coordinate Geometry of Straight Lines',
    'Ch.9 Trigonometric Relations',
    'Ch.10 Applications of Trigonometry',
    'Ch.11 Measures of Central Tendency',
    'Ch.12 Simple Idea of Probability'
  );

insert into public.topics (form_level, chapter_name, topic_name, hkdse_reference, sort_order)
select v.form_level, v.chapter_name, v.topic_name, v.hkdse_reference, v.sort_order
from (
  values
    -- F.1 Book 1A
    (1, 'Ch.0 Revision on Fundamental Arithmetic', 'Revision on Fundamental Arithmetic', 'Junior Secondary Mathematics in Action · Book 1A', 100),
    (1, 'Ch.1 Basic Mathematics', 'Basic Mathematics', 'Junior Secondary Mathematics in Action · Book 1A', 101),
    (1, 'Ch.2 Directed Numbers and the Number Line', 'Directed Numbers and the Number Line', 'Junior Secondary Mathematics in Action · Book 1A', 102),
    (1, 'Ch.3 Introduction to Algebra', 'Introduction to Algebra', 'Junior Secondary Mathematics in Action · Book 1A', 103),
    (1, 'Ch.4 Linear Equations in One Unknown', 'Linear Equations in One Unknown', 'Junior Secondary Mathematics in Action · Book 1A', 104),
    (1, 'Ch.5 Introduction to Geometry', 'Introduction to Geometry', 'Junior Secondary Mathematics in Action · Book 1A', 105),
    (1, 'Ch.6 Introduction to Statistics and Statistical Charts', 'Introduction to Statistics and Statistical Charts', 'Junior Secondary Mathematics in Action · Book 1A', 106),
    -- F.1 Book 1B
    (1, 'Ch.7 Percentages (I)', 'Percentages (I)', 'Junior Secondary Mathematics in Action · Book 1B', 107),
    (1, 'Ch.8 Approximate Values and Numerical Estimation', 'Approximate Values and Numerical Estimation', 'Junior Secondary Mathematics in Action · Book 1B', 108),
    (1, 'Ch.9 Areas and Volumes (I)', 'Areas and Volumes (I)', 'Junior Secondary Mathematics in Action · Book 1B', 109),
    (1, 'Ch.10 Manipulation of Simple Polynomials', 'Manipulation of Simple Polynomials', 'Junior Secondary Mathematics in Action · Book 1B', 110),
    (1, 'Ch.11 Congruent Triangles', 'Congruent Triangles', 'Junior Secondary Mathematics in Action · Book 1B', 111),
    (1, 'Ch.12 Introduction to Coordinates', 'Introduction to Coordinates', 'Junior Secondary Mathematics in Action · Book 1B', 112),
    -- F.2 Book 2A
    (2, 'Ch.1 Errors in Measurement', 'Errors in Measurement', 'Junior Secondary Mathematics in Action · Book 2A', 201),
    (2, 'Ch.2 Identities and Factorization', 'Identities and Factorization', 'Junior Secondary Mathematics in Action · Book 2A', 202),
    (2, 'Ch.3 Algebraic Fractions and Formulas', 'Algebraic Fractions and Formulas', 'Junior Secondary Mathematics in Action · Book 2A', 203),
    (2, 'Ch.4 Angles related to Rectilinear Figures', 'Angles related to Rectilinear Figures', 'Junior Secondary Mathematics in Action · Book 2A', 204),
    (2, 'Ch.5 Introduction to Deductive Geometry', 'Introduction to Deductive Geometry', 'Junior Secondary Mathematics in Action · Book 2A', 205),
    (2, 'Ch.6 More about Statistical Charts', 'More about Statistical Charts', 'Junior Secondary Mathematics in Action · Book 2A', 206),
    -- F.2 Book 2B
    (2, 'Ch.7 Rate, Ratio and Proportion', 'Rate, Ratio and Proportion', 'Junior Secondary Mathematics in Action · Book 2B', 207),
    (2, 'Ch.8 Similarity', 'Similarity', 'Junior Secondary Mathematics in Action · Book 2B', 208),
    (2, 'Ch.9 Linear Equations in Two Unknowns', 'Linear Equations in Two Unknowns', 'Junior Secondary Mathematics in Action · Book 2B', 209),
    (2, 'Ch.10 Pythagoras’ Theorem and Irrational Numbers', 'Pythagoras’ Theorem and Irrational Numbers', 'Junior Secondary Mathematics in Action · Book 2B', 210),
    (2, 'Ch.11 Areas and Volumes (II)', 'Areas and Volumes (II)', 'Junior Secondary Mathematics in Action · Book 2B', 211),
    (2, 'Ch.12 Trigonometric Ratios', 'Trigonometric Ratios', 'Junior Secondary Mathematics in Action · Book 2B', 212),
    -- F.3 Book 3A
    (3, 'Ch.1 More about Factorization of Polynomials', 'More about Factorization of Polynomials', 'Junior Secondary Mathematics in Action · Book 3A', 301),
    (3, 'Ch.2 Laws of Integral Indices', 'Laws of Integral Indices', 'Junior Secondary Mathematics in Action · Book 3A', 302),
    (3, 'Ch.3 Linear Inequalities in One Unknown', 'Linear Inequalities in One Unknown', 'Junior Secondary Mathematics in Action · Book 3A', 303),
    (3, 'Ch.4 Percentages (II)', 'Percentages (II)', 'Junior Secondary Mathematics in Action · Book 3A', 304),
    (3, 'Ch.5 Quadrilaterals', 'Quadrilaterals', 'Junior Secondary Mathematics in Action · Book 3A', 305),
    (3, 'Ch.6 Special Lines and Centres in a Triangle', 'Special Lines and Centres in a Triangle', 'Junior Secondary Mathematics in Action · Book 3A', 306),
    -- F.3 Book 3B
    (3, 'Ch.7 Areas and Volumes (III)', 'Areas and Volumes (III)', 'Junior Secondary Mathematics in Action · Book 3B', 307),
    (3, 'Ch.8 Coordinate Geometry of Straight Lines', 'Coordinate Geometry of Straight Lines', 'Junior Secondary Mathematics in Action · Book 3B', 308),
    (3, 'Ch.9 Trigonometric Relations', 'Trigonometric Relations', 'Junior Secondary Mathematics in Action · Book 3B', 309),
    (3, 'Ch.10 Applications of Trigonometry', 'Applications of Trigonometry', 'Junior Secondary Mathematics in Action · Book 3B', 310),
    (3, 'Ch.11 Measures of Central Tendency', 'Measures of Central Tendency', 'Junior Secondary Mathematics in Action · Book 3B', 311),
    (3, 'Ch.12 Simple Idea of Probability', 'Simple Idea of Probability', 'Junior Secondary Mathematics in Action · Book 3B', 312),
    -- F.4 HKDSE MIA 3E
    (4, 'Ch.1 Quadratic Equations in One Unknown (I)', 'Quadratic Equations in One Unknown (I)', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 401),
    (4, 'Ch.2 Quadratic Equations in One Unknown (II)', 'Quadratic Equations in One Unknown (II)', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 402),
    (4, 'Ch.3 Functions and Graphs', 'Functions and Graphs', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 403),
    (4, 'Ch.4 Equations of Straight Lines', 'Equations of Straight Lines', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 404),
    (4, 'Ch.5 More about Polynomials', 'More about Polynomials', 'HKDSE Mathematics in Action (3rd Edition) · Book 4A', 405),
    (4, 'Ch.6 Exponential Functions', 'Exponential Functions', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 406),
    (4, 'Ch.7 Logarithmic Functions', 'Logarithmic Functions', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 407),
    (4, 'Ch.8 More about Equations', 'More about Equations', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 408),
    (4, 'Ch.9 Variations', 'Variations', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 409),
    (4, 'Ch.10 More about Trigonometry', 'More about Trigonometry', 'HKDSE Mathematics in Action (3rd Edition) · Book 4B', 410),
    -- F.5 HKDSE MIA 3E
    (5, 'Ch.1 Basic Properties of Circles', 'Basic Properties of Circles', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 501),
    (5, 'Ch.2 Tangents to Circles', 'Tangents to Circles', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 502),
    (5, 'Ch.3 Inequalities', 'Inequalities', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 503),
    (5, 'Ch.4 Linear Programming', 'Linear Programming', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 504),
    (5, 'Ch.5 Applications of Trigonometry in 2-dimensional Problems', 'Applications of Trigonometry in 2-dimensional Problems', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 505),
    (5, 'Ch.6 Applications of Trigonometry in 3-dimensional Problems', 'Applications of Trigonometry in 3-dimensional Problems', 'HKDSE Mathematics in Action (3rd Edition) · Book 5A', 506),
    (5, 'Ch.7 Equations of Circles', 'Equations of Circles', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 507),
    (5, 'Ch.8 Locus', 'Locus', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 508),
    (5, 'Ch.9 Measures of Dispersion', 'Measures of Dispersion', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 509),
    (5, 'Ch.10 Permutation and Combination', 'Permutation and Combination', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 510),
    (5, 'Ch.11 More about Probability', 'More about Probability', 'HKDSE Mathematics in Action (3rd Edition) · Book 5B', 511),
    -- F.6 HKDSE MIA 3E
    (6, 'Ch.1 Arithmetic and Geometric Sequences', 'Arithmetic and Geometric Sequences', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 601),
    (6, 'Ch.2 Summation of Arithmetic and Geometric Sequences', 'Summation of Arithmetic and Geometric Sequences', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 602),
    (6, 'Ch.3 More about Graphs of Functions', 'More about Graphs of Functions', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 603),
    (6, 'Ch.4 Uses and Abuses of Statistics', 'Uses and Abuses of Statistics', 'HKDSE Mathematics in Action (3rd Edition) · Book 6A', 604)
) as v(form_level, chapter_name, topic_name, hkdse_reference, sort_order)
where not exists (
  select 1
  from public.topics t
  where t.form_level = v.form_level
    and t.chapter_name = v.chapter_name
);
