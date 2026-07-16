import { useState, useMemo, useEffect } from "react";
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
  Fingerprint,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Eye,
  EyeOff,
  LogOut,
  Briefcase,
  Loader2,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { useFinanceData } from "../hooks/useFinanceData";
import { iconFor } from "../lib/categoryIcons";

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

const TABS = [
  { key: "home", label: "Início", icon: Home },
  { key: "transactions", label: "Transações", icon: Receipt },
  { key: "add", label: "Nova", icon: Plus },
  { key: "reports", label: "Relatórios", icon: BarChart3 },
  { key: "profile", label: "Perfil", icon: User },
];

// ---------------------------------------------------------------------------
// Date / format helpers
// ---------------------------------------------------------------------------
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

function buildMonthlyHistory(transactions) {
  const now = new Date();
  const months = [];
  for (let m = 5; m >= 0; m--) months.push(new Date(now.getFullYear(), now.getMonth() - m, 1));
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

function mask(text, on) {
  return on ? "••••" : text;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 88,
    h = 32;
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

function WalletSwitcher({ activeKind, onSwitch, T, switching }) {
  const options = [
    { kind: "PF", label: "Pessoal", Icon: Wallet },
    { kind: "PJ", label: "Empresa", Icon: Briefcase },
  ];
  return (
    <div className="flex rounded-full p-0.5 shrink-0" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }}>
      {options.map(({ kind, label, Icon }) => {
        const active = activeKind === kind;
        return (
          <button
            key={kind}
            disabled={switching}
            onClick={() => onSwitch(kind)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: active ? palette.primary : "transparent",
              color: active ? "#ffffff" : T.muted,
              opacity: switching ? 0.6 : 1,
            }}
          >
            <Icon size={12} /> {label}
          </button>
        );
      })}
    </div>
  );
}

