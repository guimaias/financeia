import {
  Utensils,
  Car,
  Home,
  Ticket,
  Heart,
  ShoppingBag,
  MoreHorizontal,
  Banknote,
  Laptop,
} from "lucide-react";

// Chave salva no banco (icon_key) -> componente de ícone.
// Se adicionar uma categoria nova, registre o ícone aqui também.
export const ICONS_BY_KEY = {
  utensils: Utensils,
  car: Car,
  home: Home,
  ticket: Ticket,
  heart: Heart,
  shoppingBag: ShoppingBag,
  moreHorizontal: MoreHorizontal,
  banknote: Banknote,
  laptop: Laptop,
};

export function iconFor(key) {
  return ICONS_BY_KEY[key] || MoreHorizontal;
}

// Categorias criadas automaticamente na primeira vez que uma carteira
// (Pessoal ou Empresa) é usada. O "id" vira a chave primária junto com
// user_id + wallet_id, então pode se repetir entre carteiras diferentes.
export const DEFAULT_CATEGORIES = [
  { id: "alimentacao", name: "Alimentação", icon_key: "utensils", color: "#D98B3F", budget: 800, kind: "expense" },
  { id: "transporte", name: "Transporte", icon_key: "car", color: "#3F7FBF", budget: 350, kind: "expense" },
  { id: "moradia", name: "Moradia", icon_key: "home", color: "#8B5FBF", budget: 1700, kind: "expense" },
  { id: "lazer", name: "Lazer", icon_key: "ticket", color: "#BF3F7F", budget: 300, kind: "expense" },
  { id: "saude", name: "Saúde", icon_key: "heart", color: "#3FA8BF", budget: 250, kind: "expense" },
  { id: "compras", name: "Compras", icon_key: "shoppingBag", color: "#5F6FBF", budget: 400, kind: "expense" },
  { id: "outros", name: "Outros", icon_key: "moreHorizontal", color: "#8A94A6", budget: 150, kind: "expense" },
  { id: "salario", name: "Salário", icon_key: "banknote", color: "#2F9E6E", budget: 0, kind: "income" },
  { id: "freelance", name: "Freelance", icon_key: "laptop", color: "#4FBF8F", budget: 0, kind: "income" },
];
