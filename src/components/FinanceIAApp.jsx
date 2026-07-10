import { useState, useMemo, useRef, useEffect } from "react";
import {
  Home,
  Receipt,
  Plus,
  BarChart3,
  User,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Moon,
  Sun,
  Download,
  Trash2,
  Pencil,
  Wallet,
  Target,
  Car,
  ShoppingBag,
  Utensils,
  Laptop,
  Heart,
  Ticket,
  MoreHorizontal,
  Banknote,
  Fingerprint,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const palette = {
  ink: "#14261F",
  primary: "#1F6F5C",
  primaryDeep: "#123A30",
  income: "#2F9E6E",
  expense: "#B8483A",
  gold: "#C9A227",
  lightBg: "#F3F5F1",
  lightCard: "#FFFFFF",
  lightBorder: "#E4E7E1",
  lightMuted: "#6B7A72",
  darkBg: "#0F1613",
  darkCard: "#19221D",
  darkBorder: "#2A342E",
  darkMuted: "#8CA096",
};

const CATEGORIES_SEED = [
  { id: "alimentacao", name: "Alimentação", icon: Utensils, color: "#D98B3F", budget: 800, kind: "expense" },
  { id: "transporte", name: "Transporte", icon: Car, color: "#3F7FBF", budget: 350, kind: "expense" },
  { id: "moradia", name: "Moradia", icon: Home, color: "#8B5FBF", budget: 1700, kind: "expense" },
  { id: "lazer", name: "Lazer", icon: Ticket, color: "#BF3F7F", budget: 300, kind: "expense" },
  { id: "saude", name: "Saúde", icon: Heart, color: "#3FA8BF", budget: 250, kind: "expense" },
  { id: "compras", name: "Compras", icon: ShoppingBag, color: "#5F6FBF", budget: 400, kind: "expense" },
  { id: "outros", name: "Outros", icon: MoreHorizontal, color: "#8A94A6", budget: 150, kind: "expense" },
  { id: "salario", name: "Salário", icon: Banknote, color: "#2F9E6E", kind: "income" },
  { id: "freelance", name: "Freelance", icon: Laptop, color: "#4FBF8F", kind: "income" },
];

const TABS = [
  { key: "home", label: "Início", icon: Home },
  { key: "transactions", label: "Transações", icon: Receipt },
  { key: "add", label: "Nova", icon: Plus },
  { key: "reports", label: "Relatórios", icon: BarChart3 },
  { key: "profile", label: "Perfil", icon: User },
];

// ---------------------------------------------------------------------------
// Data / date helpers
// ---------------------------------------------------------------------------
function daysAgo(n) {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function monthLabel(d) {
  const raw = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

const RECENT_DEFS = [
  [0, "expense", 34.9, "alimentacao", "iFood - almoço"],
  [0, "expense", 18, "transporte", "Uber"],
  [1, "expense", 220.5, "compras", "Loja de roupas"],
  [2, "expense", 89.9, "lazer", "Cinema + pipoca"],
  [3, "income", 850, "freelance", "Freela - landing page"],
  [4, "expense", 45, "saude", "Farmácia"],
  [5, "income", 4200, "salario", "Salário"],
  [5, "expense", 312.4, "alimentacao", "Supermercado"],
  [6, "expense", 120, "transporte", "Combustível"],
  [7, "expense", 39.9, "lazer", "Netflix"],
  [8, "expense", 15.9, "lazer", "Spotify"],
  [9, "expense", 64.3, "alimentacao", "Restaurante"],
  [10, "expense", 1400, "moradia", "Aluguel"],
  [11, "expense", 95, "moradia", "Internet"],
  [14, "expense", 130, "saude", "Academia - mensalidade"],
];

const MONTHLY_PATTERN = [
  { day: 5, type: "income", amount: 4200, categoryId: "salario", description: "Salário" },
  { day: 4, type: "expense", amount: 310, categoryId: "alimentacao", description: "Supermercado" },
  { day: 10, type: "expense", amount: 1400, categoryId: "moradia", description: "Aluguel" },
  { day: 11, type: "expense", amount: 95, categoryId: "moradia", description: "Internet" },
  { day: 7, type: "expense", amount: 39.9, categoryId: "lazer", description: "Netflix" },
  { day: 8, type: "expense", amount: 15.9, categoryId: "lazer", description: "Spotify" },
  { day: 14, type: "expense", amount: 130, categoryId: "saude", description: "Academia - mensalidade" },
  { day: 16, type: "expense", amount: 28, categoryId: "transporte", description: "Uber" },
  { day: 20, type: "expense", amount: 60, categoryId: "alimentacao", description: "Feira" },
];

const EXTRA_PAST_DEFS = [
  { monthsBack: 1, day: 12, type: "expense", amount: 220.5, categoryId: "compras", description: "Loja de roupas" },
  { monthsBack: 2, day: 25, type: "expense", amount: 89.9, categoryId: "lazer", description: "Cinema + pipoca" },
  { monthsBack: 3, day: 18, type: "income", amount: 850, categoryId: "freelance", description: "Freela - landing page" },
  { monthsBack: 4, day: 22, type: "expense", amount: 210, categoryId: "compras", description: "Tênis novo" },
];

function buildSeedTransactions() {
  const now = new Date();
  const list = [];
  let counter = 0;

  RECENT_DEFS.forEach(([offset, type, amount, categoryId, description]) => {
    list.push({ id: `seed-${counter++}`, date: daysAgo(offset), type, amount, categoryId, description });
  });

  for (let m = 1; m <= 5; m++) {
    MONTHLY_PATTERN.forEach((p) => {
      list.push({
        id: `seed-${counter++}`,
        date: new Date(now.getFullYear(), now.getMonth() - m, p.day, 9, 0, 0),
        type: p.type,
        amount: p.amount,
        categoryId: p.categoryId,
        description: p.description,
      });
    });
  }

  EXTRA_PAST_DEFS.forEach((p) => {
    list.push({
      id: `seed-${counter++}`,
      date: new Date(now.getFullYear(), now.getMonth() - p.monthsBack, p.day, 9, 0, 0),
      type: p.type,
      amount: p.amount,
      categoryId: p.categoryId,
      description: p.description,
    });
  });

  return list;
}

function buildMonthlyHistory(transactions) {
  const now = new Date();
  const months = [];
  for (let m = 5; m >= 0; m--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - m, 1));
  }
  return months.map((d) => {
    const monthTx = transactions.filter((t) => isSameMonth(t.date, d));
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const raw = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    return { month: label, income, expense };
  });
}

function formatBRL(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function dateLabel(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 88, h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MonthSwitcher({ selectedMonth, onPrev, onNext, disableNext, T }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={onPrev}
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
      >
        <ChevronLeft size={16} style={{ color: T.text }} />
      </button>
      <span className="text-sm font-semibold capitalize" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
        {monthLabel(selectedMonth)}
      </span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, opacity: disableNext ? 0.35 : 1 }}
      >
        <ChevronRight size={16} style={{ color: T.text }} />
      </button>
    </div>
  );
}

