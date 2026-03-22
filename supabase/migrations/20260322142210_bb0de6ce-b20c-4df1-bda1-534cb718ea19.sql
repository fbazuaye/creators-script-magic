-- User credits table
create table public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  credits integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_user_credits_user_id on public.user_credits(user_id);

alter table public.user_credits enable row level security;

create policy "Users can view own credits"
  on public.user_credits for select
  using (auth.uid() = user_id);

create policy "Service role can manage credits"
  on public.user_credits for all
  using (auth.role() = 'service_role');

-- Credit transactions log
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null,
  description text,
  paddle_transaction_id text,
  environment text not null default 'sandbox',
  created_at timestamptz default now()
);

create index idx_credit_transactions_user_id on public.credit_transactions(user_id);

alter table public.credit_transactions enable row level security;

create policy "Users can view own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

create policy "Service role can manage transactions"
  on public.credit_transactions for all
  using (auth.role() = 'service_role');

-- Function to add credits atomically
create or replace function public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text default null,
  p_paddle_transaction_id text default null,
  p_environment text default 'sandbox'
)
returns integer language plpgsql security definer as $$
declare
  new_balance integer;
begin
  insert into public.user_credits (user_id, credits, updated_at)
  values (p_user_id, p_amount, now())
  on conflict (user_id)
  do update set credits = user_credits.credits + p_amount, updated_at = now();

  select credits into new_balance from public.user_credits where user_id = p_user_id;

  insert into public.credit_transactions (user_id, amount, type, description, paddle_transaction_id, environment)
  values (p_user_id, p_amount, 'purchase', p_description, p_paddle_transaction_id, p_environment);

  return new_balance;
end;
$$;

-- Function to use credits atomically
create or replace function public.use_credit(
  p_user_id uuid,
  p_amount integer default 1,
  p_description text default null
)
returns boolean language plpgsql security definer as $$
declare
  current_balance integer;
begin
  select credits into current_balance from public.user_credits where user_id = p_user_id for update;

  if current_balance is null or current_balance < p_amount then
    return false;
  end if;

  update public.user_credits set credits = credits - p_amount, updated_at = now() where user_id = p_user_id;

  insert into public.credit_transactions (user_id, amount, type, description)
  values (p_user_id, -p_amount, 'usage', p_description);

  return true;
end;
$$;