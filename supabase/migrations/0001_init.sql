-- supabase/migrations/0001_init.sql
create table if not exists extractions (
  id uuid primary key default gen_random_uuid(),
  device_name text not null,
  vendor text default '',
  register_map jsonb not null,
  is_example boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists datasheets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null,
  extraction_id uuid references extractions(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Public read for the gallery; writes go through the service-role server routes.
alter table extractions enable row level security;
create policy "public read extractions" on extractions for select using (true);
