export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string | null;
  category?: string | null;
};