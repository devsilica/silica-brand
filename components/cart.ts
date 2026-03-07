export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  qty: number;
};

export type CartState = {
  items: CartItem[];
};

export const CART_STORAGE_KEY = "silica_cart_v1";

export function calcCount(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.qty, 0);
}

export function calcTotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0);
}