function BalanceCard({ balance, income, expense, trend, trendPct, privacy, onEdit }) {
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
        <div className="flex items-center gap-1.5">
          <p className="text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.7)" }}>
            Saldo disponível
          </p>
          <button onClick={onEdit} className="p-0.5 rounded" aria-label="Ajustar saldo inicial">
            <Pencil size={11} style={{ color: "rgba(255,255,255,0.65)" }} />
          </button>
        </div>
        <div className="flex items-end justify-between mt-1">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#ffffff" }}>
            {mask(formatBRL(balance), privacy)}
          </h1>
          {!privacy && <Sparkline data={trend} color="#ffffff" />}
        </div>
        {trendPct !== null && !privacy && (
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "#BFE8D6" }}>
            {trendPct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(trendPct)}% vs mês anterior</span>
          </div>
        )}
        <div className="h-px my-4" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
        <div className="flex justify-between">
          <div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              Receitas (mês)
            </p>
            <p className="text-sm font-semibold text-white flex items-center gap-1">
              <ArrowUpRight size={14} /> {mask(formatBRL(income), privacy)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              Despesas (mês)
            </p>
            <p className="text-sm font-semibold text-white flex items-center gap-1 justify-end">
              <ArrowDownRight size={14} /> {mask(formatBRL(expense), privacy)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryDonut({ data, total, T, privacy }) {
  return (
    <div className="rounded-2xl p-4 mb-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <p className="text-sm font-semibold mb-3" style={{ color: T.text }}>
        Gastos por categoria
      </p>
      <div
        className="flex items-center gap-4"
        style={privacy ? { filter: "blur(7px)", userSelect: "none", pointerEvents: "none" } : undefined}
      >
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

function MonthlyBarChart({ data, T, privacy }) {
  return (
    <div className="rounded-2xl p-4 mb-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <p className="text-sm font-semibold mb-3" style={{ color: T.text }}>
        Receitas x despesas (6 meses)
      </p>
      <div style={{ width: "100%", height: 140, ...(privacy ? { filter: "blur(7px)", userSelect: "none", pointerEvents: "none" } : {}) }}>
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

function TransactionRow({ t, category, T, onDelete, privacy }) {
  const Icon = category?.icon;
  const isIncome = t.type === "income";
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${category?.color || "#999999"}22` }}
      >
        {Icon ? <Icon size={18} style={{ color: category?.color || "#999999" }} /> : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: T.text }}>
          {t.description}
        </p>
        <p className="text-xs" style={{ color: T.muted }}>
          {category?.name || "Outros"}
        </p>
      </div>
      <div className="text-right">
        <p
          className="text-sm font-semibold"
          style={{ fontFamily: "IBM Plex Mono, monospace", color: isIncome ? palette.income : palette.expense }}
        >
          {isIncome ? "+ " : "− "}
          {mask(formatBRL(t.amount), privacy)}
        </p>
        <p className="text-xs" style={{ color: T.muted }}>
          {dateLabel(t.date)}
        </p>
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
        {Icon ? <Icon size={16} style={{ color: category.color }} /> : null}
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
function HomeScreen({
  userLabel,
  balance,
  incomeMonth,
  expenseMonth,
  trendPct,
  expenseByCategory,
  monthlyHistory,
  recentTransactions,
  categoryMap,
  T,
  privacy,
  onSeeAll,
  onOpenAdd,
  onEditBalance,
}) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const donutData = expenseByCategory.filter((c) => c.spent > 0);
  const totalSpent = donutData.reduce((s, c) => s + c.spent, 0);
  const trendData = monthlyHistory.map((m) => m.income - m.expense);

  return (
    <div>
      <div className="mt-2 mb-4">
        <h1 className="text-lg font-semibold" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
          {greeting}
          {userLabel ? `, ${userLabel}` : ""}
        </h1>
        <p className="text-xs capitalize" style={{ color: T.muted }}>
          {dateStr}
        </p>
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

      <BalanceCard
        balance={balance}
        income={incomeMonth}
        expense={expenseMonth}
        trend={trendData}
        trendPct={trendPct}
        privacy={privacy}
        onEdit={onEditBalance}
      />

      {donutData.length > 0 && <CategoryDonut data={donutData} total={totalSpent} T={T} privacy={privacy} />}

      <MonthlyBarChart data={monthlyHistory} T={T} privacy={privacy} />

      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold" style={{ color: T.text }}>
          Últimas transações
        </p>
        <button onClick={onSeeAll} className="text-xs font-medium" style={{ color: palette.primary }}>
          Ver todas
        </button>
      </div>
      <div>
        {recentTransactions.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: T.muted }}>
            Nenhuma transação neste mês.
          </p>
        )}
        {recentTransactions.map((t) => (
          <TransactionRow key={t.id} t={t} category={categoryMap[t.categoryId]} T={T} privacy={privacy} />
        ))}
      </div>
    </div>
  );
}

function TransactionsScreen({ transactions, categoryMap, T, darkMode, onDelete, selectedMonth, privacy }) {
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
        {[
          ["all", "Todas"],
          ["income", "Receitas"],
          ["expense", "Despesas"],
        ].map(([k, label]) => (
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
        <p className="text-sm text-center py-10" style={{ color: T.muted }}>
          Nenhuma transação encontrada.
        </p>
      )}

      {groups.map(([label, items]) => (
        <div key={label} className="mb-2">
          <p className="text-xs font-medium mt-3 mb-1" style={{ color: T.muted }}>
            {label}
          </p>
          <div>
            {items.map((t) => (
              <TransactionRow key={t.id} t={t} category={categoryMap[t.categoryId]} T={T} onDelete={onDelete} privacy={privacy} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsScreen({ expenseByCategory, T, darkMode, onUpdateBudget, goals, onAddToGoal, selectedMonth, privacy, onOpenAddGoal }) {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
        Orçamentos
      </h2>
      <p className="text-xs mb-4" style={{ color: T.muted }}>
        Progresso de {monthLabel(selectedMonth)}
      </p>

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
                    {Icon ? <Icon size={15} style={{ color: c.color }} /> : null}
                  </div>
                  <span className="text-sm font-medium" style={{ color: T.text }}>
                    {c.name}
                  </span>
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
                <span>
                  {mask(formatBRL(c.spent), privacy)} de {mask(formatBRL(c.budget), privacy)}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? "#2A342E" : "#E4E7E1" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
              </div>
            </div>
          );
        })}
        {expenseByCategory.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: T.muted }}>
            Nenhuma categoria de despesa ainda.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold" style={{ color: T.text, fontFamily: "Space Grotesk, sans-serif" }}>
          Metas de economia
        </h2>
        <button
          onClick={onOpenAddGoal}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${palette.gold}18`, color: palette.gold, border: `1px solid ${palette.gold}40` }}
        >
          <Plus size={13} /> Adicionar meta
        </button>
      </div>
      <div className="space-y-3">
        {goals.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: T.muted }}>
            Nenhuma meta ainda. Crie a primeira!
          </p>
        )}
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
          return (
            <div key={g.id} className="rounded-2xl p-3" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target size={16} style={{ color: palette.gold }} />
                  <span className="text-sm font-medium" style={{ color: T.text }}>
                    {g.name}
                  </span>
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
                <span>
                  {mask(formatBRL(g.current), privacy)} de {mask(formatBRL(g.target), privacy)}
                </span>
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
        <span className="text-sm" style={{ color: T.text }}>
          {label}
        </span>
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

function ProfileScreen({ T, darkMode, setDarkMode, biometric, setBiometric, onExport, userEmail, onLogout }) {
  const initial = (userEmail || "?").charAt(0).toUpperCase();
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 mt-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold text-white shrink-0"
          style={{ backgroundColor: palette.primary, fontFamily: "Space Grotesk, sans-serif" }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: T.text }}>
            {userEmail}
          </p>
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
          <span className="text-xs" style={{ color: T.muted }}>
            Real (R$)
          </span>
        </Row>
        <Row icon={Download} label="Exportar dados (CSV)" T={T} border onClick={onExport}>
          <ChevronRight size={16} style={{ color: T.muted }} />
        </Row>
        <Row icon={Info} label="Sobre o FinanceIA" T={T} border>
          <ChevronRight size={16} style={{ color: T.muted }} />
        </Row>
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 mt-5 py-3 rounded-xl text-sm font-semibold"
        style={{ color: palette.expense, backgroundColor: `${palette.expense}12`, border: `1px solid ${palette.expense}30` }}
      >
        <LogOut size={16} /> Sair da conta
      </button>
    </div>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      {children}
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
  const [saving, setSaving] = useState(false);

  const filteredCats = categories.filter((c) => c.kind === type);
  const amount = cents / 100;
  const accent = type === "income" ? palette.income : palette.expense;
  const canSave = amount > 0 && !!categoryId && !saving;

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
  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      type,
      amount,
      categoryId,
      description: description.trim() || categories.find((c) => c.id === categoryId)?.name || "Transação",
      date: new Date(dateStr + "T12:00:00"),
      recurring,
    });
    setSaving(false);
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "back"];

  return (
    <ModalShell onClose={onClose}>
      <div className="relative w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-5 overflow-y-auto" style={{ backgroundColor: T.card, maxHeight: "88%" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: T.text }}>
            Nova transação
          </h2>
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

        <p className="text-xs font-medium mb-2" style={{ color: T.muted }}>
          Categoria
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {filteredCats.map((c) => (
            <CategoryChip key={c.id} category={c} selected={categoryId === c.id} onClick={() => setCategoryId(c.id)} />
          ))}
          {filteredCats.length === 0 && (
            <p className="text-xs" style={{ color: T.muted }}>
              Nenhuma categoria de {type === "income" ? "receita" : "despesa"} ainda.
            </p>
          )}
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
          disabled={!canSave}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: accent, opacity: amount > 0 && categoryId ? 1 : 0.4 }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </ModalShell>
  );
}