function BalanceCard({ balance, income, expense, trend, trendPct }) {
  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden mb-5"
      style={{ background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryDeep} 100%)` }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "14px 14px" }}
      />
      <div className="relative">
        <p className="text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>Saldo disponível</p>
        <div className="flex items-end justify-between mt-1">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#ffffff" }}>
            {formatBRL(balance)}
          </h1>
          <Sparkline data={trend} color="#ffffff" />
        </div>
        {trendPct !== null && (
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "#BFE8D6" }}>
            {trendPct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(trendPct)}% vs mês anterior</span>
          </div>
        )}
        <div className="h-px my-4" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
        <div className="flex justify-between">
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Receitas (mês)</p>
            <p className="text-sm font-semibold text-white flex items-center gap-1">
              <ArrowUpRight size={14} /> {formatBRL(income)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Despesas (mês)</p>
            <p className="text-sm font-semibold text-white flex items-center gap-1 justify-end">
              <ArrowDownRight size={14} /> {formatBRL(expense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryDonut({ data, total, T }) {
  return (
    <div className="rounded-2xl p-4 mb-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <p className="text-sm font-semibold mb-3" style={{ color: T.text }}>Gastos por categoria</p>
      <div className="flex items-center gap-4">
        <div style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="spent" nameKey="name" innerRadius={38} outerRadius={56} paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatBRL(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span style={{ color: T.muted }}>{c.name}</span>
              </div>
              <span className="font-medium" style={{ color: T.text }}>
                {total > 0 ? Math.round((c.spent / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthlyBarChart({ data, T }) {
  return (
    <div className="rounded-2xl p-4 mb-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <p className="text-sm font-semibold mb-3" style={{ color: T.text }}>Receitas x despesas (6 meses)</p>
      <div style={{ width: "100%", height: 140 }}>
        <ResponsiveContainer>
          <BarChart data={data} barGap={2}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.muted }} />
            <Tooltip formatter={(v) => formatBRL(v)} cursor={{ fill: "transparent" }} />
            <Bar dataKey="income" name="Receitas" fill={palette.income} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Despesas" fill={palette.expense} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TransactionRow({ t, category, T, onDelete }) {
  const Icon = category?.icon || MoreHorizontal;
  const isIncome = t.type === "income";
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${category?.color || "#999999"}22` }}
      >
        <Icon size={18} style={{ color: category?.color || "#999999" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: T.text }}>{t.description}</p>
        <p className="text-xs" style={{ color: T.muted }}>{category?.name || "Outros"}</p>
      </div>
      <div className="text-right">
        <p
          className="text-sm font-semibold"
          style={{ fontFamily: "IBM Plex Mono, monospace", color: isIncome ? palette.income : palette.expense }}
        >
          {isIncome ? "+ " : "− "}{formatBRL(t.amount)}
        </p>
        <p className="text-xs" style={{ color: T.muted }}>{dateLabel(t.date)}</p>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(t.id)} className="ml-1 p-1">
          <Trash2 size={14} style={{ color: T.muted, opacity: 0.5 }} />
        </button>
      )}
    </div>
  );
}

