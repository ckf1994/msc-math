-- MSC Math — make question metadata optional
-- Run after 001_initial_schema.sql

alter table public.questions
  alter column topic_id drop not null,
  alter column difficulty drop not null,
  alter column difficulty drop default;

