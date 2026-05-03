import { prisma } from "./prisma";

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
  return {
    ...dbProduct,
    tags: JSON.parse(dbProduct.tags || "[]"),
    wholesalePrices: dbProduct.wholesalePrices ? JSON.parse(dbProduct.wholesalePrices) : null,
    profile: dbProduct.profile ? JSON.parse(dbProduct.profile) : null,
    occasions: JSON.parse(dbProduct.occasions || "[]"),
  };
}

export async function getAllProducts() {
  const dbProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return dbProducts.map(parseProduct);
}

export async function getProductBySlug(slug: string) {
  const dbProduct = await prisma.product.findUnique({
    where: { slug },
  });
  if (!dbProduct) return null;
  return parseProduct(dbProduct);
}

export async function getRelatedProducts(product: Product) {
  const dbProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    take: 4,
  });
  return dbProducts.map(parseProduct);
}
