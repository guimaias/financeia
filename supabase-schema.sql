-- =============================================================
-- FinanceIA — Schema do banco de dados (Supabase)
-- Cole este arquivo inteiro no SQL Editor do seu projeto Supabase
-- e clique em "Run".
-- =============================================================

-- Categorias (cada usuário tem seu próprio conjunto)
create table if not exists categories (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon_key text not null,
  color text not null,
  budget numeric default 0,
  kind text not null check (kind in ('income', 'expense')),
  created_at timestamptz default now(),
  primary key (id, user_id)
);

-- Transações (receitas e despesas)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category_id text not null,
  description text not null,
  date timestamptz not null,
  recurring boolean default false,
  created_at timestamptz default now()
);

-- Metas de economia
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target numeric not null,
  current numeric default 0,
  created_at timestamptz default now()
);

-- Índices para consultas rápidas
create index if not exists idx_transactions_user_date on transactions(user_id, date desc);
create index if not exists idx_categories_user on categories(user_id);
create index if not exists idx_goals_user on goals(user_id);

-- =============================================================
-- Row Level Security (RLS)
-- Garante que cada usuário só enxerga e edita os PRÓPRIOS dados.
-- Sem isso, qualquer pessoa logada poderia ver dados de todo mundo.
-- =============================================================

alter table categories enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;

create policy "Usuários gerenciam suas próprias categorias"
  on categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários gerenciam suas próprias transações"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários gerenciam suas próprias metas"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================
-- Pronto! Depois de rodar este script:
-- 1. Vá em Project Settings → API
-- 2. Copie "Project URL" e a chave "anon public"
-- 3. Cole no arquivo .env do projeto (veja .env.example)
-- =============================================================
