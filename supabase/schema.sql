create extension if not exists "uuid-ossp";

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  phone_number text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Service role full access on conversations" on public.conversations
  as permissive for all to service_role using (true) with check (true);

create policy "Service role full access on messages" on public.messages
  as permissive for all to service_role using (true) with check (true);

create policy "Authenticated users can read conversations" on public.conversations
  as permissive for select to authenticated using (true);

create policy "Authenticated users can read messages" on public.messages
  as permissive for select to authenticated using (true);