function EditBalanceModal({ T, darkMode, currentValue, onClose, onSave }) {
  const [value, setValue] = useState(String(currentValue ?? 0));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(Number(String(value).replace(",", ".")) || 0);
    setSaving(false);
    onClose();
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="relative w-full md:max-w-sm rounded-t-3xl md:rounded-3xl p-5" style={{ backgroundColor: T.card }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: T.text }}>
            Ajustar saldo inicial
          </h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: T.muted }} />
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: T.muted }}>
          Esse valor é somado às receitas e despesas registradas para calcular o saldo disponível desta carteira.
        </p>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="w-full mb-4 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ backgroundColor: darkMode ? "#222222" : "#F1F2EF", color: T.text }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: palette.primary, opacity: saving ? 0.7 : 1 }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </ModalShell>
  );
}

function AddGoalModal({ T, darkMode, onClose, onSave }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const canSave = name.trim().length > 0 && Number(target) > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await onSave(name.trim(), Number(target));
    setSaving(false);
    onClose();
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="relative w-full md:max-w-sm rounded-t-3xl md:rounded-3xl p-5" style={{ backgroundColor: T.card }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: T.text }}>
            Nova meta de economia
          </h2>
          <button onClick={onClose}>
            <X size={20} style={{ color: T.muted }} />
          </button>
        </div>
        <label className="text-xs font-medium mb-1 block" style={{ color: T.muted }}>
          Nome da meta
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Viagem, Reserva de emergência"
          className="w-full mb-3 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ backgroundColor: darkMode ? "#222222" : "#F1F2EF", color: T.text }}
        />
        <label className="text-xs font-medium mb-1 block" style={{ color: T.muted }}>
          Valor alvo (R$)
        </label>
        <input
          type="number"
          step="0.01"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="0,00"
          className="w-full mb-4 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ backgroundColor: darkMode ? "#222222" : "#F1F2EF", color: T.text }}
        />
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: palette.gold, opacity: name.trim() && Number(target) > 0 ? 1 : 0.5 }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Criar meta
        </button>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Root app
