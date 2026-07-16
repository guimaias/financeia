-- =============================================================
-- FinanceIA — Migração: Carteiras (Pessoal PF / Empresa PJ)
-- Rode isso no SQL Editor do Supabase DEPOIS do supabase-schema.sql original.
-- Seguro de rodar mesmo com dados já existentes — nada é apagado.
-- =============================================================

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('PF', 'PJ')),
  initial_balance numeric default 0,
  created_at timestamptz default now()
);

alter table wallets enable row level security;

drop policy if exists "Usuários gerenciam suas próprias carteiras" on wallets;
create policy "Usuários gerenciam suas próprias carteiras"
  on wallets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Cria uma carteira "Pessoal" padrão para todo usuário que já tem dados
insert into wallets (user_id, name, kind)
select distinct user_id, 'Pessoal', 'PF'
from categories
where user_id not in (select user_id from wallets);

-- Adiciona a coluna wallet_id nas tabelas existentes (nullable por enquanto)
alter table categories add column if not exists wallet_id uuid references wallets(id) on delete cascade;
alter table transactions add column if not exists wallet_id uuid references wallets(id) on delete cascade;
alter table goals add column if not exists wallet_id uuid references wallets(id) on delete cascade;

-- Preenche wallet_id em tudo que já existia antes das carteiras existirem
update categories set wallet_id = w.id
from wallets w
where categories.user_id = w.user_id and categories.wallet_id is null;

update transactions set wallet_id = w.id
from wallets w
where transactions.user_id = w.user_id and transactions.wallet_id is null;

update goals set wallet_id = w.id
from wallets w
where goals.user_id = w.user_id and goals.wallet_id is null;

-- Cada usuário agora pode ter a mesma categoria (ex: "alimentacao") em carteiras diferentes,
-- então a carteira também precisa fazer parte da chave primária de categories
alter table categories drop constraint if exists categories_pkey;
alter table categories add primary key (id, user_id, wallet_id);

create index if not exists idx_transactions_wallet on transactions(wallet_id, date desc);
create index if not exists idx_categories_wallet on categories(wallet_id);
create index if not exists idx_goals_wallet on goals(wallet_id);

-- =============================================================
-- Pronto. Depois de rodar isso, atualize o código do app (próximos
-- arquivos) — ele já sabe criar a carteira "Empresa" quando você
-- clicar no alternador PF/PJ pela primeira vez.
-- =============================================================
