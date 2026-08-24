-- MSC Math — seed badge artwork (static files in /public/badges)
-- Run after 001_initial_schema.sql

update public.badges
set image_url = '/badges/junk-boat.png'
where name = 'First Steps'
  and (image_url is null or image_url = '');

insert into public.badges (name, description, image_url, criteria_type, criteria_value, xp_reward)
select *
from (
  values
    (
      'Pythagoras Pro',
      'Score 90% or higher on a Pythagoras-themed quiz.',
      '/badges/pythagoras-rainbow.png',
      'score'::public.badge_criteria_type,
      '{"min_score": 90}'::jsonb,
      100
    ),
    (
      'Book of Wisdom',
      'Complete 10 quizzes to unlock the Book of Wisdom.',
      '/badges/book-of-wisdom.png',
      'completion'::public.badge_criteria_type,
      '{"completions_required": 10}'::jsonb,
      150
    ),
    (
      'Number Pyramid',
      'Reach 80% or higher on a number skills quiz.',
      '/badges/number-pyramid.png',
      'score'::public.badge_criteria_type,
      '{"min_score": 80}'::jsonb,
      80
    ),
    (
      'Lighthouse Keeper',
      'Keep a 7-day learning streak.',
      '/badges/lighthouse.png',
      'streak'::public.badge_criteria_type,
      '{"streak_days": 7}'::jsonb,
      120
    ),
    (
      'Munsang Banner',
      'Show school spirit by completing your first assignment.',
      '/badges/munsang-banner.png',
      'completion'::public.badge_criteria_type,
      '{"completions_required": 1}'::jsonb,
      60
    ),
    (
      'Munsang Spirit',
      'Wear the spirit — maintain a 14-day streak.',
      '/badges/munsang-jacket.png',
      'streak'::public.badge_criteria_type,
      '{"streak_days": 14}'::jsonb,
      200
    ),
    (
      'Munsang Gate',
      'Pass through the gate: complete 5 quizzes.',
      '/badges/munsang-gate.png',
      'completion'::public.badge_criteria_type,
      '{"completions_required": 5}'::jsonb,
      100
    ),
    (
      'Minsheng Torch',
      'Light the torch with a 3-day streak.',
      '/badges/minsheng-torch.png',
      'streak'::public.badge_criteria_type,
      '{"streak_days": 3}'::jsonb,
      50
    ),
    (
      'Centenary Scholar',
      'Score a perfect 100% on any quiz.',
      '/badges/centenary-stand.png',
      'score'::public.badge_criteria_type,
      '{"min_score": 100}'::jsonb,
      250
    ),
    (
      'Speech Day Star',
      'Stand out on Speech Day — earn this special MSC badge.',
      '/badges/speech-day-2026.png',
      'custom'::public.badge_criteria_type,
      '{"notes": "Awarded by teachers for outstanding performance."}'::jsonb,
      300
    ),
    (
      'Campus Champion',
      'Master the campus challenge: complete 20 quizzes.',
      '/badges/campus-aerial.png',
      'completion'::public.badge_criteria_type,
      '{"completions_required": 20}'::jsonb,
      300
    )
) as seed(name, description, image_url, criteria_type, criteria_value, xp_reward)
where not exists (
  select 1
  from public.badges existing
  where existing.name = seed.name
);