// ---------------------------------------------------------------------------
export default function FinanceIAApp() {
  const { user, signOut } = useAuth();
  const {
    activeWallet,
    categories,
    transactions,
    goals,
    loading,
    error,
    switchWallet,
    addTransaction,
    deleteTransaction,
    updateCategoryBudget,
    addGoal,
    addToGoal,
    updateInitialBalance,
  } = useFinanceData(user);

  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [addInitialType, setAddInitialType] = useState("expense");
  const [showEditBalance, setShowEditBalance] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [switchingWallet, setSwitchingWallet] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const monthlyHistory = useMemo(() => buildMonthlyHistory(transactions), [transactions]);
  const monthTransactions = useMemo(() => transactions.filter((t) => isSameMonth(t.date, selectedMonth)), [transactions, selectedMonth]);
  const incomeMonth = useMemo(() => monthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [monthTransactions]);
  const expenseMonth = useMemo(() => monthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [monthTransactions]);

  const prevMonthDate = useMemo(() => addMonths(selectedMonth, -1), [selectedMonth]);
  const prevMonthTransactions = useMemo(() => transactions.filter((t) => isSameMonth(t.date, prevMonthDate)), [transactions, prevMonthDate]);
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
    const net = transactions.filter((t) => t.date < end).reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    return (activeWallet?.initial_balance || 0) + net;
  }, [transactions, selectedMonth, activeWallet]);

  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, { ...c, icon: iconFor(c.icon_key) }])), [categories]);

  const expenseByCategory = useMemo(() => {
    const spentMap = {};
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        spentMap[t.categoryId] = (spentMap[t.categoryId] || 0) + t.amount;
      });
    return categories
      .filter((c) => c.kind === "expense")
      .map((c) => ({ ...c, icon: iconFor(c.icon_key), spent: spentMap[c.id] || 0 }))
      .sort((a, b) => b.spent - a.spent);
  }, [monthTransactions, categories]);

  const recentTransactions = useMemo(() => [...monthTransactions].sort((a, b) => b.date - a.date).slice(0, 4), [monthTransactions]);
  const isCurrentMonth = isSameMonth(selectedMonth, new Date());
  const hasAlert = useMemo(() => expenseByCategory.some((c) => c.budget > 0 && c.spent >= c.budget * 0.9), [expenseByCategory]);

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

  async function handleAddTransaction(txn) {
    await addTransaction(txn);
    setShowAdd(false);
    showToast("Transação adicionada");
  }

  async function handleDelete(id) {
    await deleteTransaction(id);
  }

  async function handleUpdateBudget(categoryId, value) {
    await updateCategoryBudget(categoryId, value);
  }

  async function handleAddToGoal(id) {
    await addToGoal(id, 100);
    showToast("R$ 100 adicionados à meta");
  }

  async function handleAddGoal(name, target) {
    await addGoal(name, target);
    showToast("Meta criada");
  }

  async function handleEditBalance(value) {
    await updateInitialBalance(value);
    showToast("Saldo inicial atualizado");
  }

  async function handleSwitchWallet(kind) {
    if (activeWallet?.kind === kind || switchingWallet) return;
    setSwitchingWallet(true);
    await switchWallet(kind);
    setSwitchingWallet(false);
    showToast(kind === "PJ" ? "Carteira Empresa ativa" : "Carteira Pessoal ativa");
  }

  function handleBell() {
    if (hasAlert) {
      const names = expenseByCategory
        .filter((c) => c.budget > 0 && c.spent >= c.budget * 0.9)
        .map((c) => c.name)
        .join(", ");
      showToast(`Perto do limite: ${names}`);
    } else {
      showToast("Nenhuma notificação nova");
    }
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

  const userLabel = user?.email ? user.email.split("@")[0] : "";

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: T.bg }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: T.muted }}>
          <Loader2 size={16} className="animate-spin" /> Carregando seus dados…
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ backgroundColor: T.bg, opacity: mounted ? 1 : 0, transition: "opacity .4s ease", fontFamily: "Inter, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>

      {/* Sidebar - desktop apenas */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r px-4 py-6" style={{ backgroundColor: T.card, borderColor: T.border }}>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.primaryDeep})`, fontFamily: "Space Grotesk, sans-serif" }}
          >
            F
          </div>
          <span className="text-base font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: T.text }}>
            FinanceIA
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {TABS.filter((t) => t.key !== "add").map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ backgroundColor: active ? `${palette.primary}14` : "transparent", color: active ? palette.primary : T.muted }}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => openAdd("expense")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white mb-2 mt-4"
          style={{ backgroundColor: palette.primary }}
        >
          <Plus size={16} /> Nova transação
        </button>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ color: T.muted }}>
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 md:px-8 py-3 border-b shrink-0" style={{ borderColor: T.border, backgroundColor: T.card }}>
          <div className="flex items-center gap-2 md:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.primaryDeep})`, fontFamily: "Space Grotesk, sans-serif" }}
            >
              F
            </div>
          </div>
          <WalletSwitcher activeKind={activeWallet?.kind} onSwitch={handleSwitchWallet} T={T} switching={switchingWallet} />
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setPrivacyMode((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }}
              aria-label="Modo privacidade"
            >
              {privacyMode ? <EyeOff size={16} style={{ color: T.muted }} /> : <Eye size={16} style={{ color: T.muted }} />}
            </button>
            {activeTab !== "profile" && (
              <button
                onClick={handleBell}
                className="w-9 h-9 rounded-full flex items-center justify-center relative"
                style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }}
              >
                <Bell size={16} style={{ color: T.muted }} />
                {hasAlert && <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.expense }} />}
              </button>
            )}
          </div>
        </div>

        {activeTab !== "profile" && (
          <div className="px-4 md:px-8 pt-3 shrink-0">
            <div className="max-w-3xl mx-auto w-full">
              <MonthSwitcher selectedMonth={selectedMonth} onPrev={goPrevMonth} onNext={goNextMonth} disableNext={isCurrentMonth} T={T} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-2 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto w-full">
            {activeTab === "home" && (
              <HomeScreen
                userLabel={userLabel}
                balance={balance}
                incomeMonth={incomeMonth}
                expenseMonth={expenseMonth}
                trendPct={trendPct}
                expenseByCategory={expenseByCategory}
                monthlyHistory={monthlyHistory}
                recentTransactions={recentTransactions}
                categoryMap={categoryMap}
                T={T}
                privacy={privacyMode}
                onSeeAll={() => setActiveTab("transactions")}
                onOpenAdd={openAdd}
                onEditBalance={() => setShowEditBalance(true)}
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
                privacy={privacyMode}
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
                privacy={privacyMode}
                onOpenAddGoal={() => setShowAddGoal(true)}
              />
            )}
            {activeTab === "profile" && (
              <ProfileScreen
                T={T}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                biometric={biometric}
                setBiometric={setBiometric}
                onExport={handleExport}
                userEmail={user?.email}
                onLogout={signOut}
              />
            )}
          </div>
        </div>

        {/* Navegação inferior - mobile apenas */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 border-t z-20"
          style={{ backgroundColor: T.card, borderColor: T.border }}
        >
          {TABS.map((tab) => {
            if (tab.key === "add") {
              return (
                <button key="add" onClick={() => openAdd("expense")} className="flex flex-col items-center gap-0.5 px-2 py-1">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center -mt-4 shadow-lg" style={{ backgroundColor: palette.primary }}>
                    <Plus size={20} color="#ffffff" />
                  </span>
                  <span className="text-xs font-medium" style={{ color: palette.primary }}>
                    {tab.label}
                  </span>
                </button>
              );
            }
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="flex flex-col items-center gap-0.5 px-2 py-1">
                <Icon size={20} style={{ color: active ? palette.primary : T.muted }} />
                <span className="text-xs" style={{ color: active ? palette.primary : T.muted }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {showAdd && (
          <AddSheet
            categories={categories.map((c) => ({ ...c, icon: iconFor(c.icon_key) }))}
            T={T}
            darkMode={darkMode}
            initialType={addInitialType}
            onClose={() => setShowAdd(false)}
            onSave={handleAddTransaction}
          />
        )}
        {showEditBalance && (
          <EditBalanceModal
            T={T}
            darkMode={darkMode}
            currentValue={activeWallet?.initial_balance || 0}
            onClose={() => setShowEditBalance(false)}
            onSave={handleEditBalance}
          />
        )}
        {showAddGoal && <AddGoalModal T={T} darkMode={darkMode} onClose={() => setShowAddGoal(false)} onSave={handleAddGoal} />}

        {toast && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-40 px-4 py-2 rounded-full text-xs font-medium text-white shadow-lg whitespace-nowrap"
            style={{ backgroundColor: palette.ink }}
          >
            {toast}
          </div>
        )}

        {error && (
          <div
            className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full text-xs font-medium text-white shadow-lg"
            style={{ backgroundColor: palette.expense }}
          >
            {error.message || "Erro ao sincronizar dados"}
          </div>
        )}
      </div>
    </div>
  );
}
