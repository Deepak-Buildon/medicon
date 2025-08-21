-- Fix search path for new functions to address security warnings
drop trigger if exists update_news_feed_updated_at on public.news_feed;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_news_feed_updated_at
before update on public.news_feed
for each row execute function public.update_updated_at_column();