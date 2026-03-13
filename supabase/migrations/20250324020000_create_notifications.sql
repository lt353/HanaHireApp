create table if not exists notifications (
  id               uuid primary key default gen_random_uuid(),
  recipient_id     integer not null,
  recipient_type   text not null,
  type             text not null,
  conversation_id  uuid references conversations(id) on delete cascade,
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);
