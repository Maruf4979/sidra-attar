import { prisma } from "./prisma";
import { products as staticProducts } from "../data/products";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number | null;
  category: string;
  description: string;
  story: string;
  gradient: string;
  accent: string;
  badge: string | null;
  image: string | null;
  tags: string[];
  wholesalePrices: { minQty: number; price: number }[] | null;
  profile: { [key: string]: string } | null;
  occasions: string[];
}

export function parseProduct(dbProduct: any): Product {
  const parseJson = (val: any, fallback: any) => {
    if (typeof val !== 'string') return val ?? fallback;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  return {
    ...dbProduct,
    tags: parseJson(dbProduct.tags, []),
    wholesalePrices: parseJson(dbProduct.wholesalePrices, null),
    profile: parseJson(dbProduct.profile, null),
    occasions: parseJson(dbProduct.occasions, []),
  };
}

export async function getAllProducts() {
  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(parseProduct);
    }
  } catch (err) {
    console.error("Error fetching products from DB:", err);
  }

  return staticProducts.map((p) => ({
    ...p,
    originalPrice: p.originalPrice ?? null,
    wholesalePrices: p.wholesalePrices ?? null,
    profile: p.profile ?? null,
    badge: p.badge ?? null,
    image: p.image ?? null,
  }));
}

export async function getProductBySlug(slug: string) {
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
    });
    if (dbProduct) return parseProduct(dbProduct);
  } catch (err) {
    console.error(`Error fetching product ${slug} from DB:`, err);
  }

  const fallback = staticProducts.find((p) => p.slug === slug);
  if (!fallback) return null;
  return {
    ...fallback,
    originalPrice: fallback.originalPrice ?? null,
    wholesalePrices: fallback.wholesalePrices ?? null,
    profile: fallback.profile ?? null,
    badge: fallback.badge ?? null,
    image: fallback.image ?? null,
  };
}

export async function getRelatedProducts(product: Product) {
  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
      },
      take: 4,
    });
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map(parseProduct);
    }
  } catch (err) {
    console.error("Error fetching related products from DB:", err);
  }

  return staticProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)
    .map((p) => ({
      ...p,
      originalPrice: p.originalPrice ?? null,
      wholesalePrices: p.wholesalePrices ?? null,
      profile: p.profile ?? null,
      badge: p.badge ?? null,
      image: p.image ?? null,
    }));
}
