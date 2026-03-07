"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CART_STORAGE_KEY, CartItem, calcCount, calcTotal } from "./cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function safeParse(json: string | null) {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // load from localStorage
  useEffect(() => {
    const stored = safeParse(localStorage.getItem(CART_STORAGE_KEY));
    if (stored?.items && Array.isArray(stored.items)) setItems(stored.items);
    setHydrated(true);
  }, []);

  // persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = calcCount(items);
    const total = calcTotal(items);

    function addItem(item: Omit<CartItem, "qty">, qty = 1) {
      setItems((prev) => {
        const found = prev.find((p) => p.id === item.id);
        if (found) {
          return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
        }
        return [...prev, { ...item, qty }];
      });
    }

    function removeItem(id: string) {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }

    function setQty(id: string, qty: number) {
      const q = Math.max(1, Math.floor(qty || 1));
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: q } : p)));
    }

    function clear() {
      setItems([]);
    }

    return { items, count, total, addItem, removeItem, setQty, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}


