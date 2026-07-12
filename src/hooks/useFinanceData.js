import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Utensils, Car, Home, Ticket, Heart, ShoppingBag, MoreHorizontal, Banknote, Laptop } from "lucide-react";

export const ICONS = { Utensils, Car, Home, Ticket, Heart, ShoppingBag, MoreHorizontal, Banknote, Laptop };

export const DEFAULT_CATEGORIES = [
  { id: "alimentacao", name: "Alimentação", icon_key: "Utensils", color: "#D98B3F", budget: 800, kind: "expense" },
  { id: "transporte", name: "Transporte", icon_key: "Car", color: "#3F7FBF", budget: 350, kind: "expense" },
  { id: "moradia", name: "Moradia", icon_key: "Home", color: "#8B5FBF", budget: 1700, kind: "expense" },
  { id: "lazer", name: "Lazer", icon_key: "Ticket", color: "#BF3F7F", budget: 300, kind: "expense" },
  { id: "saude", name: "Saúde", icon_key: "Heart", color: "#3FA8BF", budget: 250, kind: "expense" },
  { id: "compras", name: "Compras", icon_key: "ShoppingBag", color: "#5F6FBF", budget: 400, kind: "expense" },
  { id: "outros", name: "Outros", icon_key: "MoreHorizontal", color: "#8A94A6", budget: 150, kind: "expense" },
  { id: "salario", name: "Salário", icon_key: "Banknote", color: "#2F9E6E", budget: 0, kind: "income" },
  { id: "freelance", name: "Freelance", icon_key: "Laptop", color: "#4FBF8F", budget: 0, kind: "income" },
];

function mapCategory(row) {
  return { ...row, icon: ICONS[row.icon_key] || MoreHorizontal, budget: Number(row.budget || 0) };
}
function mapTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    categoryId: row.category_id,
    description: row.description,
    date: new Date(row.date),
  };
}
function mapGoal(row) {
  return { id: row.id, name: row.name, target: Number(row.target), current: Number(row.current) };
}

export function useFinanceData(userId) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      let { data: cats, error: catErr } = await supabase.from("categories").select("*").eq("user_id", userId);
      if (catErr) throw catErr;

      if (!cats || cats.length === 0) {
        const seed = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId }));
        const { data: inserted, error: insertErr } = await supabase.from("categories").insert(seed).select();
        if (insertErr) throw insertErr;
        cats = inserted;
      }

      const [goalsRes, txRes] = await Promise.all([
        supabase.from("goals").select("*").eq("user_id", userId).order("created_at"),
        supabase.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false }),
      ]);
      if (goalsRes.error) throw goalsRes.error;
      if (txRes.error) throw txRes.error;

      setCategories(cats.map(mapCategory));
      setGoals((goalsRes.data || []).map(mapGoal));
      setTransactions((txRes.data || []).map(mapTransaction));
    } catch (e) {
      setError(e.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addTransaction(txn) {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: txn.type,
        amount: txn.amount,
        category_id: txn.categoryId,
        description: txn.description,
        date: txn.date.toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    setTransactions((prev) => [mapTransaction(data), ...prev]);
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function updateBudget(categoryId, value) {
    const { error } = await supabase.from("categories").update({ budget: value }).eq("id", categoryId).eq("user_id", userId);
    if (error) throw error;
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, budget: value } : c)));
  }

  async function addToGoal(id) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newCurrent = Math.min(goal.target, goal.current + 100);
    const { error } = await supabase.from("goals").update({ current: newCurrent }).eq("id", id).eq("user_id", userId);
    if (error) throw error;
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: newCurrent } : g)));
  }

  return { categories, transactions, goals, loading, error, addTransaction, deleteTransaction, updateBudget, addToGoal, reload: load };
}
