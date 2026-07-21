import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { DEFAULT_CATEGORIES } from "../lib/categoryIcons";

function normalizeCategory(c) {
  return { ...c, budget: Number(c.budget) || 0 };
}

function normalizeTransaction(t) {
  return {
    id: t.id,
    type: t.type,
    amount: Number(t.amount) || 0,
    categoryId: t.category_id,
    description: t.description,
    date: new Date(t.date),
    recurring: !!t.recurring,
  };
}

function normalizeGoal(g) {
  return { ...g, target: Number(g.target) || 0, current: Number(g.current) || 0 };
}

function normalizeWallet(w) {
  return { ...w, initial_balance: Number(w.initial_balance) || 0 };
}

export function useFinanceData(user) {
  const [wallets, setWallets] = useState([]);
  const [activeWalletId, setActiveWalletId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const seedingRef = useRef(false);

  const loadWalletData = useCallback(
    async (walletId) => {
      if (!user || !walletId) return;
      const [catRes, txRes, glRes] = await Promise.all([
        supabase.from("categories").select("*").eq("wallet_id", walletId).eq("user_id", user.id),
        supabase
          .from("transactions")
          .select("*")
          .eq("wallet_id", walletId)
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase.from("goals").select("*").eq("wallet_id", walletId).eq("user_id", user.id),
      ]);

      const firstError = catRes.error || txRes.error || glRes.error;
      if (firstError) {
        setError(firstError);
        return;
      }
      setCategories((catRes.data || []).map(normalizeCategory));
      setTransactions((txRes.data || []).map(normalizeTransaction));
      setGoals((glRes.data || []).map(normalizeGoal));
    },
    [user]
  );

  const seedCategoriesForWallet = useCallback(
    async (walletId) => {
      const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id, wallet_id: walletId }));
      const { error: insertErr } = await supabase.from("categories").insert(rows);
      if (insertErr) setError(insertErr);
    },
    [user]
  );

  const ensureWallet = useCallback(
    async (kind, name) => {
      const { data: created, error: createErr } = await supabase
        .from("wallets")
        .insert({ user_id: user.id, name, kind })
        .select()
        .single();
      if (createErr) {
        setError(createErr);
        return null;
      }
      await seedCategoriesForWallet(created.id);
      const normalized = normalizeWallet(created);
      setWallets((prev) => [...prev, normalized]);
      return normalized;
    },
    [user, seedCategoriesForWallet]
  );

  useEffect(() => {
    if (!user) {
      setWallets([]);
      setActiveWalletId(null);
      setCategories([]);
      setTransactions([]);
      setGoals([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      const { data: existingWallets, error: walletErr } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (walletErr) {
        setError(walletErr);
        setLoading(false);
        return;
      }

      let walletList = (existingWallets || []).map(normalizeWallet);

      if (walletList.length === 0 && !seedingRef.current) {
        seedingRef.current = true;
        const created = await ensureWallet("PF", "Pessoal");
        if (created) walletList = [created];
        seedingRef.current = false;
      }

      if (cancelled) return;
      setWallets(walletList);
      const active = walletList.find((w) => w.kind === "PF")?.id ?? walletList[0]?.id ?? null;
      setActiveWalletId(active);
      if (active) await loadWalletData(active);
      if (!cancelled) setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const switchWallet = useCallback(
    async (kind) => {
      let target = wallets.find((w) => w.kind === kind);
      if (!target) {
        target = await ensureWallet(kind, kind === "PJ" ? "Empresa" : "Pessoal");
      }
      if (!target) return;
      setActiveWalletId(target.id);
      await loadWalletData(target.id);
    },
    [wallets, ensureWallet, loadWalletData]
  );

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || null;

  async function addTransaction(txn) {
    const payload = {
      user_id: user.id,
      wallet_id: activeWalletId,
      type: txn.type,
      amount: txn.amount,
      category_id: txn.categoryId,
      description: txn.description,
      date: txn.date.toISOString(),
      recurring: !!txn.recurring,
    };
    const { data, error: insertErr } = await supabase.from("transactions").insert(payload).select().single();
    if (insertErr) {
      setError(insertErr);
      return;
    }
    setTransactions((prev) => [normalizeTransaction(data), ...prev]);
  }

  async function deleteTransaction(id) {
    const { error: delErr } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
    if (delErr) {
      setError(delErr);
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function updateCategoryBudget(categoryId, value) {
    const { error: updErr } = await supabase
      .from("categories")
      .update({ budget: value })
      .eq("id", categoryId)
      .eq("wallet_id", activeWalletId)
      .eq("user_id", user.id);
    if (updErr) {
      setError(updErr);
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, budget: value } : c)));
  }

  async function addGoal(name, target) {
    const payload = { user_id: user.id, wallet_id: activeWalletId, name, target, current: 0 };
    const { data, error: insertErr } = await supabase.from("goals").insert(payload).select().single();
    if (insertErr) {
      setError(insertErr);
      return;
    }
    setGoals((prev) => [...prev, normalizeGoal(data)]);
  }

  async function addToGoal(id, amount) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const nextCurrent = Math.min(goal.target, Math.max(0, goal.current + amount));
    const { error: updErr } = await supabase
      .from("goals")
      .update({ current: nextCurrent })
      .eq("id", id)
      .eq("user_id", user.id);
    if (updErr) {
      setError(updErr);
      return;
    }
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: nextCurrent } : g)));
  }

  async function updateGoal(id, fields) {
    const { error: updErr } = await supabase.from("goals").update(fields).eq("id", id).eq("user_id", user.id);
    if (updErr) {
      setError(updErr);
      return;
    }
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...fields } : g)));
  }

  async function deleteGoal(id) {
    const { error: delErr } = await supabase.from("goals").delete().eq("id", id).eq("user_id", user.id);
    if (delErr) {
      setError(delErr);
      return;
    }
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function updateInitialBalance(value) {
    if (!activeWalletId) return;
    const { error: updErr } = await supabase
      .from("wallets")
      .update({ initial_balance: value })
      .eq("id", activeWalletId)
      .eq("user_id", user.id);
    if (updErr) {
      setError(updErr);
      return;
    }
    setWallets((prev) => prev.map((w) => (w.id === activeWalletId ? { ...w, initial_balance: value } : w)));
  }

  return {
    wallets,
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
    updateGoal,
    deleteGoal,
    updateInitialBalance,
  };
}
