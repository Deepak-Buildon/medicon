-- Create news_feed table (minimal schema)
create table if not exists public.news_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.news_feed enable row level security;

-- Updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_news_feed_updated_at
before update on public.news_feed
for each row execute function public.update_updated_at_column();

-- Policies exactly as requested
create policy "Only permanent users can post to the news feed"
  on public.news_feed as restrictive for insert
  to authenticated
  with check ((select (auth.jwt()->>'is_anonymous')::boolean) is false);

create policy "Anonymous and permanent users can view the news feed"
  on public.news_feed for select
  to authenticated
  using (true);