function CategoryChip({ category, selected, onClick }) {
  const Icon = category.icon;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 shrink-0 px-3 py-2 rounded-2xl"
      style={{
        backgroundColor: selected ? `${category.color}22` : "transparent",
        border: `1.5px solid ${selected ? category.color : "transparent"}`,
      }}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${category.color}22` }}>
        <Icon size={16} style={{ color: category.color }} />
      </div>
      <span className="text-xs font-medium" style={{ color: selected ? category.color : "#8A8A8A" }}>
        {category.name}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------
function HomeScreen({ balance, incomeMonth, expenseMonth, trendPct, expenseByCategory, monthlyHistory, recentTransactions, categoryMap, T, onSeeAll, onBell, onOpenAdd }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const donutData = expenseByCategory.filter((c) => c.spent > 0);
  const totalSpent = donutData.reduce((s, c) => s + c.spent, 0);
  const trendData = monthlyHistory.map((m) => m.income - m.expense);

  return (
    <div>
      <div className="flex items-center justify-between mt-2 mb-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
            {greeting}, Guilherme
          </h1>
          <p className="text-xs capitalize" style={{ color: T.muted }}>{dateStr}</p>
        </div>
        <button
          onClick={onBell}
          className="w-9 h-9 rounded-full flex items-center justify-center relative"
          style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
        >
          <Bell size={16} style={{ color: T.muted }} />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.expense }} />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onOpenAdd("income")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: `${palette.income}18`, color: palette.income, border: `1px solid ${palette.income}40` }}
        >
          <ArrowUpRight size={15} /> Receita
        </button>
        <button
          onClick={() => onOpenAdd("expense")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: `${palette.expense}18`, color: palette.expense, border: `1px solid ${palette.expense}40` }}
        >
          <ArrowDownRight size={15} /> Despesa
        </button>
      </div>

      <BalanceCard balance={balance} income={incomeMonth} expense={expenseMonth} trend={trendData} trendPct={trendPct} />

      {donutData.length > 0 && <CategoryDonut data={donutData} total={totalSpent} T={T} />}

      <MonthlyBarChart data={monthlyHistory} T={T} />

      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold" style={{ color: T.text }}>Últimas transações</p>
        <button onClick={onSeeAll} className="text-xs font-medium" style={{ color: palette.primary }}>
          Ver todas
        </button>
      </div>
      <div>
        {recentTransactions.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: T.muted }}>Nenhuma transação neste mês.</p>
        )}
        {recentTransactions.map((t) => (
          <TransactionRow key={t.id} t={t} category={categoryMap[t.categoryId]} T={T} />
        ))}
      </div>
    </div>
  );
}

function TransactionsScreen({ transactions, categoryMap, T, darkMode, onDelete, selectedMonth }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allTime, setAllTime] = useState(false);

  const filtered = useMemo(() => {
    const base = allTime ? transactions : transactions.filter((t) => isSameMonth(t.date, selectedMonth));
    return base
      .filter((t) => (typeFilter === "all" ? true : t.type === typeFilter))
      .filter((t) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const cat = categoryMap[t.categoryId]?.name?.toLowerCase() || "";
        return t.description.toLowerCase().includes(q) || cat.includes(q);
      })
      .sort((a, b) => b.date - a.date);
  }, [transactions, query, typeFilter, allTime, selectedMonth, categoryMap]);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      const label = dateLabel(t.date);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(t);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
        Transações
      </h2>

      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ backgroundColor: darkMode ? "#1E2822" : "#EDEFEA" }}>
        <Search size={15} style={{ color: T.muted }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar transações"
          className="bg-transparent outline-none text-sm flex-1"
          style={{ color: T.text }}
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[["all", "Todas"], ["income", "Receitas"], ["expense", "Despesas"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTypeFilter(k)}
            className="text-xs px-3 py-1.5 rounded-full shrink-0 font-medium"
            style={{
              backgroundColor: typeFilter === k ? palette.primary : "transparent",
              color: typeFilter === k ? "#ffffff" : T.muted,
              border: `1px solid ${typeFilter === k ? palette.primary : T.border}`,
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setAllTime((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-full shrink-0 font-medium"
          style={{
            backgroundColor: allTime ? palette.gold : "transparent",
            color: allTime ? "#ffffff" : T.muted,
            border: `1px solid ${allTime ? palette.gold : T.border}`,
          }}
        >
          Todos os períodos
        </button>
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-center py-10" style={{ color: T.muted }}>Nenhuma transação encontrada.</p>
      )}

      {groups.map(([label, items]) => (
        <div key={label} className="mb-2">
          <p className="text-xs font-medium mt-3 mb-1" style={{ color: T.muted }}>{label}</p>
          <div>
            {items.map((t) => (
              <TransactionRow key={t.id} t={t} category={categoryMap[t.categoryId]} T={T} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsScreen({ expenseByCategory, T, darkMode, onUpdateBudget, goals, onAddToGoal, selectedMonth }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
        Orçamentos
      </h2>
      <p className="text-xs mb-4" style={{ color: T.muted }}>Progresso de {monthLabel(selectedMonth)}</p>

      <div className="space-y-3 mb-6">
        {expenseByCategory.map((c) => {
          const pct = c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
          const barColor = pct >= 100 ? palette.expense : pct >= 70 ? palette.gold : palette.income;
          const Icon = c.icon;
          return (
            <div key={c.id} className="rounded-2xl p-3" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${c.color}22` }}>
                    <Icon size={15} style={{ color: c.color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: T.text }}>{c.name}</span>
                </div>
                {editing === c.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-16 text-xs px-2 py-1 rounded-lg outline-none"
                      style={{ backgroundColor: darkMode ? "#222222" : "#F1F2EF", color: T.text }}
                    />
                    <button
                      onClick={() => {
                        onUpdateBudget(c.id, Number(editValue || 0));
                        setEditing(null);
                      }}
                    >
                      <Check size={16} style={{ color: palette.income }} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(c.id);
                      setEditValue(String(c.budget));
                    }}
                  >
                    <Pencil size={12} style={{ color: T.muted }} />
                  </button>
                )}
              </div>
              <div className="flex justify-between text-xs mb-1" style={{ color: T.muted }}>
                <span>{formatBRL(c.spent)} de {formatBRL(c.budget)}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? "#2A342E" : "#E4E7E1" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-semibold mb-3" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
        Metas de economia
      </h2>
      <div className="space-y-3">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={g.id} className="rounded-2xl p-3" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target size={16} style={{ color: palette.gold }} />
                  <span className="text-sm font-medium" style={{ color: T.text }}>{g.name}</span>
                </div>
                <button
                  onClick={() => onAddToGoal(g.id)}
                  className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ backgroundColor: `${palette.gold}22`, color: palette.gold }}
                >
                  + R$ 100
                </button>
              </div>
              <div className="flex justify-between text-xs mb-1" style={{ color: T.muted }}>
                <span>{formatBRL(g.current)} de {formatBRL(g.target)}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? "#2A342E" : "#E4E7E1" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: palette.gold }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, children, T, border, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 ${border ? "border-t" : ""}`}
      style={{ borderColor: T.border, cursor: onClick ? "pointer" : "default" }}
    >
      <div className="flex items-center gap-3">
        <Icon size={17} style={{ color: T.muted }} />
        <span className="text-sm" style={{ color: T.text }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button onClick={onChange} className="w-10 h-6 rounded-full relative transition-colors" style={{ backgroundColor: checked ? palette.primary : "#C7CCC8" }}>
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function ProfileScreen({ T, darkMode, setDarkMode, biometric, setBiometric, onExport }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 mt-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white"
          style={{ backgroundColor: palette.primary, fontFamily: "Space Grotesk, sans-serif" }}
        >
          G
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: T.text }}>Guilherme</p>
          <p className="text-xs" style={{ color: T.muted }}>guilherme@email.com</p>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
        <Row icon={darkMode ? Moon : Sun} label="Modo escuro" T={T}>
          <Switch checked={darkMode} onChange={() => setDarkMode((v) => !v)} />
        </Row>
        <Row icon={Fingerprint} label="Biometria / PIN" T={T} border>
          <Switch checked={biometric} onChange={() => setBiometric((v) => !v)} />
        </Row>
        <Row icon={Wallet} label="Moeda" T={T} border>
          <span className="text-xs" style={{ color: T.muted }}>Real (R$)</span>
        </Row>
        <Row icon={Download} label="Exportar dados (CSV)" T={T} border onClick={onExport}>
          <ChevronRight size={16} style={{ color: T.muted }} />
        </Row>
        <Row icon={Info} label="Sobre o FinanceIA" T={T} border>
          <ChevronRight size={16} style={{ color: T.muted }} />
        </Row>
      </div>
    </div>
  );
}

function AddSheet({ categories, T, darkMode, onClose, onSave, initialType }) {
  const [type, setType] = useState(initialType || "expense");
  const [cents, setCents] = useState(0);
  const [categoryId, setCategoryId] = useState(null);
  const [description, setDescription] = useState("");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [recurring, setRecurring] = useState(false);

  const filteredCats = categories.filter((c) => c.kind === type);
  const amount = cents / 100;
  const accent = type === "income" ? palette.income : palette.expense;
  const canSave = amount > 0 && !!categoryId;

  function pressDigit(d) {
    setCents((prev) => {
      const next = Number(String(prev) + d);
      return next > 99999999 ? prev : next;
    });
  }
  function backspace() {
    setCents((prev) => {
      const str = String(prev).slice(0, -1);
      return str === "" ? 0 : Number(str);
    });
  }
  function handleSave() {
    if (!canSave) return;
    onSave({
      type,
      amount,
      categoryId,
      description: description.trim() || categories.find((c) => c.id === categoryId)?.name || "Transação",
      date: new Date(dateStr + "T12:00:00"),
    });
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"];

  return (
    <div className="absolute inset-0 z-30 flex items-end">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div className="relative w-full rounded-t-3xl p-5 overflow-y-auto" style={{ backgroundColor: T.card, maxHeight: "88%" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: T.text }}>Nova transação</h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: T.muted }} />
          </button>
        </div>

        <div className="flex rounded-xl overflow-hidden mb-5" style={{ border: `1px solid ${T.border}` }}>
          {["expense", "income"].map((k) => (
            <button
              key={k}
              onClick={() => {
                setType(k);
                setCategoryId(null);
              }}
              className="flex-1 py-2 text-sm font-medium"
              style={{
                backgroundColor: type === k ? (k === "income" ? palette.income : palette.expense) : "transparent",
                color: type === k ? "#ffffff" : T.muted,
              }}
            >
              {k === "expense" ? "Despesa" : "Receita"}
            </button>
          ))}
        </div>

        <div className="text-center mb-5">
          <p className="text-3xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: accent }}>
            {formatBRL(amount)}
          </p>
        </div>

        <p className="text-xs font-medium mb-2" style={{ color: T.muted }}>Categoria</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {filteredCats.map((c) => (
            <CategoryChip key={c.id} category={c} selected={categoryId === c.id} onClick={() => setCategoryId(c.id)} />
          ))}
        </div>

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
          className="w-full mb-3 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: darkMode ? "#222222" : "#F1F2EF", color: T.text }}
        />

        <div className="flex items-center gap-2 mb-4">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
            style={{ backgroundColor: darkMode ? "#222222" : "#F1F2EF", color: T.text }}
          />
          <button
            onClick={() => setRecurring((r) => !r)}
            className="text-xs px-3 py-2 rounded-xl whitespace-nowrap"
            style={{
              backgroundColor: recurring ? `${palette.primary}22` : "transparent",
              color: recurring ? palette.primary : T.muted,
              border: `1px solid ${T.border}`,
            }}
          >
            Repetir todo mês
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => (k === "back" ? backspace() : pressDigit(k))}
              className="py-3 rounded-xl text-lg font-medium"
              style={{ backgroundColor: darkMode ? "#222222" : "#F1F2EF", color: T.text }}
            >
              {k === "back" ? "⌫" : k}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: accent, opacity: canSave ? 1 : 0.4 }}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root app
// ---------------------------------------------------------------------------
export default function FinanceIAApp() {
  const [transactions, setTransactions] = useState(buildSeedTransactions);
  const [categories, setCategories] = useState(CATEGORIES_SEED);
  const [goals, setGoals] = useState([
    { id: "g1", name: "Viagem Nordeste", target: 3000, current: 1180 },
    { id: "g2", name: "Reserva de emergência", target: 10000, current: 5400 },
  ]);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [addInitialType, setAddInitialType] = useState("expense");
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const idCounter = useRef(1000);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const monthlyHistory = useMemo(() => buildMonthlyHistory(transactions), [transactions]);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => isSameMonth(t.date, selectedMonth)),
    [transactions, selectedMonth]
  );

  const incomeMonth = useMemo(() => monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [monthTransactions]);
  const expenseMonth = useMemo(() => monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [monthTransactions]);

  const prevMonthDate = useMemo(() => addMonths(selectedMonth, -1), [selectedMonth]);
  const prevMonthTransactions = useMemo(
    () => transactions.filter((t) => isSameMonth(t.date, prevMonthDate)),
    [transactions, prevMonthDate]
  );
  const prevNet = useMemo(
    () => prevMonthTransactions.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0),
    [prevMonthTransactions]
  );
  const trendPct = useMemo(() => {
    const currentNet = incomeMonth - expenseMonth;
    if (prevNet === 0) return null;
    return Math.round(((currentNet - prevNet) / Math.abs(prevNet)) * 100);
  }, [incomeMonth, expenseMonth, prevNet]);

  const balance = useMemo(() => {
    const end = addMonths(selectedMonth, 1);
    return transactions.filter((t) => t.date < end).reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
  }, [transactions, selectedMonth]);

  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  const expenseByCategory = useMemo(() => {
    const spentMap = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        spentMap[t.categoryId] = (spentMap[t.categoryId] || 0) + t.amount;
      });
    return categories
      .filter((c) => c.kind === "expense")
      .map((c) => ({ ...c, spent: spentMap[c.id] || 0 }))
      .sort((a, b) => b.spent - a.spent);
  }, [monthTransactions, categories]);

  const recentTransactions = useMemo(() => [...monthTransactions].sort((a, b) => b.date - a.date).slice(0, 4), [monthTransactions]);

  const isCurrentMonth = isSameMonth(selectedMonth, new Date());

  const T = darkMode
    ? { bg: palette.darkBg, card: palette.darkCard, border: palette.darkBorder, text: "#F2F5F3", muted: palette.darkMuted }
    : { bg: palette.lightBg, card: palette.lightCard, border: palette.lightBorder, text: palette.ink, muted: palette.lightMuted };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  function goPrevMonth() {
    setSelectedMonth((d) => addMonths(d, -1));
  }
  function goNextMonth() {
    setSelectedMonth((d) => (isSameMonth(d, new Date()) ? d : addMonths(d, 1)));
  }
  function openAdd(type) {
    setAddInitialType(type);
    setShowAdd(true);
  }

  function handleAddTransaction(txn) {
    idCounter.current += 1;
    setTransactions((prev) => [{ ...txn, id: `t-${idCounter.current}` }, ...prev]);
    setShowAdd(false);
    showToast("Transação adicionada");
  }

  function handleDelete(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function handleUpdateBudget(categoryId, value) {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, budget: value } : c)));
  }

  function handleAddToGoal(id) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: Math.min(g.target, g.current + 100) } : g)));
    showToast("R$ 100 adicionados à meta");
  }

  function handleExport() {
    const header = "Data,Tipo,Categoria,Descricao,Valor\n";
    const rows = transactions
      .map((t) => {
        const cat = categoryMap[t.categoryId]?.name || "";
        const d = t.date.toLocaleDateString("pt-BR");
        return `${d},${t.type === "income" ? "Receita" : "Despesa"},${cat},"${t.description}",${t.amount.toFixed(2)}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financeia-transacoes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("CSV exportado");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: darkMode ? "#090D0B" : "#E7EAE4" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
        style={{
          backgroundColor: T.bg,
          border: `8px solid ${darkMode ? "#000000" : "#161616"}`,
          height: 820,
          fontFamily: "Inter, sans-serif",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "opacity .5s ease, transform .5s ease",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 rounded-b-2xl z-20"
          style={{ backgroundColor: darkMode ? "#000000" : "#161616" }}
        />

        <div className="shrink-0 flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold" style={{ color: T.text }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>••••</span>
        </div>

        {activeTab !== "profile" && (
          <div className="shrink-0 px-4 pt-1">
            <MonthSwitcher selectedMonth={selectedMonth} onPrev={goPrevMonth} onNext={goNextMonth} disableNext={isCurrentMonth} T={T} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {activeTab === "home" && (
            <HomeScreen
              balance={balance}
              incomeMonth={incomeMonth}
              expenseMonth={expenseMonth}
              trendPct={trendPct}
              expenseByCategory={expenseByCategory}
              monthlyHistory={monthlyHistory}
              recentTransactions={recentTransactions}
              categoryMap={categoryMap}
              T={T}
              onSeeAll={() => setActiveTab("transactions")}
              onBell={() => showToast("Nenhuma notificação nova")}
              onOpenAdd={openAdd}
            />
          )}
          {activeTab === "transactions" && (
            <TransactionsScreen
              transactions={transactions}
              categoryMap={categoryMap}
              T={T}
              darkMode={darkMode}
              onDelete={handleDelete}
              selectedMonth={selectedMonth}
            />
          )}
          {activeTab === "reports" && (
            <ReportsScreen
              expenseByCategory={expenseByCategory}
              T={T}
              darkMode={darkMode}
              onUpdateBudget={handleUpdateBudget}
              goals={goals}
              onAddToGoal={handleAddToGoal}
              selectedMonth={selectedMonth}
            />
          )}
          {activeTab === "profile" && (
            <ProfileScreen T={T} darkMode={darkMode} setDarkMode={setDarkMode} biometric={biometric} setBiometric={setBiometric} onExport={handleExport} />
          )}
        </div>

        <div className="shrink-0 flex items-center justify-around py-2 border-t" style={{ backgroundColor: T.card, borderColor: T.border }}>
          {TABS.map((tab) => {
            if (tab.key === "add") {
              return (
                <button key="add" onClick={() => openAdd("expense")} className="flex flex-col items-center gap-0.5 px-2 py-1">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center -mt-4 shadow-lg" style={{ backgroundColor: palette.primary }}>
                    <Plus size={20} color="#ffffff" />
                  </span>
                  <span className="text-xs font-medium" style={{ color: palette.primary }}>{tab.label}</span>
                </button>
              );
            }
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex flex-col items-center gap-0.5 px-2 py-1">
                <Icon size={20} style={{ color: active ? palette.primary : T.muted }} />
                <span className="text-xs" style={{ color: active ? palette.primary : T.muted }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {showAdd && (
          <AddSheet
            categories={categories}
            T={T}
            darkMode={darkMode}
            initialType={addInitialType}
            onClose={() => setShowAdd(false)}
            onSave={handleAddTransaction}
          />
        )}

        {toast && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-24 z-40 px-4 py-2 rounded-full text-xs font-medium text-white shadow-lg"
            style={{ backgroundColor: palette.ink }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
